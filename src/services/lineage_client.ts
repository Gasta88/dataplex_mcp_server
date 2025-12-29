import { LineageClient as GCPLineageClient, protos } from '@google-cloud/lineage';

type ISearchLinksRequest = protos.google.cloud.datacatalog.lineage.v1.ISearchLinksRequest;
type ILink = protos.google.cloud.datacatalog.lineage.v1.ILink;
type IProcess = protos.google.cloud.datacatalog.lineage.v1.IProcess;

export interface LineageNode {
  resource: string;
  displayName: string;
  type: 'table' | 'view' | 'job';
}

export interface ProcessDetails {
  processName: string;
  displayName: string;
  sourceType: string;
  attributes: Record<string, any>;
  description?: string;
  createdBy?: string;
}

export interface LineageLink {
  source: string;
  target: string;
  process?: ProcessDetails;
}

export interface LineageResult {
  upstream: LineageNode[];
  downstream: LineageNode[];
  links: LineageLink[];
  mermaidDiagram: string;
}

export class LineageClient {
  private client: GCPLineageClient;
  private projectId: string;
  private location: string;

  constructor(projectId: string, location: string = 'us-central1') {
    this.client = new GCPLineageClient();
    this.projectId = projectId;
    this.location = location;
  }

  async getTableLineage(
    datasetId: string,
    tableId: string,
    maxDepth: number = 3
  ): Promise<LineageResult> {
    const fullyQualifiedName = `bigquery:${this.projectId}.${datasetId}.${tableId}`;

    try {
      const [upstreamLinks, downstreamLinks] = await Promise.all([
        this.searchLinks(fullyQualifiedName, 'TARGET', maxDepth),
        this.searchLinks(fullyQualifiedName, 'SOURCE', maxDepth),
      ]);

      // Extract unique nodes
      const upstream = this.parseLinksToNodes(upstreamLinks);
      const downstream = this.parseLinksToNodes(downstreamLinks);

      // Extract links with process details
      const links = await this.extractLinksWithProcesses([...upstreamLinks, ...downstreamLinks]);

      const mermaidDiagram = this.generateMermaidDiagram(
        { datasetId, tableId },
        upstream,
        downstream
      );

      return {
        upstream,
        downstream,
        links,
        mermaidDiagram
      };
    } catch (error: any) {
      if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
        throw new Error(
          'Data Lineage API is not enabled or no lineage data available. ' +
          'Please ensure the Data Lineage API is enabled in your GCP project.'
        );
      }
      throw error;
    }
  }

  private async searchLinks(
    target: string,
    direction: 'SOURCE' | 'TARGET',
    maxDepth: number
  ): Promise<ILink[]> {
    const parent = `projects/${this.projectId}/locations/${this.location}`;
    const links: ILink[] = [];

    const request: ISearchLinksRequest = {
      parent,
      [direction === 'SOURCE' ? 'source' : 'target']: {
        fullyQualifiedName: target,
      },
    };

    const iterable = this.client.searchLinksAsync(request);
    let count = 0;
    const maxResults = maxDepth * 10;

    for await (const link of iterable) {
      if (count >= maxResults) break;
      links.push(link);
      count++;
    }

    return links;
  }

  private parseLinksToNodes(links: ILink[]): LineageNode[] {
    const nodes: LineageNode[] = [];
    const seen = new Set<string>();

    for (const link of links) {
      const source = link.source?.fullyQualifiedName;
      const target = link.target?.fullyQualifiedName;

      for (const resource of [source, target].filter(Boolean) as string[]) {
        if (!seen.has(resource)) {
          seen.add(resource);
          nodes.push(this.parseResourceToNode(resource));
        }
      }
    }

    return nodes;
  }

  private parseResourceToNode(resource: string): LineageNode {
    const parts = resource.split(':');
    const type = parts[0];
    const fullName = parts[1] || resource;
    
    const nameParts = fullName.split('.');
    const displayName = nameParts.slice(-2).join('.');

    return {
      resource,
      displayName,
      type: type === 'bigquery' ? 'table' : 'job',
    };
  }

  private generateMermaidDiagram(
    currentTable: { datasetId: string; tableId: string },
    upstream: LineageNode[],
    downstream: LineageNode[]
  ): string {
    const lines: string[] = ['graph LR'];
    const currentNode = `${currentTable.datasetId}.${currentTable.tableId}`;

    lines.push(`  Current["${currentNode}"]:::current`);

    // Add upstream nodes
    upstream.forEach((node, index) => {
      const nodeId = `U${index}`;
      lines.push(`  ${nodeId}["${node.displayName}"]`);
      lines.push(`  ${nodeId} --> Current`);
    });

    // Add downstream nodes
    downstream.forEach((node, index) => {
      const nodeId = `D${index}`;
      lines.push(`  ${nodeId}["${node.displayName}"]`);
      lines.push(`  Current --> ${nodeId}`);
    });

    // Add styling
    lines.push('  classDef current fill:#f9f,stroke:#333,stroke-width:4px');

    return lines.join('\n');
  }

  private async extractLinksWithProcesses(links: ILink[]): Promise<LineageLink[]> {
    const lineageLinks: LineageLink[] = [];
    const processCache = new Map<string, ProcessDetails>();

    for (const link of links) {
      const source = link.source?.fullyQualifiedName;
      const target = link.target?.fullyQualifiedName;
      console.error(`[DEBUG] Source: ${source}, Target: ${target}`);
      console.error(`[DEBUG] Link name: ${link.name}`);

      if (!source || !target) continue;

      let processDetails: ProcessDetails | undefined;

      // If link has a process, fetch its details
      if (link.name) {
        const processName = this.extractProcessNameFromLink(link.name);

        if (processName && !processCache.has(processName)) {
          try {
            processDetails = await this.getProcessDetails(processName);
            processCache.set(processName, processDetails);
          } catch (error) {
            console.error(`Failed to fetch process details: ${error}`);
          }
        } else if (processName) {
          processDetails = processCache.get(processName);
        }
      }

      lineageLinks.push({
        source,
        target,
        process: processDetails,
      });
    }
    return lineageLinks;
  }

  private extractProcessNameFromLink(linkName: string): string | null {
    // Link name format: projects/{project}/locations/{location}/processes/{process}/runs/{run}/lineageEvents/{event}
    const match = linkName.match(/projects\/[^/]+\/locations\/[^/]+\/processes\/([^/]+)/);
    return match ? `projects/${this.projectId}/locations/${this.location}/processes/${match[1]}` : null;
  }

  private async getProcessDetails(processName: string): Promise<ProcessDetails> {
    const [process] = await this.client.getProcess({ name: processName });

    const attributes = this.extractAttributes(process);

    return {
      processName: process.name || '',
      displayName: process.displayName || '',
      sourceType: process.origin?.sourceType?.toString() || 'UNKNOWN',
      attributes,
      description: attributes.description as string | undefined,
      createdBy: attributes.created_by as string | undefined,
    };
  }

  private extractAttributes(process: IProcess): Record<string, any> {
    const attributes: Record<string, any> = {};

    if (process.attributes) {
      for (const [key, value] of Object.entries(process.attributes)) {
        // Convert protobuf Value to JavaScript value
        if (value && typeof value === 'object') {
          if ('stringValue' in value) {
            attributes[key] = value.stringValue;
          } else if ('numberValue' in value) {
            attributes[key] = value.numberValue;
          } else if ('boolValue' in value) {
            attributes[key] = value.boolValue;
          } else if ('structValue' in value) {
            attributes[key] = value.structValue;
          } else if ('listValue' in value) {
            attributes[key] = value.listValue;
          }
        }
      }
    }

    return attributes;
  }

}


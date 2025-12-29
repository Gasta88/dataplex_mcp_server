import { BigQuery } from '@google-cloud/bigquery';

export interface TableMetadata {
  tableId: string;
  datasetId: string;
  projectId: string;
  description: string | null;
  schema: {
    fields: Array<{
      name: string;
      type: string;
      mode: string;
      description: string | null;
    }>;
  };
  clustering: {
    fields: string[] | null;
  };
  partitioning: {
    type: string | null;
    field: string | null;
    requirePartitionFilter: boolean;
  };
  numRows: string;
  numBytes: string;
  creationTime: string;
  lastModifiedTime: string;
}

export class BigQueryClient {
  private client: BigQuery;

  constructor(projectId: string) {
    this.client = new BigQuery({ projectId });
  }

  async listDatasets(): Promise<string[]> {
    const [datasets] = await this.client.getDatasets();
    return datasets.map(dataset => dataset.id!);
  }

  async listTables(datasetId: string): Promise<string[]> {
    const dataset = this.client.dataset(datasetId);
    const [tables] = await dataset.getTables();
    return tables.map(table => table.id!);
  }

  async getTableMetadata(datasetId: string, tableId: string): Promise<TableMetadata> {
    const table = this.client.dataset(datasetId).table(tableId);
    const [metadata] = await table.getMetadata();

    return {
      tableId,
      datasetId,
      projectId: this.client.projectId,
      description: metadata.description || null,
      schema: {
        fields: metadata.schema?.fields?.map((field: any) => ({
          name: field.name,
          type: field.type,
          mode: field.mode || 'NULLABLE',
          description: field.description || null,
        })) || [],
      },
      clustering: {
        fields: metadata.clustering?.fields || null,
      },
      partitioning: {
        type: metadata.timePartitioning?.type || 
              metadata.rangePartitioning?.field ? 'RANGE' : null,
        field: metadata.timePartitioning?.field || 
               metadata.rangePartitioning?.field || null,
        requirePartitionFilter: metadata.requirePartitionFilter || false,
      },
      numRows: metadata.numRows || '0',
      numBytes: metadata.numBytes || '0',
      creationTime: new Date(parseInt(metadata.creationTime)).toISOString(),
      lastModifiedTime: new Date(parseInt(metadata.lastModifiedTime)).toISOString(),
    };
  }

  async getTableDescription(datasetId: string, tableId: string): Promise<string | null> {
    const table = this.client.dataset(datasetId).table(tableId);
    const [metadata] = await table.getMetadata();
    return metadata.description || null;
  }

  async getColumnDescriptions(datasetId: string, tableId: string): Promise<Map<string, string>> {
    const table = this.client.dataset(datasetId).table(tableId);
    const [metadata] = await table.getMetadata();
    
    const descriptions = new Map<string, string>();
    metadata.schema?.fields?.forEach((field: any) => {
      if (field.description) {
        descriptions.set(field.name, field.description);
      }
    });
    
    return descriptions;
  }
}


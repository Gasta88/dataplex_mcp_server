import { LineageClient, LineageResult } from '../services/lineage_client.js';
import { CacheService } from '../services/cache_service.js';
import { generateEmptyLineageDiagram } from '../utils/mermaid_generator.js';

export async function getDataLineage(
  lineageClient: LineageClient,
  cache: CacheService,
  datasetId: string,
  tableId: string,
  maxDepth: number = 3
): Promise<LineageResult> {
  const cacheKey = cache.generateKey('lineage', datasetId, tableId);
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  try {
    const lineage = await lineageClient.getTableLineage(datasetId, tableId, maxDepth);
    cache.set(cacheKey, lineage);
    return lineage;
  } catch (error: any) {
    if (error.message?.includes('no lineage data available')) {
      // Return empty diagram with message
      return {
        upstream: [],
        downstream: [],
        links: [],
        mermaidDiagram: generateEmptyLineageDiagram(
          datasetId,
          tableId,
          'No lineage data available for this table'
        ),
      };
    }
    throw error;
  }
}


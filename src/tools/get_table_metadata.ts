import { BigQueryClient, TableMetadata } from '../services/bigquery_client.js';
import { CacheService } from '../services/cache_service.js';

export async function getTableMetadata(
  bqClient: BigQueryClient,
  cache: CacheService,
  datasetId: string,
  tableId: string
): Promise<TableMetadata> {
  const cacheKey = cache.generateKey('metadata', datasetId, tableId);
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const metadata = await bqClient.getTableMetadata(datasetId, tableId);
  cache.set(cacheKey, metadata);

  return metadata;
}


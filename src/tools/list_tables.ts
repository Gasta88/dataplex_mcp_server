import { BigQueryClient } from '../services/bigquery_client.js';
import { CacheService } from '../services/cache_service.js';

export async function listTables(
  bqClient: BigQueryClient,
  cache: CacheService,
  datasetId: string
): Promise<{ tables: string[] }> {
  const cacheKey = cache.generateKey('tables', datasetId);
  
  if (cache.has(cacheKey)) {
    return { tables: cache.get(cacheKey)! };
  }

  const tables = await bqClient.listTables(datasetId);
  cache.set(cacheKey, tables);

  return { tables };
}


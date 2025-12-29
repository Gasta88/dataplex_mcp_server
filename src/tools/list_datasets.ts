import { BigQueryClient } from '../services/bigquery_client.js';
import { CacheService } from '../services/cache_service.js';

export async function listDatasets(
  bqClient: BigQueryClient,
  cache: CacheService
): Promise<{ datasets: string[] }> {
  const cacheKey = cache.generateKey('datasets');
  
  if (cache.has(cacheKey)) {
    return { datasets: cache.get(cacheKey)! };
  }

  const datasets = await bqClient.listDatasets();
  cache.set(cacheKey, datasets);

  return { datasets };
}


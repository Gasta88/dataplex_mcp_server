import { DataplexClient, DataQualityResult } from '../services/dataplex_client.js';
import { CacheService } from '../services/cache_service.js';

export async function getDataQualityResults(
  dataplexClient: DataplexClient,
  cache: CacheService,
  datasetId: string,
  tableId: string
): Promise<DataQualityResult | { message: string }> {
  const cacheKey = cache.generateKey('quality', datasetId, tableId);
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const result = await dataplexClient.getDataQualityResults(datasetId, tableId);
  
  if (!result) {
    return { message: 'No data quality scans configured for this table' };
  }

  cache.set(cacheKey, result);
  return result;
}


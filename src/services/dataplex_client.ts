import { DataScanServiceClient } from '@google-cloud/dataplex';

export interface DataQualityResult {
  scanName: string;
  tableId: string;
  datasetId: string;
  executionTime: string;
  passed: boolean;
  dimensions: Array<{
    dimension: string;
    passed: boolean;
    score: number;
  }>;
  rowCount: number;
}

export class DataplexClient {
  private dataScanClient: DataScanServiceClient;
  private projectId: string;
  private location: string;

  constructor(projectId: string, location: string = 'us-central1') {
    this.dataScanClient = new DataScanServiceClient();
    this.projectId = projectId;
    this.location = location;
  }

  async getDataQualityResults(
    datasetId: string,
    tableId: string
  ): Promise<DataQualityResult | null> {
    try {
      // List data scans for the project
      const parent = `projects/${this.projectId}/locations/${this.location}`;
      const [dataScans] = await this.dataScanClient.listDataScans({ parent });

      // Find scan for the specific table
      const tableResource = `//bigquery.googleapis.com/projects/${this.projectId}/datasets/${datasetId}/tables/${tableId}`;
      const matchingScan = dataScans.find(scan =>
        scan.data?.resource === tableResource
      );

      if (!matchingScan) {
        return null; // No scan configured
      }

      // Get the full DataScan resource to access the results
      // Note: Results are stored on the DataScan resource, not on individual DataScanJobs
      const scanName = matchingScan.name!;
      const [fullScan] = await this.dataScanClient.getDataScan({ name: scanName, view: 'FULL' });

      // Access the result from the DataScan resource
      const result = fullScan.dataQualityResult;

      if (!result) {
        return null; // No data quality results available yet
      }

      // Parse dimensions
      const dimensions = (result.dimensions || []).map(dim => ({
        dimension: dim.dimension?.toString() || 'Unknown',
        passed: dim.passed || false,
        score: dim.score || 0,
      }));

      // Get execution time from the scan's execution status
      const executionTime = fullScan.executionStatus?.latestJobEndTime;
      const executionTimeStr = typeof executionTime === 'string'
        ? executionTime
        : 'Unknown';

      return {
        scanName: matchingScan.displayName || scanName,
        tableId,
        datasetId,
        executionTime: executionTimeStr,
        passed: result.passed || false,
        dimensions,
        rowCount: Number(result.rowCount) || 0,
      };

    } catch (error: any) {
      if (error.code === 5) {
        throw new Error(
          'Data Scan API error. Please ensure Dataplex API is enabled and ' +
          'the service account has appropriate permissions.'
        );
      }
      throw error;
    }
  }
}


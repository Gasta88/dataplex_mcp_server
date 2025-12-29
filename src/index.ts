#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { loadConfig, validateConfig } from './utils/config.js';
import { logger } from './utils/logger.js';
import { validateDatasetId, validateTableId, validateToolArgs, createErrorMessage } from './utils/validation.js';
import { BigQueryClient } from './services/bigquery_client.js';
import { LineageClient } from './services/lineage_client.js';
import { DataplexClient } from './services/dataplex_client.js';
import { CacheService } from './services/cache_service.js';

import { listDatasets } from './tools/list_datasets.js';
import { listTables } from './tools/list_tables.js';
import { getTableMetadata } from './tools/get_table_metadata.js';
import { getDataLineage } from './tools/get_data_lineage.js';
import { getDataQualityResults } from './tools/get_data_quality_results.js';

// Load and validate configuration
logger.info('Starting Dataplex MCP Server');
logger.debug('Loading configuration...');

let config;
try {
  config = loadConfig();
  validateConfig(config);
  logger.info('Configuration loaded and validated successfully');
} catch (error) {
  logger.error('Failed to load configuration', error);
  console.error('FATAL: Configuration error - ' + createErrorMessage(error));
  process.exit(1);
}

// Initialize clients
logger.info('Initializing GCP clients', { projectId: config.gcp.projectId });
const bqClient = new BigQueryClient(config.gcp.projectId);
const lineageClient = new LineageClient(config.gcp.projectId);
const dataplexClient = new DataplexClient(config.gcp.projectId);
const cache = new CacheService(config.cache.enabled);
logger.info('GCP clients initialized successfully');

// Define tools
const TOOLS: Tool[] = [
  {
    name: 'list_datasets',
    description: 'List all BigQuery datasets in the configured GCP project',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'list_tables',
    description: 'List all tables in a BigQuery dataset',
    inputSchema: {
      type: 'object',
      properties: {
        datasetId: {
          type: 'string',
          description: 'The dataset ID',
        },
      },
      required: ['datasetId'],
    },
  },
  {
    name: 'get_table_metadata',
    description: 'Get comprehensive metadata for a BigQuery table including schema, descriptions, clustering, partitioning, and partition filters',
    inputSchema: {
      type: 'object',
      properties: {
        datasetId: {
          type: 'string',
          description: 'The dataset ID',
        },
        tableId: {
          type: 'string',
          description: 'The table ID',
        },
      },
      required: ['datasetId', 'tableId'],
    },
  },
  {
    name: 'get_data_lineage',
    description: 'Get upstream and downstream data lineage for a BigQuery table with Mermaid diagram visualization (max depth: 3 levels)',
    inputSchema: {
      type: 'object',
      properties: {
        datasetId: {
          type: 'string',
          description: 'The dataset ID',
        },
        tableId: {
          type: 'string',
          description: 'The table ID',
        },
      },
      required: ['datasetId', 'tableId'],
    },
  },
  {
    name: 'get_data_quality_results',
    description: 'Get the latest data quality scan results for a BigQuery table',
    inputSchema: {
      type: 'object',
      properties: {
        datasetId: {
          type: 'string',
          description: 'The dataset ID',
        },
        tableId: {
          type: 'string',
          description: 'The table ID',
        },
      },
      required: ['datasetId', 'tableId'],
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: 'mcp-dataplex',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const startTime = Date.now();
  const { name, arguments: args } = request.params;

  try {
    // Log tool call
    logger.toolCall(name, args);

    // Validate arguments
    const validatedArgs = validateToolArgs(args);

    switch (name) {
      case 'list_datasets': {
        const result = await listDatasets(bqClient, cache);
        logger.toolResult(name, true, Date.now() - startTime);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_tables': {
        const datasetId = validateDatasetId(validatedArgs.datasetId);
        const result = await listTables(bqClient, cache, datasetId);
        logger.toolResult(name, true, Date.now() - startTime);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_table_metadata': {
        const datasetId = validateDatasetId(validatedArgs.datasetId);
        const tableId = validateTableId(validatedArgs.tableId);
        const result = await getTableMetadata(bqClient, cache, datasetId, tableId);
        logger.toolResult(name, true, Date.now() - startTime);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_data_lineage': {
        const datasetId = validateDatasetId(validatedArgs.datasetId);
        const tableId = validateTableId(validatedArgs.tableId);
        const result = await getDataLineage(lineageClient, cache, datasetId, tableId, 3);
        logger.toolResult(name, true, Date.now() - startTime);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_data_quality_results': {
        const datasetId = validateDatasetId(validatedArgs.datasetId);
        const tableId = validateTableId(validatedArgs.tableId);
        const result = await getDataQualityResults(dataplexClient, cache, datasetId, tableId);
        logger.toolResult(name, true, Date.now() - startTime);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    logger.toolResult(name, false, Date.now() - startTime);
    logger.error(`Tool execution failed: ${name}`, error);

    const errorMessage = createErrorMessage(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('Dataplex MCP Server running on stdio');
  console.error('Dataplex MCP server running on stdio');
}

main().catch((error) => {
  logger.error('Fatal error in main', error);
  console.error('Fatal error:', createErrorMessage(error));
  process.exit(1);
});


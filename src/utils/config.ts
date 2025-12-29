import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface DataplexConfig {
  gcp: {
    projectId: string;
  };
  cache: {
    enabled: boolean;
  };
}

/**
 * Load configuration from environment variables (MCPB bundle) or config file (legacy)
 * Priority: Environment variables > Config file
 *
 * Note: GCP authentication uses Application Default Credentials (ADC).
 * Users must run: gcloud auth application-default login
 */
export function loadConfig(): DataplexConfig {
  // First, try to load from environment variables (MCPB bundle mode)
  if (process.env.GCP_PROJECT_ID) {
    const config: DataplexConfig = {
      gcp: {
        projectId: process.env.GCP_PROJECT_ID,
      },
      cache: {
        enabled: process.env.CACHE_ENABLED === 'true' || process.env.CACHE_ENABLED === undefined,
      },
    };

    console.error('[Config] Loaded from environment variables (MCPB mode)');
    return config;
  }

  // Fallback to config file (legacy mode)
  console.error('[Config] Environment variables not found, trying config file (legacy mode)');

  const configPaths = [
    // Relative to Claude Desktop config (platform-specific)
    process.platform === 'darwin'
      ? join(homedir(), 'Library/Application Support/Claude/mcp-dataplex-config.json')
      : process.platform === 'win32'
      ? join(process.env.APPDATA || '', 'Claude/mcp-dataplex-config.json')
      : join(homedir(), '.config/Claude/mcp-dataplex-config.json'),
    // Fallback to package directory
    join(__dirname, '../../config.json'),
  ];

  for (const configPath of configPaths) {
    try {
      const configData = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configData) as DataplexConfig;

      console.error(`[Config] Loaded from file: ${configPath}`);
      return config;
    } catch (error) {
      continue;
    }
  }

  throw new Error(
    `Configuration not found. Please ensure either:\n` +
    `1. Environment variable is set (MCPB mode):\n` +
    `   - GCP_PROJECT_ID\n` +
    `   - CACHE_ENABLED (optional)\n` +
    `2. Or config file exists at one of:\n${configPaths.join('\n')}\n\n` +
    `Authentication: Run 'gcloud auth application-default login' to authenticate with GCP.`
  );
}

export function validateConfig(config: DataplexConfig): void {
  if (!config.gcp?.projectId) {
    throw new Error('Configuration error: gcp.projectId is required');
  }

  console.error(`[Config] Using GCP project: ${config.gcp.projectId}`);
  console.error(`[Config] Authentication: Application Default Credentials (ADC)`);
}


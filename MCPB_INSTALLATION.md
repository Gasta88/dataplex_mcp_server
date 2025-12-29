# Dataplex MCP Bundle Installation Guide

This guide explains how to install and use the Dataplex MCP Server as an MCPB (MCP Bundle).

## What is an MCPB?

MCPB (MCP Bundle) is a packaged format for Model Context Protocol servers that makes installation and configuration easier. The bundle includes:
- The MCP server code
- All dependencies
- Configuration schema
- Metadata and documentation

## Prerequisites

1. **Claude Desktop** - The bundle is designed to work with Claude Desktop
2. **GCP Authentication** - You need to authenticate with Google Cloud:
   ```bash
   gcloud auth application-default login
   ```
3. **GCP Project Access** - Your GCP account needs these IAM roles:
   - BigQuery Data Viewer role (`roles/bigquery.dataViewer`)
   - Dataplex Viewer role (`roles/dataplex.viewer`)
   - Data Catalog Viewer role (`roles/datacatalog.viewer`)

## Installation Steps

### Step 1: Build the Bundle

If you haven't already built the bundle, run:

```bash
# On macOS/Linux
npm run bundle

# On Windows
npm run bundle:win
```

This creates `dataplex-mcp-server.mcpb` in the project root.

### Step 2: Install in Claude Desktop

1. Open **Claude Desktop**
2. Go to **Settings** → **Developer** → **MCP Bundles**
3. Click **Install Bundle**
4. Select the `dataplex-mcp-server.mcpb` file
5. Configure the required settings:
   - **GCP Project ID**: Your Google Cloud project ID (e.g., `my-project-123`)
   - **Enable Caching**: (Optional) Enable to cache metadata for better performance

**Important:** Before using the bundle, authenticate with GCP:
```bash
gcloud auth application-default login
```

### Step 3: Verify Installation

1. Restart Claude Desktop
2. In a conversation, try using one of the Dataplex tools:
   ```
   List all datasets in my GCP project
   ```
3. Claude should now have access to your BigQuery and Dataplex data

## Available Tools

Once installed, the following tools are available:

1. **list_datasets** - List all BigQuery datasets in your project
2. **list_tables** - List all tables in a specific dataset
3. **get_table_metadata** - Get detailed metadata for a table (schema, partitioning, clustering)
4. **get_data_lineage** - Get upstream and downstream lineage with Mermaid diagram
5. **get_data_quality_results** - Get latest data quality scan results

## Configuration Options

### Required Configuration

- **projectId** (string): Your GCP project ID

### Optional Configuration

- **cacheEnabled** (boolean): Enable caching for improved performance (default: true)

### Authentication

The bundle uses Google Cloud Application Default Credentials (ADC). Before using:

```bash
# Authenticate with GCP
gcloud auth application-default login

# Verify your authentication
gcloud auth application-default print-access-token
```

**Required IAM Roles:**
Your GCP account must have:
- `roles/bigquery.dataViewer`
- `roles/dataplex.viewer`
- `roles/datacatalog.viewer`

## Troubleshooting

### Bundle Installation Fails

- Ensure you're using Claude Desktop (not Claude web)
- Check that the `.mcpb` file is not corrupted
- Try rebuilding the bundle

### Authentication Errors

**Error: "User does not have permission..."**
- Ensure you've run `gcloud auth application-default login`
- Verify your GCP account has the required IAM roles
- Check you're authenticated to the correct GCP project:
  ```bash
  gcloud config get-value project
  ```

**Error: "Could not load the default credentials"**
- Run `gcloud auth application-default login` to authenticate
- Verify the gcloud CLI is properly installed
- Check your ADC file exists:
  - macOS/Linux: `~/.config/gcloud/application_default_credentials.json`
  - Windows: `%APPDATA%\gcloud\application_default_credentials.json`

**Error: "API Not Enabled"**
- Enable required APIs:
  ```bash
  gcloud services enable bigquery.googleapis.com
  gcloud services enable dataplex.googleapis.com
  gcloud services enable datacatalog.googleapis.com
  gcloud services enable datalineage.googleapis.com
  ```

### Enable Debug Logging

To see detailed logs:
1. Set environment variable `DEBUG=true` in the bundle configuration
2. Check Claude Desktop logs for detailed error messages

## Updating the Bundle

To update to a new version:
1. Build the new bundle: `npm run bundle`
2. In Claude Desktop, go to MCP Bundles settings
3. Remove the old bundle
4. Install the new `.mcpb` file
5. Restart Claude Desktop

## Security Best Practices

1. **Use Application Default Credentials**
   - Never hardcode credentials in code
   - Use `gcloud auth application-default login` for local development
   - Use service accounts for production deployments

2. **Use Least Privilege**
   - Only grant the minimum required IAM roles
   - Use project-level or dataset-level permissions when possible
   - Regularly audit your IAM permissions

3. **Monitor Usage**
   - Enable Cloud Audit Logs to track API usage
   - Review your account activity regularly
   - Set up alerts for unusual activity

## Support

For issues or questions:
- Check the [GitHub repository](https://github.com/your-org/dataplex-mcp-server)
- Review the main [README.md](README.md) for development setup
- File an issue on GitHub

## Advanced Configuration

### Custom Cache Settings

The bundle uses in-memory caching by default. Cache behavior:
- Dataset lists: 5 minutes
- Table metadata: 10 minutes
- Lineage data: 15 minutes

### Platform-Specific Paths

The bundle automatically handles platform-specific paths:
- **macOS**: `~/Library/Application Support/Claude/`
- **Windows**: `%APPDATA%/Claude/`
- **Linux**: `~/.config/Claude/`

### Environment Variables

The bundle sets these environment variables automatically:
- `GCP_PROJECT_ID`: Your GCP project ID
- `CACHE_ENABLED`: Whether caching is enabled


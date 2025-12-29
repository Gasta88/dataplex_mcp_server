# Quick Start: Building and Installing the MCPB Bundle

This is a quick reference for building and installing the Dataplex MCP Bundle.

## Prerequisites

- Node.js 18+ installed
- npm installed
- **GCP Authentication**: Run `gcloud auth application-default login`
- GCP account with required IAM roles
- Claude Desktop installed

## Build the Bundle

### macOS/Linux

```bash
# 1. Install dependencies
npm install

# 2. Build the bundle
npm run bundle

# 3. Verify bundle was created
ls -lh dataplex-mcp-server.mcpb
```

### Windows

```powershell
# 1. Install dependencies
npm install

# 2. Build the bundle
npm run bundle:win

# 3. Verify bundle was created
dir dataplex-mcp-server.mcpb
```

## Install in Claude Desktop

1. **Open Claude Desktop**

2. **Navigate to MCP Bundles**
   - Click Settings (gear icon)
   - Go to Developer tab
   - Click on MCP Bundles section

3. **Install Bundle**
   - Click "Install Bundle" button
   - Select `dataplex-mcp-server.mcpb` file
   - Click Open

4. **Configure Settings**

   You'll be prompted to configure:

   - **GCP Project ID**: Your Google Cloud project ID
     - Example: `my-project-123`

   - **Enable Caching**: (Optional) Check to enable caching
     - Recommended: Yes (improves performance)

5. **Authenticate with GCP** (if you haven't already)

   Open a terminal and run:
   ```bash
   gcloud auth application-default login
   ```

   Follow the browser prompts to authenticate.

6. **Restart Claude Desktop**
   - Close and reopen Claude Desktop
   - The bundle should now be active

## Test the Installation

Open a new conversation in Claude and try:

```
List all datasets in my GCP project
```

If successful, you should see a JSON response with your BigQuery datasets.

## Troubleshooting

### Bundle won't build

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
npm run bundle
```

### Bundle won't install

- Ensure you're using Claude Desktop (not web version)
- Check that the .mcpb file is not corrupted
- Try rebuilding the bundle

### "Configuration not found" error

- Verify you entered the correct GCP project ID
- Ensure you've authenticated with GCP:
  ```bash
  gcloud auth application-default login
  ```

### "Permission denied" errors

Verify your GCP account has the required IAM roles:
- `roles/bigquery.dataViewer`
- `roles/dataplex.viewer`
- `roles/datacatalog.viewer`

Check your roles:
```bash
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:YOUR_EMAIL"
```

### "Could not load default credentials" error

Authenticate with GCP:
```bash
gcloud auth application-default login
```

Verify authentication:
```bash
gcloud auth application-default print-access-token
```

## Next Steps

- Read [MCPB_INSTALLATION.md](MCPB_INSTALLATION.md) for detailed instructions
- See [TESTING.md](TESTING.md) for testing procedures
- Check [README.md](README.md) for tool documentation

## Available Tools

Once installed, you can use these tools:

1. **list_datasets** - List all BigQuery datasets
2. **list_tables** - List tables in a dataset
3. **get_table_metadata** - Get table schema and metadata
4. **get_data_lineage** - Get data lineage with visualization
5. **get_data_quality_results** - Get data quality scan results

## Example Queries

Try these in Claude:

```
Show me all datasets in my project

List tables in the analytics dataset

Get metadata for table analytics.user_events

Show me the data lineage for analytics.user_events

Get SQL transformations for analytics.user_events

Get data quality results for analytics.user_events
```

## Support

For issues or questions:
- Check [MCPB_INSTALLATION.md](MCPB_INSTALLATION.md) for detailed troubleshooting
- Review [TESTING.md](TESTING.md) for testing procedures
- See [MCPB_IMPLEMENTATION_SUMMARY.md](MCPB_IMPLEMENTATION_SUMMARY.md) for technical details


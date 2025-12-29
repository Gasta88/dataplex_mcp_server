# Troubleshooting Guide

Common issues and solutions for the MCP server.

## Installation Issues

### Issue: "Module not found" Error

**Error:**
```
Error: Cannot find module '@modelcontextprotocol/sdk'
```

**Solution:**
```bash
cd mcp-dataplex
npm install
npm run build
```

### Issue: TypeScript Compilation Fails

**Error:**
```
error TS2307: Cannot find module '@google-cloud/bigquery'
```

**Solution:**
Ensure all dependencies are installed:
```bash
npm install
npm run build
```

### Issue: Node.js Version Mismatch

**Error:**
```
The engine "node" is incompatible with this module
```

**Solution:**
Upgrade Node.js to version 18 or higher:
```bash
node --version  # Check current version
# Install Node 20 using your package manager
```

## Configuration Issues

### Issue: Configuration File Not Found

**Error:**
```
Configuration file not found. Expected locations:
/Users/you/Library/Application Support/Claude/mcp-dataplex-config.json
```

**Solution:**
Create the config file in the correct location:
```bash
# macOS
mkdir -p ~/Library/Application\ Support/Claude/
cp config/config.example.json ~/Library/Application\ Support/Claude/mcp-dataplex-config.json

# Edit with your values
nano ~/Library/Application\ Support/Claude/mcp-dataplex-config.json
```

### Issue: Invalid JSON in Config File

**Error:**
```
SyntaxError: Unexpected token } in JSON
```

**Solution:**
Validate your JSON using a linter:
```bash
# macOS/Linux
cat ~/Library/Application\ Support/Claude/mcp-dataplex-config.json | jq .

# Or use online validator: jsonlint.com
```

Common JSON mistakes:
- Trailing commas
- Missing quotes
- Unescaped backslashes in paths (Windows)

### Issue: Authentication Failed

**Error:**
```
Error: Could not load the default credentials
```

**Solution:**

1. Authenticate with GCP:
   ```bash
   gcloud auth application-default login
   ```

2. Verify authentication:
   ```bash
   gcloud auth application-default print-access-token
   ```

3. Check credential file exists:
   ```bash
   # macOS/Linux
   ls -la ~/.config/gcloud/application_default_credentials.json

   # Windows
   dir "%APPDATA%\gcloud\application_default_credentials.json"
   ```

4. Verify you're authenticated to the correct project:
   ```bash
   gcloud config get-value project
   ```

## Claude Desktop Integration Issues

### Issue: MCP Server Not Appearing in Claude

**Symptoms:**
- Tools don't show up
- Claude doesn't recognize MCP commands

**Solution:**

1. **Verify Claude Desktop config location:**
   ```bash
   # macOS
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

   # Linux
   cat ~/.config/Claude/claude_desktop_config.json
   ```

2. **Check JSON syntax:**
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .
   ```

3. **Verify absolute paths:**
   Must use absolute paths, not relative:
   ```json
   {
     "mcpServers": {
       "mcp-dataplex": {
         "command": "node",
         "args": ["/Users/youruser/mcp-dataplex/dist/index.js"]
       }
     }
   }
   ```

4. **Test server manually:**
   ```bash
   node /absolute/path/to/dist/index.js
   # Should output: "Dataplex MCP server running on stdio"
   # Press Ctrl+C to exit
   ```

5. **Check Claude Desktop logs:**
   ```bash
   # macOS
   tail -f ~/Library/Logs/Claude/mcp*.log

   # Linux
   tail -f ~/.local/share/Claude/logs/mcp*.log
   ```

6. **Restart Claude Desktop:**
   - Completely quit (Cmd+Q on macOS)
   - Relaunch application

## GCP Authentication Issues

### Issue: "Permission Denied" on BigQuery

**Error:**
```
Error: User does not have permission to access dataset
```

**Solution:**

1. **Verify you have the correct IAM roles:**
   ```bash
   YOUR_EMAIL=$(gcloud config get-value account)
   gcloud projects get-iam-policy GCP_PROJECT_ID \
     --flatten="bindings[].members" \
     --filter="bindings.members:user:${YOUR_EMAIL}"
   ```

2. **Grant missing roles:**
   ```bash
   YOUR_EMAIL=$(gcloud config get-value account)

   # BigQuery Data Viewer
   gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
     --member="user:${YOUR_EMAIL}" \
     --role="roles/bigquery.dataViewer"

   # Data Lineage Viewer
   gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
     --member="user:${YOUR_EMAIL}" \
     --role="roles/datalineage.viewer"

   # Dataplex Catalogue Viewer
   gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
     --member="user:${YOUR_EMAIL}" \
     --role="roles/datacatalog.viewer"

   # Dataplex Datascan DataViewer
   gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
     --member="user:${YOUR_EMAIL}" \
     --role="roles/dataplex.dataScanDataViewer"

   # Dataplex Viewer
   gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
     --member="user:${YOUR_EMAIL}" \
     --role="roles/dataplex.viewer"
   ```

### Issue: "API Not Enabled"

**Error:**
```
BigQuery API has not been used in project before or it is disabled
```

**Solution:**
Enable required APIs:
```bash
gcloud services enable bigquery.googleapis.com
gcloud services enable dataplex.googleapis.com
gcloud services enable datacatalog.googleapis.com
gcloud services enable datalineage.googleapis.com
```

### Issue: Wrong Project

**Error:**
```
Project not found or access denied
```

**Solution:**

1. Check which project you're authenticated to:
   ```bash
   gcloud config get-value project
   ```

2. Set the correct project:
   ```bash
   gcloud config set project GCP_PROJECT_ID
   ```

3. Re-authenticate:
   ```bash
   gcloud auth application-default login
   ```

## Data Lineage Issues

### Issue: No Lineage Data Available

**Message:**
```
No lineage data available for this table
```

**Possible causes:**
1. Data Lineage API not enabled
2. No lineage has been captured yet
3. Table was created before lineage was enabled

**Solution:**
1. Enable Data Lineage API
2. Run a query that uses the table to generate lineage
3. Wait for lineage to be collected (can take up to 24 hours)

## Data Quality Issues

### Issue: No Data Quality Scans Found

**Message:**
```
No data quality scans configured for this table
```

**Solution:**
1. Go to Dataplex > Data Quality in GCP Console
2. Create a new data scan for the table
3. Run the scan at least once

## Getting Help

If you continue to experience issues:

1. **Check logs:**
   ```bash
   # Run server with debug output
   DEBUG=* node dist/index.js
   ```

2. **Verify connectivity:**
   ```bash
   # Test BigQuery access
   bq ls --project_id=GCP_PROJECT_ID
   ```

3. **Open an issue on GitHub** with:
   - Error message
   - Configuration (redacted)
   - Steps to reproduce

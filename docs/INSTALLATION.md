# Installation Guide

Complete step-by-step guide for installing and configuring the MCP server.

## System Requirements

- **Operating System:** macOS, Linux, or Windows
- **Node.js:** Version 18.0.0 or higher
- **Claude Desktop:** Latest version
- **GCP Access:** User account with appropriate IAM roles
- **GCP Authentication:** gcloud CLI installed and configured

## Step 1: Install Node.js

### macOS (using Homebrew)
```bash
brew install node@20
```

### Linux (using nvm)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Windows
Download and install from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version  # Should show v18.0.0 or higher
npm --version
```

## Step 2: Clone Repository

```bash
git clone https://github.com/your-org/mcp-dataplex.git
cd mcp-dataplex
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Build Server

```bash
npm run build
```

You should see output indicating successful TypeScript compilation.

## Step 5: Authenticate with GCP

Instead of using a service account key file, you'll authenticate using Application Default Credentials (ADC).

### Authenticate

```bash
# Authenticate with your GCP account
gcloud auth application-default login

# Verify authentication
gcloud auth application-default print-access-token
```

### Verify Your IAM Roles

Your GCP account needs these roles:
- `roles/bigquery.dataViewer`
- `roles/dataplex.viewer`
- `roles/datacatalog.viewer`

**Check your roles:**

```bash
YOUR_EMAIL=$(gcloud config get-value account)
gcloud projects get-iam-policy GCP_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:${YOUR_EMAIL}"
```

If you don't have the required roles, see [GCP Setup Guide](GCP_SETUP.md) for role assignment instructions.

## Step 6: Configure MCP Server

### Determine Configuration Directory

**macOS:**
```
~/Library/Application Support/Claude/
```

**Linux:**
```
~/.config/Claude/
```

**Windows:**
```
%APPDATA%\Claude\
```

### Create Configuration File

```bash
# macOS
cat > ~/Library/Application\ Support/Claude/mcp-dataplex-config.json << 'EOF'
{
  "gcp": {
    "projectId": "GCP_PROJECT_ID"
  },
  "cache": {
    "enabled": true
  }
}
EOF
```

**Important:** Replace `GCP_PROJECT_ID` with your actual GCP project ID.

**Note:** No credentials path needed - the server uses your authenticated gcloud credentials.

## Step 7: Configure Claude Desktop

### Locate Claude Desktop Config

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

### Add MCP Server Entry

Edit the file to add (or merge with existing `mcpServers`):

```json
{
  "mcpServers": {
    "mcp-dataplex": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-dataplex/dist/index.js"
      ]
    }
  }
}
```

**Important:** Use absolute paths, not relative paths.

### Example (macOS)

```json
{
  "mcpServers": {
    "mcp-dataplex": {
      "command": "node",
      "args": [
        "/Users/youruser/mcp-dataplex/dist/index.js"
      ]
    }
  }
}
```

## Step 8: Restart Claude Desktop

1. Quit Claude Desktop completely
2. Relaunch the application
3. The MCP server should automatically start

## Step 9: Verify Installation

In Claude Desktop, try asking:

```
"Can you list the BigQuery datasets in my project?"
```

or

```
"Show me the tables in dataset X"
```

If working correctly, Claude will use the MCP tools to fetch the data.

## Troubleshooting

If tools don't appear or don't work:

1. **Check Claude Desktop logs:**
   - macOS: `~/Library/Logs/Claude/`
   - Linux: `~/.local/share/Claude/logs/`
   - Windows: `%APPDATA%\Claude\logs\`

2. **Verify Node.js path:**
   ```bash
   which node  # macOS/Linux
   where node  # Windows
   ```

3. **Test server manually:**
   ```bash
   node dist/index.js
   # Should output: "Dataplex MCP server running on stdio"
   ```

4. **Verify GCP authentication:**
   ```bash
   gcloud auth application-default print-access-token
   # Should print an access token
   ```

5. **Check configuration paths:**
   - Ensure your GCP project ID is correct
   - Verify absolute paths in `claude_desktop_config.json`
   - Ensure you're authenticated with the correct GCP account

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more details.

## Updating

To update the MCP server:

```bash
cd mcp-dataplex
git pull
npm install
npm run build
```

Then restart Claude Desktop.

## Uninstallation

1. Remove MCP server entry from `claude_desktop_config.json`
2. Delete configuration file:
   ```bash
   # macOS
   rm ~/Library/Application\ Support/Claude/mcp-dataplex-config.json
   ```
3. Delete repository:
   ```bash
   rm -rf mcp-dataplex
   ```
4. Restart Claude Desktop

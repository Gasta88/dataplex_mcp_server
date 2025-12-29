# MCP Server for GCP Dataplex

Model Context Protocol (MCP) server for integrating Google Cloud Platform's Dataplex and BigQuery services with Claude Desktop.

## Overview

Provides metadata, lineage, and data quality capabilities:
- List BigQuery datasets and tables
- Get comprehensive table metadata (schema, descriptions, clustering, partitioning)
- Retrieve data lineage with Mermaid diagram visualization
- Extract SQL transformations (CTAS and INSERT) from lineage processes
- Access latest data quality scan results

## Features

✅ TypeScript implementation with type safety

✅ Uses Google Cloud Application Default Credentials (ADC) - no service account keys needed

✅ In-memory caching for performance

✅ Comprehensive error handling

✅ Mermaid diagram generation for lineage

✅ Max lineage depth: 3 levels

✅ **MCPB Bundle Support** - Easy installation via Claude Desktop

## Installation Options

### Option 1: MCPB Bundle (Recommended)

The easiest way to install is using the MCPB bundle format:

1. **Build the bundle:**
   ```bash
   npm install
   npm run bundle
   ```

2. **Install in Claude Desktop:**
   - Open Claude Desktop
   - Go to Settings → Developer → MCP Bundles
   - Click "Install Bundle" and select `dataplex-mcp-server.mcpb`
   - Configure your GCP project ID

📖 **See [MCPB_INSTALLATION.md](MCPB_INSTALLATION.md) for detailed installation instructions**

### Option 2: Development Setup

For development or manual installation:

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Claude Desktop application
- GCP project with BigQuery/Dataplex enabled
- **GCP Authentication**: Run `gcloud auth application-default login` to authenticate
- Appropriate IAM roles for your GCP user account (see [GCP Setup Guide](docs/GCP_SETUP.md))

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/MyCompany/mcp-dataplex.git
cd mcp-dataplex
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the server:**
```bash
npm run bundle
```

4. **Authenticate with GCP:**

First, ensure you have the gcloud CLI installed, then authenticate:

```bash
# Authenticate with your GCP account
gcloud auth application-default login

# Verify authentication
gcloud auth application-default print-access-token
```

**Required IAM Roles:**
Your GCP user account needs these roles:
- `roles/bigquery.dataViewer`
- `roles/dataplex.viewer`
- `roles/datacatalog.viewer`

See [GCP Setup Guide](docs/GCP_SETUP.md) for detailed role assignment instructions.

5. **Add Bundle to Claude Desktop:**
```
> Open claude Desktop
> Go To Settings
> Go to Extensions
> Drag and Drop MCP Bundle in the area
```
Important: **Replace GCP_PROJECT_ID` with your actual GCP project ID.**

# Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [GCP Setup Guide](docs/GCP_SETUP.md)
- [Usage Examples](docs/USAGE_EXAMPLES.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Tools Reference

| Tool | Description |
|------|-------------|
| `list_datasets` | List all datasets in the project |
| `list_tables` | List tables in a dataset |
| `get_table_metadata` | Get schema, clustering, partitioning info |
| `get_data_lineage` | Get upstream and downstream lineage with Mermaid diagram (max depth: 3) |
| `get_data_quality_results` | Get latest data quality scan results |



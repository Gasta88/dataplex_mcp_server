# Build Instructions for Dataplex MCP Bundle

## Overview

This document provides complete instructions for building the Dataplex MCP Server as an MCPB bundle.

## What You'll Build

A production-ready MCPB bundle (`dataplex-mcp-server.mcpb`) that includes:
- Compiled JavaScript server code
- All production dependencies
- MCPB manifest with configuration schema
- Complete documentation

## Prerequisites

### Required Software
- **Node.js**: Version 18.0.0 or higher
- **npm**: Comes with Node.js
- **Git**: For cloning the repository
- **Bash** (macOS/Linux) or **PowerShell** (Windows)

### Required GCP Resources
- Google Cloud Platform project with:
  - BigQuery API enabled
  - Dataplex API enabled
  - Data Lineage API enabled
  - Data Catalog API enabled
- Service account with IAM roles:
  - `roles/bigquery.dataViewer`
  - `roles/dataplex.viewer`
  - `roles/datacatalog.viewer`
- Service account JSON key file downloaded

## Build Steps

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd dataplex_mcp_server

# Install dependencies
npm install
```

### 2. Verify TypeScript Compilation

```bash
# Build TypeScript
npm run build

# Check for errors
echo $?  # Should output 0 (success)
```

### 3. Build the Bundle

#### On macOS/Linux:

```bash
npm run bundle
```

#### On Windows:

```powershell
npm run bundle:win
```

### 4. Verify Bundle Creation

```bash
# Check bundle exists
ls -lh dataplex-mcp-server.mcpb

# List bundle contents
unzip -l dataplex-mcp-server.mcpb | head -20
```

Expected output should show:
- `manifest.json`
- `server/index.js`
- `server/node_modules/`
- Various service and tool files

## What the Build Script Does

The build script (`scripts/build-bundle.sh` or `scripts/build-bundle.ps1`) performs these steps:

1. **Clean**: Removes previous build artifacts
   - Deletes `dist/` directory
   - Deletes `bundle/` directory
   - Deletes any existing `.mcpb` files

2. **Compile**: Builds TypeScript to JavaScript
   - Runs `tsc` compiler
   - Outputs to `dist/` directory

3. **Structure**: Creates bundle directory layout
   - Creates `bundle/server/` directory
   - Copies compiled JavaScript files

4. **Manifest**: Copies configuration
   - Copies `manifest.json` to bundle root
   - Copies `icon.png` if present

5. **Dependencies**: Installs production packages
   - Installs MCP SDK
   - Installs Google Cloud libraries
   - Only production dependencies (no dev dependencies)

6. **Package**: Creates .mcpb archive
   - Creates ZIP file with `.mcpb` extension
   - Excludes system files (.DS_Store, etc.)

7. **Verify**: Validates bundle contents
   - Lists files in archive
   - Shows bundle size

## Bundle Structure

The final `.mcpb` file contains:

```
dataplex-mcp-server.mcpb
├── manifest.json                 # MCPB configuration
├── icon.png                      # Optional bundle icon
└── server/
    ├── index.js                  # Main entry point
    ├── package.json              # Package metadata
    ├── services/                 # GCP client services
    │   ├── bigquery_client.js
    │   ├── lineage_client.js
    │   ├── dataplex_client.js
    │   └── cache_service.js
    ├── tools/                    # MCP tool implementations
    │   ├── list_datasets.js
    │   ├── list_tables.js
    │   ├── get_table_metadata.js
    │   ├── get_data_lineage.js
    │   └── get_data_quality_results.js
    ├── utils/                    # Utility modules
    │   ├── config.js
    │   ├── validation.js
    │   ├── logger.js
    │   └── mermaid_generator.js
    └── node_modules/             # Production dependencies
        ├── @modelcontextprotocol/
        ├── @google-cloud/
        └── ... (all dependencies)
```

## Troubleshooting Build Issues

### TypeScript Compilation Errors

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Missing Dependencies

```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

### Permission Errors (macOS/Linux)

```bash
# Make build script executable
chmod +x scripts/build-bundle.sh
```

### Bundle Creation Fails

Check that you have:
- Sufficient disk space (bundle is ~50-100 MB)
- Write permissions in the project directory
- `zip` command available (macOS/Linux)

## Next Steps After Building

1. **Test the Bundle**: See [TESTING.md](TESTING.md)
2. **Install in Claude Desktop**: See [MCPB_INSTALLATION.md](MCPB_INSTALLATION.md)
3. **Quick Start**: See [QUICKSTART_BUNDLE.md](QUICKSTART_BUNDLE.md)

## Build Artifacts

After building, you'll have:

- `dist/` - Compiled JavaScript (gitignored)
- `bundle/` - Temporary bundle directory (gitignored)
- `dataplex-mcp-server.mcpb` - Final bundle (gitignored)

These are all excluded from git via `.gitignore`.

## Cleaning Up

To remove all build artifacts:

```bash
npm run clean
```

This removes:
- `dist/` directory
- `bundle/` directory
- `*.mcpb` files

## Advanced: Manual Bundle Creation

If the automated scripts don't work, you can build manually:

```bash
# 1. Compile TypeScript
npx tsc

# 2. Create bundle structure
mkdir -p bundle/server
cp -r dist/* bundle/server/
cp manifest.json bundle/

# 3. Install dependencies
cd bundle/server
npm init -y
npm install --production @modelcontextprotocol/sdk @google-cloud/bigquery @google-cloud/datacatalog @google-cloud/dataplex @google-cloud/lineage
cd ../..

# 4. Create archive
cd bundle
zip -r ../dataplex-mcp-server.mcpb .
cd ..
```

## Support

For build issues:
- Check [TESTING.md](TESTING.md) for validation steps
- Review [MCPB_IMPLEMENTATION_SUMMARY.md](MCPB_IMPLEMENTATION_SUMMARY.md) for technical details
- File an issue on GitHub


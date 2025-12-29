#!/bin/bash
set -e

echo "🔨 Building Dataplex MCP Bundle..."

# Clean previous builds
echo "📦 Cleaning previous builds..."
rm -rf dist bundle *.mcpb

# Compile TypeScript
echo "🔧 Compiling TypeScript..."
npm run build

# Create bundle directory structure
echo "📁 Creating bundle structure..."
mkdir -p bundle/server

# Copy compiled JavaScript files
echo "📋 Copying compiled files..."
cp -r dist/* bundle/server/

# Copy manifest
echo "📄 Copying manifest.json..."
cp manifest.json bundle/

# Copy icon if exists
if [ -f "icon.png" ]; then
  echo "🎨 Copying icon.png..."
  cp icon.png bundle/
fi

# Install production dependencies in bundle
echo "📦 Installing production dependencies..."
cd bundle/server
npm init -y > /dev/null 2>&1
npm install --production --no-save \
  @modelcontextprotocol/sdk \
  @google-cloud/bigquery \
  @google-cloud/datacatalog \
  @google-cloud/dataplex \
  @google-cloud/lineage

cd ../..

# Create .mcpb archive
echo "🗜️  Creating .mcpb archive..."
cd bundle
zip -r ../dataplex-mcp-server.mcpb . -x "*.DS_Store" -x "__MACOSX/*"
cd ..

# Verify bundle
echo "✅ Verifying bundle..."
unzip -l dataplex-mcp-server.mcpb | head -20

echo ""
echo "✨ Bundle created successfully: dataplex-mcp-server.mcpb"
echo "📦 Size: $(du -h dataplex-mcp-server.mcpb | cut -f1)"
echo ""
echo "To install:"
echo "  1. Open Claude Desktop"
echo "  2. Go to Settings > Developer > MCP Bundles"
echo "  3. Click 'Install Bundle' and select dataplex-mcp-server.mcpb"
echo ""


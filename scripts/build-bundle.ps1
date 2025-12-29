# PowerShell script for building MCPB bundle on Windows
$ErrorActionPreference = "Stop"

Write-Host "🔨 Building Dataplex MCP Bundle..." -ForegroundColor Cyan

# Clean previous builds
Write-Host "📦 Cleaning previous builds..." -ForegroundColor Yellow
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "bundle" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "*.mcpb" -Force -ErrorAction SilentlyContinue

# Compile TypeScript
Write-Host "🔧 Compiling TypeScript..." -ForegroundColor Yellow
npm run build

# Create bundle directory structure
Write-Host "📁 Creating bundle structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "bundle/server" -Force | Out-Null

# Copy compiled JavaScript files
Write-Host "📋 Copying compiled files..." -ForegroundColor Yellow
Copy-Item -Path "dist/*" -Destination "bundle/server/" -Recurse

# Copy manifest
Write-Host "📄 Copying manifest.json..." -ForegroundColor Yellow
Copy-Item -Path "manifest.json" -Destination "bundle/"

# Copy icon if exists
if (Test-Path "icon.png") {
    Write-Host "🎨 Copying icon.png..." -ForegroundColor Yellow
    Copy-Item -Path "icon.png" -Destination "bundle/"
}

# Install production dependencies in bundle
Write-Host "📦 Installing production dependencies..." -ForegroundColor Yellow
Set-Location "bundle/server"
npm init -y | Out-Null
npm install --production --no-save `
    @modelcontextprotocol/sdk `
    @google-cloud/bigquery `
    @google-cloud/datacatalog `
    @google-cloud/dataplex `
    @google-cloud/lineage

Set-Location "../.."

# Create .mcpb archive
Write-Host "🗜️  Creating .mcpb archive..." -ForegroundColor Yellow
Compress-Archive -Path "bundle/*" -DestinationPath "dataplex-mcp-server.mcpb" -Force

# Verify bundle
Write-Host "✅ Verifying bundle..." -ForegroundColor Green
$bundleSize = (Get-Item "dataplex-mcp-server.mcpb").Length / 1MB
Write-Host "Bundle size: $([math]::Round($bundleSize, 2)) MB" -ForegroundColor Green

Write-Host ""
Write-Host "✨ Bundle created successfully: dataplex-mcp-server.mcpb" -ForegroundColor Green
Write-Host ""
Write-Host "To install:" -ForegroundColor Cyan
Write-Host "  1. Open Claude Desktop" -ForegroundColor White
Write-Host "  2. Go to Settings > Developer > MCP Bundles" -ForegroundColor White
Write-Host "  3. Click 'Install Bundle' and select dataplex-mcp-server.mcpb" -ForegroundColor White
Write-Host ""


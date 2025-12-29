# Testing Guide for Dataplex MCP Bundle

This guide covers testing the MCPB bundle before and after installation.

## Pre-Installation Testing

### 1. Validate Build

```bash
# Clean previous builds
npm run clean

# Build TypeScript
npm run build

# Check for compilation errors
echo $?  # Should output 0
```

### 2. Validate Manifest

```bash
# Check manifest.json is valid JSON
cat manifest.json | python3 -m json.tool

# Verify required fields
cat manifest.json | jq '.manifest_version, .name, .version, .server.type'
```

### 3. Test Bundle Creation

```bash
# Create the bundle
npm run bundle

# Verify bundle was created
ls -lh dataplex-mcp-server.mcpb

# List bundle contents
unzip -l dataplex-mcp-server.mcpb
```

Expected bundle structure:
```
manifest.json
icon.png (optional)
server/
  index.js
  services/
  tools/
  utils/
  node_modules/
```

### 4. Validate Bundle Contents

```bash
# Extract to temporary directory
mkdir -p /tmp/mcpb-test
unzip dataplex-mcp-server.mcpb -d /tmp/mcpb-test

# Check manifest exists
test -f /tmp/mcpb-test/manifest.json && echo "✅ Manifest found"

# Check server code exists
test -f /tmp/mcpb-test/server/index.js && echo "✅ Server code found"

# Check dependencies are bundled
test -d /tmp/mcpb-test/server/node_modules/@modelcontextprotocol && echo "✅ MCP SDK bundled"
test -d /tmp/mcpb-test/server/node_modules/@google-cloud && echo "✅ GCP libraries bundled"

# Cleanup
rm -rf /tmp/mcpb-test
```

## Post-Installation Testing

### 1. Manual Testing in Claude Desktop

After installing the bundle in Claude Desktop:

1. **Test list_datasets**:
   ```
   List all datasets in my GCP project
   ```
   Expected: JSON array of dataset objects

2. **Test list_tables**:
   ```
   List all tables in the [dataset_name] dataset
   ```
   Expected: JSON array of table objects

3. **Test get_table_metadata**:
   ```
   Get metadata for table [dataset_name].[table_name]
   ```
   Expected: Detailed table metadata including schema

4. **Test get_data_lineage**:
   ```
   Show me the data lineage for [dataset_name].[table_name]
   ```
   Expected: Lineage data with Mermaid diagram

5. **Test get_data_quality_results**:
   ```
   Get data quality results for [dataset_name].[table_name]
   ```
   Expected: Data quality scan results or "no scans found"

### 2. Error Handling Tests

Test error scenarios:

1. **Invalid dataset ID**:
   ```
   List tables in dataset "invalid-name-with-dashes"
   ```
   Expected: Clear error message about invalid format

2. **Non-existent dataset**:
   ```
   List tables in dataset "nonexistent_dataset_12345"
   ```
   Expected: Error message indicating dataset not found

3. **Missing permissions**:
   - Remove a required IAM role temporarily
   - Try to list datasets
   Expected: Clear permission error message

### 3. Configuration Tests

1. **Test with missing authentication**:
   - Revoke ADC credentials: `gcloud auth application-default revoke`
   - Restart Claude Desktop
   Expected: Clear error about missing authentication

2. **Test with invalid project ID**:
   - Set projectId to invalid format
   - Restart Claude Desktop
   Expected: Error when trying to use tools

3. **Test with caching disabled**:
   - Set cacheEnabled to false
   - Use same tool twice
   - Check logs for cache behavior

### 4. Performance Tests

1. **Test caching**:
   ```
   # First call (should hit API)
   List all datasets
   
   # Second call within 5 minutes (should use cache)
   List all datasets
   ```
   Check logs for cache hit/miss

2. **Test large dataset**:
   ```
   Get metadata for a table with 100+ columns
   ```
   Expected: Should complete within reasonable time

## Debugging

### Enable Debug Logging

Set `DEBUG=true` in the bundle configuration to see detailed logs.

### Check Claude Desktop Logs

**macOS**:
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Windows**:
```powershell
Get-Content "$env:APPDATA\Claude\Logs\mcp*.log" -Wait
```

**Linux**:
```bash
tail -f ~/.config/Claude/logs/mcp*.log
```

### Common Issues

1. **"Configuration not found"**
   - Check that environment variables are set correctly
   - Verify manifest.json has correct user_config schema

2. **"Could not load default credentials"**
   - Run `gcloud auth application-default login` to authenticate
   - Verify ADC file exists in the correct location

3. **"Permission denied" errors**
   - Verify your user account has required IAM roles
   - Check that APIs are enabled in GCP project

4. **Bundle won't install**
   - Verify .mcpb file is not corrupted
   - Check Claude Desktop version compatibility
   - Try rebuilding the bundle

## Automated Testing

### Unit Tests (Future Enhancement)

Create test files for validation utilities:

```typescript
// tests/validation.test.ts
import { validateDatasetId, validateTableId } from '../src/utils/validation';

describe('validateDatasetId', () => {
  it('should accept valid dataset IDs', () => {
    expect(validateDatasetId('my_dataset')).toBe('my_dataset');
  });
  
  it('should reject invalid characters', () => {
    expect(() => validateDatasetId('my-dataset')).toThrow();
  });
});
```

### Integration Tests (Future Enhancement)

Test against a real GCP project with test data.

## Checklist Before Release

- [ ] All TypeScript compiles without errors
- [ ] manifest.json is valid JSON
- [ ] Bundle builds successfully
- [ ] Bundle contains all required files
- [ ] All tools work in Claude Desktop
- [ ] Error handling works correctly
- [ ] Documentation is up to date
- [ ] MCPB_INSTALLATION.md is accurate
- [ ] README.md reflects MCPB support


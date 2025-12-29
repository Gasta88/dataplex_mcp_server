# Migration Guide: v1.x to v2.0

## Breaking Changes

Version 2.0 removes the requirement for a service account key file. Authentication now uses Google Cloud Application Default Credentials (ADC).

## What Changed

- ❌ **Removed**: `credentialsPath` configuration parameter
- ❌ **Removed**: `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- ✅ **Added**: Application Default Credentials (ADC) authentication

## Migration Steps

### 1. Authenticate with GCP

```bash
gcloud auth application-default login
```

### 2. Update Configuration File

**Old configuration:**
```json
{
  "gcp": {
    "projectId": "GCP_PROJECT_ID",
    "credentialsPath": "~/gcp-keys/mcp-dataplex-reader.json"
  },
  "cache": {
    "enabled": true
  }
}
```

**New configuration:**
```json
{
  "gcp": {
    "projectId": "GCP_PROJECT_ID"
  },
  "cache": {
    "enabled": true
  }
}
```

### 3. Update IAM Permissions

If you were using a service account, you now need the same IAM roles on your personal GCP account:

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

### 4. Rebuild and Reinstall

```bash
# Pull latest changes
git pull

# Rebuild
npm run clean
npm install
npm run build

# For MCPB bundle users
npm run bundle
# Then reinstall the bundle in Claude Desktop

# For direct installation users
# Just restart Claude Desktop
```

### 5. Clean Up (Optional)

You can now safely remove your service account key files and delete the service account if it was only used for this MCP server.

## Benefits

- ✅ No sensitive key files to manage
- ✅ Simpler authentication flow
- ✅ Uses same credentials as gcloud CLI
- ✅ More secure (credentials managed by Google)
- ✅ Easier onboarding for new users

## Troubleshooting

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common issues.


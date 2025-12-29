# GCP Setup Guide

Guide for setting up Google Cloud Platform resources and permissions for the MCP server.

## Prerequisites

- GCP project with billing enabled
- Project owner or admin access (to grant IAM roles and enable APIs)
- `gcloud` CLI installed (optional but recommended)

## Authentication Method

This MCP server uses **Google Cloud Application Default Credentials (ADC)** for authentication. This means:

- ✅ No service account key files needed
- ✅ Uses your personal GCP account credentials
- ✅ Simpler and more secure authentication
- ✅ Same credentials as gcloud CLI

**To authenticate:**
```bash
gcloud auth application-default login
```

This command will open your browser and prompt you to authenticate with your Google account.

---

## Step 1: Enable Required APIs

Enable the necessary APIs in your GCP project:

```bash
gcloud services enable bigquery.googleapis.com
gcloud services enable dataplex.googleapis.com
gcloud services enable datacatalog.googleapis.com
gcloud services enable datalineage.googleapis.com
```

Alternatively, enable via Cloud Console:
1. Go to **APIs & Services** > **Library**
2. Search and enable:
   - BigQuery API
   - Dataplex API
   - Data Catalog API
   - Data Lineage API

## Step 2: Grant IAM Roles to Your User Account

Instead of creating a service account, you'll grant the necessary IAM roles directly to your GCP user account.

### Using gcloud CLI

```bash
# Set your project
gcloud config set project GCP_PROJECT_ID

# Get your email address
YOUR_EMAIL=$(gcloud config get-value account)

# Grant BigQuery Data Viewer role
gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
  --member="user:${YOUR_EMAIL}" \
  --role="roles/bigquery.dataViewer"

# Grant Data Lineage Viewer role
gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
  --member="user:${YOUR_EMAIL}" \
  --role="roles/datalineage.viewer"

# Grant Dataplex Catalogue Viewer role
gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
  --member="user:${YOUR_EMAIL}" \
  --role="roles/datacatalog.viewer"

# Grant Dataplex Datascan DataViewer role
gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
  --member="user:${YOUR_EMAIL}" \
  --role="roles/dataplex.dataScanDataViewer"

# Grant Dataplex Viewer role
gcloud projects add-iam-policy-binding GCP_PROJECT_ID \
  --member="user:${YOUR_EMAIL}" \
  --role="roles/dataplex.viewer"
```

### Using Cloud Console

1. Go to **IAM & Admin** → **IAM**
2. Find your user account (your email)
3. Click **Edit principal** (pencil icon)
4. Add roles:
   - **BigQuery Data Viewer** (`roles/bigquery.dataViewer`)
   - **Data Lineage Viewer** (`roles/datalineage.viewer`)
   - **Dataplex Catalogue Viewer** (`roles/datacatalog.viewer`)
   - **Dataplex Datascan DataViewer** (`roles/dataplex.dataScanDataViewer`)
   - **Dataplex Viewer** (`roles/dataplex.viewer`)
5. Click **Save**

## Step 3: Verify Permissions and Authenticate

### Authenticate with ADC

```bash
# Authenticate with your GCP account
gcloud auth application-default login

# This will open a browser window for authentication
# Follow the prompts to authenticate
```

### Test Your Permissions

```bash
# Verify you're authenticated
gcloud auth application-default print-access-token

# Test BigQuery access
bq ls --project_id=GCP_PROJECT_ID

# List datasets (should succeed if you have correct permissions)
bq ls --project_id=GCP_PROJECT_ID
```

### Verify Your Roles

```bash
# Check your IAM roles
YOUR_EMAIL=$(gcloud config get-value account)
gcloud projects get-iam-policy GCP_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:${YOUR_EMAIL}"
```

## Step 4: Configure Data Lineage (Optional)

Data lineage tracking requires additional setup:

### Enable Lineage Collection

1. Go to **Dataplex** > **Lineage**
2. Click **Enable Data Lineage**
3. Configure lineage sources:
   - BigQuery
   - Dataflow (if applicable)

### Grant Lineage Permissions

Your user account automatically gets lineage viewing permissions via the Dataplex Viewer role.

## Step 5: Set Up Data Quality Scans (Optional)

To use the data quality features:

1. Go to **Dataplex** > **Data Quality**
2. Click **Create Data Scan**
3. Select a BigQuery table
4. Configure quality rules:
   - Completeness checks
   - Validity rules
   - Uniqueness constraints
5. Set scan schedule
6. Click **Create**

## IAM Roles Summary

| Role | Purpose | Permissions |
|------|---------|-------------|
| `roles/bigquery.dataViewer` | Read BigQuery data | View tables, datasets, metadata |
| `roles/datalineage.viewer` | View data lineage | Access lineage graphs and relationships |
| `roles/datacatalog.viewer` | View Data Catalog | Read metadata, tags, policies |
| `roles/dataplex.dataScanDataViewer` | View data quality scans | Access data quality scan results |
| `roles/dataplex.viewer` | Access Dataplex metadata | View data scans, lakes, zones |

**Note:** These roles are granted to your user account, not a service account.

## Security Best Practices

### Authentication Management
- Use Application Default Credentials for local development
- Credentials are stored securely by gcloud CLI
- Rotate credentials by re-running `gcloud auth application-default login`
- Use `gcloud auth application-default revoke` to revoke credentials

### Least Privilege
- Grant only necessary permissions
- Use project-level or dataset-level permissions
- Regularly audit your IAM bindings

### Monitoring
- Enable audit logging for BigQuery
- Monitor your account usage
- Set up alerts for unusual activity

### Credential Storage Locations
Application Default Credentials are stored at:
- **macOS/Linux**: `~/.config/gcloud/application_default_credentials.json`
- **Windows**: `%APPDATA%\gcloud\application_default_credentials.json`

**Do not:**
- Share your ADC files
- Commit ADC files to version control
- Use production credentials for development

## Troubleshooting Permissions

### "Permission Denied" Errors

**Error:** `User does not have bigquery.datasets.get permission`

**Solution:** Add `roles/bigquery.dataViewer` role to your user account

**Error:** `Could not load the default credentials`

**Solution:** Run `gcloud auth application-default login` to authenticate

**Error:** `Data Lineage API not enabled`

**Solution:**
```bash
gcloud services enable datalineage.googleapis.com
```

### Verify Current Permissions

```bash
# List roles for your user account
YOUR_EMAIL=$(gcloud config get-value account)
gcloud projects get-iam-policy GCP_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:${YOUR_EMAIL}"
```

## Cost Considerations

### BigQuery Costs
- **Query costs:** $5 per TB scanned (queries through this MCP are read-only)
- **Storage costs:** $0.02 per GB per month (active), $0.01 per GB (long-term)

### Dataplex Costs
- **Data scans:** $0.10 per GB scanned
- **Metadata storage:** Minimal cost

### Cost Optimization Tips
- Use partitioning and clustering to reduce scan sizes
- Cache metadata to reduce API calls
- Use table metadata to understand optimization opportunities

## Additional Resources

- [BigQuery IAM Documentation](https://cloud.google.com/bigquery/docs/access-control)
- [Dataplex Documentation](https://cloud.google.com/dataplex/docs)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
- [Data Lineage Overview](https://cloud.google.com/data-catalog/docs/concepts/about-data-lineage)

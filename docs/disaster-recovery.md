# Disaster Recovery - Firestore Backup & Restore Guide

## Overview

This document provides comprehensive instructions for setting up automated Firestore backups and restoring data in case of disaster.

**Backup Strategy:**
- **Frequency:** Daily automated backups at 2:00 AM UTC
- **Retention:** 30 days (automatic deletion of older backups)
- **Storage:** Google Cloud Storage bucket
- **Scope:** All Firestore collections

---

## Prerequisites

Before setting up backups, ensure you have:

1. **Firebase Blaze Plan** (Pay-as-you-go)
   - ✅ You have 1 year of credits available
   - Required for Cloud Scheduler and Firestore export operations

2. **Google Cloud SDK** installed locally
   ```bash
   # Install gcloud CLI
   # macOS:
   brew install google-cloud-sdk

   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

3. **Project Access**
   - Owner or Editor role on the Firebase/GCP project
   - Project ID: `buildathon-judge-2026` (update if different)

4. **Authenticated with gcloud**
   ```bash
   gcloud auth login
   gcloud config set project buildathon-judge-2026
   ```

---

## Part 1: Initial Setup

### Step 1: Create Backup Storage Bucket

Create a dedicated Google Cloud Storage bucket for Firestore backups:

```bash
# Set your project ID
PROJECT_ID="buildathon-judge-2026"

# Create the backup bucket in us-central1 region
gsutil mb -p ${PROJECT_ID} -l us-central1 gs://${PROJECT_ID}-firestore-backups

# Verify bucket was created
gsutil ls -p ${PROJECT_ID}
```

**Expected Output:**
```
gs://buildathon-judge-2026-firestore-backups/
```

---

### Step 2: Configure Lifecycle Policy (30-Day Retention)

Create a lifecycle configuration to automatically delete backups older than 30 days:

```bash
# Create lifecycle.json configuration file
cat > lifecycle.json << 'EOF'
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": 30,
          "matchesPrefix": ["scheduled-backup/"]
        }
      }
    ]
  }
}
EOF

# Apply lifecycle policy to bucket
gsutil lifecycle set lifecycle.json gs://${PROJECT_ID}-firestore-backups

# Verify lifecycle policy
gsutil lifecycle get gs://${PROJECT_ID}-firestore-backups
```

---

### Step 3: Enable Required APIs

```bash
# Enable Cloud Scheduler API
gcloud services enable cloudscheduler.googleapis.com

# Enable Firestore API (should already be enabled)
gcloud services enable firestore.googleapis.com

# Verify APIs are enabled
gcloud services list --enabled | grep -E "(cloudscheduler|firestore)"
```

---

### Step 4: Grant Permissions to App Engine Service Account

Cloud Scheduler requires App Engine, which uses a default service account:

```bash
# Get the App Engine service account email
APP_ENGINE_SA="${PROJECT_ID}@appspot.gserviceaccount.com"

# Grant permissions for Firestore export operations
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${APP_ENGINE_SA}" \
  --role="roles/datastore.importExportAdmin"

# Grant permissions to write to Cloud Storage
gsutil iam ch serviceAccount:${APP_ENGINE_SA}:objectAdmin \
  gs://${PROJECT_ID}-firestore-backups
```

---

### Step 5: Initialize App Engine (Required for Cloud Scheduler)

Cloud Scheduler requires an App Engine app to exist:

```bash
# Initialize App Engine in us-central region
gcloud app create --region=us-central

# Note: If App Engine already exists, you'll see an error - this is fine, skip to next step
```

---

### Step 6: Create Cloud Scheduler Job for Daily Backups

```bash
# Create the scheduled export job
gcloud scheduler jobs create http firestore-daily-backup \
  --location=us-central1 \
  --schedule="0 2 * * *" \
  --uri="https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default):exportDocuments" \
  --http-method=POST \
  --headers="Content-Type=application/json" \
  --message-body="{
    \"outputUriPrefix\": \"gs://${PROJECT_ID}-firestore-backups/scheduled-backup/\$(date +%Y-%m-%d)\",
    \"collectionIds\": []
  }" \
  --oauth-service-account-email="${APP_ENGINE_SA}" \
  --oauth-token-scope="https://www.googleapis.com/auth/datastore"

# Verify the job was created
gcloud scheduler jobs list --location=us-central1
```

**Schedule Explanation:**
- `0 2 * * *` = Every day at 2:00 AM UTC
- Adjust timezone if needed using `--time-zone` flag

---

### Step 7: Test the Backup (Manual Trigger)

Before waiting for the scheduled run, test the backup manually:

```bash
# Manually trigger the scheduled job
gcloud scheduler jobs run firestore-daily-backup --location=us-central1

# Check job execution status
gcloud scheduler jobs describe firestore-daily-backup --location=us-central1

# Wait a few minutes, then verify backup appeared in Cloud Storage
gsutil ls gs://${PROJECT_ID}-firestore-backups/scheduled-backup/

# Check the most recent backup folder
gsutil ls gs://${PROJECT_ID}-firestore-backups/scheduled-backup/$(date +%Y-%m-%d)/
```

**Expected Output:**
You should see files like:
```
gs://buildathon-judge-2026-firestore-backups/scheduled-backup/2026-03-15/
gs://buildathon-judge-2026-firestore-backups/scheduled-backup/2026-03-15/all_namespaces/
gs://buildathon-judge-2026-firestore-backups/scheduled-backup/2026-03-15/all_namespaces/kind_events/
...
```

---

## Part 2: Monitoring & Verification

### Daily Monitoring Checklist

1. **Verify Daily Backup Execution**
   ```bash
   # Check recent job runs
   gcloud scheduler jobs describe firestore-daily-backup --location=us-central1 | grep lastAttemptTime

   # Check Cloud Storage for today's backup
   gsutil ls gs://${PROJECT_ID}-firestore-backups/scheduled-backup/$(date +%Y-%m-%d)/
   ```

2. **Check Backup Size** (estimate storage costs)
   ```bash
   # Get total size of all backups
   gsutil du -sh gs://${PROJECT_ID}-firestore-backups/
   ```

3. **Verify Lifecycle Policy is Working**
   ```bash
   # List backups older than 30 days (should be empty after 30 days)
   gsutil ls gs://${PROJECT_ID}-firestore-backups/scheduled-backup/ | head -35
   ```

### Set Up Alerts (Optional but Recommended)

Create a monitoring alert for backup failures:

```bash
# TODO: Configure Cloud Monitoring alerts
# Alert when backup job fails
# Send notification email to: admin@buildathon.live
```

---

## Part 3: Disaster Recovery - Restore Procedures

### Scenario 1: Restore Entire Database

**⚠️ WARNING:** This will OVERWRITE all existing data in Firestore!

```bash
# List available backups
gsutil ls gs://${PROJECT_ID}-firestore-backups/scheduled-backup/

# Choose a backup date (e.g., 2026-03-15)
BACKUP_DATE="2026-03-15"

# Restore from backup
gcloud firestore import gs://${PROJECT_ID}-firestore-backups/scheduled-backup/${BACKUP_DATE}/all_namespaces/all_namespaces.overall_export_metadata

# Monitor restore progress
# Check Firebase Console → Firestore → Usage tab
```

**Restore Time:** Typically 10-30 minutes depending on data size

---

### Scenario 2: Restore Specific Collections

Restore only specific collections (e.g., `events`, `teams`):

```bash
BACKUP_DATE="2026-03-15"

# Restore only specific collections
gcloud firestore import gs://${PROJECT_ID}-firestore-backups/scheduled-backup/${BACKUP_DATE}/all_namespaces/all_namespaces.overall_export_metadata \
  --collection-ids='events,teams,registrations'
```

---

### Scenario 3: Restore to a Different Project (Testing)

For testing restore procedures without affecting production:

```bash
# Create a test Firebase project first
TEST_PROJECT_ID="buildathon-judge-test"

# Set test project context
gcloud config set project ${TEST_PROJECT_ID}

# Restore to test project
gcloud firestore import gs://buildathon-judge-2026-firestore-backups/scheduled-backup/2026-03-15/all_namespaces/all_namespaces.overall_export_metadata
```

---

## Part 4: Backup Verification Strategy

### Monthly Verification Test (Recommended)

1. **Test Restore to Development Project**
   - Once per month, restore a recent backup to a test project
   - Verify data integrity and completeness
   - Document any issues

2. **Backup Integrity Checklist**
   - [ ] Backup files exist in Cloud Storage
   - [ ] Backup size is reasonable (not 0 bytes)
   - [ ] Restore completes without errors
   - [ ] Sample data is readable and accurate

---

## Part 5: Cost Estimation

**Cloud Storage Costs (as of 2026):**
- Storage: ~$0.020 per GB/month (us-central1)
- Estimated database size: 1-5 GB
- **Monthly cost:** ~$0.10 - $1.00

**Firestore Export Costs:**
- Export operation: Free
- No per-document export fees

**Cloud Scheduler Costs:**
- First 3 jobs: Free
- **Monthly cost:** $0

**Total Estimated Cost:** < $2/month

---

## Part 6: Troubleshooting

### Issue: "Permission denied" during backup

**Solution:**
```bash
# Re-grant permissions to App Engine service account
APP_ENGINE_SA="${PROJECT_ID}@appspot.gserviceaccount.com"
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${APP_ENGINE_SA}" \
  --role="roles/datastore.importExportAdmin"
```

---

### Issue: Backup job not running

**Solution:**
```bash
# Check job status
gcloud scheduler jobs describe firestore-daily-backup --location=us-central1

# Check recent logs
gcloud logging read "resource.type=cloud_scheduler_job AND resource.labels.job_id=firestore-daily-backup" --limit=10

# Manually trigger to test
gcloud scheduler jobs run firestore-daily-backup --location=us-central1
```

---

### Issue: Restore is stuck or slow

**Solution:**
- Large restores can take 30+ minutes
- Check Firebase Console → Firestore → Usage tab for progress
- Restore operations cannot be cancelled once started
- If stuck for > 2 hours, contact Firebase Support

---

## Part 7: Maintenance Tasks

### Quarterly Tasks

- [ ] Verify backup integrity by performing test restore
- [ ] Review backup retention policy (adjust if needed)
- [ ] Check storage costs and optimize if necessary
- [ ] Update this documentation with any changes

### Annual Tasks

- [ ] Review and update disaster recovery procedures
- [ ] Conduct full disaster recovery drill
- [ ] Update contact information for emergency procedures

---

## Emergency Contacts

**In case of data loss or disaster:**

1. **Firebase Support:** https://firebase.google.com/support
2. **GCP Support Console:** https://console.cloud.google.com/support
3. **Project Admin:** [Add your email]

---

## Quick Reference Commands

```bash
# List all backups
gsutil ls gs://buildathon-judge-2026-firestore-backups/scheduled-backup/

# Manual backup right now
gcloud scheduler jobs run firestore-daily-backup --location=us-central1

# Check backup job status
gcloud scheduler jobs describe firestore-daily-backup --location=us-central1

# Restore from specific date
gcloud firestore import gs://buildathon-judge-2026-firestore-backups/scheduled-backup/YYYY-MM-DD/all_namespaces/all_namespaces.overall_export_metadata

# Delete old backups manually (if lifecycle policy fails)
gsutil rm -r gs://buildathon-judge-2026-firestore-backups/scheduled-backup/2026-01-*
```

---

## Backup Status Dashboard

| Metric | Status | Last Checked |
|--------|--------|--------------|
| Daily Backup Running | ✅ / ❌ | YYYY-MM-DD |
| Last Successful Backup | YYYY-MM-DD | - |
| Backup Size | X.X GB | YYYY-MM-DD |
| Retention Policy Active | ✅ / ❌ | YYYY-MM-DD |
| Last Restore Test | YYYY-MM-DD | - |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-15
**Next Review Date:** 2026-06-15

# Infrastructure Scripts

This directory contains scripts for setting up and managing infrastructure components.

## Available Scripts

### `setup-firestore-backups.sh`

Automated setup script for daily Firestore backups to Google Cloud Storage.

**What it does:**
- Creates a Cloud Storage bucket for backups
- Configures 30-day automatic retention policy
- Sets up Cloud Scheduler for daily backups (2 AM UTC)
- Grants necessary permissions
- Optionally triggers a test backup

**Prerequisites:**
- Google Cloud SDK (`gcloud`) installed
- Authenticated with `gcloud auth login`
- Firebase Blaze (pay-as-you-go) plan enabled
- Owner or Editor role on the project

**Usage:**

```bash
# Run with default project ID (buildathon-judge-2026)
./scripts/setup-firestore-backups.sh

# Or set custom project ID
FIREBASE_PROJECT_ID=your-project-id ./scripts/setup-firestore-backups.sh
```

**Time to complete:** ~2-3 minutes

**Output:**
- Bucket: `gs://buildathon-judge-2026-firestore-backups`
- Daily backups stored at: `gs://[bucket]/scheduled-backup/YYYY-MM-DD/`
- Scheduler job: `firestore-daily-backup` (us-central1)

---

## Verification

After running the setup script, verify everything works:

```bash
# Check if backup job exists
gcloud scheduler jobs list --location=us-central1

# Check if bucket exists
gsutil ls | grep firestore-backups

# Wait 5 minutes after test backup, then check for backup files
gsutil ls gs://buildathon-judge-2026-firestore-backups/scheduled-backup/$(date +%Y-%m-%d)/
```

---

## Troubleshooting

**"Permission denied" errors:**
```bash
# Re-authenticate
gcloud auth login
gcloud auth application-default login
```

**"App Engine not initialized" error:**
```bash
# Initialize App Engine manually
gcloud app create --region=us-central
```

**Backup job not running:**
```bash
# Check job status
gcloud scheduler jobs describe firestore-daily-backup --location=us-central1

# Manually trigger
gcloud scheduler jobs run firestore-daily-backup --location=us-central1
```

---

## Documentation

For full disaster recovery procedures, see:
- **[docs/disaster-recovery.md](../docs/disaster-recovery.md)** - Complete backup/restore guide

---

## Cost Estimate

- **Cloud Storage:** ~$0.10 - $1.00/month (depends on data size)
- **Cloud Scheduler:** Free (first 3 jobs)
- **Firestore Exports:** Free
- **Total:** < $2/month

---

## Support

For issues or questions:
1. Check [docs/disaster-recovery.md](../docs/disaster-recovery.md)
2. Review script output for error messages
3. Check Cloud Logging in GCP Console

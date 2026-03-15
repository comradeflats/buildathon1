#!/bin/bash

#############################################
# Firestore Automated Backup Setup Script
#
# This script automates the setup of daily
# Firestore backups to Cloud Storage with
# 30-day retention policy.
#############################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${FIREBASE_PROJECT_ID:-buildathon-judge-2026}"
REGION="us-central1"
BUCKET_NAME="${PROJECT_ID}-firestore-backups"
JOB_NAME="firestore-daily-backup"
SCHEDULE="0 2 * * *"  # 2 AM UTC daily

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Firestore Backup Setup for ${PROJECT_ID}${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Function to print status messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed!"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

print_success "gcloud CLI found"

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    print_error "Not authenticated with gcloud. Run: gcloud auth login"
    exit 1
fi

print_success "Authenticated with gcloud"

# Set project
print_status "Setting project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# Check if gsutil is available
if ! command -v gsutil &> /dev/null; then
    print_error "gsutil is not available!"
    exit 1
fi

print_success "gsutil found"

echo ""
print_status "Starting Firestore backup setup..."
echo ""

#############################################
# Step 1: Create Storage Bucket
#############################################
print_status "Step 1/7: Creating Cloud Storage bucket..."

if gsutil ls -b gs://${BUCKET_NAME} &> /dev/null; then
    print_warning "Bucket gs://${BUCKET_NAME} already exists. Skipping creation."
else
    gsutil mb -p ${PROJECT_ID} -l ${REGION} gs://${BUCKET_NAME}
    print_success "Created bucket: gs://${BUCKET_NAME}"
fi

#############################################
# Step 2: Set Lifecycle Policy
#############################################
print_status "Step 2/7: Configuring 30-day retention policy..."

cat > /tmp/lifecycle.json << 'EOF'
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

gsutil lifecycle set /tmp/lifecycle.json gs://${BUCKET_NAME}
print_success "Lifecycle policy configured (30-day retention)"
rm /tmp/lifecycle.json

#############################################
# Step 3: Enable Required APIs
#############################################
print_status "Step 3/7: Enabling required APIs..."

gcloud services enable cloudscheduler.googleapis.com
gcloud services enable firestore.googleapis.com

print_success "APIs enabled"

#############################################
# Step 4: Grant Permissions
#############################################
print_status "Step 4/7: Granting permissions to service account..."

APP_ENGINE_SA="${PROJECT_ID}@appspot.gserviceaccount.com"

# Grant Firestore export permissions
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${APP_ENGINE_SA}" \
  --role="roles/datastore.importExportAdmin" \
  --quiet &> /dev/null

# Grant Cloud Storage permissions
gsutil iam ch serviceAccount:${APP_ENGINE_SA}:objectAdmin gs://${BUCKET_NAME} &> /dev/null

print_success "Permissions granted to ${APP_ENGINE_SA}"

#############################################
# Step 5: Initialize App Engine (if needed)
#############################################
print_status "Step 5/7: Checking App Engine initialization..."

if gcloud app describe &> /dev/null; then
    print_warning "App Engine already initialized. Skipping."
else
    print_status "Initializing App Engine in ${REGION}..."
    gcloud app create --region=${REGION}
    print_success "App Engine initialized"
fi

#############################################
# Step 6: Create Scheduler Job
#############################################
print_status "Step 6/7: Creating Cloud Scheduler job..."

# Check if job already exists
if gcloud scheduler jobs describe ${JOB_NAME} --location=${REGION} &> /dev/null; then
    print_warning "Scheduler job ${JOB_NAME} already exists."
    read -p "Do you want to delete and recreate it? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gcloud scheduler jobs delete ${JOB_NAME} --location=${REGION} --quiet
        print_status "Deleted existing job"
    else
        print_status "Keeping existing job"
    fi
fi

# Create the job if it doesn't exist
if ! gcloud scheduler jobs describe ${JOB_NAME} --location=${REGION} &> /dev/null; then
    gcloud scheduler jobs create http ${JOB_NAME} \
      --location=${REGION} \
      --schedule="${SCHEDULE}" \
      --uri="https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default):exportDocuments" \
      --http-method=POST \
      --headers="Content-Type=application/json" \
      --message-body="{\"outputUriPrefix\": \"gs://${BUCKET_NAME}/scheduled-backup/\$(date +%Y-%m-%d)\", \"collectionIds\": []}" \
      --oauth-service-account-email="${APP_ENGINE_SA}" \
      --oauth-token-scope="https://www.googleapis.com/auth/datastore"

    print_success "Scheduler job created: ${JOB_NAME}"
else
    print_status "Scheduler job already exists and was kept"
fi

#############################################
# Step 7: Test Backup
#############################################
print_status "Step 7/7: Running test backup..."

echo ""
read -p "Do you want to trigger a test backup now? (Y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    print_status "Skipping test backup"
else
    print_status "Triggering manual backup..."
    gcloud scheduler jobs run ${JOB_NAME} --location=${REGION}

    print_success "Backup triggered successfully!"
    print_status "Backup will complete in a few minutes. Check Cloud Storage at:"
    echo "    gs://${BUCKET_NAME}/scheduled-backup/$(date +%Y-%m-%d)/"

    echo ""
    print_status "To verify backup completion, wait 5 minutes then run:"
    echo "    gsutil ls gs://${BUCKET_NAME}/scheduled-backup/$(date +%Y-%m-%d)/"
fi

#############################################
# Setup Complete
#############################################
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Setup Complete! ✓${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

print_status "Summary:"
echo "  - Bucket: gs://${BUCKET_NAME}"
echo "  - Retention: 30 days"
echo "  - Schedule: Daily at 2:00 AM UTC"
echo "  - Next backup: $(date -d 'tomorrow 02:00' '+%Y-%m-%d %H:%M %Z' 2>/dev/null || date -v+1d -v2H -v0M '+%Y-%m-%d %H:%M %Z')"
echo ""

print_status "Next steps:"
echo "  1. Verify backup exists in Cloud Storage (after a few minutes)"
echo "  2. Review disaster-recovery.md documentation"
echo "  3. Set up monitoring alerts (optional)"
echo "  4. Schedule monthly restore tests"
echo ""

print_status "Useful commands:"
echo "  - List backups:  gsutil ls gs://${BUCKET_NAME}/scheduled-backup/"
echo "  - Job status:    gcloud scheduler jobs describe ${JOB_NAME} --location=${REGION}"
echo "  - Manual backup: gcloud scheduler jobs run ${JOB_NAME} --location=${REGION}"
echo ""

echo -e "${BLUE}For full documentation, see: docs/disaster-recovery.md${NC}"
echo ""

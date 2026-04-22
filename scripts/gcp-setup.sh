#!/usr/bin/env bash
set -euo pipefail

# GCP infrastructure setup for detached-node.dev (Cloud Run migration)
# Usage: ./scripts/gcp-setup.sh <GCP_PROJECT_ID> [GCP_REGION] [GITHUB_REPO] [DOMAIN]

GCP_PROJECT_ID="${1:-}"
GCP_REGION="${2:-us-west1}"
GITHUB_REPO="${3:-julianken/detached-node}"
DOMAIN="${4:-detached-node.dev}"

REGISTRY_NAME="tech-blog"
SA_NAME="github-deployer"
POOL_NAME="github-pool"
PROVIDER_NAME="github-provider"
BUCKET_NAME="${GCP_PROJECT_ID}-media"

# Color helpers (only when stdout is a terminal)
if [ -t 1 ]; then
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  RED='\033[0;31m'
  RESET='\033[0m'
else
  GREEN='' YELLOW='' RED='' RESET=''
fi

info()    { printf "${GREEN}[+]${RESET} %s\n" "$*"; }
warn()    { printf "${YELLOW}[!]${RESET} %s\n" "$*"; }
err()     { printf "${RED}[✗]${RESET} %s\n" "$*" >&2; }

usage() {
  printf "Usage: %s <GCP_PROJECT_ID> [GCP_REGION] [GITHUB_REPO] [DOMAIN]\n\n" "$0"
  printf "  GCP_PROJECT_ID   (required) GCP project to deploy into\n"
  printf "  GCP_REGION       (default: us-west1)\n"
  printf "  GITHUB_REPO      (default: julianken/detached-node)  owner/repo\n"
  printf "  DOMAIN           (default: detached-node.dev)\n\n"
  printf "Example:\n"
  printf "  %s my-gcp-project-123\n" "$0"
  exit 0
}

check_prereqs() {
  info "Step 0: Checking prerequisites"
  if ! command -v gcloud &>/dev/null; then
    err "gcloud CLI not found. Install from https://cloud.google.com/sdk/docs/install"
    exit 1
  fi
  if ! gcloud auth print-access-token &>/dev/null; then
    err "Not authenticated. Run: gcloud auth login"
    exit 1
  fi
  info "gcloud OK ($(gcloud version --format='value(Google Cloud SDK)' 2>/dev/null || echo 'unknown version'))"
}

set_project() {
  info "Step 1: Setting active project to ${GCP_PROJECT_ID}"
  gcloud config set project "${GCP_PROJECT_ID}" --quiet
}

enable_apis() {
  info "Step 2: Enabling required APIs (this may take a minute)"
  gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    iam.googleapis.com \
    iamcredentials.googleapis.com \
    cloudresourcemanager.googleapis.com \
    billingbudgets.googleapis.com \
    --quiet
  info "APIs enabled"
}

create_artifact_registry() {
  info "Step 3: Creating Artifact Registry (${REGISTRY_NAME})"
  if gcloud artifacts repositories describe "${REGISTRY_NAME}" \
      --location="${GCP_REGION}" --format='value(name)' &>/dev/null; then
    warn "Artifact Registry '${REGISTRY_NAME}' already exists — skipping"
  else
    gcloud artifacts repositories create "${REGISTRY_NAME}" \
      --repository-format=docker \
      --location="${GCP_REGION}" \
      --description="Docker images for detached-node.dev" \
      --quiet
    info "Created Artifact Registry: ${REGISTRY_NAME}"
  fi
}

create_gcs_bucket() {
  info "Step 4: Creating GCS media bucket (${BUCKET_NAME})"
  if gcloud storage buckets describe "gs://${BUCKET_NAME}" &>/dev/null; then
    warn "Bucket gs://${BUCKET_NAME} already exists — skipping creation"
  else
    gcloud storage buckets create "gs://${BUCKET_NAME}" \
      --location="${GCP_REGION}" \
      --uniform-bucket-level-access \
      --quiet
    info "Created bucket gs://${BUCKET_NAME}"
  fi

  info "Step 4a: Granting public read on bucket"
  gcloud storage buckets add-iam-policy-binding "gs://${BUCKET_NAME}" \
    --member="allUsers" \
    --role="roles/storage.objectViewer" \
    --quiet

  info "Step 4b: Applying CORS policy to bucket"
  local cors_json
  cors_json="$(mktemp /tmp/gcs-cors-XXXXXX.json)"
  trap 'rm -f "${cors_json}"' RETURN
  cat > "${cors_json}" <<EOF
[
  {
    "origin": ["https://${DOMAIN}", "http://localhost:3000"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
EOF
  gcloud storage buckets update "gs://${BUCKET_NAME}" \
    --cors-file="${cors_json}" \
    --quiet
  info "CORS applied to gs://${BUCKET_NAME}"
}

create_service_account() {
  info "Step 5: Creating service account (${SA_NAME})"
  local sa_email="${SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

  if gcloud iam service-accounts describe "${sa_email}" &>/dev/null; then
    warn "Service account ${sa_email} already exists — skipping creation"
  else
    gcloud iam service-accounts create "${SA_NAME}" \
      --display-name="GitHub Actions deployer for detached-node.dev" \
      --quiet
    info "Created service account: ${sa_email}"
  fi

  info "Step 5a: Granting project-level IAM roles"
  local roles=("roles/run.admin" "roles/artifactregistry.writer" "roles/iam.serviceAccountUser" "roles/secretmanager.secretAccessor")
  for role in "${roles[@]}"; do
    gcloud projects add-iam-policy-binding "${GCP_PROJECT_ID}" \
      --member="serviceAccount:${sa_email}" \
      --role="${role}" \
      --condition=None \
      --quiet
  done

  info "Step 5b: Granting storage.objectAdmin on media bucket"
  gcloud storage buckets add-iam-policy-binding "gs://${BUCKET_NAME}" \
    --member="serviceAccount:${sa_email}" \
    --role="roles/storage.objectAdmin" \
    --quiet

  info "Service account configured: ${sa_email}"
}

create_wif() {
  info "Step 6: Creating Workload Identity Federation"
  local sa_email="${SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

  if gcloud iam workload-identity-pools describe "${POOL_NAME}" \
      --location=global --format='value(name)' &>/dev/null; then
    warn "WIF pool '${POOL_NAME}' already exists — skipping creation"
  else
    gcloud iam workload-identity-pools create "${POOL_NAME}" \
      --location=global \
      --display-name="GitHub Actions pool" \
      --quiet
    info "Created WIF pool: ${POOL_NAME}"
  fi

  if gcloud iam workload-identity-pools providers describe "${PROVIDER_NAME}" \
      --workload-identity-pool="${POOL_NAME}" \
      --location=global --format='value(name)' &>/dev/null; then
    warn "WIF provider '${PROVIDER_NAME}' already exists — skipping creation"
  else
    gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_NAME}" \
      --workload-identity-pool="${POOL_NAME}" \
      --location=global \
      --issuer-uri="https://token.actions.githubusercontent.com" \
      --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
      --attribute-condition="assertion.repository == '${GITHUB_REPO}'" \
      --quiet
    info "Created WIF provider: ${PROVIDER_NAME}"
  fi

  info "Step 6a: Binding SA to WIF pool (repo-scoped)"
  local project_number
  project_number="$(gcloud projects describe "${GCP_PROJECT_ID}" --format='value(projectNumber)')"
  gcloud iam service-accounts add-iam-policy-binding "${sa_email}" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/${project_number}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${GITHUB_REPO}" \
    --quiet

  info "WIF configured. Provider path:"
  printf "  projects/%s/locations/global/workloadIdentityPools/%s/providers/%s\n" \
    "${project_number}" "${POOL_NAME}" "${PROVIDER_NAME}"
}

create_secrets() {
  info "Step 7: Creating Secret Manager placeholder secrets"
  local secrets=("database-url" "payload-secret" "upstash-redis-url" "upstash-redis-token" "gcs-bucket" "gcs-hmac-key" "gcs-hmac-secret")

  for secret in "${secrets[@]}"; do
    if gcloud secrets describe "${secret}" --format='value(name)' &>/dev/null; then
      warn "Secret '${secret}' already exists — skipping"
    else
      # Create with a placeholder value; user will populate manually
      printf "PLACEHOLDER" | gcloud secrets create "${secret}" \
        --replication-policy=automatic \
        --data-file=- \
        --quiet
      info "Created placeholder secret: ${secret}"
    fi
  done

  printf "\n"
  warn "ACTION REQUIRED — populate each secret before deploying:"
  printf "  gcloud secrets versions add database-url    --data-file=-   # paste Supabase session URL\n"
  printf "  gcloud secrets versions add payload-secret  --data-file=-   # paste Payload CMS secret\n"
  printf "  gcloud secrets versions add upstash-redis-url    --data-file=-\n"
  printf "  gcloud secrets versions add upstash-redis-token  --data-file=-\n"
  printf "  gcloud secrets versions add gcs-bucket     --data-file=-    # value: %s\n" "${BUCKET_NAME}"
  printf "\n"
  warn "For HMAC keys (gcs-hmac-key, gcs-hmac-secret), see Step 8 instructions below.\n"
}

print_hmac_instructions() {
  info "Step 8: HMAC key creation (manual — key must be captured at creation time)"
  local sa_email="${SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
  printf "\n"
  printf "  Run the following and capture the output:\n\n"
  printf "    gcloud storage hmac create %s --project=%s\n\n" "${sa_email}" "${GCP_PROJECT_ID}"
  printf "  Then store the values:\n"
  printf "    printf '<ACCESS_KEY>'  | gcloud secrets versions add gcs-hmac-key    --data-file=-\n"
  printf "    printf '<SECRET>'      | gcloud secrets versions add gcs-hmac-secret --data-file=-\n\n"
}

print_gh_actions_config() {
  info "Step 9: GitHub Actions configuration"
  local project_number
  project_number="$(gcloud projects describe "${GCP_PROJECT_ID}" --format='value(projectNumber)')"
  local wif_provider="projects/${project_number}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"
  local sa_email="${SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

  printf "\n  Set GitHub Actions variables (repo: %s):\n\n" "${GITHUB_REPO}"
  printf "    gh variable set GCP_PROJECT_ID                --body '%s'\n" "${GCP_PROJECT_ID}"
  printf "    gh variable set GCP_REGION                    --body '%s'\n" "${GCP_REGION}"
  printf "    gh variable set GCP_SERVICE_ACCOUNT           --body '%s'\n" "${sa_email}"
  printf "    gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER --body '%s'\n" "${wif_provider}"
  printf "    gh variable set NEXT_PUBLIC_SERVER_URL         --body 'https://%s'\n\n" "${DOMAIN}"
  printf "  Set GitHub Actions secrets:\n\n"
  printf "    gh secret set SUPABASE_SESSION_URL   # Supabase Postgres session URL (port 5432)\n"
  printf "    gh secret set PAYLOAD_SECRET         # Payload CMS secret\n\n"
}

print_domain_instructions() {
  info "Step 10: Custom domain mapping (run after first successful deploy)"
  printf "\n"
  printf "  gcloud run domain-mappings create \\\\\n"
  printf "    --service=detached-node \\\\\n"
  printf "    --domain=%s \\\\\n" "${DOMAIN}"
  printf "    --region=%s\n\n" "${GCP_REGION}"
  printf "  Then add the DNS records shown in the output to your DNS provider.\n\n"
}

print_budget_note() {
  # Billing Budget API requires a billing account ID — cannot be automated generically
  warn "Billing budget: set one at https://console.cloud.google.com/billing/budgets"
  printf "  (billingbudgets.googleapis.com is enabled; billing account ID needed to automate)\n\n"
}

# ── Main ─────────────────────────────────────────────────────────────────────

if [[ "${1:-}" == "--help" || -z "${GCP_PROJECT_ID}" ]]; then
  usage
fi

printf "\n${GREEN}=== GCP Infrastructure Setup: detached-node.dev ===${RESET}\n"
printf "  Project : %s\n  Region  : %s\n  Repo    : %s\n  Domain  : %s\n\n" \
  "${GCP_PROJECT_ID}" "${GCP_REGION}" "${GITHUB_REPO}" "${DOMAIN}"

check_prereqs
set_project
enable_apis
create_artifact_registry
create_gcs_bucket
create_service_account
create_wif
create_secrets
print_hmac_instructions
print_gh_actions_config
print_domain_instructions
print_budget_note

printf "${GREEN}=== Setup complete ===${RESET}\n"
printf "Next: populate secrets, run HMAC creation, set GH Actions vars/secrets, then push to main.\n\n"

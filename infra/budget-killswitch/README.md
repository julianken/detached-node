# Budget kill switch

Cloud Function that detaches billing from `detached-node` when the
monthly `blog-spend-cap` budget is hit.

## Wiring

- Budget `blog-spend-cap` ($50/mo) publishes to Pub/Sub topic `budget-alerts`
  on every threshold cross. The budget's email channel warns at 60% ($30)
  and 90% ($45).
- Function `budget-killswitch` (2nd gen, Python 3.12) subscribes to that
  topic and detaches billing when `costAmount >= budgetAmount`.
- Runtime SA: `budget-killswitch@detached-node.iam.gserviceaccount.com`.
- Region: `us-west1` (colocated with the `detached-node` Cloud Run service).

### IAM bindings the deploy doesn't create

Granted once, out of band from `gcloud functions deploy`:

```
# Lets the function detach billing from the project.
gcloud projects add-iam-policy-binding detached-node \
  --member=serviceAccount:budget-killswitch@detached-node.iam.gserviceaccount.com \
  --role=roles/billing.projectManager

# Lets the Pub/Sub push subscription invoke the underlying Cloud Run service.
# For Gen 2 + --trigger-topic, the invoker is the Pub/Sub-managed service
# agent, NOT the function's runtime SA.
gcloud run services add-iam-policy-binding budget-killswitch \
  --region=us-west1 \
  --member=serviceAccount:service-474426172729@gcp-sa-pubsub.iam.gserviceaccount.com \
  --role=roles/run.invoker

# Lets the Pub/Sub service agent mint OIDC tokens for the function's runtime SA.
gcloud iam service-accounts add-iam-policy-binding \
  budget-killswitch@detached-node.iam.gserviceaccount.com \
  --member=serviceAccount:service-474426172729@gcp-sa-pubsub.iam.gserviceaccount.com \
  --role=roles/iam.serviceAccountTokenCreator
```

## Recovery after a trigger

```
gcloud billing projects link detached-node \
  --billing-account=011F47-AB44AC-9479DB
```

Cloud Run services scale back up on the next request. No data is lost;
Cloud SQL / GCS / Secret Manager keep their contents while billing is
detached.

## Redeploy

```
gcloud functions deploy budget-killswitch \
  --gen2 \
  --region=us-west1 \
  --runtime=python312 \
  --entry-point=handle_budget_alert \
  --trigger-topic=budget-alerts \
  --service-account=budget-killswitch@detached-node.iam.gserviceaccount.com \
  --set-env-vars=TARGET_PROJECT_ID=detached-node \
  --source=.
```

## Test without spending $50

Publish a synthetic payload to the topic:

```
gcloud pubsub topics publish budget-alerts \
  --message='{"costAmount": 0.01, "budgetAmount": 50}' \
  --attribute=budgetDisplayName=blog-spend-cap
```

The under-threshold branch will log and exit without touching billing.
To dry-run the detach path, temporarily set `costAmount` above
`budgetAmount` in the message — but only do this if you are prepared
to re-link billing immediately.

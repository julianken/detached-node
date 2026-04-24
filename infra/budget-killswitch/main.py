"""Cloud Function that detaches billing from a project when a budget's
actual spend meets or exceeds the budgeted amount.

Triggered by Pub/Sub messages from a GCP Budget notification channel.
The message attributes carry `budgetAmount` and `costAmount`; the
payload JSON carries the full budget event. We detach billing iff
costAmount >= budgetAmount.
"""

import base64
import json
import os

from google.cloud import billing_v1

PROJECT_ID = os.environ["TARGET_PROJECT_ID"]
PROJECT_NAME = f"projects/{PROJECT_ID}"


def handle_budget_alert(event, context):
    pubsub_message = event.get("data")
    if not pubsub_message:
        print("No data in event; ignoring.")
        return

    try:
        payload = json.loads(base64.b64decode(pubsub_message).decode("utf-8"))
    except (ValueError, TypeError) as exc:
        print(f"Could not decode payload: {exc}")
        return

    cost = float(payload.get("costAmount", 0))
    budget = float(payload.get("budgetAmount", 0))
    print(f"Budget alert: cost={cost} budget={budget}")

    if budget <= 0 or cost < budget:
        print("Under threshold; no action.")
        return

    client = billing_v1.CloudBillingClient()
    info = client.get_project_billing_info(name=PROJECT_NAME)
    if not info.billing_enabled:
        print("Billing already disabled; no action.")
        return

    client.update_project_billing_info(
        name=PROJECT_NAME,
        project_billing_info=billing_v1.ProjectBillingInfo(billing_account_name=""),
    )
    print(f"Disabled billing on {PROJECT_ID}.")

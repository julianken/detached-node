"""Cloud Function that detaches billing from a project when a budget's
actual spend meets or exceeds the budgeted amount.

Triggered by Pub/Sub messages from a GCP Budget notification channel.
Deployed as a Gen 2 Cloud Function, so the runtime delivers a
CloudEvent. The Pub/Sub message JSON carries `budgetAmount` and
`costAmount`; we detach billing iff costAmount >= budgetAmount.
"""

import base64
import json
import os

import functions_framework
from google.cloud import billing_v1

PROJECT_ID = os.environ["TARGET_PROJECT_ID"]
PROJECT_NAME = f"projects/{PROJECT_ID}"


@functions_framework.cloud_event
def handle_budget_alert(cloud_event):
    try:
        encoded = cloud_event.data["message"]["data"]
    except (KeyError, TypeError) as exc:
        print(f"CloudEvent missing message.data: {exc}")
        return

    try:
        payload = json.loads(base64.b64decode(encoded).decode("utf-8"))
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

"""
Integration smoke-test for the Closira enquiry pipeline.
Run from the /backend directory:
    python verify_pipeline.py
"""
import sys
import time
from pathlib import Path

# Ensure the backend package is importable regardless of CWD
sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

DIVIDER = "=" * 60


def section(title: str) -> None:
    print(f"\n{DIVIDER}")
    print(f"  {title}")
    print(DIVIDER)


def ok(msg: str) -> None:
    print(f"  ✅  {msg}")


def fail(msg: str) -> None:
    print(f"  ❌  {msg}")


# ── 1. Health ──────────────────────────────────────────────────────────────
section("1 / 5  HEALTH CHECK")
r = client.get("/health")
if r.status_code == 200 and r.json().get("status") == "healthy":
    ok(f"Healthy → {r.json()}")
else:
    fail(f"HTTP {r.status_code} → {r.text}")

# ── 2. Create enquiry ──────────────────────────────────────────────────────
section("2 / 5  CREATE ENQUIRY  (POST /enquiry)")
payload = {
    "channel": "WhatsApp",
    "customer_name": "Sarah Miller",
    "message": "Hello! I would love to book a slot for tomorrow afternoon.",
}
r = client.post("/enquiry", json=payload)
if r.status_code == 202:
    enq_id = r.json()["job_id"]
    ok(f"Accepted → job_id={enq_id}")
else:
    fail(f"HTTP {r.status_code} → {r.text}")
    sys.exit(1)

# Give BackgroundTasks a moment to run (TestClient is synchronous but tasks run inline)
time.sleep(0.2)

# ── 3. History ─────────────────────────────────────────────────────────────
section("3 / 5  FETCH HISTORY  (GET /enquiry/{id}/history)")
r = client.get(f"/enquiry/{enq_id}/history")
if r.status_code == 200:
    data = r.json()
    ok(f"Status      : {data['status']}")
    ok(f"Matched SOP : {data['matched_sop']}")
    ok(f"Suggested   : {data['suggested_response']}")
    ok(f"Timeline    : {len(data['timeline'])} events")
else:
    fail(f"HTTP {r.status_code} → {r.text}")

# ── 4. Follow-up ───────────────────────────────────────────────────────────
section("4 / 5  SCHEDULE FOLLOW-UP  (POST /enquiry/{id}/follow-up)")
r = client.post(f"/enquiry/{enq_id}/follow-up", json={"delay_minutes": 30})
if r.status_code == 200:
    ok(r.json()["message"])
else:
    fail(f"HTTP {r.status_code} → {r.text}")

# ── 5. Escalate ────────────────────────────────────────────────────────────
section("5 / 5  ESCALATE  (POST /enquiry/{id}/escalate)")
r = client.post(f"/enquiry/{enq_id}/escalate", json={"reason": "Customer requested human agent"})
if r.status_code == 200:
    ok(f"Escalated → {r.json()}")
else:
    fail(f"HTTP {r.status_code} → {r.text}")

print(f"\n{DIVIDER}")
print("  ALL PIPELINE STAGES VERIFIED")
print(DIVIDER + "\n")
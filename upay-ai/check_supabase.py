"""
Full Supabase Integration Check — run: python check_supabase.py
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import urllib.request, json, psycopg, psycopg.rows

BASE = "http://localhost:8001"
HEADERS = {"x-api-key": "milestone-ai-dev-key-2026"}
DB_URL = "postgresql://postgres.dqkkdxlicrmtamxicmms:R7Y2jvgA41cN8O3S@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"

passed = 0
failed = 0

def ok(label, detail=""):
    global passed
    passed += 1
    msg = f"  [PASS] {label}"
    if detail:
        msg += f": {detail}"
    print(msg)

def fail(label, detail=""):
    global failed
    failed += 1
    msg = f"  [FAIL] {label}"
    if detail:
        msg += f": {detail}"
    print(msg)

def api(path, timeout=40):
    try:
        req = urllib.request.Request(f"{BASE}{path}", headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read())
    except Exception as e:
        return None, str(e)

def pg_connect():
    return psycopg.connect(DB_URL, row_factory=psycopg.rows.dict_row, connect_timeout=10)


print("=" * 55)
print("  SUPABASE INTEGRATION FULL CHECK")
print("=" * 55)

# ── 1. Direct Supabase connection ─────────────────────────────
print("\n[1] Supabase Direct Connection")
try:
    pg = pg_connect()
    ok("Supabase (PostgreSQL 17) connected")
    cur = pg.cursor()
    for table in ["predictions", "nudges", "savings_plans", "traces"]:
        cur.execute(f"SELECT COUNT(*) as c FROM {table}")
        count = cur.fetchone()["c"]
        ok(f"Table [{table}]", f"{count} rows in Supabase")
    cur.close()
    pg.close()
except Exception as e:
    fail("Supabase connection", str(e))

# ── 2. Health check ───────────────────────────────────────────
print("\n[2] Health Check")
status, data = api("/health")
if status == 200:
    ok("/health", data.get("service"))
else:
    fail("/health", str(data))

# ── 3. Prediction endpoint ────────────────────────────────────
print("\n[3] Prediction Endpoint + Supabase Persistence")
status, data = api("/api/v1/users/U000016699/prediction", timeout=60)
if status == 200 and isinstance(data, dict):
    pred_id = data.get("prediction_id")
    milestones = list(data.get("milestone_probabilities", {}).keys())
    ok("/users/{id}/prediction returns 200", "pred_id=" + str(pred_id))
    ok("Has milestone_probabilities", str(milestones))
    ok("Has primary_drop_off", str(data.get("primary_drop_off")))
    if data.get("nudge"):
        ok("Nudge generated", data["nudge"].get("target_milestone"))
    else:
        ok("Nudge field present (may be null)", "no drop-off")

    # Verify saved in Supabase
    try:
        pg = pg_connect()
        cur = pg.cursor()
        cur.execute("SELECT prediction_id, primary_drop_off FROM predictions WHERE prediction_id = %s", (pred_id,))
        row = cur.fetchone()
        if row:
            ok("Prediction persisted to Supabase", row["prediction_id"])
        else:
            fail("Prediction persisted to Supabase", "NOT FOUND in DB")
        cur.close()
        pg.close()
    except Exception as e:
        fail("Prediction persisted to Supabase", str(e))
else:
    fail("/users/{id}/prediction", str(data)[:100])

# ── 4. At-risk users ──────────────────────────────────────────
print("\n[4] At-Risk Users Endpoint")
status, data = api("/api/v1/at-risk-users?limit=5", timeout=90)
if status == 200 and isinstance(data, dict):
    total = data.get("total_at_risk", 0)
    users = data.get("users", [])
    ok("/at-risk-users returns 200", "total_at_risk=" + str(total))
    if users:
        ok("Users returned", "sample=" + str(users[0].get("user_id")))
else:
    fail("/at-risk-users", str(data)[:100])

# ── 5. Savings plan endpoint ──────────────────────────────────
print("\n[5] Savings Plan Endpoint + Supabase Persistence")
status, data = api("/api/v1/users/U000016699/savings-plan", timeout=60)
if status == 200 and isinstance(data, dict):
    surplus = data.get("cashflow", {}).get("monthly_surplus")
    eligible = data.get("dps_recommendation", {}).get("eligible")
    ok("/users/{id}/savings-plan returns 200", "monthly_surplus=" + str(surplus))
    ok("DPS recommendation present", "eligible=" + str(eligible))

    # Verify saved in Supabase
    try:
        pg = pg_connect()
        cur = pg.cursor()
        cur.execute("SELECT COUNT(*) as c FROM savings_plans WHERE user_id = 'U000016699'")
        count = cur.fetchone()["c"]
        if count > 0:
            ok("Savings plan persisted to Supabase", str(count) + " plan(s) found")
        else:
            fail("Savings plan persisted to Supabase", "NOT FOUND in DB")
        cur.close()
        pg.close()
    except Exception as e:
        fail("Savings plan persisted to Supabase", str(e))
else:
    fail("/users/{id}/savings-plan", str(data)[:100])

# ── 6. Traces endpoint ────────────────────────────────────────
print("\n[6] Traces Endpoint (reads from Supabase)")
status, data = api("/api/v1/traces?limit=5")
if status == 200 and isinstance(data, dict):
    total = data.get("total", 0)
    ok("/traces returns 200", "total=" + str(total))
    for t in data.get("traces", [])[:2]:
        print("       trace_id=" + str(t.get("trace_id")) + " | action=" + str(t.get("action")) + " | user=" + str(t.get("user_id")))
else:
    fail("/traces", str(data)[:100])

# ── 7. Nudge approval ─────────────────────────────────────────
print("\n[7] Nudge Approve Endpoint (writes to Supabase)")
try:
    pg = pg_connect()
    cur = pg.cursor()
    cur.execute("SELECT nudge_id FROM nudges LIMIT 1")
    row = cur.fetchone()
    cur.close()
    pg.close()

    if row:
        nid = row["nudge_id"]
        payload = json.dumps({"action": "approved", "approver_id": "TEST_CM001"}).encode()
        req = urllib.request.Request(
            f"{BASE}/api/v1/nudges/{nid}/approve",
            data=payload,
            headers={**HEADERS, "Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as r:
            resp = json.loads(r.read())
            ok("POST /nudges/{id}/approve", "status=" + str(resp.get("status")))
    else:
        fail("POST /nudges/{id}/approve", "No nudge in Supabase to test")
except Exception as e:
    fail("POST /nudges/{id}/approve", str(e)[:80])

# ── 8. Config verification ────────────────────────────────────
print("\n[8] Config Verification")
sys.path.insert(0, "backend")
from app.config import Config

if "pooler.supabase.com" in Config.DATABASE_URL:
    host_part = Config.DATABASE_URL.split("@")[-1]
    ok("DATABASE_URL uses Supabase pooler", host_part)
else:
    fail("DATABASE_URL", "Not pointing to Supabase: " + Config.DATABASE_URL[:60])

sqlite_in_code = False
import os
for root, dirs, files in os.walk("backend/app"):
    dirs[:] = [d for d in dirs if d != "__pycache__"]
    for f in files:
        if f.endswith(".py"):
            content = open(os.path.join(root, f)).read()
            if "sqlite3.connect" in content:
                sqlite_in_code = True
                fail("No sqlite3.connect in backend code", f)

if not sqlite_in_code:
    ok("No sqlite3.connect calls in backend code", "Clean PostgreSQL-only codebase")

# ── Summary ───────────────────────────────────────────────────
print("\n" + "=" * 55)
print(f"  TOTAL: {passed} PASSED  |  {failed} FAILED")
if failed == 0:
    print("  ALL CHECKS PASSED!")
    print("  Project is 100% running on Supabase (PostgreSQL).")
else:
    print(f"  {failed} issue(s) detected. Review above.")
print("=" * 55)

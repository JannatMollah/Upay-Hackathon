"""Restore app tables and migrate data from SQLite"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import psycopg, psycopg.rows, sqlite3, os

DB_URL = "postgresql://postgres.dqkkdxlicrmtamxicmms:R7Y2jvgA41cN8O3S@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"
pg = psycopg.connect(DB_URL)

SQLITE = os.path.join("data", "milestone_ai.db")
if os.path.exists(SQLITE):
    sl = sqlite3.connect(SQLITE)
    sl.row_factory = sqlite3.Row
    slc = sl.cursor()

    slc.execute("SELECT * FROM nudges")
    rows = slc.fetchall()
    print(f"Migrating {len(rows)} nudges...")
    m = 0
    for row in rows:
        try:
            with pg.cursor() as cur:
                cur.execute(
                    "INSERT INTO nudges (nudge_id,prediction_id,user_id,target_milestone,bonus_amount_bdt,text_bn,text_en,channel_recommendation,status,ai_generated,guardrail_passed,generation_method,approved_by,approved_at,created_at) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING",
                    (row["nudge_id"],row["prediction_id"],row["user_id"],row["target_milestone"],row["bonus_amount_bdt"],row["text_bn"],row["text_en"],row["channel_recommendation"],row["status"],bool(row["ai_generated"]) if row["ai_generated"] is not None else None,bool(row["guardrail_passed"]) if row["guardrail_passed"] is not None else None,row["generation_method"],row["approved_by"],row["approved_at"],row["created_at"])
                )
            pg.commit()
            m += 1
        except:
            pass
    print(f"Nudges: {m}/{len(rows)} restored")

    slc.execute("SELECT * FROM traces")
    rows = slc.fetchall()
    print(f"Migrating {len(rows)} traces...")
    m = 0
    for row in rows:
        try:
            with pg.cursor() as cur:
                cur.execute(
                    "INSERT INTO traces (prediction_id,nudge_id,user_id,action,details,actor,timestamp) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                    (row["prediction_id"],row["nudge_id"],row["user_id"],row["action"],row["details"],row["actor"],row["timestamp"])
                )
            pg.commit()
            m += 1
        except:
            pass
    print(f"Traces: {m}/{len(rows)} restored")
    slc.close()
    sl.close()

print("\n--- Supabase table counts ---")
with pg.cursor(row_factory=psycopg.rows.dict_row) as cur:
    tables = ["predictions","nudges","savings_plans","traces",
              "agents","agent_daily","users","cashflow_summary","features_test","milestone_events"]
    for t in tables:
        try:
            cur.execute(f"SELECT COUNT(*) as c FROM {t}")
            count = cur.fetchone()["c"]
            print(f"  {t}: {count}")
        except Exception as e:
            print(f"  {t}: ERROR - {e}")

pg.close()
print("\nDone!")

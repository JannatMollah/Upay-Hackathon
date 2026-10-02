"""
Supabase Migration Script
Creates tables and migrates existing SQLite data to Supabase (PostgreSQL).
Uses psycopg v3 (compatible with Python 3.14).
Run: python migrate_to_supabase.py
"""

import sqlite3
import psycopg
import psycopg.rows
import os
import sys

# ── Config ──────────────────────────────────────────────────────────────────
SQLITE_PATH = os.path.join(os.path.dirname(__file__), "data", "milestone_ai.db")
DATABASE_URL = "postgresql://postgres.dqkkdxlicrmtamxicmms:R7Y2jvgA41cN8O3S@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"


def connect_pg():
    print("🔌 Connecting to Supabase (PostgreSQL)...")
    conn = psycopg.connect(DATABASE_URL)
    print("✅ Connected to Supabase!")
    return conn


def create_tables(pg_conn):
    """Create all tables in Supabase."""
    print("\n📦 Creating tables in Supabase...")

    with pg_conn.cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                prediction_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                milestone_probabilities TEXT NOT NULL,
                primary_drop_off TEXT,
                shap_values TEXT,
                created_at TEXT DEFAULT (NOW()::TEXT)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS nudges (
                nudge_id TEXT PRIMARY KEY,
                prediction_id TEXT,
                user_id TEXT NOT NULL,
                target_milestone TEXT NOT NULL,
                bonus_amount_bdt INTEGER,
                text_bn TEXT,
                text_en TEXT,
                channel_recommendation TEXT,
                status TEXT DEFAULT 'pending_approval',
                ai_generated BOOLEAN,
                guardrail_passed BOOLEAN,
                generation_method TEXT,
                approved_by TEXT,
                approved_at TEXT,
                created_at TEXT DEFAULT (NOW()::TEXT)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS savings_plans (
                plan_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                predicted_surplus REAL,
                recommended_amount INTEGER,
                recommended_tenure INTEGER,
                projected_maturity REAL,
                surplus_pct_used REAL,
                cashflow_summary TEXT,
                linked_nudge_id TEXT,
                created_at TEXT DEFAULT (NOW()::TEXT)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS traces (
                trace_id SERIAL PRIMARY KEY,
                prediction_id TEXT,
                nudge_id TEXT,
                user_id TEXT,
                action TEXT NOT NULL,
                details TEXT,
                actor TEXT,
                timestamp TEXT DEFAULT (NOW()::TEXT)
            )
        """)

        pg_conn.commit()
    print("✅ All 4 tables created/verified in Supabase!")


def migrate_sqlite_data(pg_conn):
    """Migrate existing SQLite data to Supabase."""
    if not os.path.exists(SQLITE_PATH):
        print(f"\n⚠️  SQLite DB not found at: {SQLITE_PATH}")
        print("   Skipping data migration (tables are ready, starting fresh).")
        return

    print(f"\n📂 Reading SQLite DB from: {SQLITE_PATH}")
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_conn.row_factory = sqlite3.Row

    sl_cursor = sqlite_conn.cursor()

    # ── Migrate predictions ──────────────────────────────────────────────────
    sl_cursor.execute("SELECT * FROM predictions")
    rows = sl_cursor.fetchall()
    print(f"\n  → Migrating {len(rows)} predictions...")
    migrated = 0
    for row in rows:
        try:
            with pg_conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO predictions
                       (prediction_id, user_id, timestamp, milestone_probabilities, primary_drop_off, shap_values, created_at)
                       VALUES (%s, %s, %s, %s, %s, %s, %s)
                       ON CONFLICT (prediction_id) DO NOTHING""",
                    (
                        row["prediction_id"], row["user_id"], row["timestamp"],
                        row["milestone_probabilities"], row["primary_drop_off"],
                        row["shap_values"], row["created_at"],
                    ),
                )
            pg_conn.commit()
            migrated += 1
        except Exception as e:
            print(f"    ⚠️  Skipping prediction {row['prediction_id']}: {e}")
    print(f"  ✅ {migrated}/{len(rows)} predictions migrated.")

    # ── Migrate nudges ───────────────────────────────────────────────────────
    sl_cursor.execute("SELECT * FROM nudges")
    rows = sl_cursor.fetchall()
    print(f"\n  → Migrating {len(rows)} nudges...")
    migrated = 0
    for row in rows:
        try:
            with pg_conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO nudges
                       (nudge_id, prediction_id, user_id, target_milestone, bonus_amount_bdt,
                        text_bn, text_en, channel_recommendation, status, ai_generated,
                        guardrail_passed, generation_method, approved_by, approved_at, created_at)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                       ON CONFLICT (nudge_id) DO NOTHING""",
                    (
                        row["nudge_id"], row["prediction_id"], row["user_id"],
                        row["target_milestone"], row["bonus_amount_bdt"],
                        row["text_bn"], row["text_en"], row["channel_recommendation"],
                        row["status"],
                        bool(row["ai_generated"]) if row["ai_generated"] is not None else None,
                        bool(row["guardrail_passed"]) if row["guardrail_passed"] is not None else None,
                        row["generation_method"], row["approved_by"], row["approved_at"],
                        row["created_at"],
                    ),
                )
            pg_conn.commit()
            migrated += 1
        except Exception as e:
            print(f"    ⚠️  Skipping nudge {row['nudge_id']}: {e}")
    print(f"  ✅ {migrated}/{len(rows)} nudges migrated.")

    # ── Migrate savings_plans ────────────────────────────────────────────────
    sl_cursor.execute("SELECT * FROM savings_plans")
    rows = sl_cursor.fetchall()
    print(f"\n  → Migrating {len(rows)} savings plans...")
    migrated = 0
    for row in rows:
        try:
            with pg_conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO savings_plans
                       (plan_id, user_id, predicted_surplus, recommended_amount, recommended_tenure,
                        projected_maturity, surplus_pct_used, cashflow_summary, linked_nudge_id, created_at)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                       ON CONFLICT (plan_id) DO NOTHING""",
                    (
                        row["plan_id"], row["user_id"], row["predicted_surplus"],
                        row["recommended_amount"], row["recommended_tenure"],
                        row["projected_maturity"], row["surplus_pct_used"],
                        row["cashflow_summary"], row["linked_nudge_id"], row["created_at"],
                    ),
                )
            pg_conn.commit()
            migrated += 1
        except Exception as e:
            print(f"    ⚠️  Skipping savings_plan {row['plan_id']}: {e}")
    print(f"  ✅ {migrated}/{len(rows)} savings plans migrated.")

    # ── Migrate traces ───────────────────────────────────────────────────────
    sl_cursor.execute("SELECT * FROM traces")
    rows = sl_cursor.fetchall()
    print(f"\n  → Migrating {len(rows)} traces...")
    migrated = 0
    for row in rows:
        try:
            with pg_conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO traces
                       (prediction_id, nudge_id, user_id, action, details, actor, timestamp)
                       VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (
                        row["prediction_id"], row["nudge_id"], row["user_id"],
                        row["action"], row["details"], row["actor"], row["timestamp"],
                    ),
                )
            pg_conn.commit()
            migrated += 1
        except Exception as e:
            print(f"    ⚠️  Skipping trace {row['trace_id']}: {e}")
    print(f"  ✅ {migrated}/{len(rows)} traces migrated.")

    sl_cursor.close()
    sqlite_conn.close()


def verify_tables(pg_conn):
    """Show row counts from Supabase to confirm migration."""
    print("\n📊 Verifying data in Supabase:")
    with pg_conn.cursor() as cursor:
        for table in ["predictions", "nudges", "savings_plans", "traces"]:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"  • {table}: {count} rows")


if __name__ == "__main__":
    try:
        pg_conn = connect_pg()
        create_tables(pg_conn)
        migrate_sqlite_data(pg_conn)
        verify_tables(pg_conn)
        pg_conn.close()
        print("\n🎉 Migration complete! Supabase is ready.")
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

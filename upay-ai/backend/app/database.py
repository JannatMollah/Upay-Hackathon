"""
MilestoneAI — Database Setup (Supabase / PostgreSQL)
Uses psycopg v3 for Python 3.14 compatibility.
"""

import psycopg
import psycopg.rows
import logging
from .config import Config

logger = logging.getLogger("MilestoneAI")

DATABASE_URL = Config.DATABASE_URL

_db_initialized = False


def get_db():
    """Get a PostgreSQL database connection from Supabase."""
    global _db_initialized
    conn = psycopg.connect(DATABASE_URL, row_factory=psycopg.rows.dict_row)
    if not _db_initialized:
        _init_tables(conn)
        _db_initialized = True
    return conn


def _init_tables(conn):
    """Execute CREATE TABLE IF NOT EXISTS statements for PostgreSQL."""
    with conn.cursor() as cursor:

        # Predictions table
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

        # Nudges table
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

        # Savings plans table
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

        # Traces table (audit trail) — serial replaces AUTOINCREMENT
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

        conn.commit()
    logger.info("✅ Supabase tables initialized / verified.")


def init_db():
    """Explicitly initialize tables on Supabase."""
    conn = get_db()
    _init_tables(conn)
    conn.close()

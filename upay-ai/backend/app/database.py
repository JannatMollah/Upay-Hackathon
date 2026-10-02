"""
MilestoneAI — Database Setup (SQLite)
"""

import sqlite3
import os

from .config import Config

DB_PATH = Config.DB_PATH


_db_initialized = False

def get_db():
    """Get a database connection."""
    global _db_initialized
    os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    if not _db_initialized:
        _init_tables(conn)
        _db_initialized = True
    return conn


def _init_tables(conn):
    """Execute CREATE TABLE IF NOT EXISTS statements."""
    cursor = conn.cursor()

    # Predictions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            prediction_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            milestone_probabilities TEXT NOT NULL,
            primary_drop_off TEXT,
            shap_values TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (prediction_id) REFERENCES predictions(prediction_id)
        )
    """)

    # Savings plans table [NEW — SanchayBot]
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
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (linked_nudge_id) REFERENCES nudges(nudge_id)
        )
    """)

    # Traces table (audit trail)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS traces (
            trace_id INTEGER PRIMARY KEY AUTOINCREMENT,
            prediction_id TEXT,
            nudge_id TEXT,
            user_id TEXT,
            action TEXT NOT NULL,
            details TEXT,
            actor TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()


def init_db():
    """Explicitly initialize tables."""
    conn = get_db()
    _init_tables(conn)


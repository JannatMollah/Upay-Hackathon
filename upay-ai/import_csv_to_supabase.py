"""
CSV Data Import to Supabase — Final corrected version
Uses pandas to_sql with if_exists='append' to safely import reference data
without affecting application tables (predictions, nudges, savings_plans, traces).

Run once during initial deployment:
  python import_csv_to_supabase.py

Tables imported:
  - agents           (500 rows)
  - agent_daily      (45,000 rows)
  - users            (50,000 rows)
  - cashflow_summary (50,000 rows)
  - features_test    (7,500 rows)
  - milestone_events (300,000 rows)
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import pandas as pd
import numpy as np
import os
from sqlalchemy import create_engine, text

DB_URL_SA = "postgresql+psycopg://postgres.dqkkdxlicrmtamxicmms:R7Y2jvgA41cN8O3S@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# Max parameters per query: Postgres = 65535
# Safe chunksize = floor(65535 / num_columns)
CSV_CONFIGS = [
    # (csv_file, table_name, num_columns)
    ("agents.csv",          "agents",          10),
    ("agent_daily.csv",     "agent_daily",     14),
    ("users.csv",           "users",           13),
    ("cashflow_summary.csv","cashflow_summary", 9),
    ("features_test.csv",   "features_test",   53),
    ("milestone_events.csv","milestone_events", 7),
]


def safe_chunksize(num_cols):
    """Calculate max rows per batch to stay under Postgres 65535 param limit."""
    return max(10, min(500, 65535 // num_cols))


def import_csv(engine, table_name, csv_file, num_cols):
    path = os.path.join(DATA_DIR, csv_file)
    if not os.path.exists(path):
        print(f"  [SKIP] {csv_file} not found")
        return 0

    # Check if already imported
    with engine.connect() as conn:
        try:
            count = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
            if count > 0:
                print(f"  [SKIP] {table_name} already has {count} rows")
                return count
        except Exception:
            pass  # Table doesn't exist yet, will be created

    print(f"\n  Importing {csv_file} -> {table_name}...")
    df = pd.read_csv(csv_file if os.path.isabs(csv_file) else path)
    df = df.where(pd.notnull(df), None)
    rows = len(df)
    chunksize = safe_chunksize(num_cols)
    print(f"  {rows} rows | {len(df.columns)} cols | chunksize={chunksize}")

    df.to_sql(
        table_name,
        engine,
        if_exists="append",  # NEVER replace — would drop the table
        index=False,
        method="multi",
        chunksize=chunksize,
    )

    with engine.connect() as conn:
        count = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
    print(f"  Done: {count} rows in Supabase")
    return count


def main():
    print("=" * 60)
    print("  CSV DATA IMPORT TO SUPABASE")
    print("=" * 60)

    engine = create_engine(DB_URL_SA, pool_pre_ping=True)
    with engine.connect() as conn:
        version = conn.execute(text("SELECT version()")).scalar()
        print(f"Connected: {version[:50]}")

    for csv_file, table_name, num_cols in CSV_CONFIGS:
        import_csv(engine, table_name, csv_file, num_cols)

    print("\n" + "=" * 60)
    print("  FINAL SUPABASE TABLE COUNTS")
    print("=" * 60)
    all_tables = [
        "agents", "agent_daily", "users", "cashflow_summary",
        "features_test", "milestone_events",
        "predictions", "nudges", "savings_plans", "traces"
    ]
    with engine.connect() as conn:
        for t in all_tables:
            try:
                count = conn.execute(text(f"SELECT COUNT(*) FROM {t}")).scalar()
                status = "[OK]" if count > 0 else "[EMPTY]"
                print(f"  {t:<25} : {count:>7} rows  {status}")
            except Exception as e:
                print(f"  {t:<25} : NOT FOUND")

    engine.dispose()
    print("\nImport complete!")


if __name__ == "__main__":
    main()

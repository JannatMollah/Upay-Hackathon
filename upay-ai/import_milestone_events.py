"""
Import milestone_events.csv to Supabase using append mode (table already exists)
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

engine = create_engine(DB_URL_SA, pool_pre_ping=True)

# First check if milestone_events has data
with engine.connect() as conn:
    count = conn.execute(text("SELECT COUNT(*) FROM milestone_events")).scalar()
    print(f"milestone_events current count: {count}")
    if count > 0:
        print("Already has data, skipping import.")
        engine.dispose()
        exit(0)

    # Ensure table has correct schema (drop and recreate if empty)
    conn.execute(text("DROP TABLE IF EXISTS milestone_events"))
    conn.execute(text("""
        CREATE TABLE milestone_events (
            event_id TEXT PRIMARY KEY,
            user_id TEXT,
            milestone TEXT,
            completed BOOLEAN,
            completed_at TEXT,
            days_since_registration REAL,
            bonus_amount_bdt INTEGER
        )
    """))
    conn.commit()
    print("Table recreated with correct schema.")

print("Loading milestone_events.csv...")
path = os.path.join(DATA_DIR, "milestone_events.csv")
df = pd.read_csv(path)
df = df.where(pd.notnull(df), None)
print(f"Loaded {len(df)} rows")

print("Uploading to Supabase in chunks of 200...")
df.to_sql(
    "milestone_events",
    engine,
    if_exists="append",
    index=False,
    method="multi",
    chunksize=200,     # 200 rows × 7 cols = 1400 params (well under 65535)
)

with engine.connect() as conn:
    count = conn.execute(text("SELECT COUNT(*) FROM milestone_events")).scalar()
    print(f"milestone_events now has: {count} rows")

engine.dispose()
print("Done!")

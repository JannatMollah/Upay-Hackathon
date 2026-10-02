"""
Tests for synthetic data generation.
"""

import os
import sys
import pandas as pd
import pytest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")


def test_users_exist_and_count():
    users_path = os.path.join(DATA_DIR, "users.csv")
    assert os.path.exists(users_path), "users.csv not found"
    df = pd.read_csv(users_path)
    assert len(df) == 50000, f"Expected 50000 users, got {len(df)}"
    assert "user_id" in df.columns
    assert df["user_id"].notna().all()


def test_milestones_exist_and_count():
    milestones_path = os.path.join(DATA_DIR, "milestone_events.csv")
    assert os.path.exists(milestones_path), "milestone_events.csv not found"
    df = pd.read_csv(milestones_path)
    assert len(df) == 300000, f"Expected 300000 milestone events, got {len(df)}"
    assert set(df["milestone"].unique()) == {"M1", "M2", "M3", "M4", "M5", "M6"}


def test_transactions_exist():
    tx_path = os.path.join(DATA_DIR, "transactions.csv")
    assert os.path.exists(tx_path), "transactions.csv not found"
    cf_path = os.path.join(DATA_DIR, "cashflow_summary.csv")
    assert os.path.exists(cf_path), "cashflow_summary.csv not found"
    cf = pd.read_csv(cf_path)
    assert len(cf) == 50000
    assert "monthly_surplus" in cf.columns

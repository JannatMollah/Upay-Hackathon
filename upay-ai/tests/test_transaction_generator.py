"""
Tests for synthetic transaction and cash-flow generation pipeline.
Validates P9-P14 patterns and cashflow summary integrity.
"""

import os
import sys
import pandas as pd
import numpy as np
import pytest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")


def test_transactions_csv_exists():
    path = os.path.join(DATA_DIR, "transactions.csv")
    assert os.path.exists(path), "transactions.csv not found"
    df = pd.read_csv(path)
    assert len(df) > 500_000, f"Expected 500k+ transactions, got {len(df)}"
    assert "user_id" in df.columns
    assert "tx_type" in df.columns
    assert set(df["tx_type"].unique()) == {"income", "expense"}


def test_cashflow_summary_integrity():
    path = os.path.join(DATA_DIR, "cashflow_summary.csv")
    assert os.path.exists(path), "cashflow_summary.csv not found"
    df = pd.read_csv(path)
    assert len(df) == 50000, f"Expected 50000 users in cashflow, got {len(df)}"

    required = ["monthly_income", "monthly_expenses", "monthly_surplus",
                 "cash_out_amount", "cash_out_ratio", "savings_rate"]
    for col in required:
        assert col in df.columns, f"Missing column: {col}"

    # Surplus = income - expenses (within rounding tolerance)
    diff = (df["monthly_income"] - df["monthly_expenses"] - df["monthly_surplus"]).abs()
    assert (diff < 1.0).all(), "Surplus != income - expenses for some users"


def test_transaction_categories():
    df = pd.read_csv(os.path.join(DATA_DIR, "transactions.csv"))

    income_cats = {"salary", "freelance", "remittance", "cash_in", "add_money"}
    expense_cats = {"cash_out", "mobile_recharge", "merchant_payment",
                    "utility_bill", "money_transfer", "education",
                    "transport", "food", "other"}

    income_in_data = set(df[df["tx_type"] == "income"]["category"].unique())
    expense_in_data = set(df[df["tx_type"] == "expense"]["category"].unique())

    assert income_in_data.issubset(income_cats), f"Unexpected income cats: {income_in_data - income_cats}"
    assert expense_in_data.issubset(expense_cats), f"Unexpected expense cats: {expense_in_data - expense_cats}"


def test_pattern_p9_salary_wallet_higher_income():
    """P9: Salary wallet users should have higher average income."""
    users = pd.read_csv(os.path.join(DATA_DIR, "users.csv"))
    cf = pd.read_csv(os.path.join(DATA_DIR, "cashflow_summary.csv"))
    merged = users.merge(cf, on="user_id")

    salary_income = merged[merged["salary_wallet_active"] == True]["monthly_income"].mean()
    non_salary_income = merged[merged["salary_wallet_active"] == False]["monthly_income"].mean()
    assert salary_income > non_salary_income, \
        f"P9 FAIL: salary wallet income ({salary_income:.0f}) <= non-salary ({non_salary_income:.0f})"


def test_pattern_p14_bank_account_lower_cashout():
    """P14: Bank account holders should have lower cash-out ratio."""
    users = pd.read_csv(os.path.join(DATA_DIR, "users.csv"))
    cf = pd.read_csv(os.path.join(DATA_DIR, "cashflow_summary.csv"))
    merged = users.merge(cf, on="user_id")

    bank_cashout = merged[merged["has_bank_account"] == True]["cash_out_ratio"].mean()
    no_bank_cashout = merged[merged["has_bank_account"] == False]["cash_out_ratio"].mean()
    assert bank_cashout < no_bank_cashout, \
        f"P14 FAIL: bank holder cashout ({bank_cashout:.3f}) >= non-bank ({no_bank_cashout:.3f})"

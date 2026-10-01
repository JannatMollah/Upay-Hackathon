"""
SanchayBot — Synthetic Transaction & Cash-Flow Generator
Generates realistic income/expense transactions and derives cash-flow summaries.

ALL DATA IS SYNTHETIC. No real upay transaction data is used.

Injected Cash-Flow Patterns (P9-P14):
  P9:  Salary wallet → regular income pattern, higher surplus
  P10: High cash-out ratio → lower net savings potential
  P11: Urban users → higher income but higher expenses
  P12: Feature phone → cash-out dependent (60%+ of expenses)
  P13: Young (18-25) → lower income, higher mobile recharge spending
  P14: Bank account holders → lower cash-out ratio (use bank ATM)
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
SEED_TRANSACTIONS = 42

# Transaction categories
INCOME_CATEGORIES = ["salary", "freelance", "remittance", "cash_in", "add_money"]
EXPENSE_CATEGORIES = [
    "cash_out", "mobile_recharge", "merchant_payment", "utility_bill",
    "money_transfer", "education", "transport", "food", "other"
]

# Base income distribution by occupation proxy
INCOME_PROFILES = {
    "18-25": {"mean": 8000, "std": 3000},    # Students/entry-level
    "26-35": {"mean": 15000, "std": 5000},   # Early career
    "36-45": {"mean": 20000, "std": 7000},   # Mid career
    "46+":   {"mean": 18000, "std": 6000},   # Senior
}


def generate_transactions(rng, users):
    """Generate synthetic transaction data for each user."""
    n = len(users)
    print(f"Generating transactions for {n} users...")

    all_transactions = []
    tx_counter = 0

    user_ids = users["user_id"].values
    age_groups = users["age_group"].values
    area_types = users["area_type"].values
    device_types = users["device_type"].values
    has_banks = users["has_bank_account"].values
    salary_wallets = users["salary_wallet_active"].values
    reg_dates = pd.to_datetime(users["registration_date"]).values

    # Pre-generate counts per user (between 15 and 35 to keep dataset fast and manageable while rich)
    tx_counts = rng.integers(15, 36, size=n)

    for i in range(n):
        user_id = user_ids[i]
        age_group = age_groups[i]
        area_type = area_types[i]
        device_type = device_types[i]
        has_bank = has_banks[i]
        salary_wallet = salary_wallets[i]
        reg_dt = pd.Timestamp(reg_dates[i])

        # Determine monthly income (P9, P11, P13)
        income_profile = INCOME_PROFILES.get(age_group, INCOME_PROFILES["26-35"])
        base_income = max(2000.0, float(rng.normal(income_profile["mean"], income_profile["std"])))

        # P9: Salary wallet → more regular, +20% income
        if salary_wallet:
            base_income *= 1.20

        # P11: Urban → +15% income but also +20% expenses
        urban_multiplier = 1.15 if area_type == "urban" else (1.05 if area_type == "peri_urban" else 1.0)
        base_income *= urban_multiplier

        n_tx = int(tx_counts[i])
        n_income = max(2, int(n_tx * rng.uniform(0.25, 0.35)))
        n_expense = n_tx - n_income

        # Income transactions
        for j in range(n_income):
            days_offset = int(rng.integers(0, 30))
            tx_dt = reg_dt + timedelta(days=days_offset)
            if salary_wallet and j == 0:
                category = "salary"
                amount = round(base_income * 0.7, -2)
            else:
                category = rng.choice(INCOME_CATEGORIES, p=[0.25, 0.15, 0.20, 0.25, 0.15])
                amount = round(float(rng.uniform(200, max(500, base_income * 0.35))), -1)

            all_transactions.append({
                "tx_id": f"TX{tx_counter:012d}",
                "user_id": user_id,
                "tx_type": "income",
                "category": category,
                "amount_bdt": round(float(amount), 2),
                "tx_date": tx_dt.strftime("%Y-%m-%d"),
                "day_since_reg": days_offset,
            })
            tx_counter += 1

        # Expense transactions
        # P10: Cash-out ratio distribution
        if device_type == "feature_phone":
            cash_out_prob = 0.55  # P12: Feature phone → high cash-out
        elif has_bank:
            cash_out_prob = 0.20  # P14: Bank account → lower cash-out
        else:
            cash_out_prob = 0.35  # Default

        expense_dist = [
            cash_out_prob,          # cash_out
            0.15,                   # mobile_recharge
            0.10,                   # merchant_payment
            0.08,                   # utility_bill
            0.07,                   # money_transfer
            0.05,                   # education
            0.03,                   # transport
            0.02,                   # food
            max(0.01, 1.0 - cash_out_prob - 0.50),  # other (remainder)
        ]
        # Normalize
        total = sum(expense_dist)
        expense_dist = [p / total for p in expense_dist]

        for j in range(n_expense):
            days_offset = int(rng.integers(0, 30))
            tx_dt = reg_dt + timedelta(days=days_offset)
            category = rng.choice(EXPENSE_CATEGORIES, p=expense_dist)

            if category == "cash_out":
                amount = rng.uniform(500, 4000)
            elif category == "mobile_recharge":
                amount = rng.choice([30, 50, 100, 200, 300, 500])
            elif category == "merchant_payment":
                amount = rng.uniform(50, 1500)
            else:
                amount = rng.uniform(100, 2000)

            all_transactions.append({
                "tx_id": f"TX{tx_counter:012d}",
                "user_id": user_id,
                "tx_type": "expense",
                "category": category,
                "amount_bdt": round(float(amount), 2),
                "tx_date": tx_dt.strftime("%Y-%m-%d"),
                "day_since_reg": days_offset,
            })
            tx_counter += 1

    transactions = pd.DataFrame(all_transactions)
    print(f"  Transactions generated: {len(transactions)}")
    return transactions


def generate_cashflow_summary(transactions, users):
    """Derive monthly cash-flow summary from transaction data."""
    print("Generating cash-flow summaries...")

    income = transactions[transactions["tx_type"] == "income"].groupby("user_id")["amount_bdt"].sum()
    expenses = transactions[transactions["tx_type"] == "expense"].groupby("user_id")["amount_bdt"].sum()
    cash_out = transactions[
        (transactions["tx_type"] == "expense") & (transactions["category"] == "cash_out")
    ].groupby("user_id")["amount_bdt"].sum()

    # Top expense category per user
    expense_tx = transactions[transactions["tx_type"] == "expense"]
    top_category = expense_tx.groupby(["user_id", "category"])["amount_bdt"].sum().reset_index()
    top_category = top_category.sort_values("amount_bdt", ascending=False).drop_duplicates("user_id")
    top_cat_map = top_category.set_index("user_id")["category"]

    tx_counts = transactions.groupby("user_id").size()

    cashflow = pd.DataFrame({
        "user_id": users["user_id"],
    }).set_index("user_id")

    cashflow["monthly_income"] = income.reindex(cashflow.index).fillna(0).round(2)
    cashflow["monthly_expenses"] = expenses.reindex(cashflow.index).fillna(0).round(2)
    cashflow["monthly_surplus"] = (cashflow["monthly_income"] - cashflow["monthly_expenses"]).round(2)
    cashflow["cash_out_amount"] = cash_out.reindex(cashflow.index).fillna(0).round(2)
    cashflow["cash_out_ratio"] = (
        cashflow["cash_out_amount"] / cashflow["monthly_expenses"].replace(0, 1)
    ).round(4)
    cashflow["top_expense_category"] = top_cat_map.reindex(cashflow.index).fillna("other")
    cashflow["savings_rate"] = (
        cashflow["monthly_surplus"] / cashflow["monthly_income"].replace(0, 1)
    ).clip(0, 1).round(4)
    cashflow["tx_count"] = tx_counts.reindex(cashflow.index).fillna(0).astype(int)

    cashflow = cashflow.reset_index()
    print(f"  Cash-flow summaries generated: {len(cashflow)}")
    return cashflow


def save_transaction_data(transactions, cashflow):
    """Save transaction and cashflow data."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    transactions.to_csv(os.path.join(OUTPUT_DIR, "transactions.csv"), index=False)
    cashflow.to_csv(os.path.join(OUTPUT_DIR, "cashflow_summary.csv"), index=False)
    print(f"\nData saved to {OUTPUT_DIR}/")
    print(f"  transactions.csv: {len(transactions)} rows")
    print(f"  cashflow_summary.csv: {len(cashflow)} rows")


def main():
    """Main transaction generation pipeline."""
    print("=" * 60)
    print("SanchayBot — Synthetic Transaction & Cash-Flow Generator")
    print("ALL DATA IS SYNTHETIC. No real upay transaction data is used.")
    print("=" * 60)

    users_path = os.path.join(OUTPUT_DIR, "users.csv")
    if not os.path.exists(users_path):
        print(f"Error: {users_path} does not exist. Run data_generator.py first.")
        return

    users = pd.read_csv(users_path)
    rng = np.random.default_rng(SEED_TRANSACTIONS)

    transactions = generate_transactions(rng, users)
    cashflow = generate_cashflow_summary(transactions, users)
    save_transaction_data(transactions, cashflow)

    print("\n--- Summary Statistics ---")
    print(f"Mean monthly income: BDT {cashflow['monthly_income'].mean():.2f}")
    print(f"Mean monthly expenses: BDT {cashflow['monthly_expenses'].mean():.2f}")
    print(f"Mean monthly surplus: BDT {cashflow['monthly_surplus'].mean():.2f}")
    print(f"Mean cash-out ratio: {cashflow['cash_out_ratio'].mean():.2%}")


if __name__ == "__main__":
    main()

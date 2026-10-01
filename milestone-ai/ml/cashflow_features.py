"""
SanchayBot — Cash-Flow Feature Engineering
Computes 11 features from cash-flow summary for surplus prediction.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import os
import json

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
SEED = 42


def build_cashflow_features(users, cashflow):
    """Build cash-flow feature matrix for surplus prediction."""
    df = users[["user_id", "area_type", "age_group", "device_type",
                "has_bank_account", "salary_wallet_active"]].merge(
        cashflow, on="user_id", how="inner"
    )

    # Derived features
    df["income_per_tx"] = (df["monthly_income"] / df["tx_count"].replace(0, 1)).round(2)
    df["expense_diversity"] = (df["tx_count"] * (1 - df["cash_out_ratio"])).round(2)
    df["is_high_cash_out"] = (df["cash_out_ratio"] > 0.40).astype(int)
    df["has_surplus"] = (df["monthly_surplus"] > 0).astype(int)

    # Encode categoricals
    for col in ["area_type", "age_group", "device_type", "top_expense_category"]:
        dummies = pd.get_dummies(df[col], prefix=col, dtype=int)
        df = pd.concat([df, dummies], axis=1)

    df["has_bank_account"] = df["has_bank_account"].astype(int)
    df["salary_wallet_active"] = df["salary_wallet_active"].astype(int)

    # Target: monthly_surplus
    target = df["monthly_surplus"].copy()

    # Feature columns (exclude IDs and target)
    exclude_cols = ["user_id", "monthly_surplus", "area_type", "age_group",
                    "device_type", "top_expense_category"]
    feature_cols = [c for c in df.columns if c not in exclude_cols]

    return df, feature_cols, target


def main():
    """Main cash-flow feature engineering pipeline."""
    print("=" * 60)
    print("SanchayBot — Cash-Flow Feature Engineering")
    print("=" * 60)

    users_path = os.path.join(DATA_DIR, "users.csv")
    cashflow_path = os.path.join(DATA_DIR, "cashflow_summary.csv")

    if not os.path.exists(users_path) or not os.path.exists(cashflow_path):
        print("Required CSV files not found. Generate synthetic data first.")
        return

    users = pd.read_csv(users_path)
    cashflow = pd.read_csv(cashflow_path)

    df, feature_cols, target = build_cashflow_features(users, cashflow)

    # Split
    X = df[feature_cols]
    y = target
    uids = df["user_id"]

    X_trainval, X_test, y_trainval, y_test, uid_trainval, uid_test = train_test_split(
        X, y, uids, test_size=0.15, random_state=SEED
    )
    X_train, X_val, y_train, y_val, uid_train, uid_val = train_test_split(
        X_trainval, y_trainval, uid_trainval, test_size=0.176, random_state=SEED
    )

    # Save
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)

    for name, X_s, y_s, uid_s in [("train", X_train, y_train, uid_train),
                                  ("val", X_val, y_val, uid_val),
                                  ("test", X_test, y_test, uid_test)]:
        combined = pd.concat([
            uid_s.reset_index(drop=True),
            X_s.reset_index(drop=True),
            y_s.reset_index(drop=True).rename("target_surplus")
        ], axis=1)
        combined.to_csv(os.path.join(DATA_DIR, f"cashflow_features_{name}.csv"), index=False)
        print(f"  {name}: {len(X_s)} samples")

    with open(os.path.join(MODELS_DIR, "cashflow_feature_names.json"), "w") as f:
        json.dump(feature_cols, f, indent=2)

    print(f"  Feature count: {len(feature_cols)}")
    print("\nCash-flow feature engineering complete!")


if __name__ == "__main__":
    main()

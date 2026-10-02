"""
MilestoneAI — Feature Engineering Pipeline
Computes 22 features from users + early_activity tables.
Produces train/validation/test splits.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import os
import json

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
SEED = 42
TEST_SIZE = 0.15
VAL_SIZE = 0.15  # 0.15 of remaining 85% ≈ 12.75% overall


def load_data():
    """Load generated synthetic data."""
    users = pd.read_csv(os.path.join(DATA_DIR, "users.csv"))
    activity = pd.read_csv(os.path.join(DATA_DIR, "early_activity.csv"))
    milestones = pd.read_csv(os.path.join(DATA_DIR, "milestone_events.csv"))
    return users, activity, milestones


def build_features(users, activity):
    """Build the feature matrix from users and early_activity."""
    # Merge users and activity
    df = users.merge(activity, on="user_id", how="inner")

    # Derived features
    df["registration_date"] = pd.to_datetime(df["registration_date"])
    df["registration_day_of_week"] = df["registration_date"].dt.dayofweek
    df["registration_hour"] = df["registration_date"].dt.hour
    df["is_weekend_registration"] = df["registration_day_of_week"].isin([5, 6]).astype(int)

    # Total app engagement (day 1-3)
    df["total_app_opens_day1_3"] = (
        df["app_opens_day1"] + df["app_opens_day2"] + df["app_opens_day3"]
    )

    # Engagement trend (day3 - day1, negative means declining)
    df["engagement_trend"] = df["app_opens_day3"] - df["app_opens_day1"]

    # Boolean to int
    for col in ["has_bank_account", "salary_wallet_active", "zero_data_eligible", "notification_enabled"]:
        df[col] = df[col].astype(int)

    # Select feature columns
    feature_cols = [
        # Registration features
        "registration_channel",
        "device_type",
        "sim_operator",
        "division",
        "area_type",
        "age_group",
        "gender",
        "has_bank_account",
        "salary_wallet_active",
        "zero_data_eligible",
        # Derived registration
        "registration_day_of_week",
        "registration_hour",
        "is_weekend_registration",
        # Early activity
        "first_app_open_hours",
        "app_opens_day1",
        "app_opens_day2",
        "app_opens_day3",
        "total_app_opens_day1_3",
        "engagement_trend",
        "ussd_sessions_day1_3",
        "balance_check_count_day1_3",
        "screens_visited_day1",
        "time_in_app_minutes_day1",
        "notification_enabled",
        "language_preference",
    ]

    features = df[["user_id"] + feature_cols].copy()
    return features, feature_cols


def build_targets(milestones):
    """Build target variables: completion of M2, M3, M4, M5."""
    targets = milestones[milestones["milestone"].isin(["M2", "M3", "M4", "M5"])].pivot_table(
        index="user_id", columns="milestone", values="completed", aggfunc="first"
    ).reset_index()

    targets.columns = ["user_id", "target_M2", "target_M3", "target_M4", "target_M5"]

    for col in ["target_M2", "target_M3", "target_M4", "target_M5"]:
        targets[col] = targets[col].astype(int)

    return targets


def encode_categoricals(features, feature_cols):
    """One-hot encode categorical features."""
    categorical_cols = [
        "registration_channel",
        "device_type",
        "sim_operator",
        "division",
        "area_type",
        "age_group",
        "gender",
        "language_preference",
    ]

    numeric_cols = [c for c in feature_cols if c not in categorical_cols]

    # One-hot encode
    encoded = pd.get_dummies(features[categorical_cols], prefix_sep="_", dtype=int)

    # Combine with numeric features
    result = pd.concat([features[["user_id"] + numeric_cols], encoded], axis=1)

    return result


def split_data(features_encoded, targets):
    """Split into train/validation/test sets."""
    # Merge features and targets
    df = features_encoded.merge(targets, on="user_id", how="inner")

    # Separate features and targets
    target_cols = ["target_M2", "target_M3", "target_M4", "target_M5"]
    feature_cols = [c for c in df.columns if c not in ["user_id"] + target_cols]

    X = df[feature_cols]
    y = df[target_cols]
    user_ids = df["user_id"]

    # First split: train+val vs test
    X_trainval, X_test, y_trainval, y_test, uid_trainval, uid_test = train_test_split(
        X, y, user_ids, test_size=TEST_SIZE, random_state=SEED, stratify=y["target_M4"]
    )

    # Second split: train vs val
    val_frac = VAL_SIZE / (1 - TEST_SIZE)
    X_train, X_val, y_train, y_val, uid_train, uid_val = train_test_split(
        X_trainval, y_trainval, uid_trainval,
        test_size=val_frac, random_state=SEED, stratify=y_trainval["target_M4"]
    )

    return {
        "X_train": X_train, "y_train": y_train, "uid_train": uid_train,
        "X_val": X_val, "y_val": y_val, "uid_val": uid_val,
        "X_test": X_test, "y_test": y_test, "uid_test": uid_test,
        "feature_names": feature_cols,
    }


def main():
    """Main feature engineering pipeline."""
    print("=" * 60)
    print("MilestoneAI — Feature Engineering Pipeline")
    print("=" * 60)

    users, activity, milestones = load_data()
    features, feature_cols = build_features(users, activity)
    targets = build_targets(milestones)
    features_encoded = encode_categoricals(features, feature_cols)

    splits = split_data(features_encoded, targets)

    # Save splits
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)

    for name in ["train", "val", "test"]:
        X = splits[f"X_{name}"]
        y = splits[f"y_{name}"]
        uid = splits[f"uid_{name}"]
        combined = pd.concat([uid.reset_index(drop=True), X.reset_index(drop=True), y.reset_index(drop=True)], axis=1)
        combined.to_csv(os.path.join(DATA_DIR, f"features_{name}.csv"), index=False)
        print(f"  {name}: {len(X)} samples")

    # Save feature names
    with open(os.path.join(MODELS_DIR, "feature_names.json"), "w") as f:
        json.dump(splits["feature_names"], f, indent=2)
    print(f"  Feature count: {len(splits['feature_names'])}")

    print("\nFeature engineering complete!")


if __name__ == "__main__":
    main()

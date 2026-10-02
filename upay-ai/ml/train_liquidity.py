"""
Upay AI — Agent Liquidity Forecast Model
Trains an XGBoost regressor to predict next-day cash-out demand per agent.

Features:
  - Historical volume (lag-1, lag-3, lag-7, rolling means)
  - Temporal (day-of-week, day-of-month, is_salary_day, is_month_end)
  - Agent profile (area_type, tier, is_rmg_zone, float_capacity)
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
SEED = 42


def build_features(agents_df, daily_df):
    """Engineer features for liquidity prediction."""
    print("Building liquidity features...")

    # Merge agent info with daily data
    df = daily_df.merge(agents_df[["agent_id", "area_type", "tier", "is_rmg_zone", "float_capacity_bdt"]],
                        on="agent_id")

    # Sort for lag features
    df = df.sort_values(["agent_id", "date"]).reset_index(drop=True)

    # Lag features (per agent)
    for lag in [1, 2, 3, 7]:
        df[f"cashout_lag_{lag}"] = df.groupby("agent_id")["cash_out_volume"].shift(lag)

    # Rolling means
    for window in [3, 7, 14]:
        df[f"cashout_rolling_{window}d"] = (
            df.groupby("agent_id")["cash_out_volume"]
            .transform(lambda x: x.shift(1).rolling(window, min_periods=1).mean())
        )

    # Rolling std (volatility)
    df["cashout_std_7d"] = (
        df.groupby("agent_id")["cash_out_volume"]
        .transform(lambda x: x.shift(1).rolling(7, min_periods=2).std())
    )

    # Cash-in lag
    df["cashin_lag_1"] = df.groupby("agent_id")["cash_in_volume"].shift(1)

    # Encode categoricals
    df["area_encoded"] = df["area_type"].map({"urban": 2, "peri_urban": 1, "rural": 0})
    df["tier_encoded"] = df["tier"].map({"platinum": 3, "gold": 2, "silver": 1, "bronze": 0})
    df["is_rmg_int"] = df["is_rmg_zone"].astype(int)

    # Drop rows with NaN from lag features
    df = df.dropna().reset_index(drop=True)

    feature_cols = [
        "day_of_week", "day_of_month", "is_salary_day", "is_month_end",
        "cashout_lag_1", "cashout_lag_2", "cashout_lag_3", "cashout_lag_7",
        "cashout_rolling_3d", "cashout_rolling_7d", "cashout_rolling_14d",
        "cashout_std_7d", "cashin_lag_1",
        "area_encoded", "tier_encoded", "is_rmg_int", "float_capacity_bdt",
    ]

    # Convert booleans to int
    for col in ["is_salary_day", "is_month_end"]:
        df[col] = df[col].astype(int)

    target_col = "cash_out_volume"

    print(f"  Features: {len(feature_cols)}")
    print(f"  Samples: {len(df)}")

    return df, feature_cols, target_col


def train_model(df, feature_cols, target_col):
    """Train XGBoost regressor for liquidity demand."""
    print("\nTraining liquidity forecast model...")

    X = df[feature_cols].values
    y = df[target_col].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=SEED
    )

    model = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=SEED,
        n_jobs=-1,
    )

    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=20,
    )

    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print(f"\n--- Liquidity Model Results ---")
    print(f"  MAE:  BDT {mae:,.0f}")
    print(f"  RMSE: BDT {rmse:,.0f}")
    print(f"  R²:   {r2:.4f}")

    # Feature importance
    importances = model.feature_importances_
    feat_imp = sorted(zip(feature_cols, importances), key=lambda x: -x[1])
    print("\n  Feature Importance (top 8):")
    for fname, imp in feat_imp[:8]:
        print(f"    {fname}: {imp:.4f}")

    results = {
        "test_mae": round(float(mae), 2),
        "test_rmse": round(float(rmse), 2),
        "test_r2": round(float(r2), 4),
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "n_features": len(feature_cols),
        "feature_importance": {f: round(float(i), 4) for f, i in feat_imp},
    }

    return model, results, feature_cols


def save_artifacts(model, results, feature_names):
    """Save model and results."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    joblib.dump(model, os.path.join(MODELS_DIR, "liquidity_model.joblib"))
    print(f"  Saved: liquidity_model.joblib")

    with open(os.path.join(MODELS_DIR, "liquidity_results.json"), "w") as f:
        json.dump(results, f, indent=2)
    print(f"  Saved: liquidity_results.json")

    with open(os.path.join(MODELS_DIR, "liquidity_feature_names.json"), "w") as f:
        json.dump(feature_names, f)
    print(f"  Saved: liquidity_feature_names.json")


def main():
    print("=" * 60)
    print("Upay AI — Agent Liquidity Forecast Training")
    print("=" * 60)

    agents = pd.read_csv(os.path.join(DATA_DIR, "agents.csv"))
    daily = pd.read_csv(os.path.join(DATA_DIR, "agent_daily.csv"))

    df, feature_cols, target_col = build_features(agents, daily)
    model, results, feature_names = train_model(df, feature_cols, target_col)
    save_artifacts(model, results, feature_names)

    print("\nLiquidity model training complete!")


if __name__ == "__main__":
    main()

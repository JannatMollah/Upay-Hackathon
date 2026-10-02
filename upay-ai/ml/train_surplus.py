"""
SanchayBot — Surplus Prediction Model (XGBoost Regressor)
Predicts monthly surplus from cash-flow features.
"""

import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.model_selection import RandomizedSearchCV
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import joblib
import json
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")

PARAM_DIST = {
    "n_estimators": [100, 200, 300],
    "max_depth": [3, 4, 5, 6],
    "learning_rate": [0.05, 0.1, 0.2],
    "subsample": [0.7, 0.8, 0.9],
    "colsample_bytree": [0.7, 0.8, 0.9],
    "min_child_weight": [1, 3, 5],
}


def train_surplus_model():
    """Train XGBoost regressor for surplus prediction."""
    print("=" * 60)
    print("SanchayBot — Surplus Prediction Model (XGBoost Regressor)")
    print("=" * 60)

    train = pd.read_csv(os.path.join(DATA_DIR, "cashflow_features_train.csv"))
    val = pd.read_csv(os.path.join(DATA_DIR, "cashflow_features_val.csv"))
    test = pd.read_csv(os.path.join(DATA_DIR, "cashflow_features_test.csv"))

    with open(os.path.join(MODELS_DIR, "cashflow_feature_names.json")) as f:
        feature_names = json.load(f)

    X_train = train[feature_names].values
    y_train = train["target_surplus"].values
    X_val = val[feature_names].values
    y_val = val["target_surplus"].values
    X_test = test[feature_names].values
    y_test = test["target_surplus"].values

    # Hyperparameter search
    base_model = XGBRegressor(random_state=42, objective="reg:squarederror")
    search = RandomizedSearchCV(
        base_model, PARAM_DIST, n_iter=10, scoring="r2",
        cv=3, random_state=42, n_jobs=-1, verbose=0
    )
    search.fit(X_train, y_train)

    model = search.best_estimator_
    print(f"  Best params: {search.best_params_}")

    # Evaluate
    y_val_pred = model.predict(X_val)
    y_test_pred = model.predict(X_test)

    val_mae = mean_absolute_error(y_val, y_val_pred)
    val_r2 = r2_score(y_val, y_val_pred)
    test_mae = mean_absolute_error(y_test, y_test_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))

    print(f"  Val:  MAE=BDT {val_mae:.0f}, R2={val_r2:.4f}")
    print(f"  Test: MAE=BDT {test_mae:.0f}, R2={test_r2:.4f}, RMSE=BDT {test_rmse:.0f}")

    # Scatter plot
    try:
        plt.figure(figsize=(8, 8))
        plt.scatter(y_test, y_test_pred, alpha=0.3, s=10)
        plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--')
        plt.xlabel("Actual Surplus (BDT)")
        plt.ylabel("Predicted Surplus (BDT)")
        plt.title(f"Surplus Prediction: R2={test_r2:.3f}, MAE=BDT {test_mae:.0f}")
        plt.tight_layout()
        plt.savefig(os.path.join(MODELS_DIR, "surplus_scatter.png"), dpi=100)
        plt.close()
    except Exception as e:
        print(f"Plot warning: {e}")

    # Save
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(model, os.path.join(MODELS_DIR, "surplus_regressor.joblib"))

    results = {
        "val_mae": round(float(val_mae), 2),
        "val_r2": round(float(val_r2), 4),
        "test_mae": round(float(test_mae), 2),
        "test_r2": round(float(test_r2), 4),
        "test_rmse": round(float(test_rmse), 2),
        "best_params": {k: (int(v) if isinstance(v, (np.integer,)) else float(v) if isinstance(v, (np.floating,)) else v) for k, v in search.best_params_.items()},
    }
    with open(os.path.join(MODELS_DIR, "surplus_results.json"), "w") as f:
        json.dump(results, f, indent=2)

    print("\nSurplus model saved!")
    return model, results


if __name__ == "__main__":
    train_surplus_model()

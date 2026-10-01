"""
MilestoneAI — Main Model Training (XGBoost Multi-Output)
Trains a separate XGBoost model for each milestone (M2, M3, M4, M5).
Includes hyperparameter tuning via RandomizedSearchCV.
"""

import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import RandomizedSearchCV
from sklearn.metrics import roc_auc_score, classification_report, brier_score_loss
from sklearn.calibration import calibration_curve
import joblib
import json
import os
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MILESTONES = ["target_M2", "target_M3", "target_M4", "target_M5"]

# Hyperparameter search space
PARAM_DIST = {
    "n_estimators": [100, 200, 300],
    "max_depth": [3, 4, 5, 6],
    "learning_rate": [0.05, 0.1, 0.2],
    "subsample": [0.7, 0.8, 0.9],
    "colsample_bytree": [0.7, 0.8, 0.9],
    "min_child_weight": [1, 3, 5],
    "gamma": [0, 0.1, 0.2],
}


def load_splits():
    """Load train/val/test splits."""
    train = pd.read_csv(os.path.join(DATA_DIR, "features_train.csv"))
    val = pd.read_csv(os.path.join(DATA_DIR, "features_val.csv"))
    test = pd.read_csv(os.path.join(DATA_DIR, "features_test.csv"))

    with open(os.path.join(MODELS_DIR, "feature_names.json")) as f:
        feature_names = json.load(f)

    return train, val, test, feature_names


def train_xgboost():
    """Train XGBoost model for each milestone with hyperparameter tuning."""
    print("=" * 60)
    print("MilestoneAI — Main Model Training (XGBoost)")
    print("=" * 60)

    train, val, test, feature_names = load_splits()
    X_train = train[feature_names].values
    X_val = val[feature_names].values
    X_test = test[feature_names].values

    models = {}
    results = {}

    for target in MILESTONES:
        milestone_name = target.replace("target_", "")
        print(f"\n--- Training {milestone_name} ---")

        y_train = train[target].values
        y_val = val[target].values
        y_test = test[target].values

        # Hyperparameter search
        base_model = XGBClassifier(
            random_state=42,
            eval_metric="logloss",
        )

        search = RandomizedSearchCV(
            base_model,
            PARAM_DIST,
            n_iter=10,
            scoring="roc_auc",
            cv=3,
            random_state=42,
            n_jobs=-1,
            verbose=0,
        )
        search.fit(X_train, y_train)

        best_model = search.best_estimator_
        print(f"  Best params: {search.best_params_}")

        # Evaluate on validation set
        y_val_proba = best_model.predict_proba(X_val)[:, 1]
        val_auc = roc_auc_score(y_val, y_val_proba)

        # Evaluate on test set
        y_test_proba = best_model.predict_proba(X_test)[:, 1]
        test_auc = roc_auc_score(y_test, y_test_proba)
        brier = brier_score_loss(y_test, y_test_proba)

        y_test_pred = (y_test_proba >= 0.5).astype(int)
        report = classification_report(y_test, y_test_pred, output_dict=True, zero_division=0)
        pos_key = "1" if "1" in report else 1

        models[milestone_name] = best_model
        results[milestone_name] = {
            "val_auc_roc": round(float(val_auc), 4),
            "test_auc_roc": round(float(test_auc), 4),
            "brier_score": round(float(brier), 4),
            "precision": round(float(report[pos_key]["precision"]), 4),
            "recall": round(float(report[pos_key]["recall"]), 4),
            "f1": round(float(report[pos_key]["f1-score"]), 4),
            "best_params": {k: (int(v) if isinstance(v, (np.integer,)) else float(v) if isinstance(v, (np.floating,)) else v) for k, v in search.best_params_.items()},
        }

        print(f"  Val AUC: {val_auc:.4f} | Test AUC: {test_auc:.4f} | Brier: {brier:.4f}")
        print(f"  P={report[pos_key]['precision']:.3f}, R={report[pos_key]['recall']:.3f}, F1={report[pos_key]['f1-score']:.3f}")

        # Generate calibration plot
        try:
            prob_true, prob_pred = calibration_curve(y_test, y_test_proba, n_bins=10)
            plt.figure(figsize=(6, 6))
            plt.plot(prob_pred, prob_true, "s-", label=milestone_name)
            plt.plot([0, 1], [0, 1], "k--", label="Perfect calibration")
            plt.xlabel("Predicted probability")
            plt.ylabel("Actual frequency")
            plt.title(f"Calibration: {milestone_name}")
            plt.legend()
            plt.tight_layout()
            plt.savefig(os.path.join(MODELS_DIR, f"calibration_{milestone_name}.png"), dpi=100)
            plt.close()
        except Exception as e:
            print(f"Calibration plot warning: {e}")

    # Save models
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(models, os.path.join(MODELS_DIR, "xgboost_model.joblib"))

    with open(os.path.join(MODELS_DIR, "xgboost_results.json"), "w") as f:
        json.dump(results, f, indent=2)

    # Compare with baseline
    try:
        with open(os.path.join(MODELS_DIR, "baseline_results.json")) as f:
            baseline = json.load(f)

        print("\n--- XGBoost vs Baseline Comparison ---")
        for m in ["M2", "M3", "M4", "M5"]:
            bl_auc = baseline[m]["auc_roc"]
            xg_auc = results[m]["test_auc_roc"]
            diff = xg_auc - bl_auc
            print(f"  {m}: Baseline={bl_auc:.4f} -> XGBoost={xg_auc:.4f} (diff={diff:+.4f})")
    except FileNotFoundError:
        print("  (Baseline results not found — run train_baseline.py first)")

    print("\nXGBoost model saved!")
    return models, results


if __name__ == "__main__":
    train_xgboost()

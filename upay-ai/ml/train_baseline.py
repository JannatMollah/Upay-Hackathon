"""
MilestoneAI — Baseline Model Training (Logistic Regression)
Trains a separate LR model for each milestone (M2, M3, M4, M5).
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, classification_report
from sklearn.preprocessing import StandardScaler
import joblib
import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MILESTONES = ["target_M2", "target_M3", "target_M4", "target_M5"]


def load_splits():
    """Load train/val/test splits."""
    train = pd.read_csv(os.path.join(DATA_DIR, "features_train.csv"))
    val = pd.read_csv(os.path.join(DATA_DIR, "features_val.csv"))

    with open(os.path.join(MODELS_DIR, "feature_names.json")) as f:
        feature_names = json.load(f)

    return train, val, feature_names


def train_baseline():
    """Train Logistic Regression baseline for each milestone."""
    print("=" * 60)
    print("MilestoneAI — Baseline Model (Logistic Regression)")
    print("=" * 60)

    train, val, feature_names = load_splits()
    X_train = train[feature_names].values
    X_val = val[feature_names].values

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)

    models = {}
    results = {}

    for target in MILESTONES:
        y_train = train[target].values
        y_val = val[target].values

        model = LogisticRegression(max_iter=1000, random_state=42, C=1.0)
        model.fit(X_train_scaled, y_train)

        # Evaluate
        y_pred_proba = model.predict_proba(X_val_scaled)[:, 1]
        auc = roc_auc_score(y_val, y_pred_proba)

        y_pred = (y_pred_proba >= 0.5).astype(int)
        report = classification_report(y_val, y_pred, output_dict=True, zero_division=0)

        milestone_name = target.replace("target_", "")
        models[milestone_name] = model
        pos_key = "1" if "1" in report else 1
        results[milestone_name] = {
            "auc_roc": round(float(auc), 4),
            "precision": round(float(report[pos_key]["precision"]), 4),
            "recall": round(float(report[pos_key]["recall"]), 4),
            "f1": round(float(report[pos_key]["f1-score"]), 4),
        }

        print(f"\n  {milestone_name}: AUC={auc:.4f}, P={report[pos_key]['precision']:.3f}, R={report[pos_key]['recall']:.3f}")

    # Save
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump({"models": models, "scaler": scaler}, os.path.join(MODELS_DIR, "baseline_lr.joblib"))

    with open(os.path.join(MODELS_DIR, "baseline_results.json"), "w") as f:
        json.dump(results, f, indent=2)

    print("\nBaseline model saved!")
    return results


if __name__ == "__main__":
    train_baseline()

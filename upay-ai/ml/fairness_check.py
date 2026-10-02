"""
MilestoneAI — Fairness Analysis
Checks model predictions across urban/rural and male/female groups.
Computes equalized odds ratios.
"""

import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score
import joblib
import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MILESTONES = ["M2", "M3", "M4", "M5"]
FAIRNESS_THRESHOLD = 0.80  # Minimum equalized odds ratio


def compute_group_metrics(y_true, y_pred, y_proba, group_mask, group_name):
    """Compute metrics for a specific group."""
    group_y_true = y_true[group_mask]
    group_y_pred = y_pred[group_mask]
    group_y_proba = y_proba[group_mask]

    if len(group_y_true) == 0 or len(np.unique(group_y_true)) < 2:
        return None

    tp = np.sum((group_y_pred == 1) & (group_y_true == 1))
    fp = np.sum((group_y_pred == 1) & (group_y_true == 0))
    fn = np.sum((group_y_pred == 0) & (group_y_true == 1))
    tn = np.sum((group_y_pred == 0) & (group_y_true == 0))

    tpr = tp / (tp + fn) if (tp + fn) > 0 else 0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0
    auc = roc_auc_score(group_y_true, group_y_proba)

    return {
        "group": group_name,
        "n": int(len(group_y_true)),
        "positive_rate": float(group_y_true.mean()),
        "predicted_positive_rate": float(group_y_pred.mean()),
        "tpr": round(float(tpr), 4),
        "fpr": round(float(fpr), 4),
        "auc_roc": round(float(auc), 4),
    }


def check_fairness():
    """Run fairness analysis across defined groups."""
    print("=" * 60)
    print("MilestoneAI — Fairness Analysis")
    print("=" * 60)

    models = joblib.load(os.path.join(MODELS_DIR, "xgboost_model.joblib"))
    test = pd.read_csv(os.path.join(DATA_DIR, "features_test.csv"))

    with open(os.path.join(MODELS_DIR, "feature_names.json")) as f:
        feature_names = json.load(f)

    X_test = test[feature_names].values
    fairness_report = {}

    # Define group columns (from one-hot encoded features)
    group_definitions = {
        "urban_vs_rural": {
            "group_a": ("area_type_urban", "Urban"),
            "group_b": ("area_type_rural", "Rural"),
        },
        "male_vs_female": {
            "group_a": ("gender_male", "Male"),
            "group_b": ("gender_female", "Female"),
        },
    }

    for milestone in MILESTONES:
        print(f"\n--- {milestone} ---")
        target_col = f"target_{milestone}"
        y_test = test[target_col].values
        model = models[milestone]

        y_proba = model.predict_proba(X_test)[:, 1]
        y_pred = (y_proba >= 0.5).astype(int)

        milestone_fairness = {}

        for comparison_name, groups in group_definitions.items():
            col_a, name_a = groups["group_a"]
            col_b, name_b = groups["group_b"]

            # Find column indices
            if col_a in feature_names and col_b in feature_names:
                idx_a = feature_names.index(col_a)
                idx_b = feature_names.index(col_b)
                mask_a = X_test[:, idx_a] == 1
                mask_b = X_test[:, idx_b] == 1
            else:
                print(f"  Warning: columns {col_a} or {col_b} not found")
                continue

            metrics_a = compute_group_metrics(y_test, y_pred, y_proba, mask_a, name_a)
            metrics_b = compute_group_metrics(y_test, y_pred, y_proba, mask_b, name_b)

            if metrics_a and metrics_b:
                # Equalized odds: ratio of TPR and FPR
                tpr_ratio = min(metrics_a["tpr"], metrics_b["tpr"]) / max(metrics_a["tpr"], metrics_b["tpr"]) if max(metrics_a["tpr"], metrics_b["tpr"]) > 0 else 1.0
                fpr_ratio = min(metrics_a["fpr"], metrics_b["fpr"]) / max(metrics_a["fpr"], metrics_b["fpr"]) if max(metrics_a["fpr"], metrics_b["fpr"]) > 0 else 1.0
                eo_ratio = min(tpr_ratio, fpr_ratio)

                passed = eo_ratio >= FAIRNESS_THRESHOLD
                status = "PASS" if passed else "FAIL"

                print(f"  {comparison_name}: EO ratio = {eo_ratio:.3f} [{status}]")
                print(f"    {name_a}: TPR={metrics_a['tpr']:.3f}, FPR={metrics_a['fpr']:.3f}, AUC={metrics_a['auc_roc']:.3f} (n={metrics_a['n']})")
                print(f"    {name_b}: TPR={metrics_b['tpr']:.3f}, FPR={metrics_b['fpr']:.3f}, AUC={metrics_b['auc_roc']:.3f} (n={metrics_b['n']})")

                milestone_fairness[comparison_name] = {
                    "group_a": metrics_a,
                    "group_b": metrics_b,
                    "equalized_odds_ratio": round(float(eo_ratio), 4),
                    "passed": bool(passed),
                }

        fairness_report[milestone] = milestone_fairness

    # Save report
    with open(os.path.join(MODELS_DIR, "fairness_report.json"), "w") as f:
        json.dump(fairness_report, f, indent=2)

    print("\nFairness report saved!")
    return fairness_report


if __name__ == "__main__":
    check_fairness()

"""
MilestoneAI — Model Evaluation
Generates comprehensive evaluation report and plots.
"""

import pandas as pd
import numpy as np
from sklearn.metrics import roc_curve, roc_auc_score, classification_report, brier_score_loss
import joblib
import json
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MILESTONES = ["M2", "M3", "M4", "M5"]


def evaluate():
    """Generate full evaluation report."""
    print("=" * 60)
    print("MilestoneAI — Model Evaluation Report")
    print("=" * 60)

    models = joblib.load(os.path.join(MODELS_DIR, "xgboost_model.joblib"))
    test = pd.read_csv(os.path.join(DATA_DIR, "features_test.csv"))

    with open(os.path.join(MODELS_DIR, "feature_names.json")) as f:
        feature_names = json.load(f)

    X_test = test[feature_names].values
    report = {"model_version": "xgb_v1", "milestones": {}}

    # Plot all ROC curves together
    try:
        plt.figure(figsize=(8, 8))
        for milestone in MILESTONES:
            target_col = f"target_{milestone}"
            y_test = test[target_col].values
            model = models[milestone]

            y_proba = model.predict_proba(X_test)[:, 1]
            auc = roc_auc_score(y_test, y_proba)
            brier = brier_score_loss(y_test, y_proba)

            fpr, tpr, _ = roc_curve(y_test, y_proba)
            plt.plot(fpr, tpr, label=f"{milestone} (AUC={auc:.3f})")

            y_pred = (y_proba >= 0.5).astype(int)
            cr = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
            pos_key = "1" if "1" in cr else 1

            report["milestones"][milestone] = {
                "auc_roc": round(float(auc), 4),
                "brier_score": round(float(brier), 4),
                "precision": round(float(cr[pos_key]["precision"]), 4),
                "recall": round(float(cr[pos_key]["recall"]), 4),
                "f1": round(float(cr[pos_key]["f1-score"]), 4),
            }

            print(f"  {milestone}: AUC={auc:.4f}, Brier={brier:.4f}, P={cr[pos_key]['precision']:.3f}, R={cr[pos_key]['recall']:.3f}")

        # Overall AUC (average)
        aucs = [report["milestones"][m]["auc_roc"] for m in MILESTONES]
        report["overall_auc_roc"] = round(float(np.mean(aucs)), 4)
        report["overall_brier"] = round(
            float(np.mean([report["milestones"][m]["brier_score"] for m in MILESTONES])), 4
        )

        print(f"\n  Overall AUC: {report['overall_auc_roc']:.4f}")
        print(f"  Overall Brier: {report['overall_brier']:.4f}")

        # Save ROC plot
        plt.plot([0, 1], [0, 1], "k--", label="Random")
        plt.xlabel("False Positive Rate")
        plt.ylabel("True Positive Rate")
        plt.title("ROC Curves — All Milestones")
        plt.legend()
        plt.tight_layout()
        plt.savefig(os.path.join(MODELS_DIR, "roc_curves.png"), dpi=100)
        plt.close()
    except Exception as e:
        print(f"Evaluation error: {e}")

    # Save report
    with open(os.path.join(MODELS_DIR, "evaluation_report.json"), "w") as f:
        json.dump(report, f, indent=2)

    print("\nEvaluation report saved!")
    return report


if __name__ == "__main__":
    evaluate()

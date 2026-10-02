"""
MilestoneAI — SHAP Explainability
Computes SHAP values for all test set predictions.
Generates feature importance plots.
"""

import pandas as pd
import numpy as np
import shap
import joblib
import json
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MILESTONES = ["M2", "M3", "M4", "M5"]


def compute_shap_values():
    """Compute SHAP values for all milestones on the test set."""
    print("=" * 60)
    print("MilestoneAI — SHAP Explainability")
    print("=" * 60)

    # Load model and data
    models = joblib.load(os.path.join(MODELS_DIR, "xgboost_model.joblib"))
    test = pd.read_csv(os.path.join(DATA_DIR, "features_test.csv"))

    with open(os.path.join(MODELS_DIR, "feature_names.json")) as f:
        feature_names = json.load(f)

    X_test = test[feature_names]

    all_shap_values = {}

    for milestone in MILESTONES:
        print(f"\nComputing SHAP for {milestone}...")
        model = models[milestone]

        # Use TreeExplainer for XGBoost (fast)
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_test)

        all_shap_values[milestone] = shap_values

        # Feature importance plot
        try:
            plt.figure(figsize=(10, 8))
            shap.summary_plot(
                shap_values,
                X_test,
                feature_names=feature_names,
                show=False,
                max_display=15,
            )
            plt.title(f"SHAP Feature Importance: {milestone}")
            plt.tight_layout()
            plt.savefig(
                os.path.join(MODELS_DIR, f"shap_importance_{milestone}.png"), dpi=100
            )
            plt.close()
        except Exception as e:
            print(f"SHAP plot warning: {e}")

        # Mean absolute SHAP values (for API)
        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        importance = dict(zip(feature_names, mean_abs_shap.tolist()))
        importance_sorted = dict(
            sorted(importance.items(), key=lambda x: x[1], reverse=True)
        )

        print(f"  Top 5 features for {milestone}:")
        for feat, val in list(importance_sorted.items())[:5]:
            print(f"    {feat}: {val:.4f}")

    # Save SHAP values as numpy arrays
    for milestone in MILESTONES:
        np.save(
            os.path.join(MODELS_DIR, f"shap_values_{milestone}.npy"),
            all_shap_values[milestone],
        )

    # Also save one combined test shap cache if needed
    np.save(
        os.path.join(MODELS_DIR, "shap_values_test.npy"),
        all_shap_values["M4"],  # default to M4 as primary drop-off
    )

    # Save test user IDs for SHAP lookup
    test["user_id"].to_csv(
        os.path.join(MODELS_DIR, "shap_test_user_ids.csv"), index=False
    )

    print("\nSHAP computation complete!")


if __name__ == "__main__":
    compute_shap_values()

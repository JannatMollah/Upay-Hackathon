"""
Tests for the XGBoost surplus regressor model (SanchayBot Module B).
Validates model existence, prediction quality, and feature importance.
"""

import os
import sys
import json
import pytest
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")


def test_surplus_model_exists():
    path = os.path.join(MODELS_DIR, "surplus_regressor.joblib")
    assert os.path.exists(path), "surplus_regressor.joblib not found"


def test_surplus_results_exist():
    path = os.path.join(MODELS_DIR, "surplus_results.json")
    assert os.path.exists(path), "surplus_results.json not found"
    with open(path) as f:
        results = json.load(f)
    assert "test_r2" in results
    assert "test_mae" in results


def test_surplus_model_quality():
    """Surplus regressor must meet minimum quality thresholds (Phase 2 leakage-free)."""
    with open(os.path.join(MODELS_DIR, "surplus_results.json")) as f:
        results = json.load(f)

    # R² should be > 0.85 (leakage-free model achieves 0.9401)
    assert results["test_r2"] > 0.85, f"R² too low: {results['test_r2']}"

    # MAE should be < BDT 5000 (leakage-free model achieves BDT ~2,657)
    assert results["test_mae"] < 5000, f"MAE too high: {results['test_mae']}"


def test_surplus_prediction_shape():
    """Model should produce predictions for test data."""
    import joblib

    model = joblib.load(os.path.join(MODELS_DIR, "surplus_regressor.joblib"))
    with open(os.path.join(MODELS_DIR, "cashflow_feature_names.json")) as f:
        feature_names = json.load(f)

    test = pd.read_csv(os.path.join(DATA_DIR, "cashflow_features_test.csv"))
    X_test = test[feature_names].values[:10]  # First 10 samples

    predictions = model.predict(X_test)
    assert len(predictions) == 10
    assert not np.any(np.isnan(predictions)), "NaN values in predictions"


def test_surplus_scatter_plot_exists():
    path = os.path.join(MODELS_DIR, "surplus_scatter.png")
    assert os.path.exists(path), "surplus_scatter.png not found"
    assert os.path.getsize(path) > 1000, "surplus_scatter.png is too small"


def test_surplus_model_r2_explanation():
    """
    Phase 2 Validation:
    Data leakage features (monthly_income, monthly_expenses) have been removed.
    The model now predicts surplus with a realistic R² of ~0.94 and MAE ~2,657.
    """
    with open(os.path.join(MODELS_DIR, "surplus_results.json")) as f:
        results = json.load(f)

    # R² should be strong and realistic (> 0.85)
    assert results["test_r2"] > 0.85, "R² dropped below expected range — investigate feature set"

    # MAE should reflect honest prediction uncertainty (> 100)
    assert results["test_mae"] > 100, "MAE suspiciously low — possible data leakage"

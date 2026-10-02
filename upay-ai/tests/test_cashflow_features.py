"""
Tests for cash-flow feature engineering pipeline.
Validates feature splits, column integrity, and feature count.
"""

import os
import sys
import pandas as pd
import json
import pytest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")


def test_cashflow_features_splits_exist():
    for split in ["train", "val", "test"]:
        path = os.path.join(DATA_DIR, f"cashflow_features_{split}.csv")
        assert os.path.exists(path), f"cashflow_features_{split}.csv not found"


def test_cashflow_feature_names_exist():
    path = os.path.join(MODELS_DIR, "cashflow_feature_names.json")
    assert os.path.exists(path), "cashflow_feature_names.json not found"
    with open(path) as f:
        names = json.load(f)
    assert isinstance(names, list)
    assert len(names) >= 10, f"Expected >=10 cashflow features, got {len(names)}"


def test_cashflow_features_shape():
    with open(os.path.join(MODELS_DIR, "cashflow_feature_names.json")) as f:
        feature_names = json.load(f)

    train = pd.read_csv(os.path.join(DATA_DIR, "cashflow_features_train.csv"))
    val = pd.read_csv(os.path.join(DATA_DIR, "cashflow_features_val.csv"))
    test = pd.read_csv(os.path.join(DATA_DIR, "cashflow_features_test.csv"))

    # All feature columns present
    for col in feature_names:
        assert col in train.columns, f"Missing feature column in train: {col}"

    # Target column present
    assert "target_surplus" in train.columns, "Missing target_surplus in train"

    # Split proportions (roughly 70/15/15)
    total = len(train) + len(val) + len(test)
    assert abs(total - 50000) < 100, f"Total samples ({total}) not close to 50000"
    assert len(test) / total > 0.10, "Test set too small"
    assert len(val) / total > 0.10, "Val set too small"


def test_cashflow_no_nulls_in_features():
    train = pd.read_csv(os.path.join(DATA_DIR, "cashflow_features_train.csv"))
    with open(os.path.join(MODELS_DIR, "cashflow_feature_names.json")) as f:
        feature_names = json.load(f)

    null_counts = train[feature_names].isnull().sum()
    has_nulls = null_counts[null_counts > 0]
    assert len(has_nulls) == 0, f"Null values found in features: {has_nulls.to_dict()}"


def test_target_surplus_distribution():
    """Surplus should have meaningful variance, not all zeros."""
    train = pd.read_csv(os.path.join(DATA_DIR, "cashflow_features_train.csv"))
    surplus = train["target_surplus"]
    assert surplus.std() > 100, f"Surplus std too low: {surplus.std():.2f}"
    # Some users should have positive surplus (savers) and some negative (spenders)
    assert (surplus > 0).sum() > 0, "No users with positive surplus — unrealistic"
    # Some users should have negative surplus too
    assert (surplus < 0).sum() > 0, "No users with negative surplus — unrealistic"

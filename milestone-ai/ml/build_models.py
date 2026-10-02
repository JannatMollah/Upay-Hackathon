"""
Build models using the pre-computed best hyperparameters.
Generates:
  - models/xgboost_model.joblib
  - models/surplus_regressor.joblib
  - models/shap_values_*.npy
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from xgboost import XGBClassifier, XGBRegressor
import shap

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")

def build_xgboost_models():
    print("Fitting XGBoost models...")
    train = pd.read_csv(os.path.join(DATA_DIR, "features_train.csv"))
    with open(os.path.join(MODELS_DIR, "feature_names.json")) as f:
        feature_names = json.load(f)
    with open(os.path.join(MODELS_DIR, "xgboost_results.json")) as f:
        results = json.load(f)

    X_train = train[feature_names].values

    models = {}
    for m in ["M2", "M3", "M4", "M5"]:
        target_col = f"target_{m}"
        y_train = train[target_col].values
        params = results[m]["best_params"]
        model = XGBClassifier(
            **params,
            random_state=42,
            eval_metric="logloss"
        )
        model.fit(X_train, y_train)
        models[m] = model
        print(f"  {m} fitted.")

    joblib.dump(models, os.path.join(MODELS_DIR, "xgboost_model.joblib"))
    print("xgboost_model.joblib saved!")
    return models, feature_names

def build_surplus_model():
    print("\nFitting Surplus Regressor...")
    train = pd.read_csv(os.path.join(DATA_DIR, "cashflow_features_train.csv"))
    with open(os.path.join(MODELS_DIR, "cashflow_feature_names.json")) as f:
        feature_names = json.load(f)
    with open(os.path.join(MODELS_DIR, "surplus_results.json")) as f:
        results = json.load(f)

    X_train = train[feature_names].values
    y_train = train["target_surplus"].values
    params = results["best_params"]

    model = XGBRegressor(
        **params,
        random_state=42,
        objective="reg:squarederror"
    )
    model.fit(X_train, y_train)
    joblib.dump(model, os.path.join(MODELS_DIR, "surplus_regressor.joblib"))
    print("surplus_regressor.joblib saved!")

def build_shap_values(models, feature_names):
    print("\nComputing SHAP values...")
    test = pd.read_csv(os.path.join(DATA_DIR, "features_test.csv"))
    X_test = test[feature_names]

    all_shap_values = {}
    for m in ["M2", "M3", "M4", "M5"]:
        print(f"  Computing SHAP for {m}...")
        explainer = shap.TreeExplainer(models[m])
        shap_values = explainer.shap_values(X_test)
        all_shap_values[m] = shap_values
        np.save(os.path.join(MODELS_DIR, f"shap_values_{m}.npy"), shap_values)

    np.save(os.path.join(MODELS_DIR, "shap_values_test.npy"), all_shap_values["M4"])
    test["user_id"].to_csv(os.path.join(MODELS_DIR, "shap_test_user_ids.csv"), index=False)
    print("SHAP values saved!")

if __name__ == "__main__":
    models, feature_names = build_xgboost_models()
    build_surplus_model()
    build_shap_values(models, feature_names)
    print("\nAll models and caches built successfully!")

"""
MilestoneAI — Model Metrics and Fairness Endpoints
GET /api/v1/model/metrics
GET /api/v1/model/fairness
"""

from fastapi import APIRouter
import json
import os

from ..config import Config

router = APIRouter(tags=["Metrics"])
MODELS_DIR = Config.MODELS_DIR


@router.get("/model/metrics")
async def model_metrics():
    """Get model performance metrics."""
    path = os.path.join(MODELS_DIR, "evaluation_report.json")
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)

    # Return baseline or training results if evaluation report not yet saved
    xgb_path = os.path.join(MODELS_DIR, "xgboost_results.json")
    if os.path.exists(xgb_path):
        with open(xgb_path) as f:
            data = json.load(f)
            return {"model_version": "xgb_v1", "milestones": data, "data_is_synthetic": True}

    return {"error": "Evaluation report not found. Run evaluate_model.py first.", "data_is_synthetic": True}


@router.get("/model/fairness")
async def model_fairness():
    """Get fairness analysis report."""
    path = os.path.join(MODELS_DIR, "fairness_report.json")
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {"error": "Fairness report not found. Run fairness_check.py first.", "data_is_synthetic": True}

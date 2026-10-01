"""
Tests for FastAPI endpoints.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app

client = TestClient(app)
HEADERS = {"X-API-Key": "milestone-ai-dev-key-2026"}


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_funnel():
    res = client.get("/api/v1/funnel", headers=HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert data["total_users"] == 50000
    assert len(data["milestones"]) == 6


def test_at_risk_users():
    res = client.get("/api/v1/at-risk-users?limit=10", headers=HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert "users" in data
    assert len(data["users"]) <= 10


def test_model_metrics():
    res = client.get("/api/v1/model/metrics", headers=HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert "overall_auc_roc" in data or "milestones" in data


def test_user_prediction_and_nudge():
    risk_res = client.get("/api/v1/at-risk-users?limit=1", headers=HEADERS)
    user_id = risk_res.json()["users"][0]["user_id"]

    pred_res = client.get(f"/api/v1/users/{user_id}/prediction", headers=HEADERS)
    assert pred_res.status_code == 200
    pred = pred_res.json()
    assert pred["user_id"] == user_id
    assert "milestone_probabilities" in pred


def test_user_savings_plan():
    risk_res = client.get("/api/v1/at-risk-users?limit=1", headers=HEADERS)
    user_id = risk_res.json()["users"][0]["user_id"]

    sav_res = client.get(f"/api/v1/users/{user_id}/savings-plan", headers=HEADERS)
    assert sav_res.status_code == 200
    sav = sav_res.json()
    assert "cashflow" in sav
    assert "dps_recommendation" in sav

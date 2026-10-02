"""
Tests for the SanchayBot savings plan API endpoint.
Validates DPS recommendations, cashflow responses, and edge cases.
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


def test_savings_plan_endpoint():
    """GET /users/{id}/savings-plan should return cashflow + DPS plan."""
    # Get a real user ID from at-risk list
    risk_res = client.get("/api/v1/at-risk-users?limit=1", headers=HEADERS)
    assert risk_res.status_code == 200
    user_id = risk_res.json()["users"][0]["user_id"]

    res = client.get(f"/api/v1/users/{user_id}/savings-plan", headers=HEADERS)
    assert res.status_code == 200
    data = res.json()

    # Response structure
    assert "cashflow" in data
    assert "dps_recommendation" in data
    assert "data_is_synthetic" in data
    assert data["data_is_synthetic"] is True


def test_cashflow_fields():
    """Cashflow summary should contain all required fields."""
    risk_res = client.get("/api/v1/at-risk-users?limit=1", headers=HEADERS)
    user_id = risk_res.json()["users"][0]["user_id"]

    res = client.get(f"/api/v1/users/{user_id}/savings-plan", headers=HEADERS)
    cf = res.json()["cashflow"]

    required = ["monthly_income", "monthly_expenses", "monthly_surplus",
                 "cash_out_ratio", "top_expense_category", "savings_rate", "tx_count"]
    for field in required:
        assert field in cf, f"Missing cashflow field: {field}"

    assert cf["monthly_income"] >= 0, "Negative income"
    assert cf["tx_count"] > 0, "No transactions"


def test_dps_recommendation_structure():
    """DPS recommendation should have eligible flag and plan details."""
    risk_res = client.get("/api/v1/at-risk-users?limit=1", headers=HEADERS)
    user_id = risk_res.json()["users"][0]["user_id"]

    res = client.get(f"/api/v1/users/{user_id}/savings-plan", headers=HEADERS)
    dps = res.json()["dps_recommendation"]

    assert "eligible" in dps

    if dps["eligible"]:
        assert "recommended_plan" in dps
        plan = dps["recommended_plan"]
        assert "monthly_amount" in plan
        assert "tenure_months" in plan
        assert "projected_maturity" in plan
        # Amount must be within DPS limits (৳200 - ৳5000)
        assert 200 <= plan["monthly_amount"] <= 5000, \
            f"DPS amount {plan['monthly_amount']} outside ৳200-৳5000 range"
        # Tenure must be valid
        assert plan["tenure_months"] in [6, 12, 18, 24, 36], \
            f"Invalid tenure: {plan['tenure_months']}"
        # Maturity must exceed deposits
        assert plan["projected_maturity"] >= plan["total_deposits"], \
            "Projected maturity less than total deposits"
        # All plans should be provided
        assert "all_plans" in dps
        assert len(dps["all_plans"]) == 5, "Expected 5 tenure options"
    else:
        assert "reason" in dps


def test_savings_plan_404_invalid_user():
    """Should return 404 for a non-existent user."""
    res = client.get("/api/v1/users/UINVALID999/savings-plan", headers=HEADERS)
    assert res.status_code == 404


def test_savings_plan_consistency_across_calls():
    """Same user should get same plan across calls (deterministic)."""
    risk_res = client.get("/api/v1/at-risk-users?limit=1", headers=HEADERS)
    user_id = risk_res.json()["users"][0]["user_id"]

    res1 = client.get(f"/api/v1/users/{user_id}/savings-plan", headers=HEADERS)
    res2 = client.get(f"/api/v1/users/{user_id}/savings-plan", headers=HEADERS)

    data1 = res1.json()
    data2 = res2.json()

    assert data1["cashflow"]["monthly_surplus"] == data2["cashflow"]["monthly_surplus"]
    assert data1["dps_recommendation"]["eligible"] == data2["dps_recommendation"]["eligible"]

"""
End-to-end integration test: Full SanchayBot flow
cashflow → surplus prediction → DPS recommendation → M5 nudge enrichment

This test validates the complete hybrid system pipeline.
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


class TestEndToEndHybridFlow:
    """End-to-end integration tests for the full MilestoneAI + SanchayBot pipeline."""

    def _get_at_risk_user(self, milestone=None):
        """Helper: get an at-risk user ID."""
        params = "limit=1"
        if milestone:
            params += f"&milestone={milestone}"
        res = client.get(f"/api/v1/at-risk-users?{params}", headers=HEADERS)
        assert res.status_code == 200
        users = res.json()["users"]
        assert len(users) > 0, f"No at-risk users found for {milestone}"
        return users[0]["user_id"]

    def test_full_prediction_flow(self):
        """Test: at-risk → prediction → SHAP → nudge → complete response."""
        user_id = self._get_at_risk_user()

        res = client.get(f"/api/v1/users/{user_id}/prediction", headers=HEADERS)
        assert res.status_code == 200
        data = res.json()

        # Must have all core fields
        assert data["user_id"] == user_id
        assert "milestone_probabilities" in data
        assert "explanation" in data
        assert "nudge" in data

        # Milestones M2-M5 present
        probs = data["milestone_probabilities"]
        for m in ["M2", "M3", "M4", "M5"]:
            assert m in probs, f"Missing milestone {m}"
            assert "completion_prob" in probs[m]
            assert "at_risk" in probs[m]

        # SHAP explanation exists
        if data["explanation"]:
            assert "features" in data["explanation"]
            assert len(data["explanation"]["features"]) > 0

        # Nudge exists
        if data["nudge"]:
            assert "text_bn" in data["nudge"]
            assert "bonus_amount_bdt" in data["nudge"]

    def test_full_savings_flow(self):
        """Test: user → cashflow analysis → DPS plan → all tenure options."""
        user_id = self._get_at_risk_user()

        res = client.get(f"/api/v1/users/{user_id}/savings-plan", headers=HEADERS)
        assert res.status_code == 200
        data = res.json()

        # Cashflow analysis
        cf = data["cashflow"]
        assert cf["monthly_income"] >= 0
        assert cf["tx_count"] > 0

        # DPS recommendation
        dps = data["dps_recommendation"]
        if dps["eligible"]:
            plan = dps["recommended_plan"]
            assert 200 <= plan["monthly_amount"] <= 5000
            assert plan["projected_maturity"] > plan["total_deposits"]
            assert len(dps["all_plans"]) == 5  # 6, 12, 18, 24, 36 months

    def test_hybrid_user_both_modules(self):
        """Test: Same user gets BOTH prediction (Module A) + savings (Module B)."""
        user_id = self._get_at_risk_user()

        # Module A: Prediction
        pred_res = client.get(f"/api/v1/users/{user_id}/prediction", headers=HEADERS)
        assert pred_res.status_code == 200

        # Module B: Savings
        sav_res = client.get(f"/api/v1/users/{user_id}/savings-plan", headers=HEADERS)
        assert sav_res.status_code == 200

        # Both should reference the same user
        assert pred_res.json()["user_id"] == user_id
        assert sav_res.json()["user_id"] == user_id

    def test_funnel_has_all_milestones(self):
        """Funnel should show M1-M6 with decreasing completion rates."""
        res = client.get("/api/v1/funnel", headers=HEADERS)
        assert res.status_code == 200
        data = res.json()

        assert data["total_users"] == 50000
        milestones = data["milestones"]
        assert len(milestones) == 6

        # Rates should generally decrease (funnel shape)
        rates = [m["rate"] for m in milestones]
        assert rates[0] > rates[-1], "First milestone should have higher rate than last"

    def test_model_metrics_endpoint(self):
        """Model metrics should include per-milestone AUC scores."""
        res = client.get("/api/v1/model/metrics", headers=HEADERS)
        assert res.status_code == 200
        data = res.json()

        if "milestones" in data:
            for m in ["M2", "M3", "M4", "M5"]:
                assert m in data["milestones"], f"Missing {m} in metrics"

    def test_model_fairness_endpoint(self):
        """Fairness report should include both demographic axes."""
        res = client.get("/api/v1/model/fairness", headers=HEADERS)
        assert res.status_code == 200
        data = res.json()

        for m in ["M2", "M3", "M4", "M5"]:
            if m in data:
                assert "urban_vs_rural" in data[m]
                assert "male_vs_female" in data[m]

    def test_nudge_approval_flow(self):
        """Test human-in-the-loop: predict → nudge → approve."""
        user_id = self._get_at_risk_user()

        # Get prediction with nudge
        pred_res = client.get(f"/api/v1/users/{user_id}/prediction", headers=HEADERS)
        pred = pred_res.json()

        if pred.get("nudge") and pred["nudge"].get("nudge_id"):
            nudge_id = pred["nudge"]["nudge_id"]

            # Approve the nudge
            approve_res = client.post(
                f"/api/v1/nudges/{nudge_id}/approve",
                headers=HEADERS,
                json={
                    "action": "approve",
                    "approver_id": "CM001",
                },
            )
            assert approve_res.status_code == 200
            result = approve_res.json()
            assert result["status"] == "approved"
            assert result["approved_by"] == "CM001"

    def test_audit_trail(self):
        """Traces endpoint should return audit entries."""
        res = client.get("/api/v1/traces?limit=5", headers=HEADERS)
        assert res.status_code == 200

    def test_synthetic_data_flag(self):
        """All responses must include data_is_synthetic=True."""
        user_id = self._get_at_risk_user()

        # Check funnel
        funnel = client.get("/api/v1/funnel", headers=HEADERS).json()
        assert funnel.get("data_is_synthetic") is True

        # Check prediction
        pred = client.get(f"/api/v1/users/{user_id}/prediction", headers=HEADERS).json()
        assert pred.get("data_is_synthetic") is True

        # Check savings
        sav = client.get(f"/api/v1/users/{user_id}/savings-plan", headers=HEADERS).json()
        assert sav.get("data_is_synthetic") is True

        # Check health
        health = client.get("/health").json()
        assert health.get("data_is_synthetic") is True

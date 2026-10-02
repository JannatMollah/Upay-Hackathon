"""
Test Agent Liquidity Forecast endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
import os

client = TestClient(app)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def test_agents_csv_exists():
    """Verify agent data was generated."""
    assert os.path.exists(os.path.join(DATA_DIR, "agents.csv")), "agents.csv missing"


def test_agent_daily_csv_exists():
    """Verify agent daily transaction data was generated."""
    assert os.path.exists(os.path.join(DATA_DIR, "agent_daily.csv")), "agent_daily.csv missing"


def test_liquidity_agents_endpoint():
    """Test GET /api/v1/liquidity/agents returns agent overview."""
    resp = client.get("/api/v1/liquidity/agents")
    assert resp.status_code == 200
    data = resp.json()
    assert "agents" in data
    assert "total_agents" in data
    assert data["total_agents"] == 500
    assert "status_summary" in data
    assert "critical" in data["status_summary"]
    assert data["data_is_synthetic"] is True


def test_liquidity_agents_filter_by_area():
    """Test area filter on agents endpoint."""
    resp = client.get("/api/v1/liquidity/agents?area=urban")
    assert resp.status_code == 200
    data = resp.json()
    for agent in data["agents"]:
        assert agent["area_type"] == "urban"


def test_liquidity_agent_forecast():
    """Test GET /api/v1/liquidity/agents/{id}/forecast returns 7-day forecast."""
    resp = client.get("/api/v1/liquidity/agents/AG00000/forecast")
    assert resp.status_code == 200
    data = resp.json()
    assert data["agent_id"] == "AG00000"
    assert "forecast" in data
    assert len(data["forecast"]) == 7
    assert "predicted_cashout" in data["forecast"][0]
    assert "risk_level" in data["forecast"][0]
    assert data["data_is_synthetic"] is True


def test_liquidity_agent_forecast_404():
    """Test 404 for unknown agent."""
    resp = client.get("/api/v1/liquidity/agents/INVALID/forecast")
    assert resp.status_code == 404


def test_liquidity_model_metrics():
    """Test GET /api/v1/liquidity/model/metrics returns model results."""
    resp = client.get("/api/v1/liquidity/model/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert "test_r2" in data
    assert "test_mae" in data
    assert data["test_r2"] > 0.5  # Reasonable R² for demand forecasting

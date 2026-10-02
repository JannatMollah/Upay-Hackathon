"""
Upay AI — Agent Liquidity Forecast Router
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..services import liquidity_service

router = APIRouter(prefix="/liquidity", tags=["Agent Liquidity"])


@router.get("/agents")
async def get_agents_overview(
    area: Optional[str] = Query(None, description="Filter by area: urban, peri_urban, rural"),
    status: Optional[str] = Query(None, description="Filter by status: critical, low, adequate, healthy"),
    limit: int = Query(50, ge=1, le=500),
):
    """Get overview of all agent points with liquidity status."""
    return liquidity_service.get_agents_overview(area, status, limit)


@router.get("/agents/{agent_id}/forecast")
async def get_agent_forecast(agent_id: str):
    """Get 7-day liquidity forecast for a specific agent."""
    result = liquidity_service.get_agent_forecast(agent_id)
    if result is None:
        raise HTTPException(404, f"Agent {agent_id} not found")
    return result


@router.get("/model/metrics")
async def get_liquidity_model_metrics():
    """Get liquidity model performance metrics."""
    return liquidity_service.get_liquidity_model_metrics()

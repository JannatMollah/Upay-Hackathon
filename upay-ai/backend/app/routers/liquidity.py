"""
Upay AI — Agent Liquidity Forecast Router
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..services import liquidity_service

router = APIRouter(prefix="/liquidity", tags=["Agent Liquidity"])


@router.get("/search")
async def search_agents(
    q: str = Query(..., min_length=1, description="Search agent by ID, division, district, or area"),
    limit: int = Query(8, ge=1, le=20),
):
    """Real-time autocomplete search for agent points."""
    return liquidity_service.search_agents(q, limit)


@router.get("/agents")
async def get_agents_overview(
    area: Optional[str] = Query(None, description="Filter by area: urban, peri_urban, rural"),
    status: Optional[str] = Query(None, description="Filter by status: critical, low, adequate, healthy"),
    search: Optional[str] = Query(None, description="Search by agent ID, division, district, or area"),
    limit: int = Query(10, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """Get overview of all agent points with liquidity status."""
    return liquidity_service.get_agents_overview(area, status, search, limit, offset)


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

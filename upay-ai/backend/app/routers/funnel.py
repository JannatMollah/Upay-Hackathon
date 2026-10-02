"""
MilestoneAI — Funnel Router
GET /api/v1/funnel
"""

from fastapi import APIRouter
from ..services.prediction_service import get_funnel_stats
from ..models.schemas import FunnelResponse

router = APIRouter(tags=["Funnel"])


@router.get("/funnel", response_model=FunnelResponse)
async def get_funnel():
    """Get milestone completion funnel statistics."""
    return get_funnel_stats()

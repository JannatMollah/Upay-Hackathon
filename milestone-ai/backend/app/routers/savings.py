"""
SanchayBot — Savings Plan Endpoints (Module B)
GET /api/v1/users/{id}/savings-plan
"""

from fastapi import APIRouter, HTTPException
from ..services.savings_service import get_user_savings_plan
from ..models.schemas import SavingsPlanResponse

router = APIRouter(tags=["Savings"])


@router.get("/users/{user_id}/savings-plan", response_model=SavingsPlanResponse)
async def user_savings_plan(user_id: str):
    """Get personalized savings plan (SanchayBot) for a user."""
    plan = get_user_savings_plan(user_id)
    if plan is None:
        raise HTTPException(status_code=404, detail=f"Cash-flow data for user {user_id} not found")
    return plan

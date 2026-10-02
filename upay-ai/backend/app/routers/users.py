"""
MilestoneAI — User Prediction Endpoints
GET /api/v1/at-risk-users
GET /api/v1/users/{id}/prediction
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..services.prediction_service import predict_user, get_at_risk_users, search_users_by_id
from ..services.nudge_service import NudgeGenerator
from ..services.trace_service import log_trace
from ..models.schemas import AtRiskResponse, PredictionResponse

router = APIRouter(tags=["Users"])
nudge_gen = NudgeGenerator()


@router.get("/users/search")
async def search_users(q: str = Query(..., min_length=1), limit: int = Query(8, ge=1, le=50)):
    """Search user IDs matching query substring or prefix."""
    results = search_users_by_id(q, limit=limit)
    return {"query": q, "results": results}


@router.get("/at-risk-users", response_model=AtRiskResponse)
async def at_risk_users(
    milestone: Optional[str] = Query(None, pattern="^M[1-6]$"),
    limit: int = Query(10, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """Get ranked list of at-risk users."""
    return get_at_risk_users(milestone_filter=milestone, limit=limit, offset=offset)


@router.get("/users/{user_id}/prediction", response_model=PredictionResponse)
async def user_prediction(user_id: str):
    """Get full prediction, explanation, and nudge for a user."""
    prediction = predict_user(user_id)
    if not prediction:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")

    # Generate nudge if user has a drop-off milestone
    nudge = None
    if prediction.get("primary_drop_off"):
        risk_factors = prediction.get("explanation", {}).get("features", [])
        nudge = nudge_gen.generate_nudge(
            user_id=user_id,
            milestone=prediction["primary_drop_off"],
            risk_factors=risk_factors,
        )
        try:
            from ..database import get_db
            db = get_db()
            cursor = db.cursor()
            cursor.execute(
                """INSERT OR REPLACE INTO nudges 
                   (nudge_id, prediction_id, user_id, target_milestone, bonus_amount_bdt, text_bn, text_en, channel_recommendation, status, ai_generated, guardrail_passed, generation_method)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    nudge["nudge_id"],
                    prediction.get("prediction_id"),
                    user_id,
                    nudge["target_milestone"],
                    nudge["bonus_amount_bdt"],
                    nudge["text_bn"],
                    nudge["text_en"],
                    nudge["channel_recommendation"],
                    nudge["status"],
                    nudge["ai_generated"],
                    nudge["guardrail_passed"],
                    nudge.get("generation_method", "gemini"),
                ),
            )
            db.commit()
            db.close()
        except Exception as e:
            print(f"Warning: Failed to save nudge: {e}")

    prediction["nudge"] = nudge

    # Log audit trace
    log_trace(
        prediction_id=prediction.get("prediction_id"),
        user_id=user_id,
        action="prediction_generated",
        details={"primary_drop_off": prediction.get("primary_drop_off")},
    )

    return prediction

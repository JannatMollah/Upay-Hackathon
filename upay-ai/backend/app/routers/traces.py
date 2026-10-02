"""
MilestoneAI — Audit Trail / Trace Endpoints
GET /api/v1/traces
"""

from fastapi import APIRouter, Query
from typing import Optional
from ..database import get_db

router = APIRouter(tags=["Traces"])


@router.get("/traces")
async def get_traces(
    limit: int = Query(50, ge=1, le=200),
    user_id: Optional[str] = None,
):
    """Get audit trail of explanation traces and approvals."""
    db = get_db()
    cursor = db.cursor()

    if user_id:
        cursor.execute(
            "SELECT * FROM traces WHERE user_id = %s ORDER BY timestamp DESC LIMIT %s",
            (user_id, limit),
        )
    else:
        cursor.execute(
            "SELECT * FROM traces ORDER BY timestamp DESC LIMIT %s",
            (limit,),
        )

    rows = cursor.fetchall()
    traces = list(rows)  # Already dicts via dict_row factory
    cursor.close()
    db.close()
    return {"traces": traces, "total": len(traces), "data_is_synthetic": True}

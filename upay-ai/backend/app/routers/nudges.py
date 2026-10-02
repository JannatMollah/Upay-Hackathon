"""
MilestoneAI — Nudge Approval Endpoints
POST /api/v1/nudges/{id}/approve
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
from ..database import get_db
from ..services.trace_service import log_trace
from ..models.schemas import NudgeApproveRequest, NudgeApproveResponse

router = APIRouter(tags=["Nudges"])


@router.post("/nudges/{nudge_id}/approve", response_model=NudgeApproveResponse)
async def approve_nudge(nudge_id: str, payload: NudgeApproveRequest):
    """Approve, reject, or edit a nudge."""
    db = get_db()
    cursor = db.cursor()

    now = datetime.utcnow().isoformat() + "Z"

    if payload.action in ["approve", "approved"]:
        status = "approved"
    elif payload.action in ["reject", "rejected"]:
        status = "rejected"
    elif payload.action in ["edit", "edited"]:
        status = "approved"
        if payload.modified_text_bn:
            cursor.execute(
                "UPDATE nudges SET text_bn = %s WHERE nudge_id = %s",
                (payload.modified_text_bn, nudge_id),
            )
    else:
        raise HTTPException(status_code=400, detail=f"Invalid action: {payload.action}")

    cursor.execute("SELECT user_id FROM nudges WHERE nudge_id = %s", (nudge_id,))
    row = cursor.fetchone()
    if row:
        cursor.execute(
            "UPDATE nudges SET status = %s, approved_by = %s, approved_at = %s WHERE nudge_id = %s",
            (status, payload.approver_id, now, nudge_id),
        )
    else:
        cursor.execute(
            """INSERT INTO nudges (nudge_id, user_id, target_milestone, status, approved_by, approved_at)
               VALUES (%s, 'DEMO_USER', 'M4', %s, %s, %s)""",
            (nudge_id, status, payload.approver_id, now),
        )
    db.commit()
    cursor.close()
    db.close()

    # Log trace
    log_trace(
        nudge_id=nudge_id,
        action=f"nudge_{status}",
        details={"approver": payload.approver_id, "action": payload.action},
        actor=payload.approver_id,
    )

    return {
        "nudge_id": nudge_id,
        "status": status,
        "approved_at": now,
        "approved_by": payload.approver_id,
        "data_is_synthetic": True,
    }

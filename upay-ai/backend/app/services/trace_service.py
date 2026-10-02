"""
MilestoneAI — Audit Trail / Trace Service
Logs all predictions, nudges, and human decisions.
"""

from datetime import datetime
import json
from typing import Optional
from ..database import get_db


def log_trace(
    action: str,
    prediction_id: Optional[str] = None,
    nudge_id: Optional[str] = None,
    user_id: Optional[str] = None,
    details: Optional[dict] = None,
    actor: Optional[str] = "system",
):
    """Log an action to the audit trail."""
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            """INSERT INTO traces (prediction_id, nudge_id, user_id, action, details, actor, timestamp)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                prediction_id,
                nudge_id,
                user_id,
                action,
                json.dumps(details) if details else None,
                actor,
                datetime.utcnow().isoformat(),
            ),
        )
        db.commit()
        db.close()
    except Exception as e:
        print(f"Warning: Failed to log trace: {e}")

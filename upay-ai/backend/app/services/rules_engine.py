"""
MilestoneAI — Business Rules Engine
Keeps business rules separate from ML predictions.
Rules determine nudge eligibility, frequency, and constraints.
"""

from datetime import datetime, timedelta
from typing import Optional



class NudgeRules:
    """Business rules for nudge eligibility and constraints."""

    MAX_NUDGES_PER_WEEK = 2
    MIN_HOURS_BETWEEN_NUDGES = 48
    CAMPAIGN_WINDOW_DAYS = 30  # Nudge only within 30 days of registration
    MAX_NUDGES_PER_MILESTONE = 3

    # Milestone bonus amounts (BDT) — from upay's campaign
    MILESTONE_BONUSES = {
        "M2": 20,  # First recharge (>=30 taka)
        "M3": 30,  # Cash-in or Add Money (>=500 taka)
        "M4": 20,  # Merchant payment (>=200 taka)
        "M5": 50,  # Open DPS account
    }

    # Milestone action descriptions (for nudge context)
    MILESTONE_ACTIONS = {
        "M2": {
            "action_bn": "যেকোনো নাম্বারে ৩০ টাকা রিচার্জ করুন",
            "action_en": "Recharge any number with 30 taka",
        },
        "M3": {
            "action_bn": "৫০০ টাকা ক্যাশ-ইন বা অ্যাড মানি করুন",
            "action_en": "Cash-in or Add Money of 500 taka",
        },
        "M4": {
            "action_bn": "যেকোনো দোকানে ২০০ টাকা QR পেমেন্ট করুন",
            "action_en": "Pay 200 taka at any shop via QR code",
        },
        "M5": {
            "action_bn": "অ্যাপ থেকে একটি ডিপিএস অ্যাকাউন্ট খুলুন",
            "action_en": "Open a DPS account from the app",
        },
    }

    @classmethod
    def check_eligibility(
        cls,
        user_id: str,
        milestone: str,
        registration_date: datetime,
        milestone_completed: bool,
        nudge_history: list,  # List of past nudges with timestamps
    ) -> dict:
        """
        Check if a user is eligible for a nudge.

        Returns:
            dict with 'eligible' (bool), 'reason' (str), and 'constraints' (dict)
        """
        now = datetime.utcnow()

        # Rule 1: Don't nudge if milestone already completed
        if milestone_completed:
            return {
                "eligible": False,
                "reason": f"Milestone {milestone} already completed",
                "rule": "completed_milestone",
            }

        # Rule 2: Within campaign window (30 days of registration)
        days_since_reg = (now - registration_date).days
        if days_since_reg > cls.CAMPAIGN_WINDOW_DAYS:
            return {
                "eligible": False,
                "reason": f"Outside campaign window ({days_since_reg} days since registration)",
                "rule": "campaign_window",
            }

        # Rule 3: Max nudges per week
        one_week_ago = now - timedelta(days=7)
        recent_nudges = [
            n for n in nudge_history
            if n.get("sent_at") and datetime.fromisoformat(n["sent_at"]) > one_week_ago
        ]
        if len(recent_nudges) >= cls.MAX_NUDGES_PER_WEEK:
            return {
                "eligible": False,
                "reason": f"Max {cls.MAX_NUDGES_PER_WEEK} nudges per week reached",
                "rule": "max_weekly",
            }

        # Rule 4: Minimum time between nudges
        if nudge_history:
            valid_times = [
                datetime.fromisoformat(n["sent_at"])
                for n in nudge_history
                if n.get("sent_at")
            ]
            if valid_times:
                last_nudge_time = max(valid_times)
                hours_since_last = (now - last_nudge_time).total_seconds() / 3600
                if hours_since_last < cls.MIN_HOURS_BETWEEN_NUDGES:
                    return {
                        "eligible": False,
                        "reason": f"Only {hours_since_last:.1f}h since last nudge (min: {cls.MIN_HOURS_BETWEEN_NUDGES}h)",
                        "rule": "cooldown",
                    }

        # Rule 5: Max nudges per specific milestone
        milestone_nudges = [
            n for n in nudge_history if n.get("target_milestone") == milestone
        ]
        if len(milestone_nudges) >= cls.MAX_NUDGES_PER_MILESTONE:
            return {
                "eligible": False,
                "reason": f"Max {cls.MAX_NUDGES_PER_MILESTONE} nudges for {milestone} reached",
                "rule": "max_per_milestone",
            }

        return {
            "eligible": True,
            "reason": "All rules passed",
            "rule": "eligible",
            "bonus_amount": cls.MILESTONE_BONUSES.get(milestone, 0),
            "action": cls.MILESTONE_ACTIONS.get(milestone, {}),
        }

    @classmethod
    def get_priority_milestone(cls, milestone_probs: dict) -> Optional[str]:
        """
        Given probability scores for each milestone, return the highest-risk
        (lowest probability) milestone that hasn't been completed.
        """
        if not milestone_probs:
            return None

        # Sort by completion probability (ascending = highest risk first)
        sorted_milestones = sorted(milestone_probs.items(), key=lambda x: x[1])
        return sorted_milestones[0][0]  # Return highest-risk milestone

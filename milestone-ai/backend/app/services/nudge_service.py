"""
MilestoneAI — LLM Nudge Generator
Generates personalized Bangla nudge messages using Gemini API.
Includes guardrails and fallback templates.
"""

import os
import json
import uuid
from datetime import datetime
from typing import Optional

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

from ..utils.sanitizer import sanitize_context, validate_nudge_output
from .rules_engine import NudgeRules
from ..config import Config

# Fallback templates (used when Gemini API is unavailable or for testing)
FALLBACK_TEMPLATES = {
    "M2": [
        "আপনি মাত্র ৩০ টাকা রিচার্জ করলেই {bonus} টাকা বোনাস পাবেন! আজকেই যেকোনো নাম্বারে রিচার্জ করুন।",
        "রিচার্জ করুন, বোনাস পান! মাত্র ৩০ টাকা রিচার্জ করলেই {bonus} টাকা ক্যাশ রিওয়ার্ড আপনার ওয়ালেটে।",
    ],
    "M3": [
        "আপনার উপায় ওয়ালেটে ৫০০ টাকা অ্যাড মানি বা ক্যাশ-ইন করলেই {bonus} টাকা বোনাস! যেকোনো ব্যাংক কার্ড থেকে ফ্রিতে অ্যাড মানি করুন।",
        "৫০০ টাকা ক্যাশ-ইন করুন, {bonus} টাকা বোনাস পান। কাছের এজেন্ট পয়েন্ট থেকে ফ্রিতে ক্যাশ-ইন করতে পারবেন।",
    ],
    "M4": [
        "আপনার কাছের দোকানে মাত্র ২০০ টাকা QR কোড দিয়ে পে করলেই {bonus} টাকা বোনাস পাবেন! ক্যাশ আউট চার্জও বাঁচবে।",
        "QR পেমেন্ট করুন, {bonus} টাকা পান! দোকানে ২০০ টাকা পেমেন্ট করলে বোনাস + ক্যাশ আউট ফি সেভ।",
    ],
    "M5": [
        "উপায় অ্যাপ থেকে একটি ডিপিএস অ্যাকাউন্ট খুলুন, {bonus} টাকা বোনাস পান! মাত্র ২০০ টাকা দিয়ে সঞ্চয় শুরু করুন।",
        "ডিপিএস খুলুন, {bonus} টাকা পান! প্রতি মাসে মাত্র ২০০ টাকা রাখলে ১ বছরে ২,৬০০+ টাকা পাবেন।",
    ],
}

FALLBACK_TEMPLATES_EN = {
    "M2": "Recharge just 30 taka to get {bonus} taka bonus! Recharge any number today on upay.",
    "M3": "Cash-in or Add Money 500 taka to your upay wallet and get {bonus} taka bonus immediately!",
    "M4": "Pay 200 taka using QR at your nearest merchant and earn {bonus} taka bonus, plus save on cash-out charges!",
    "M5": "Open a DPS savings scheme from upay app and get {bonus} taka bonus! Start saving from just 200 taka/month.",
}

SYSTEM_PROMPT = """You are a helpful upay campaign assistant. Your ONLY task is to generate a short, encouraging Bangla nudge message for a upay user.

STRICT RULES:
1. Write ONLY in Bangla (Bengali script)
2. Keep the message between 30-100 words
3. Reference the specific milestone action and exact bonus amount
4. Be encouraging and friendly, NOT pressuring or manipulative
5. Do NOT include: URLs, phone numbers, email addresses, passwords, PINs
6. Do NOT promise anything beyond the defined campaign bonus
7. Do NOT make financial advice or product recommendations
8. Do NOT reference any real user's personal information
9. The tone should be warm and helpful, like a friend reminding you of an opportunity
10. Mention the specific action the user needs to take
11. If relevant, mention how the action saves money (e.g., merchant payment saves cash-out charges)

Output ONLY the Bangla nudge message text. No explanations, no English text."""


def _build_user_prompt(context: dict) -> str:
    """Build the user prompt with sanitized context."""
    milestone = context.get("milestone", "M4")
    bonus = NudgeRules.MILESTONE_BONUSES.get(milestone, 20)
    action = NudgeRules.MILESTONE_ACTIONS.get(milestone, {})

    return f"""Generate a Bangla nudge for this user:

<user_context>
Target Milestone: {milestone}
Milestone Action: {action.get('action_bn', 'N/A')}
Bonus Amount: {bonus} taka
User Area: {context.get('area_type', 'urban')}
Device Type: {context.get('device_type', 'smartphone_android')}
Top Risk Factors: {context.get('risk_factors', 'low engagement')}
</user_context>

Generate the nudge in Bangla now."""


class NudgeGenerator:
    """Generates nudge messages using Gemini API with guardrails."""

    def __init__(self):
        self.api_key = Config.GEMINI_API_KEY
        self.model_name = Config.GEMINI_MODEL
        self.genai_ready = False

        if GENAI_AVAILABLE and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(self.model_name, system_instruction=SYSTEM_PROMPT)
                self.genai_ready = True
            except Exception as e:
                print(f"Warning: Gemini API init failed: {e}")

    def generate_nudge(
        self,
        user_id: str,
        milestone: str,
        risk_factors: list[dict],
        area_type: str = "urban",
        device_type: str = "smartphone_android",
        language_pref: str = "bangla",
    ) -> dict:
        """
        Generate a personalized nudge message.

        Returns:
            dict with nudge_id, text_bn, text_en, status, ai_generated, guardrail_passed
        """
        nudge_id = f"N_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        bonus = NudgeRules.MILESTONE_BONUSES.get(milestone, 20)

        # Build context
        context = {
            "milestone": milestone,
            "area_type": area_type,
            "device_type": device_type,
            "risk_factors": ", ".join(
                [f"{rf.get('name', 'unknown')}: {rf.get('value', '')}" for rf in risk_factors[:3]]
            ),
        }

        # Sanitize context
        is_valid, sanitized = sanitize_context(context)
        if not is_valid:
            return self._fallback_nudge(nudge_id, milestone, bonus, "Context sanitization failed")

        # Try Gemini API
        if self.genai_ready:
            try:
                prompt = _build_user_prompt(sanitized)
                response = self.model.generate_content(
                    prompt,
                    generation_config={
                        "temperature": 0.7,
                        "max_output_tokens": 256,
                    },
                )

                nudge_text = response.text.strip()

                # Validate output
                is_valid_output, violations = validate_nudge_output(nudge_text, bonus)

                if is_valid_output:
                    return {
                        "nudge_id": nudge_id,
                        "target_milestone": milestone,
                        "bonus_amount_bdt": bonus,
                        "text_bn": nudge_text,
                        "text_en": FALLBACK_TEMPLATES_EN.get(milestone, "").format(bonus=bonus),
                        "channel_recommendation": "sms" if device_type == "feature_phone" else "push",
                        "status": "pending_approval",
                        "ai_generated": True,
                        "guardrail_passed": True,
                        "generation_method": "gemini",
                    }
                else:
                    return self._fallback_nudge(
                        nudge_id, milestone, bonus,
                        f"Output validation failed: {violations}"
                    )

            except Exception as e:
                return self._fallback_nudge(
                    nudge_id, milestone, bonus, f"Gemini API error: {str(e)}"
                )

        # Fallback to template
        return self._fallback_nudge(nudge_id, milestone, bonus, "Gemini API not configured")

    def _fallback_nudge(
        self, nudge_id: str, milestone: str, bonus: int, reason: str
    ) -> dict:
        """Generate a fallback template-based nudge."""
        import random

        templates = FALLBACK_TEMPLATES.get(milestone, FALLBACK_TEMPLATES["M4"])
        template = random.choice(templates)
        nudge_text = template.format(bonus=bonus)
        text_en = FALLBACK_TEMPLATES_EN.get(milestone, f"Complete milestone {milestone} to earn {bonus} BDT").format(bonus=bonus)

        return {
            "nudge_id": nudge_id,
            "target_milestone": milestone,
            "bonus_amount_bdt": bonus,
            "text_bn": nudge_text,
            "text_en": text_en,
            "channel_recommendation": "sms",
            "status": "pending_approval",
            "ai_generated": False,
            "guardrail_passed": True,
            "generation_method": "template",
            "fallback_reason": reason,
        }

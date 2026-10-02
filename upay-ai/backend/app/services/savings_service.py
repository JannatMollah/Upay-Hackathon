"""
SanchayBot — Savings Service
Handles surplus prediction, DPS plan recommendation, and savings explanation generation.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Optional
from datetime import datetime

# DPS Recommendation Rules (from upay document)
DPS_CONFIG = {
    "min_dps_amount": 200,       # ৳200/month minimum
    "max_dps_amount": 5000,      # ৳5,000/month cap
    "surplus_percentage": 0.25,  # Recommend 25% of surplus
    "min_surplus_for_dps": 500,  # Don't recommend if surplus < ৳500
    "tenure_options": [6, 12, 18, 24, 36],  # months
    "annual_return": 0.05,       # 5% annual return estimate
    "free_cashout": "UCB ATM",   # From upay docs
}

from ..config import Config

MODELS_DIR = Config.MODELS_DIR
DATA_DIR = Config.DATA_DIR

_savings_cache = {}


def _load_surplus_model():
    """Load surplus regressor (cached)."""
    if "surplus_model" not in _savings_cache:
        path = os.path.join(MODELS_DIR, "surplus_regressor.joblib")
        if os.path.exists(path):
            _savings_cache["surplus_model"] = joblib.load(path)
        else:
            _savings_cache["surplus_model"] = None
    return _savings_cache["surplus_model"]


def _load_cashflow_data():
    """Load cashflow summary data (cached). Falls back to Supabase if CSV not found."""
    if "cashflow" not in _savings_cache:
        path = os.path.join(DATA_DIR, "cashflow_summary.csv")
        if os.path.exists(path):
            _savings_cache["cashflow"] = pd.read_csv(path)
        else:
            # Fallback: load from Supabase cashflow_summary table
            try:
                from ..database import get_db
                db = get_db()
                cursor = db.cursor()
                cursor.execute("SELECT * FROM cashflow_summary")
                rows = cursor.fetchall()
                cursor.close()
                db.close()
                if rows:
                    _savings_cache["cashflow"] = pd.DataFrame(rows)
                else:
                    _savings_cache["cashflow"] = None
            except Exception as e:
                print(f"Warning: Could not load cashflow_summary from Supabase: {e}")
                _savings_cache["cashflow"] = None
    return _savings_cache["cashflow"]


def recommend_dps_plan(predicted_surplus: float) -> dict:
    """
    Given a predicted monthly surplus, recommend a DPS plan.

    Rules:
    - Don't recommend if surplus < ৳500
    - Recommend 20-30% of surplus (default 25%)
    - Clamp to [৳200, ৳5000] range
    - Round to nearest ৳100
    - Pick tenure that gives meaningful maturity
    """
    if predicted_surplus < DPS_CONFIG["min_surplus_for_dps"]:
        return {
            "eligible": False,
            "predicted_surplus": round(predicted_surplus, 2),
            "reason": f"Predicted surplus ৳{predicted_surplus:.0f} below minimum ৳{DPS_CONFIG['min_surplus_for_dps']}",
            "recommended_plan": None,
            "all_plans": [],
            "surplus_percentage_used": 0.0,
            "free_cashout_channel": DPS_CONFIG["free_cashout"],
            "disclaimer": "Projections are indicative based on prevailing profit rates.",
            "data_is_synthetic": True,
        }

    # Calculate recommended amount
    raw_amount = predicted_surplus * DPS_CONFIG["surplus_percentage"]
    dps_amount = max(DPS_CONFIG["min_dps_amount"], min(DPS_CONFIG["max_dps_amount"], raw_amount))
    dps_amount = round(dps_amount / 100) * 100  # Round to nearest 100

    # Percentage of surplus
    surplus_pct = (dps_amount / predicted_surplus * 100) if predicted_surplus > 0 else 0

    annual_rate = DPS_CONFIG["annual_return"]
    plans = []
    for tenure in DPS_CONFIG["tenure_options"]:
        total_deposits = dps_amount * tenure
        interest = total_deposits * (annual_rate * tenure / 12 / 2)  # Approximate compound interest
        maturity = total_deposits + interest
        plans.append({
            "tenure_months": tenure,
            "monthly_amount": int(dps_amount),
            "total_deposits": int(total_deposits),
            "projected_interest": round(float(interest), 2),
            "projected_maturity": round(float(maturity), 2),
        })

    # Recommend 12-month as default (good balance)
    recommended_idx = next((i for i, p in enumerate(plans) if p["tenure_months"] == 12), 1)

    return {
        "eligible": True,
        "predicted_surplus": round(predicted_surplus, 2),
        "recommended_plan": plans[recommended_idx],
        "surplus_percentage_used": round(surplus_pct, 1),
        "all_plans": plans,
        "free_cashout_channel": DPS_CONFIG["free_cashout"],
        "disclaimer": "Projected returns are estimates. Actual returns may vary.",
        "data_is_synthetic": True,
    }


def get_user_savings_plan(user_id: str) -> Optional[dict]:
    """Get a complete savings plan for a user."""
    cashflow = _load_cashflow_data()
    if cashflow is None:
        return None

    user_cf = cashflow[cashflow["user_id"] == user_id]
    if user_cf.empty:
        return None

    row = user_cf.iloc[0]

    # Cash-flow summary
    cashflow_summary = {
        "user_id": user_id,
        "monthly_income": round(float(row["monthly_income"]), 2),
        "monthly_expenses": round(float(row["monthly_expenses"]), 2),
        "monthly_surplus": round(float(row["monthly_surplus"]), 2),
        "cash_out_amount": round(float(row["cash_out_amount"]), 2),
        "cash_out_ratio": round(float(row["cash_out_ratio"]), 4),
        "top_expense_category": str(row["top_expense_category"]),
        "savings_rate": round(float(row["savings_rate"]), 4),
        "tx_count": int(row["tx_count"]),
    }

    # DPS recommendation
    dps_plan = recommend_dps_plan(float(row["monthly_surplus"]))

    result = {
        "user_id": user_id,
        "cashflow": cashflow_summary,
        "dps_recommendation": dps_plan,
        "nudge_text_bn": f"প্রতি মাসে মাত্র ৳{dps_plan['recommended_plan']['monthly_amount'] if dps_plan.get('recommended_plan') else 200} সঞ্চয় করুন, ১ বছরে পাবেন লাভসহ মোট ৳{int(dps_plan['recommended_plan']['projected_maturity']) if dps_plan.get('recommended_plan') else 2600}!",
        "nudge_text_en": f"Save just ৳{dps_plan['recommended_plan']['monthly_amount'] if dps_plan.get('recommended_plan') else 200}/month with upay DPS and get ৳{int(dps_plan['recommended_plan']['projected_maturity']) if dps_plan.get('recommended_plan') else 2600} after maturity!",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "data_is_synthetic": True,
    }

    # Persist savings plan to Supabase
    try:
        import uuid
        from ..database import get_db
        plan_id = f"SP_{user_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
        rec_plan = dps_plan.get("recommended_plan") or {}
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """INSERT INTO savings_plans
               (plan_id, user_id, predicted_surplus, recommended_amount, recommended_tenure,
                projected_maturity, surplus_pct_used, cashflow_summary)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
               ON CONFLICT (plan_id) DO NOTHING""",
            (
                plan_id,
                user_id,
                dps_plan.get("predicted_surplus"),
                rec_plan.get("monthly_amount"),
                rec_plan.get("tenure_months"),
                rec_plan.get("projected_maturity"),
                dps_plan.get("surplus_percentage_used"),
                json.dumps(cashflow_summary),
            ),
        )
        db.commit()
        cursor.close()
        db.close()
    except Exception as e:
        print(f"Warning: Failed to save savings plan to Supabase: {e}")

    return result

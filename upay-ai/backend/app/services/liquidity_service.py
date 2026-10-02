"""
Upay AI — Agent Liquidity Forecast Service
Predicts next-day cash-out demand per agent point using XGBoost.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Optional
from datetime import datetime

from ..config import Config

MODELS_DIR = Config.MODELS_DIR
DATA_DIR = Config.DATA_DIR

_liquidity_cache = {}


def _load_liquidity_model():
    """Load liquidity forecast model (cached)."""
    if "model" not in _liquidity_cache:
        path = os.path.join(MODELS_DIR, "liquidity_model.joblib")
        if os.path.exists(path):
            _liquidity_cache["model"] = joblib.load(path)
        else:
            _liquidity_cache["model"] = None
    return _liquidity_cache["model"]


def _load_agents():
    """Load agent data (cached). Falls back to Supabase if CSV not found."""
    if "agents" not in _liquidity_cache:
        path = os.path.join(DATA_DIR, "agents.csv")
        if os.path.exists(path):
            _liquidity_cache["agents"] = pd.read_csv(path)
        else:
            try:
                from ..database import get_db
                db = get_db()
                cursor = db.cursor()
                cursor.execute("SELECT * FROM agents")
                rows = cursor.fetchall()
                cursor.close()
                db.close()
                _liquidity_cache["agents"] = pd.DataFrame(rows) if rows else pd.DataFrame()
            except Exception as e:
                print(f"Warning: Could not load agents from Supabase: {e}")
                _liquidity_cache["agents"] = pd.DataFrame()
    return _liquidity_cache["agents"]


def _load_daily_data():
    """Load agent daily transaction data (cached). Falls back to Supabase if CSV not found."""
    if "daily" not in _liquidity_cache:
        path = os.path.join(DATA_DIR, "agent_daily.csv")
        if os.path.exists(path):
            _liquidity_cache["daily"] = pd.read_csv(path)
        else:
            try:
                from ..database import get_db
                db = get_db()
                cursor = db.cursor()
                cursor.execute("SELECT * FROM agent_daily")
                rows = cursor.fetchall()
                cursor.close()
                db.close()
                _liquidity_cache["daily"] = pd.DataFrame(rows) if rows else pd.DataFrame()
            except Exception as e:
                print(f"Warning: Could not load agent_daily from Supabase: {e}")
                _liquidity_cache["daily"] = pd.DataFrame()
    return _liquidity_cache["daily"]


def _load_feature_names():
    """Load feature names for liquidity model."""
    if "features" not in _liquidity_cache:
        path = os.path.join(MODELS_DIR, "liquidity_feature_names.json")
        if os.path.exists(path):
            with open(path) as f:
                _liquidity_cache["features"] = json.load(f)
        else:
            _liquidity_cache["features"] = []
    return _liquidity_cache["features"]


def _get_latest_merged():
    if "latest_merged" not in _liquidity_cache:
        agents = _load_agents()
        daily = _load_daily_data()
        if agents.empty or daily.empty:
            return pd.DataFrame(), None, {}, 0
        latest_date = daily["date"].max()
        latest = daily[daily["date"] == latest_date].copy()
        merged = latest.merge(agents, on="agent_id")
        status_counts = latest["liquidity_status"].value_counts().to_dict()
        _liquidity_cache["latest_merged"] = (merged, latest_date, status_counts, len(agents))
    return _liquidity_cache["latest_merged"]


def get_agents_overview(area_filter: Optional[str] = None,
                        status_filter: Optional[str] = None,
                        search: Optional[str] = None,
                        limit: int = 10,
                        offset: int = 0) -> dict:
    """Get overview of agent liquidity status with search, filtering, and pagination."""
    merged, latest_date, status_counts, total_agents = _get_latest_merged()

    if merged.empty:
        return {"agents": [], "total_agents": 0, "total_matching": 0, "status_summary": {}}

    filtered = merged

    if area_filter and area_filter != "all":
        filtered = filtered[filtered["area_type"] == area_filter]

    if status_filter and status_filter != "all":
        filtered = filtered[filtered["liquidity_status"] == status_filter]

    if search and search.strip():
        q = search.strip().lower()
        filtered = filtered[
            filtered["agent_id"].astype(str).str.lower().str.contains(q) |
            filtered["division"].astype(str).str.lower().str.contains(q) |
            filtered["district"].astype(str).str.lower().str.contains(q) |
            filtered["area_type"].astype(str).str.lower().str.contains(q) |
            filtered["liquidity_status"].astype(str).str.lower().str.contains(q)
        ]

    total_matching = len(filtered)

    # Sort by float ratio (most critical first) and paginate
    sorted_df = filtered.sort_values("float_ratio")
    page_df = sorted_df.iloc[offset : offset + limit]

    result_agents = []
    for _, row in page_df.iterrows():
        result_agents.append({
            "agent_id": row["agent_id"],
            "area_type": row["area_type"],
            "division": row["division"],
            "district": row["district"],
            "tier": row["tier"],
            "is_rmg_zone": bool(row["is_rmg_zone"]),
            "cash_out_volume": round(float(row["cash_out_volume"]), 2),
            "cash_in_volume": round(float(row["cash_in_volume"]), 2),
            "estimated_float": round(float(row["estimated_float"]), 2),
            "float_capacity": int(row["float_capacity_bdt"]),
            "float_ratio": round(float(row["float_ratio"]), 4),
            "liquidity_status": row["liquidity_status"],
            "tx_count": int(row["tx_count_out"]) + int(row["tx_count_in"]),
        })

    return {
        "date": latest_date,
        "total_agents": total_agents,
        "total_matching": total_matching,
        "status_summary": {
            "critical": status_counts.get("critical", 0),
            "low": status_counts.get("low", 0),
            "adequate": status_counts.get("adequate", 0),
            "healthy": status_counts.get("healthy", 0),
        },
        "agents": result_agents,
        "data_is_synthetic": True,
    }


def get_agent_forecast(agent_id: str) -> Optional[dict]:
    """Get liquidity forecast for a specific agent."""
    agents = _load_agents()
    daily = _load_daily_data()
    model = _load_liquidity_model()
    feature_names = _load_feature_names()

    if agents.empty or daily.empty:
        return None

    agent_row = agents[agents["agent_id"] == agent_id]
    if agent_row.empty:
        return None

    agent = agent_row.iloc[0]
    agent_daily = daily[daily["agent_id"] == agent_id].sort_values("date")

    if len(agent_daily) < 8:
        return None

    # Build recent history (last 14 days)
    recent = agent_daily.tail(14).to_dict("records")

    # Build forecast for next 7 days
    forecast_days = []
    last_row = agent_daily.iloc[-1]
    last_date = pd.to_datetime(last_row["date"])

    # Use model if available, otherwise use rolling average
    if model is not None and feature_names:
        # Build features from the latest data
        area_map = {"urban": 2, "peri_urban": 1, "rural": 0}
        tier_map = {"platinum": 3, "gold": 2, "silver": 1, "bronze": 0}

        history = agent_daily["cash_out_volume"].values
        cashin_history = agent_daily["cash_in_volume"].values

        for d in range(1, 8):
            forecast_date = last_date + pd.Timedelta(days=d)
            dow = forecast_date.weekday()
            dom = forecast_date.day
            is_salary = int(dom in {1, 5, 10, 15})
            is_month_end = int(dom >= 28)

            # Lag features (from history + previous predictions)
            lag_1 = float(history[-1]) if len(history) >= 1 else 0
            lag_2 = float(history[-2]) if len(history) >= 2 else lag_1
            lag_3 = float(history[-3]) if len(history) >= 3 else lag_1
            lag_7 = float(history[-7]) if len(history) >= 7 else lag_1

            roll_3 = float(np.mean(history[-3:])) if len(history) >= 3 else lag_1
            roll_7 = float(np.mean(history[-7:])) if len(history) >= 7 else lag_1
            roll_14 = float(np.mean(history[-14:])) if len(history) >= 14 else lag_1
            std_7 = float(np.std(history[-7:])) if len(history) >= 7 else 0

            cashin_lag_1 = float(cashin_history[-1]) if len(cashin_history) >= 1 else 0

            features = np.array([[
                dow, dom, is_salary, is_month_end,
                lag_1, lag_2, lag_3, lag_7,
                roll_3, roll_7, roll_14, std_7, cashin_lag_1,
                area_map.get(agent["area_type"], 1),
                tier_map.get(agent["tier"], 1),
                int(agent["is_rmg_zone"]),
                float(agent["float_capacity_bdt"]),
            ]])

            predicted = float(model.predict(features)[0])
            predicted = max(0, predicted)

            # Determine risk level
            float_cap = float(agent["float_capacity_bdt"])
            remaining = max(0, float_cap - predicted * 0.4)
            ratio = remaining / float_cap if float_cap > 0 else 0

            if ratio < 0.15:
                risk = "critical"
            elif ratio < 0.30:
                risk = "warning"
            else:
                risk = "normal"

            forecast_days.append({
                "date": forecast_date.strftime("%Y-%m-%d"),
                "day_name": forecast_date.strftime("%A"),
                "predicted_cashout": round(predicted, 2),
                "is_salary_day": bool(is_salary),
                "risk_level": risk,
            })

            # Append prediction to history for next iteration
            history = np.append(history, predicted)
    else:
        # Fallback: simple rolling average
        avg_cashout = agent_daily["cash_out_volume"].tail(7).mean()
        for d in range(1, 8):
            forecast_date = last_date + pd.Timedelta(days=d)
            dom = forecast_date.day
            is_salary = dom in {1, 5, 10, 15}
            mult = 1.4 if is_salary else 1.0

            forecast_days.append({
                "date": forecast_date.strftime("%Y-%m-%d"),
                "day_name": forecast_date.strftime("%A"),
                "predicted_cashout": round(avg_cashout * mult, 2),
                "is_salary_day": is_salary,
                "risk_level": "normal",
            })

    return {
        "agent_id": agent_id,
        "agent_info": {
            "area_type": agent["area_type"],
            "division": agent["division"],
            "district": agent["district"],
            "tier": agent["tier"],
            "is_rmg_zone": bool(agent["is_rmg_zone"]),
            "float_capacity": int(agent["float_capacity_bdt"]),
        },
        "recent_history": recent[-7:],
        "forecast": forecast_days,
        "generated_at": datetime.now().isoformat() + "Z",
        "data_is_synthetic": True,
    }


def get_liquidity_model_metrics() -> dict:
    """Get liquidity model performance metrics."""
    path = os.path.join(MODELS_DIR, "liquidity_results.json")
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {"error": "Model metrics not available"}


def search_agents(query: str, limit: int = 8) -> dict:
    """Search agents by agent_id, division, district, or area_type."""
    if not query or not query.strip():
        return {"query": query, "results": []}

    agents = _load_agents()
    daily = _load_daily_data()
    if agents.empty:
        return {"query": query, "results": []}

    q = query.strip().lower()

    latest_status_map = {}
    if not daily.empty:
        latest_date = daily["date"].max()
        latest = daily[daily["date"] == latest_date]
        for _, row in latest.iterrows():
            latest_status_map[row["agent_id"]] = {
                "status": row.get("liquidity_status", "adequate"),
                "cash_out": round(float(row.get("cash_out_volume", 0)), 0),
            }

    matches = []
    for _, row in agents.iterrows():
        aid = str(row["agent_id"])
        div = str(row.get("division", ""))
        dist = str(row.get("district", ""))
        area = str(row.get("area_type", ""))

        if (q in aid.lower() or
            q in div.lower() or
            q in dist.lower() or
            q in area.lower()):
            stat_info = latest_status_map.get(aid, {"status": "adequate", "cash_out": 0})
            matches.append({
                "agent_id": aid,
                "division": div,
                "district": dist,
                "area_type": area,
                "tier": str(row.get("tier", "Silver")),
                "is_rmg_zone": bool(row.get("is_rmg_zone", False)),
                "float_capacity": int(row.get("float_capacity_bdt", 100000)),
                "liquidity_status": stat_info["status"],
                "cash_out_volume": stat_info["cash_out"],
            })
            if len(matches) >= limit:
                break

    return {"query": query, "results": matches}


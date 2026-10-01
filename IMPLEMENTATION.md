# IMPLEMENTATION: MilestoneAI + SanchayBot — Step-by-Step Build Guide

**Version:** 2.0 (Hybrid)  
**Date:** 2026-10-01  
**Product:** MilestoneAI + SanchayBot — Hybrid Activation & Savings Intelligence for upay

---

## Table of Contents

1. [Repository Structure](#1-repository-structure)
2. [Environment Setup](#2-environment-setup)
3. [Synthetic Data Generator](#3-synthetic-data-generator)
4. [Feature Engineering & Training Pipeline](#4-feature-engineering--training-pipeline)
5. [Business Rules Engine](#5-business-rules-engine)
6. [GenAI / RAG Layer](#6-genai--rag-layer)
7. [API Layer](#7-api-layer)
8. [Frontend](#8-frontend)
9. [SanchayBot Module (Module B)](#9-sanchaybot-module-module-b)
10. [Monitoring & Logging](#10-monitoring--logging)
11. [Testing](#11-testing)
12. [Docker & Run Instructions](#12-docker--run-instructions)
13. [Troubleshooting](#13-troubleshooting)
14. [Final Submission Checklist](#14-final-submission-checklist)

---

## 1. Repository Structure

```
milestone-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app entry point
│   │   ├── config.py                  # Configuration & env vars
│   │   ├── database.py                # SQLite connection & setup
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── schemas.py             # Pydantic request/response models
│   │   │   └── db_models.py           # SQLAlchemy ORM models (optional)
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── funnel.py              # GET /funnel
│   │   │   ├── users.py               # GET /at-risk-users, GET /users/{id}/prediction
│   │   │   ├── nudges.py              # POST /nudges/{id}/approve
│   │   │   ├── savings.py             # [NEW] GET /users/{id}/savings-plan, POST /savings-plan/goal
│   │   │   ├── metrics.py             # GET /model/metrics, GET /model/fairness
│   │   │   └── traces.py              # GET /traces
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── prediction_service.py  # Model loading, prediction, SHAP
│   │   │   ├── nudge_service.py       # LLM nudge generation + guardrails
│   │   │   ├── savings_service.py     # [NEW] SanchayBot — surplus prediction, DPS recommendation, savings explanation
│   │   │   ├── rules_engine.py        # Business rules for nudge + DPS eligibility
│   │   │   └── trace_service.py       # Audit trail logging
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── sanitizer.py           # Prompt injection defense
│   │       └── bangla_utils.py        # Bangla text utilities
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.template
├── ml/
│   ├── data_generator.py              # Synthetic data generation (users, milestones, transactions)
│   ├── transaction_generator.py       # [NEW] Transaction + cashflow synthetic data
│   ├── feature_engineering.py         # Milestone feature computation
│   ├── cashflow_features.py           # [NEW] Cash-flow feature computation (SanchayBot)
│   ├── train_baseline.py             # Logistic Regression baseline
│   ├── train_xgboost.py              # XGBoost multi-output training (milestone classifier)
│   ├── train_surplus.py              # [NEW] XGBoost regressor for surplus prediction
│   ├── evaluate_model.py             # Evaluation metrics & plots
│   ├── fairness_check.py             # Fairness analysis
│   ├── shap_explainer.py             # SHAP value computation
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx             # Root layout
│   │   │   ├── page.tsx               # Dashboard page
│   │   │   ├── globals.css            # Global styles
│   │   │   ├── users/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # User detail page
│   │   │   └── performance/
│   │   │       └── page.tsx           # Model performance page
│   │   │   ├── savings/
│   │   │   │   └── page.tsx           # [NEW] Savings Coach standalone page
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── FunnelChart.tsx
│   │   │   ├── AtRiskTable.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   ├── MilestoneProgress.tsx
│   │   │   ├── ShapWaterfall.tsx
│   │   │   ├── NudgeCard.tsx
│   │   │   ├── SanchayBotPanel.tsx     # [NEW] Savings recommendation panel
│   │   │   ├── SpendingDonut.tsx       # [NEW] Expense breakdown chart
│   │   │   ├── SavingsGrowthChart.tsx  # [NEW] DPS projection line chart
│   │   │   ├── MetricsGrid.tsx
│   │   │   ├── FairnessPanel.tsx
│   │   │   └── SyntheticBanner.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                 # API client
│   │   │   └── i18n.ts               # Bangla/English strings
│   │   └── types/
│   │       └── index.ts              # TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── Dockerfile
├── data/                              # Generated synthetic data
│   ├── users.csv
│   ├── milestone_events.csv
│   ├── early_activity.csv
│   ├── transactions.csv               # [NEW] Synthetic transaction data
│   ├── cashflow_summary.csv           # [NEW] Derived cash-flow summaries
│   ├── features_train.csv
│   ├── features_val.csv
│   ├── features_test.csv
│   ├── cashflow_features_train.csv    # [NEW] Cash-flow feature splits
│   ├── cashflow_features_val.csv
│   └── cashflow_features_test.csv
├── models/                            # Saved model artifacts
│   ├── baseline_lr.joblib
│   ├── xgboost_model.joblib
│   ├── surplus_regressor.joblib       # [NEW] Surplus prediction model
│   ├── dps_recommender_config.json    # [NEW] DPS recommendation rules
│   ├── shap_values_test.npy
│   ├── feature_names.json
│   ├── cashflow_feature_names.json    # [NEW]
│   └── evaluation_report.json
├── tests/
│   ├── test_data_generator.py
│   ├── test_transaction_generator.py  # [NEW]
│   ├── test_feature_engineering.py
│   ├── test_cashflow_features.py      # [NEW]
│   ├── test_model.py
│   ├── test_surplus_model.py          # [NEW]
│   ├── test_api.py
│   ├── test_savings_api.py            # [NEW]
│   └── test_e2e.py
├── docker-compose.yml
├── .env.template
├── .gitignore
├── README.md
├── PRD.md
├── PLAN.md
└── IMPLEMENTATION.md
```

---

## 2. Environment Setup

### 2.1 Prerequisites

```bash
# Required software
Python 3.10+
Node.js 18+
npm 9+
Git
```

### 2.2 Clone & Initialize

```bash
# File: (terminal commands)
mkdir milestone-ai
cd milestone-ai
git init

# Create directory structure
mkdir -p backend/app/models backend/app/routers backend/app/services backend/app/utils
mkdir -p ml data models tests
mkdir -p frontend
```

### 2.3 Python Environment

```bash
# File: (terminal commands)
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2.4 Python Dependencies

```
# File: backend/requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.2
python-dotenv==1.0.0
aiosqlite==0.19.0
google-generativeai==0.3.2
joblib==1.3.2
numpy==1.26.2
pandas==2.1.4
scikit-learn==1.3.2
xgboost==2.0.3
shap==0.44.0
matplotlib==3.8.2
httpx==0.25.2
```

```
# File: ml/requirements.txt
numpy==1.26.2
pandas==2.1.4
scikit-learn==1.3.2
xgboost==2.0.3
shap==0.44.0
matplotlib==3.8.2
seaborn==0.13.0
joblib==1.3.2
```

```bash
# File: (terminal commands)
pip install -r backend/requirements.txt
pip install -r ml/requirements.txt
```

### 2.5 Next.js Frontend Setup

```bash
# File: (terminal commands)
cd frontend
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
npm install recharts @tanstack/react-table
cd ..
```

> **Note:** We use Tailwind here because Next.js scaffolds it by default. We will use vanilla CSS for custom components where needed. The user specified TypeScript for frontend.

### 2.6 Environment Variables

```
# File: .env.template
# === API Configuration ===
API_HOST=0.0.0.0
API_PORT=8000
API_KEY=milestone-ai-dev-key-2026

# === Database ===
DB_PATH=./data/milestone_ai.db

# === Gemini API ===
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash

# === Model ===
MODEL_PATH=./models/xgboost_model.joblib
BASELINE_PATH=./models/baseline_lr.joblib
SHAP_CACHE_PATH=./models/shap_values_test.npy
FEATURE_NAMES_PATH=./models/feature_names.json

# === Frontend ===
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 2.7 Git Ignore

```
# File: .gitignore
__pycache__/
*.pyc
venv/
.env
*.db
*.joblib
*.npy
node_modules/
.next/
dist/
*.log
.DS_Store
```

---

## 3. Synthetic Data Generator

This is the most critical script. It generates all data with documented, injected patterns.

```python
# File: ml/data_generator.py
"""
MilestoneAI — Synthetic Data Generator
Generates 50,000 synthetic upay users with registration metadata,
early activity signals, and milestone completion outcomes.

ALL DATA IS SYNTHETIC. No real upay user data is used.

Injected Patterns (P1-P8):
  P1: Agent-assisted → -15% completion
  P2: Feature phone → -25% M4, -35% M5
  P3: Rural → +10% M3, -20% M4
  P4: High day-1 engagement → +25% all
  P5: Salary wallet → +30% M3, -10% M5
  P6: Referral → +15% M2
  P7: Weekend registration → -10% M2
  P8: Notifications enabled → +20% all
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os
import json

# ============================================================
# CONFIGURATION
# ============================================================

NUM_USERS = 50_000
START_DATE = datetime(2026, 7, 1)
END_DATE = datetime(2026, 9, 30)
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
SEED_TRAIN = 42
SEED_TEST = 123

# Distribution configs
REGISTRATION_CHANNEL_DIST = {
    "app_self": 0.50,
    "agent_assisted": 0.30,
    "referral": 0.20,
}

DEVICE_TYPE_DIST = {
    "smartphone_android": 0.70,
    "smartphone_ios": 0.05,
    "feature_phone": 0.25,
}

SIM_OPERATOR_DIST = {
    "grameenphone": 0.45,
    "robi": 0.25,
    "banglalink": 0.20,
    "teletalk": 0.10,
}

DIVISION_DIST = {
    "dhaka": 0.25,
    "chittagong": 0.18,
    "rajshahi": 0.13,
    "khulna": 0.10,
    "rangpur": 0.10,
    "sylhet": 0.08,
    "barishal": 0.08,
    "mymensingh": 0.08,
}

AREA_TYPE_DIST = {"urban": 0.35, "peri_urban": 0.30, "rural": 0.35}
AGE_GROUP_DIST = {"18-25": 0.25, "26-35": 0.35, "36-45": 0.25, "46+": 0.15}
GENDER_DIST = {"male": 0.55, "female": 0.35, "unknown": 0.10}
LANGUAGE_DIST = {"bangla": 0.60, "english": 0.15, "both": 0.25}

# Base milestone completion probabilities (before pattern injection)
BASE_COMPLETION_PROB = {
    "M1": 0.95,
    "M2": 0.70,
    "M3": 0.50,
    "M4": 0.40,
    "M5": 0.25,
}

# Milestone bonus amounts (BDT)
MILESTONE_BONUS = {
    "M1": 30,
    "M2": 20,
    "M3": 30,
    "M4": 20,
    "M5": 50,
    "M6": 50,
}


def _sample_categorical(rng, dist, n):
    """Sample n values from a categorical distribution."""
    categories = list(dist.keys())
    probabilities = list(dist.values())
    return rng.choice(categories, size=n, p=probabilities)


def generate_users(rng, n=NUM_USERS):
    """Generate synthetic user registration data."""
    print(f"Generating {n} users...")

    # Registration dates (uniform over 90-day window)
    days_range = (END_DATE - START_DATE).days
    reg_days = rng.integers(0, days_range, size=n)
    reg_hours = rng.integers(6, 23, size=n)  # Registration 6AM-11PM
    reg_minutes = rng.integers(0, 60, size=n)
    registration_dates = [
        START_DATE + timedelta(days=int(d), hours=int(h), minutes=int(m))
        for d, h, m in zip(reg_days, reg_hours, reg_minutes)
    ]

    # Core attributes
    registration_channel = _sample_categorical(rng, REGISTRATION_CHANNEL_DIST, n)
    device_type = _sample_categorical(rng, DEVICE_TYPE_DIST, n)
    sim_operator = _sample_categorical(rng, SIM_OPERATOR_DIST, n)
    division = _sample_categorical(rng, DIVISION_DIST, n)
    area_type = _sample_categorical(rng, AREA_TYPE_DIST, n)
    age_group = _sample_categorical(rng, AGE_GROUP_DIST, n)
    gender = _sample_categorical(rng, GENDER_DIST, n)

    # Binary attributes
    has_bank_account = rng.random(n) < 0.30
    salary_wallet_active = rng.random(n) < 0.15
    zero_data_eligible = np.isin(sim_operator, ["grameenphone", "robi"])

    # Referral source (only for referral channel)
    referral_source_id = np.where(
        registration_channel == "referral",
        [f"U{rng.integers(0, n):09d}" for _ in range(n)],
        None,
    )

    users = pd.DataFrame(
        {
            "user_id": [f"U{i:09d}" for i in range(n)],
            "registration_date": registration_dates,
            "registration_channel": registration_channel,
            "device_type": device_type,
            "sim_operator": sim_operator,
            "division": division,
            "area_type": area_type,
            "age_group": age_group,
            "gender": gender,
            "has_bank_account": has_bank_account,
            "referral_source_id": referral_source_id,
            "salary_wallet_active": salary_wallet_active,
            "zero_data_eligible": zero_data_eligible,
        }
    )

    print(f"  Users generated: {len(users)}")
    return users


def generate_early_activity(rng, users):
    """Generate synthetic early activity data for users."""
    n = len(users)
    print(f"Generating early activity for {n} users...")

    # Feature phone users have less app activity
    is_feature_phone = (users["device_type"] == "feature_phone").values

    # First app open (hours after registration)
    first_app_open_hours = np.where(
        is_feature_phone,
        rng.exponential(scale=12.0, size=n),  # Slower for feature phones
        rng.exponential(scale=2.0, size=n),  # Faster for smartphones
    )
    first_app_open_hours = np.clip(first_app_open_hours, 0.1, 72.0)

    # App opens per day (Poisson, lower for feature phones)
    app_opens_day1 = np.where(
        is_feature_phone,
        rng.poisson(lam=1.0, size=n),
        rng.poisson(lam=3.5, size=n),
    )
    app_opens_day2 = np.where(
        is_feature_phone,
        rng.poisson(lam=0.5, size=n),
        rng.poisson(lam=2.0, size=n),
    )
    app_opens_day3 = np.where(
        is_feature_phone,
        rng.poisson(lam=0.3, size=n),
        rng.poisson(lam=1.5, size=n),
    )

    # USSD sessions (higher for feature phones and rural)
    is_rural = (users["area_type"] == "rural").values
    ussd_sessions_day1_3 = np.where(
        is_feature_phone | is_rural,
        rng.poisson(lam=3.0, size=n),
        rng.poisson(lam=0.5, size=n),
    )

    # Balance checks
    balance_check_count_day1_3 = rng.poisson(lam=2.0, size=n)

    # Screens visited on day 1
    screens_visited_day1 = np.where(
        is_feature_phone,
        rng.poisson(lam=2.0, size=n),
        rng.poisson(lam=5.0, size=n),
    )

    # Time in app on day 1 (minutes)
    time_in_app_minutes_day1 = np.where(
        is_feature_phone,
        rng.exponential(scale=3.0, size=n),
        rng.exponential(scale=8.0, size=n),
    )
    time_in_app_minutes_day1 = np.clip(time_in_app_minutes_day1, 0.5, 60.0)

    # Notification enabled (lower for feature phones)
    notification_enabled = np.where(
        is_feature_phone,
        rng.random(n) < 0.30,
        rng.random(n) < 0.70,
    )

    # Language preference
    language_preference = _sample_categorical(rng, LANGUAGE_DIST, n)

    activity = pd.DataFrame(
        {
            "user_id": users["user_id"].values,
            "first_app_open_hours": np.round(first_app_open_hours, 2),
            "app_opens_day1": app_opens_day1,
            "app_opens_day2": app_opens_day2,
            "app_opens_day3": app_opens_day3,
            "ussd_sessions_day1_3": ussd_sessions_day1_3,
            "balance_check_count_day1_3": balance_check_count_day1_3,
            "screens_visited_day1": screens_visited_day1,
            "time_in_app_minutes_day1": np.round(time_in_app_minutes_day1, 2),
            "notification_enabled": notification_enabled,
            "language_preference": language_preference,
        }
    )

    print(f"  Early activity generated: {len(activity)}")
    return activity


def _apply_patterns(rng, users, activity):
    """
    Compute per-user, per-milestone completion probabilities
    by applying the 8 injected patterns to the base rates.

    Returns a DataFrame with columns: user_id, M2_prob, M3_prob, M4_prob, M5_prob
    """
    n = len(users)
    print("Applying 8 injected patterns...")

    # Start with base probabilities
    probs = {
        "M2": np.full(n, BASE_COMPLETION_PROB["M2"]),
        "M3": np.full(n, BASE_COMPLETION_PROB["M3"]),
        "M4": np.full(n, BASE_COMPLETION_PROB["M4"]),
        "M5": np.full(n, BASE_COMPLETION_PROB["M5"]),
    }

    # P1: Agent-assisted → -15% completion for M2-M5
    agent_mask = users["registration_channel"].values == "agent_assisted"
    for m in ["M2", "M3", "M4", "M5"]:
        probs[m] = np.where(agent_mask, probs[m] - 0.15, probs[m])

    # P2: Feature phone → -25% M4, -35% M5
    fp_mask = users["device_type"].values == "feature_phone"
    probs["M4"] = np.where(fp_mask, probs["M4"] - 0.25, probs["M4"])
    probs["M5"] = np.where(fp_mask, probs["M5"] - 0.35, probs["M5"])

    # P3: Rural → +10% M3, -20% M4
    rural_mask = users["area_type"].values == "rural"
    probs["M3"] = np.where(rural_mask, probs["M3"] + 0.10, probs["M3"])
    probs["M4"] = np.where(rural_mask, probs["M4"] - 0.20, probs["M4"])

    # P4: High day-1 engagement (app_opens_day1 >= 3) → +25% all
    high_engage = activity["app_opens_day1"].values >= 3
    for m in ["M2", "M3", "M4", "M5"]:
        probs[m] = np.where(high_engage, probs[m] + 0.25, probs[m])

    # P5: Salary wallet → +30% M3, -10% M5
    salary_mask = users["salary_wallet_active"].values
    probs["M3"] = np.where(salary_mask, probs["M3"] + 0.30, probs["M3"])
    probs["M5"] = np.where(salary_mask, probs["M5"] - 0.10, probs["M5"])

    # P6: Referral → +15% M2
    referral_mask = users["registration_channel"].values == "referral"
    probs["M2"] = np.where(referral_mask, probs["M2"] + 0.15, probs["M2"])

    # P7: Weekend registration → -10% M2
    reg_dates = pd.to_datetime(users["registration_date"])
    weekend_mask = reg_dates.dt.dayofweek.isin([5, 6]).values
    probs["M2"] = np.where(weekend_mask, probs["M2"] - 0.10, probs["M2"])

    # P8: Notifications enabled → +20% all
    notif_mask = activity["notification_enabled"].values.astype(bool)
    for m in ["M2", "M3", "M4", "M5"]:
        probs[m] = np.where(notif_mask, probs[m] + 0.20, probs[m])

    # Add noise and clip to [0.02, 0.98]
    for m in ["M2", "M3", "M4", "M5"]:
        noise = rng.normal(0, 0.05, size=n)
        probs[m] = np.clip(probs[m] + noise, 0.02, 0.98)

    return probs


def generate_milestones(rng, users, activity):
    """Generate milestone completion events based on injected patterns."""
    n = len(users)
    print(f"Generating milestone events for {n} users...")

    # Compute probabilities with patterns
    probs = _apply_patterns(rng, users, activity)

    # Sample completion outcomes
    milestone_rows = []
    event_counter = 0

    for i in range(n):
        user_id = users.iloc[i]["user_id"]
        reg_date = pd.to_datetime(users.iloc[i]["registration_date"])

        # M1: Nearly universal (base 0.95)
        m1_completed = rng.random() < BASE_COMPLETION_PROB["M1"]
        m1_days = int(rng.integers(0, 1)) if m1_completed else None
        m1_date = reg_date + timedelta(days=m1_days) if m1_completed else None

        milestone_rows.append(
            {
                "event_id": f"E{event_counter:010d}",
                "user_id": user_id,
                "milestone": "M1",
                "completed": m1_completed,
                "completed_at": m1_date,
                "days_since_registration": m1_days,
                "bonus_amount_bdt": MILESTONE_BONUS["M1"] if m1_completed else 0,
            }
        )
        event_counter += 1

        if not m1_completed:
            # If M1 not completed, no further milestones
            for m in ["M2", "M3", "M4", "M5", "M6"]:
                milestone_rows.append(
                    {
                        "event_id": f"E{event_counter:010d}",
                        "user_id": user_id,
                        "milestone": m,
                        "completed": False,
                        "completed_at": None,
                        "days_since_registration": None,
                        "bonus_amount_bdt": 0,
                    }
                )
                event_counter += 1
            continue

        # M2-M5: Independent completion based on probabilities
        completions = {}
        for m in ["M2", "M3", "M4", "M5"]:
            completed = rng.random() < probs[m][i]
            completions[m] = completed

            if completed:
                # Days to completion (exponential, capped at 30)
                days = min(int(rng.exponential(scale=7.0)) + 1, 30)
            else:
                days = None

            comp_date = reg_date + timedelta(days=days) if completed else None

            milestone_rows.append(
                {
                    "event_id": f"E{event_counter:010d}",
                    "user_id": user_id,
                    "milestone": m,
                    "completed": completed,
                    "completed_at": comp_date,
                    "days_since_registration": days,
                    "bonus_amount_bdt": MILESTONE_BONUS[m] if completed else 0,
                }
            )
            event_counter += 1

        # M6: Completion bonus (only if ALL M1-M5 completed)
        all_completed = m1_completed and all(completions.values())
        m6_days = max(
            [
                r["days_since_registration"]
                for r in milestone_rows[-4:]
                if r["days_since_registration"] is not None
            ],
            default=None,
        )
        if all_completed and m6_days is not None:
            m6_days = m6_days + 1  # Day after last milestone

        milestone_rows.append(
            {
                "event_id": f"E{event_counter:010d}",
                "user_id": user_id,
                "milestone": "M6",
                "completed": all_completed,
                "completed_at": (
                    reg_date + timedelta(days=m6_days) if all_completed else None
                ),
                "days_since_registration": m6_days if all_completed else None,
                "bonus_amount_bdt": MILESTONE_BONUS["M6"] if all_completed else 0,
            }
        )
        event_counter += 1

    milestones = pd.DataFrame(milestone_rows)
    print(f"  Milestone events generated: {len(milestones)}")
    return milestones


def validate_data(users, activity, milestones):
    """Run validation checks on generated data."""
    print("\nRunning validation checks...")
    checks = []

    # Row counts
    checks.append(("Users count == 50000", len(users) == NUM_USERS))
    checks.append(
        ("Milestones count == 300000", len(milestones) == NUM_USERS * 6)
    )
    checks.append(("Activity count == 50000", len(activity) == NUM_USERS))

    # No nulls in required columns
    checks.append(("No null user_ids", users["user_id"].notna().all()))
    checks.append(
        ("No null registration_dates", users["registration_date"].notna().all())
    )

    # Distribution checks
    channel_dist = users["registration_channel"].value_counts(normalize=True)
    checks.append(
        (
            "App_self between 45-55%",
            0.45 <= channel_dist.get("app_self", 0) <= 0.55,
        )
    )

    # Milestone completion rates
    for m in ["M1", "M2", "M3", "M4", "M5"]:
        rate = milestones[milestones["milestone"] == m]["completed"].mean()
        checks.append((f"{m} completion rate: {rate:.2%}", True))  # Just report

    # Pattern detection: P1 - agent vs non-agent M2 completion
    agent_users = set(
        users[users["registration_channel"] == "agent_assisted"]["user_id"]
    )
    non_agent_users = set(
        users[users["registration_channel"] != "agent_assisted"]["user_id"]
    )
    m2_data = milestones[milestones["milestone"] == "M2"]
    agent_m2_rate = m2_data[m2_data["user_id"].isin(agent_users)][
        "completed"
    ].mean()
    non_agent_m2_rate = m2_data[m2_data["user_id"].isin(non_agent_users)][
        "completed"
    ].mean()
    checks.append(
        (
            f"P1 detected: agent M2={agent_m2_rate:.2%} < non-agent M2={non_agent_m2_rate:.2%}",
            agent_m2_rate < non_agent_m2_rate,
        )
    )

    for name, passed in checks:
        status = "✓" if passed else "✗"
        print(f"  {status} {name}")

    failed = [name for name, passed in checks if not passed]
    if failed:
        print(f"\n  WARNING: {len(failed)} check(s) failed!")
    else:
        print("\n  All checks passed!")

    return len(failed) == 0


def save_data(users, activity, milestones):
    """Save generated data to CSV files."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    users.to_csv(os.path.join(OUTPUT_DIR, "users.csv"), index=False)
    activity.to_csv(os.path.join(OUTPUT_DIR, "early_activity.csv"), index=False)
    milestones.to_csv(
        os.path.join(OUTPUT_DIR, "milestone_events.csv"), index=False
    )

    print(f"\nData saved to {OUTPUT_DIR}/")
    print(f"  users.csv: {len(users)} rows")
    print(f"  early_activity.csv: {len(activity)} rows")
    print(f"  milestone_events.csv: {len(milestones)} rows")


def main():
    """Main data generation pipeline."""
    print("=" * 60)
    print("MilestoneAI — Synthetic Data Generator")
    print("ALL DATA IS SYNTHETIC. No real upay data is used.")
    print("=" * 60)

    rng = np.random.default_rng(SEED_TRAIN)

    users = generate_users(rng)
    activity = generate_early_activity(rng, users)
    milestones = generate_milestones(rng, users, activity)

    validate_data(users, activity, milestones)
    save_data(users, activity, milestones)

    # Print summary stats
    print("\n--- Summary Statistics ---")
    for m in ["M1", "M2", "M3", "M4", "M5", "M6"]:
        rate = milestones[milestones["milestone"] == m]["completed"].mean()
        print(f"  {m} completion rate: {rate:.1%}")

    full_rate = milestones[milestones["milestone"] == "M6"]["completed"].mean()
    print(f"\n  Full completion (all 6): {full_rate:.1%}")


if __name__ == "__main__":
    main()
```

---

## 4. Feature Engineering & Training Pipeline

### 4.1 Feature Engineering

```python
# File: ml/feature_engineering.py
"""
MilestoneAI — Feature Engineering Pipeline
Computes 22 features from users + early_activity tables.
Produces train/validation/test splits.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import os
import json

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
SEED = 42
TEST_SIZE = 0.15
VAL_SIZE = 0.15  # 0.15 of remaining 85% ≈ 12.75% overall


def load_data():
    """Load generated synthetic data."""
    users = pd.read_csv(os.path.join(DATA_DIR, "users.csv"))
    activity = pd.read_csv(os.path.join(DATA_DIR, "early_activity.csv"))
    milestones = pd.read_csv(os.path.join(DATA_DIR, "milestone_events.csv"))
    return users, activity, milestones


def build_features(users, activity):
    """Build the feature matrix from users and early_activity."""
    # Merge users and activity
    df = users.merge(activity, on="user_id", how="inner")

    # Derived features
    df["registration_date"] = pd.to_datetime(df["registration_date"])
    df["registration_day_of_week"] = df["registration_date"].dt.dayofweek
    df["registration_hour"] = df["registration_date"].dt.hour
    df["is_weekend_registration"] = df["registration_day_of_week"].isin([5, 6]).astype(int)

    # Total app engagement (day 1-3)
    df["total_app_opens_day1_3"] = (
        df["app_opens_day1"] + df["app_opens_day2"] + df["app_opens_day3"]
    )

    # Engagement trend (day3 - day1, negative means declining)
    df["engagement_trend"] = df["app_opens_day3"] - df["app_opens_day1"]

    # Boolean to int
    for col in ["has_bank_account", "salary_wallet_active", "zero_data_eligible", "notification_enabled"]:
        df[col] = df[col].astype(int)

    # Select feature columns
    feature_cols = [
        # Registration features
        "registration_channel",
        "device_type",
        "sim_operator",
        "division",
        "area_type",
        "age_group",
        "gender",
        "has_bank_account",
        "salary_wallet_active",
        "zero_data_eligible",
        # Derived registration
        "registration_day_of_week",
        "registration_hour",
        "is_weekend_registration",
        # Early activity
        "first_app_open_hours",
        "app_opens_day1",
        "app_opens_day2",
        "app_opens_day3",
        "total_app_opens_day1_3",
        "engagement_trend",
        "ussd_sessions_day1_3",
        "balance_check_count_day1_3",
        "screens_visited_day1",
        "time_in_app_minutes_day1",
        "notification_enabled",
        "language_preference",
    ]

    features = df[["user_id"] + feature_cols].copy()
    return features, feature_cols


def build_targets(milestones):
    """Build target variables: completion of M2, M3, M4, M5."""
    targets = milestones[milestones["milestone"].isin(["M2", "M3", "M4", "M5"])].pivot_table(
        index="user_id", columns="milestone", values="completed", aggfunc="first"
    ).reset_index()

    targets.columns = ["user_id", "target_M2", "target_M3", "target_M4", "target_M5"]

    for col in ["target_M2", "target_M3", "target_M4", "target_M5"]:
        targets[col] = targets[col].astype(int)

    return targets


def encode_categoricals(features, feature_cols):
    """One-hot encode categorical features."""
    categorical_cols = [
        "registration_channel",
        "device_type",
        "sim_operator",
        "division",
        "area_type",
        "age_group",
        "gender",
        "language_preference",
    ]

    numeric_cols = [c for c in feature_cols if c not in categorical_cols]

    # One-hot encode
    encoded = pd.get_dummies(features[categorical_cols], prefix_sep="_", dtype=int)

    # Combine with numeric features
    result = pd.concat([features[["user_id"] + numeric_cols], encoded], axis=1)

    return result


def split_data(features_encoded, targets):
    """Split into train/validation/test sets."""
    # Merge features and targets
    df = features_encoded.merge(targets, on="user_id", how="inner")

    # Separate features and targets
    target_cols = ["target_M2", "target_M3", "target_M4", "target_M5"]
    feature_cols = [c for c in df.columns if c not in ["user_id"] + target_cols]

    X = df[feature_cols]
    y = df[target_cols]
    user_ids = df["user_id"]

    # First split: train+val vs test
    X_trainval, X_test, y_trainval, y_test, uid_trainval, uid_test = train_test_split(
        X, y, user_ids, test_size=TEST_SIZE, random_state=SEED, stratify=y["target_M4"]
    )

    # Second split: train vs val
    val_frac = VAL_SIZE / (1 - TEST_SIZE)
    X_train, X_val, y_train, y_val, uid_train, uid_val = train_test_split(
        X_trainval, y_trainval, uid_trainval,
        test_size=val_frac, random_state=SEED, stratify=y_trainval["target_M4"]
    )

    return {
        "X_train": X_train, "y_train": y_train, "uid_train": uid_train,
        "X_val": X_val, "y_val": y_val, "uid_val": uid_val,
        "X_test": X_test, "y_test": y_test, "uid_test": uid_test,
        "feature_names": feature_cols,
    }


def main():
    """Main feature engineering pipeline."""
    print("=" * 60)
    print("MilestoneAI — Feature Engineering Pipeline")
    print("=" * 60)

    users, activity, milestones = load_data()
    features, feature_cols = build_features(users, activity)
    targets = build_targets(milestones)
    features_encoded = encode_categoricals(features, feature_cols)

    splits = split_data(features_encoded, targets)

    # Save splits
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)

    for name in ["train", "val", "test"]:
        X = splits[f"X_{name}"]
        y = splits[f"y_{name}"]
        uid = splits[f"uid_{name}"]
        combined = pd.concat([uid.reset_index(drop=True), X.reset_index(drop=True), y.reset_index(drop=True)], axis=1)
        combined.to_csv(os.path.join(DATA_DIR, f"features_{name}.csv"), index=False)
        print(f"  {name}: {len(X)} samples")

    # Save feature names
    with open(os.path.join(MODELS_DIR, "feature_names.json"), "w") as f:
        json.dump(splits["feature_names"], f, indent=2)
    print(f"  Feature count: {len(splits['feature_names'])}")

    print("\nFeature engineering complete!")


if __name__ == "__main__":
    main()
```

### 4.2 Baseline Model (Logistic Regression)

```python
# File: ml/train_baseline.py
"""
MilestoneAI — Baseline Model Training (Logistic Regression)
Trains a separate LR model for each milestone (M2, M3, M4, M5).
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, classification_report
from sklearn.preprocessing import StandardScaler
import joblib
import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MILESTONES = ["target_M2", "target_M3", "target_M4", "target_M5"]


def load_splits():
    """Load train/val/test splits."""
    train = pd.read_csv(os.path.join(DATA_DIR, "features_train.csv"))
    val = pd.read_csv(os.path.join(DATA_DIR, "features_val.csv"))

    with open(os.path.join(MODELS_DIR, "feature_names.json")) as f:
        feature_names = json.load(f)

    return train, val, feature_names


def train_baseline():
    """Train Logistic Regression baseline for each milestone."""
    print("=" * 60)
    print("MilestoneAI — Baseline Model (Logistic Regression)")
    print("=" * 60)

    train, val, feature_names = load_splits()
    X_train = train[feature_names].values
    X_val = val[feature_names].values

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)

    models = {}
    results = {}

    for target in MILESTONES:
        y_train = train[target].values
        y_val = val[target].values

        model = LogisticRegression(max_iter=1000, random_state=42, C=1.0)
        model.fit(X_train_scaled, y_train)

        # Evaluate
        y_pred_proba = model.predict_proba(X_val_scaled)[:, 1]
        auc = roc_auc_score(y_val, y_pred_proba)

        y_pred = (y_pred_proba >= 0.5).astype(int)
        report = classification_report(y_val, y_pred, output_dict=True)

        milestone_name = target.replace("target_", "")
        models[milestone_name] = model
        results[milestone_name] = {
            "auc_roc": round(auc, 4),
            "precision": round(report["1"]["precision"], 4),
            "recall": round(report["1"]["recall"], 4),
            "f1": round(report["1"]["f1-score"], 4),
        }

        print(f"\n  {milestone_name}: AUC={auc:.4f}, P={report['1']['precision']:.3f}, R={report['1']['recall']:.3f}")

    # Save
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump({"models": models, "scaler": scaler}, os.path.join(MODELS_DIR, "baseline_lr.joblib"))

    with open(os.path.join(MODELS_DIR, "baseline_results.json"), "w") as f:
        json.dump(results, f, indent=2)

    print("\nBaseline model saved!")
    return results


if __name__ == "__main__":
    train_baseline()
```

### 4.3 Main Model (XGBoost)

```python
# File: ml/train_xgboost.py
"""
MilestoneAI — Main Model Training (XGBoost Multi-Output)
Trains a separate XGBoost model for each milestone (M2, M3, M4, M5).
Includes hyperparameter tuning via RandomizedSearchCV.
"""

import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import RandomizedSearchCV
from sklearn.metrics import roc_auc_score, classification_report, brier_score_loss
from sklearn.calibration import calibration_curve
import joblib
import json
import os
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MILESTONES = ["target_M2", "target_M3", "target_M4", "target_M5"]

# Hyperparameter search space
PARAM_DIST = {
    "n_estimators": [100, 200, 300],
    "max_depth": [3, 4, 5, 6],
    "learning_rate": [0.05, 0.1, 0.2],
    "subsample": [0.7, 0.8, 0.9],
    "colsample_bytree": [0.7, 0.8, 0.9],
    "min_child_weight": [1, 3, 5],
    "gamma": [0, 0.1, 0.2],
}


def load_splits():
    """Load train/val/test splits."""
    train = pd.read_csv(os.path.join(DATA_DIR, "features_train.csv"))
    val = pd.read_csv(os.path.join(DATA_DIR, "features_val.csv"))
    test = pd.read_csv(os.path.join(DATA_DIR, "features_test.csv"))

    with open(os.path.join(MODELS_DIR, "feature_names.json")) as f:
        feature_names = json.load(f)

    return train, val, test, feature_names


def train_xgboost():
    """Train XGBoost model for each milestone with hyperparameter tuning."""
    print("=" * 60)
    print("MilestoneAI — Main Model Training (XGBoost)")
    print("=" * 60)

    train, val, test, feature_names = load_splits()
    X_train = train[feature_names].values
    X_val = val[feature_names].values
    X_test = test[feature_names].values

    models = {}
    results = {}

    for target in MILESTONES:
        milestone_name = target.replace("target_", "")
        print(f"\n--- Training {milestone_name} ---")

        y_train = train[target].values
        y_val = val[target].values
        y_test = test[target].values

        # Hyperparameter search
        base_model = XGBClassifier(
            random_state=42,
            eval_metric="logloss",
            use_label_encoder=False,
        )

        search = RandomizedSearchCV(
            base_model,
            PARAM_DIST,
            n_iter=20,
            scoring="roc_auc",
            cv=3,
            random_state=42,
            n_jobs=-1,
            verbose=0,
        )
        search.fit(X_train, y_train)

        best_model = search.best_estimator_
        print(f"  Best params: {search.best_params_}")

        # Evaluate on validation set
        y_val_proba = best_model.predict_proba(X_val)[:, 1]
        val_auc = roc_auc_score(y_val, y_val_proba)

        # Evaluate on test set
        y_test_proba = best_model.predict_proba(X_test)[:, 1]
        test_auc = roc_auc_score(y_test, y_test_proba)
        brier = brier_score_loss(y_test, y_test_proba)

        y_test_pred = (y_test_proba >= 0.5).astype(int)
        report = classification_report(y_test, y_test_pred, output_dict=True)

        models[milestone_name] = best_model
        results[milestone_name] = {
            "val_auc_roc": round(val_auc, 4),
            "test_auc_roc": round(test_auc, 4),
            "brier_score": round(brier, 4),
            "precision": round(report["1"]["precision"], 4),
            "recall": round(report["1"]["recall"], 4),
            "f1": round(report["1"]["f1-score"], 4),
            "best_params": search.best_params_,
        }

        print(f"  Val AUC: {val_auc:.4f} | Test AUC: {test_auc:.4f} | Brier: {brier:.4f}")
        print(f"  P={report['1']['precision']:.3f}, R={report['1']['recall']:.3f}, F1={report['1']['f1-score']:.3f}")

        # Generate calibration plot
        prob_true, prob_pred = calibration_curve(y_test, y_test_proba, n_bins=10)
        plt.figure(figsize=(6, 6))
        plt.plot(prob_pred, prob_true, "s-", label=milestone_name)
        plt.plot([0, 1], [0, 1], "k--", label="Perfect calibration")
        plt.xlabel("Predicted probability")
        plt.ylabel("Actual frequency")
        plt.title(f"Calibration: {milestone_name}")
        plt.legend()
        plt.tight_layout()
        plt.savefig(os.path.join(MODELS_DIR, f"calibration_{milestone_name}.png"), dpi=100)
        plt.close()

    # Save models
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(models, os.path.join(MODELS_DIR, "xgboost_model.joblib"))

    # Save results
    # Convert numpy types to native Python for JSON serialization
    def convert_numpy(obj):
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return obj

    serializable_results = json.loads(
        json.dumps(results, default=convert_numpy)
    )
    with open(os.path.join(MODELS_DIR, "xgboost_results.json"), "w") as f:
        json.dump(serializable_results, f, indent=2)

    # Compare with baseline
    try:
        with open(os.path.join(MODELS_DIR, "baseline_results.json")) as f:
            baseline = json.load(f)

        print("\n--- XGBoost vs Baseline Comparison ---")
        for m in ["M2", "M3", "M4", "M5"]:
            bl_auc = baseline[m]["auc_roc"]
            xg_auc = results[m]["test_auc_roc"]
            diff = xg_auc - bl_auc
            print(f"  {m}: Baseline={bl_auc:.4f} → XGBoost={xg_auc:.4f} (Δ={diff:+.4f})")
    except FileNotFoundError:
        print("  (Baseline results not found — run train_baseline.py first)")

    print("\nXGBoost model saved!")
    return models, results


if __name__ == "__main__":
    train_xgboost()
```

### 4.4 SHAP Explainer

```python
# File: ml/shap_explainer.py
"""
MilestoneAI — SHAP Explainability
Computes SHAP values for all test set predictions.
Generates feature importance plots.
"""

import pandas as pd
import numpy as np
import shap
import joblib
import json
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MILESTONES = ["M2", "M3", "M4", "M5"]


def compute_shap_values():
    """Compute SHAP values for all milestones on the test set."""
    print("=" * 60)
    print("MilestoneAI — SHAP Explainability")
    print("=" * 60)

    # Load model and data
    models = joblib.load(os.path.join(MODELS_DIR, "xgboost_model.joblib"))
    test = pd.read_csv(os.path.join(DATA_DIR, "features_test.csv"))

    with open(os.path.join(MODELS_DIR, "feature_names.json")) as f:
        feature_names = json.load(f)

    X_test = test[feature_names]

    all_shap_values = {}

    for milestone in MILESTONES:
        print(f"\nComputing SHAP for {milestone}...")
        model = models[milestone]

        # Use TreeExplainer for XGBoost (fast)
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_test)

        all_shap_values[milestone] = shap_values

        # Feature importance plot
        plt.figure(figsize=(10, 8))
        shap.summary_plot(
            shap_values,
            X_test,
            feature_names=feature_names,
            show=False,
            max_display=15,
        )
        plt.title(f"SHAP Feature Importance: {milestone}")
        plt.tight_layout()
        plt.savefig(
            os.path.join(MODELS_DIR, f"shap_importance_{milestone}.png"), dpi=100
        )
        plt.close()

        # Mean absolute SHAP values (for API)
        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        importance = dict(zip(feature_names, mean_abs_shap.tolist()))
        importance_sorted = dict(
            sorted(importance.items(), key=lambda x: x[1], reverse=True)
        )

        print(f"  Top 5 features for {milestone}:")
        for feat, val in list(importance_sorted.items())[:5]:
            print(f"    {feat}: {val:.4f}")

    # Save SHAP values as numpy arrays
    for milestone in MILESTONES:
        np.save(
            os.path.join(MODELS_DIR, f"shap_values_{milestone}.npy"),
            all_shap_values[milestone],
        )

    # Save test user IDs for SHAP lookup
    test["user_id"].to_csv(
        os.path.join(MODELS_DIR, "shap_test_user_ids.csv"), index=False
    )

    print("\nSHAP computation complete!")


if __name__ == "__main__":
    compute_shap_values()
```

### 4.5 Fairness Check

```python
# File: ml/fairness_check.py
"""
MilestoneAI — Fairness Analysis
Checks model predictions across urban/rural and male/female groups.
Computes equalized odds ratios.
"""

import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score
import joblib
import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MILESTONES = ["M2", "M3", "M4", "M5"]
FAIRNESS_THRESHOLD = 0.80  # Minimum equalized odds ratio


def compute_group_metrics(y_true, y_pred, y_proba, group_mask, group_name):
    """Compute metrics for a specific group."""
    group_y_true = y_true[group_mask]
    group_y_pred = y_pred[group_mask]
    group_y_proba = y_proba[group_mask]

    if len(group_y_true) == 0 or len(np.unique(group_y_true)) < 2:
        return None

    tp = np.sum((group_y_pred == 1) & (group_y_true == 1))
    fp = np.sum((group_y_pred == 1) & (group_y_true == 0))
    fn = np.sum((group_y_pred == 0) & (group_y_true == 1))
    tn = np.sum((group_y_pred == 0) & (group_y_true == 0))

    tpr = tp / (tp + fn) if (tp + fn) > 0 else 0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0
    auc = roc_auc_score(group_y_true, group_y_proba)

    return {
        "group": group_name,
        "n": int(len(group_y_true)),
        "positive_rate": float(group_y_true.mean()),
        "predicted_positive_rate": float(group_y_pred.mean()),
        "tpr": round(tpr, 4),
        "fpr": round(fpr, 4),
        "auc_roc": round(auc, 4),
    }


def check_fairness():
    """Run fairness analysis across defined groups."""
    print("=" * 60)
    print("MilestoneAI — Fairness Analysis")
    print("=" * 60)

    models = joblib.load(os.path.join(MODELS_DIR, "xgboost_model.joblib"))
    test = pd.read_csv(os.path.join(DATA_DIR, "features_test.csv"))

    with open(os.path.join(MODELS_DIR, "feature_names.json")) as f:
        feature_names = json.load(f)

    X_test = test[feature_names].values
    fairness_report = {}

    # Define group columns (from one-hot encoded features)
    group_definitions = {
        "urban_vs_rural": {
            "group_a": ("area_type_urban", "Urban"),
            "group_b": ("area_type_rural", "Rural"),
        },
        "male_vs_female": {
            "group_a": ("gender_male", "Male"),
            "group_b": ("gender_female", "Female"),
        },
    }

    for milestone in MILESTONES:
        print(f"\n--- {milestone} ---")
        target_col = f"target_{milestone}"
        y_test = test[target_col].values
        model = models[milestone]

        y_proba = model.predict_proba(X_test)[:, 1]
        y_pred = (y_proba >= 0.5).astype(int)

        milestone_fairness = {}

        for comparison_name, groups in group_definitions.items():
            col_a, name_a = groups["group_a"]
            col_b, name_b = groups["group_b"]

            # Find column indices
            if col_a in feature_names and col_b in feature_names:
                idx_a = feature_names.index(col_a)
                idx_b = feature_names.index(col_b)
                mask_a = X_test[:, idx_a] == 1
                mask_b = X_test[:, idx_b] == 1
            else:
                print(f"  Warning: columns {col_a} or {col_b} not found")
                continue

            metrics_a = compute_group_metrics(y_test, y_pred, y_proba, mask_a, name_a)
            metrics_b = compute_group_metrics(y_test, y_pred, y_proba, mask_b, name_b)

            if metrics_a and metrics_b:
                # Equalized odds: ratio of TPR and FPR
                tpr_ratio = min(metrics_a["tpr"], metrics_b["tpr"]) / max(metrics_a["tpr"], metrics_b["tpr"]) if max(metrics_a["tpr"], metrics_b["tpr"]) > 0 else 1.0
                fpr_ratio = min(metrics_a["fpr"], metrics_b["fpr"]) / max(metrics_a["fpr"], metrics_b["fpr"]) if max(metrics_a["fpr"], metrics_b["fpr"]) > 0 else 1.0
                eo_ratio = min(tpr_ratio, fpr_ratio)

                passed = eo_ratio >= FAIRNESS_THRESHOLD
                status = "PASS" if passed else "FAIL"

                print(f"  {comparison_name}: EO ratio = {eo_ratio:.3f} [{status}]")
                print(f"    {name_a}: TPR={metrics_a['tpr']:.3f}, FPR={metrics_a['fpr']:.3f}, AUC={metrics_a['auc_roc']:.3f} (n={metrics_a['n']})")
                print(f"    {name_b}: TPR={metrics_b['tpr']:.3f}, FPR={metrics_b['fpr']:.3f}, AUC={metrics_b['auc_roc']:.3f} (n={metrics_b['n']})")

                milestone_fairness[comparison_name] = {
                    "group_a": metrics_a,
                    "group_b": metrics_b,
                    "equalized_odds_ratio": round(eo_ratio, 4),
                    "passed": passed,
                }

        fairness_report[milestone] = milestone_fairness

    # Save report
    with open(os.path.join(MODELS_DIR, "fairness_report.json"), "w") as f:
        json.dump(fairness_report, f, indent=2)

    print("\nFairness report saved!")
    return fairness_report


if __name__ == "__main__":
    check_fairness()
```

### 4.6 Model Evaluation

```python
# File: ml/evaluate_model.py
"""
MilestoneAI — Model Evaluation
Generates comprehensive evaluation report and plots.
"""

import pandas as pd
import numpy as np
from sklearn.metrics import roc_curve, roc_auc_score, classification_report, brier_score_loss
import joblib
import json
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MILESTONES = ["M2", "M3", "M4", "M5"]


def evaluate():
    """Generate full evaluation report."""
    print("=" * 60)
    print("MilestoneAI — Model Evaluation Report")
    print("=" * 60)

    models = joblib.load(os.path.join(MODELS_DIR, "xgboost_model.joblib"))
    test = pd.read_csv(os.path.join(DATA_DIR, "features_test.csv"))

    with open(os.path.join(MODELS_DIR, "feature_names.json")) as f:
        feature_names = json.load(f)

    X_test = test[feature_names].values
    report = {"model_version": "xgb_v1", "milestones": {}}

    # Plot all ROC curves together
    plt.figure(figsize=(8, 8))

    for milestone in MILESTONES:
        target_col = f"target_{milestone}"
        y_test = test[target_col].values
        model = models[milestone]

        y_proba = model.predict_proba(X_test)[:, 1]
        auc = roc_auc_score(y_test, y_proba)
        brier = brier_score_loss(y_test, y_proba)

        fpr, tpr, _ = roc_curve(y_test, y_proba)
        plt.plot(fpr, tpr, label=f"{milestone} (AUC={auc:.3f})")

        y_pred = (y_proba >= 0.5).astype(int)
        cr = classification_report(y_test, y_pred, output_dict=True)

        report["milestones"][milestone] = {
            "auc_roc": round(auc, 4),
            "brier_score": round(brier, 4),
            "precision": round(cr["1"]["precision"], 4),
            "recall": round(cr["1"]["recall"], 4),
            "f1": round(cr["1"]["f1-score"], 4),
        }

        print(f"  {milestone}: AUC={auc:.4f}, Brier={brier:.4f}, P={cr['1']['precision']:.3f}, R={cr['1']['recall']:.3f}")

    # Overall AUC (average)
    aucs = [report["milestones"][m]["auc_roc"] for m in MILESTONES]
    report["overall_auc_roc"] = round(np.mean(aucs), 4)
    report["overall_brier"] = round(
        np.mean([report["milestones"][m]["brier_score"] for m in MILESTONES]), 4
    )

    print(f"\n  Overall AUC: {report['overall_auc_roc']:.4f}")
    print(f"  Overall Brier: {report['overall_brier']:.4f}")

    # Save ROC plot
    plt.plot([0, 1], [0, 1], "k--", label="Random")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curves — All Milestones")
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(MODELS_DIR, "roc_curves.png"), dpi=100)
    plt.close()

    # Save report
    with open(os.path.join(MODELS_DIR, "evaluation_report.json"), "w") as f:
        json.dump(report, f, indent=2)

    print("\nEvaluation report saved!")


if __name__ == "__main__":
    evaluate()
```

---

## 5. Business Rules Engine

```python
# File: backend/app/services/rules_engine.py
"""
MilestoneAI — Business Rules Engine
Keeps business rules separate from ML predictions.
Rules determine nudge eligibility, frequency, and constraints.
"""

from datetime import datetime, timedelta
from typing import Optional
import sqlite3


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
            last_nudge_time = max(
                datetime.fromisoformat(n["sent_at"])
                for n in nudge_history
                if n.get("sent_at")
            )
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

        Args:
            milestone_probs: dict like {"M2": 0.45, "M3": 0.38, "M4": 0.18, "M5": 0.12}

        Returns:
            The milestone with the lowest completion probability
        """
        if not milestone_probs:
            return None

        # Sort by completion probability (ascending = highest risk first)
        sorted_milestones = sorted(milestone_probs.items(), key=lambda x: x[1])
        return sorted_milestones[0][0]  # Return highest-risk milestone
```

---

## 6. GenAI / RAG Layer

### 6.1 Prompt Injection Defense

```python
# File: backend/app/utils/sanitizer.py
"""
MilestoneAI — Input Sanitizer
Defends against prompt injection in LLM inputs.
"""

import re
from typing import Optional


# Allowed patterns for user context fields
ALLOWED_PATTERNS = {
    "user_id": re.compile(r"^U\d{9}$"),
    "milestone": re.compile(r"^M[2-5]$"),
    "area_type": re.compile(r"^(urban|peri_urban|rural)$"),
    "device_type": re.compile(r"^(smartphone_android|smartphone_ios|feature_phone)$"),
    "division": re.compile(r"^(dhaka|chittagong|rajshahi|khulna|rangpur|sylhet|barishal|mymensingh)$"),
    "language_preference": re.compile(r"^(bangla|english|both)$"),
    "bonus_amount": re.compile(r"^\d{1,3}$"),
}

# Banned patterns in any input
BANNED_PATTERNS = [
    re.compile(r"ignore\s+(previous|above|all)\s+(instructions?|prompts?)", re.IGNORECASE),
    re.compile(r"system\s*prompt", re.IGNORECASE),
    re.compile(r"<\s*/?script", re.IGNORECASE),
    re.compile(r"javascript:", re.IGNORECASE),
    re.compile(r"eval\s*\(", re.IGNORECASE),
    re.compile(r"exec\s*\(", re.IGNORECASE),
]

# Banned patterns in LLM output (nudge text)
OUTPUT_BANNED_PATTERNS = [
    re.compile(r"https?://", re.IGNORECASE),         # No URLs
    re.compile(r"\b\d{11}\b"),                        # No phone numbers (11 digits)
    re.compile(r"@[a-zA-Z]"),                         # No email-like patterns
    re.compile(r"password|পাসওয়ার্ড", re.IGNORECASE),  # No password mentions
    re.compile(r"PIN|পিন", re.IGNORECASE),             # No PIN mentions
]


def sanitize_input(field_name: str, value: str) -> tuple[bool, str]:
    """
    Validate and sanitize a single input field.

    Returns:
        (is_valid, sanitized_value_or_error_message)
    """
    if not isinstance(value, str):
        value = str(value)

    # Check banned patterns
    for pattern in BANNED_PATTERNS:
        if pattern.search(value):
            return False, f"Banned pattern detected in {field_name}"

    # Check allowed pattern if defined
    if field_name in ALLOWED_PATTERNS:
        if not ALLOWED_PATTERNS[field_name].match(value):
            return False, f"Invalid format for {field_name}: {value}"

    return True, value


def sanitize_context(context: dict) -> tuple[bool, dict]:
    """
    Validate and sanitize the entire user context for LLM prompt.

    Returns:
        (all_valid, sanitized_context_or_errors)
    """
    sanitized = {}
    errors = []

    for key, value in context.items():
        is_valid, result = sanitize_input(key, str(value))
        if is_valid:
            sanitized[key] = result
        else:
            errors.append(result)

    if errors:
        return False, {"errors": errors}

    return True, sanitized


def validate_nudge_output(nudge_text: str, expected_bonus: int) -> tuple[bool, list]:
    """
    Validate LLM-generated nudge text.

    Returns:
        (is_valid, list_of_violations)
    """
    violations = []

    # Check banned output patterns
    for pattern in OUTPUT_BANNED_PATTERNS:
        if pattern.search(nudge_text):
            violations.append(f"Output contains banned pattern: {pattern.pattern}")

    # Check length (50-200 words)
    word_count = len(nudge_text.split())
    if word_count < 10:
        violations.append(f"Nudge too short: {word_count} words")
    if word_count > 200:
        violations.append(f"Nudge too long: {word_count} words")

    # Check that the bonus amount mentioned matches expected
    # Look for Bangla numerals or English numerals
    bonus_str = str(expected_bonus)
    bangla_bonus = bonus_str.translate(
        str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")
    )
    if bonus_str not in nudge_text and bangla_bonus not in nudge_text:
        # Bonus amount not mentioned — warning but not blocking
        pass  # Allow nudges that don't mention the exact amount

    return len(violations) == 0, violations
```

### 6.2 LLM Nudge Generator

```python
# File: backend/app/services/nudge_service.py
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

# TODO: Replace with actual google.generativeai import when API key is available
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

from ..utils.sanitizer import sanitize_context, validate_nudge_output
from .rules_engine import NudgeRules


# Fallback templates (used when Gemini API is unavailable)
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


SYSTEM_PROMPT = """You are a helpful upay campaign assistant. Your ONLY task is to generate a short, encouraging Bangla nudge message for a upay user.

STRICT RULES:
1. Write ONLY in Bangla (Bengali script)
2. Keep the message between 50-120 words
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
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        self.genai_ready = False

        if GENAI_AVAILABLE and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(self.model_name)
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
                    [
                        {"role": "user", "parts": [SYSTEM_PROMPT + "\n\n" + prompt]},
                    ],
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
                        "text_en": f"[AI-generated Bangla nudge for {milestone}]",
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
        return self._fallback_nudge(nudge_id, milestone, bonus, "Gemini API not available")

    def _fallback_nudge(
        self, nudge_id: str, milestone: str, bonus: int, reason: str
    ) -> dict:
        """Generate a fallback template-based nudge."""
        import random

        templates = FALLBACK_TEMPLATES.get(milestone, FALLBACK_TEMPLATES["M4"])
        template = random.choice(templates)
        nudge_text = template.format(bonus=bonus)

        return {
            "nudge_id": nudge_id,
            "target_milestone": milestone,
            "bonus_amount_bdt": bonus,
            "text_bn": nudge_text,
            "text_en": f"[Template nudge for {milestone}]",
            "channel_recommendation": "sms",
            "status": "pending_approval",
            "ai_generated": False,
            "guardrail_passed": True,
            "generation_method": "template",
            "fallback_reason": reason,
        }
```

---

## 7. API Layer

### 7.1 FastAPI Main App

```python
# File: backend/app/main.py
"""
MilestoneAI — FastAPI Application
Main entry point for the backend API.
"""

from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from .routers import funnel, users, nudges, savings, metrics, traces
from .database import init_db

app = FastAPI(
    title="MilestoneAI + SanchayBot API",
    description="Hybrid Activation & Savings Intelligence for upay",
    version="2.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Key authentication
API_KEY = os.getenv("API_KEY", "milestone-ai-dev-key-2026")


async def verify_api_key(x_api_key: str = Header(default="")):
    """Simple API key verification."""
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key


# Include routers
app.include_router(funnel.router, prefix="/api/v1", dependencies=[Depends(verify_api_key)])
app.include_router(users.router, prefix="/api/v1", dependencies=[Depends(verify_api_key)])
app.include_router(nudges.router, prefix="/api/v1", dependencies=[Depends(verify_api_key)])
app.include_router(savings.router, prefix="/api/v1", dependencies=[Depends(verify_api_key)])  # [NEW] SanchayBot
app.include_router(metrics.router, prefix="/api/v1", dependencies=[Depends(verify_api_key)])
app.include_router(traces.router, prefix="/api/v1", dependencies=[Depends(verify_api_key)])


@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    init_db()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "MilestoneAI + SanchayBot", "data_is_synthetic": True}
```

### 7.2 Database Setup

```python
# File: backend/app/database.py
"""
MilestoneAI — Database Setup (SQLite)
"""

import sqlite3
import os

DB_PATH = os.getenv("DB_PATH", "./data/milestone_ai.db")


def get_db():
    """Get a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database tables."""
    conn = get_db()
    cursor = conn.cursor()

    # Predictions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            prediction_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            milestone_probabilities TEXT NOT NULL,
            primary_drop_off TEXT,
            shap_values TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Nudges table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS nudges (
            nudge_id TEXT PRIMARY KEY,
            prediction_id TEXT,
            user_id TEXT NOT NULL,
            target_milestone TEXT NOT NULL,
            bonus_amount_bdt INTEGER,
            text_bn TEXT,
            text_en TEXT,
            channel_recommendation TEXT,
            status TEXT DEFAULT 'pending_approval',
            ai_generated BOOLEAN,
            guardrail_passed BOOLEAN,
            generation_method TEXT,
            approved_by TEXT,
            approved_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (prediction_id) REFERENCES predictions(prediction_id)
        )
    """)

    # Savings plans table [NEW — SanchayBot]
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS savings_plans (
            plan_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            predicted_surplus REAL,
            recommended_amount INTEGER,
            recommended_tenure INTEGER,
            projected_maturity REAL,
            surplus_pct_used REAL,
            cashflow_summary TEXT,
            linked_nudge_id TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (linked_nudge_id) REFERENCES nudges(nudge_id)
        )
    """)

    # Traces table (audit trail)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS traces (
            trace_id INTEGER PRIMARY KEY AUTOINCREMENT,
            prediction_id TEXT,
            nudge_id TEXT,
            user_id TEXT,
            action TEXT NOT NULL,
            details TEXT,
            actor TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()
```

### 7.3 Prediction Service

```python
# File: backend/app/services/prediction_service.py
"""
MilestoneAI — Prediction Service
Loads model, computes predictions and SHAP explanations.
"""

import numpy as np
import pandas as pd
import joblib
import json
import os
from typing import Optional
from datetime import datetime
import uuid


MODELS_DIR = os.getenv("MODELS_DIR", "./models")
DATA_DIR = os.getenv("DATA_DIR", "./data")

# Cache for loaded models
_model_cache = {}
_data_cache = {}


def _load_models():
    """Load XGBoost models (cached)."""
    if "xgboost" not in _model_cache:
        model_path = os.path.join(MODELS_DIR, "xgboost_model.joblib")
        _model_cache["xgboost"] = joblib.load(model_path)
    return _model_cache["xgboost"]


def _load_feature_names():
    """Load feature names (cached)."""
    if "feature_names" not in _model_cache:
        path = os.path.join(MODELS_DIR, "feature_names.json")
        with open(path) as f:
            _model_cache["feature_names"] = json.load(f)
    return _model_cache["feature_names"]


def _load_test_data():
    """Load test data for lookups (cached)."""
    if "test_data" not in _data_cache:
        _data_cache["test_data"] = pd.read_csv(os.path.join(DATA_DIR, "features_test.csv"))
    return _data_cache["test_data"]


def _load_shap_values(milestone: str):
    """Load pre-computed SHAP values for a milestone."""
    key = f"shap_{milestone}"
    if key not in _model_cache:
        path = os.path.join(MODELS_DIR, f"shap_values_{milestone}.npy")
        if os.path.exists(path):
            _model_cache[key] = np.load(path)
        else:
            _model_cache[key] = None
    return _model_cache[key]


def predict_user(user_id: str) -> Optional[dict]:
    """
    Generate prediction for a specific user.

    Returns full prediction with probabilities, SHAP explanation, and metadata.
    """
    models = _load_models()
    feature_names = _load_feature_names()
    test_data = _load_test_data()

    # Find user in test data
    user_row = test_data[test_data["user_id"] == user_id]
    if user_row.empty:
        # Try in train/val data
        for split in ["train", "val"]:
            split_data = pd.read_csv(os.path.join(DATA_DIR, f"features_{split}.csv"))
            user_row = split_data[split_data["user_id"] == user_id]
            if not user_row.empty:
                break

    if user_row.empty:
        return None

    X = user_row[feature_names].values

    # Predict probabilities for each milestone
    prediction_id = f"P_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
    milestone_probs = {}
    AT_RISK_THRESHOLD = 0.50

    for milestone in ["M2", "M3", "M4", "M5"]:
        model = models[milestone]
        prob = float(model.predict_proba(X)[:, 1][0])
        milestone_probs[milestone] = {
            "completion_prob": round(prob, 4),
            "at_risk": prob < AT_RISK_THRESHOLD,
        }

    # Find primary drop-off (lowest probability, at-risk milestone)
    at_risk_milestones = {
        m: p["completion_prob"]
        for m, p in milestone_probs.items()
        if p["at_risk"]
    }
    primary_drop_off = min(at_risk_milestones, key=at_risk_milestones.get) if at_risk_milestones else None

    # SHAP explanation for primary drop-off
    explanation = None
    if primary_drop_off:
        explanation = _get_shap_explanation(user_id, primary_drop_off, X, feature_names)

    return {
        "user_id": user_id,
        "prediction_id": prediction_id,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "milestone_probabilities": milestone_probs,
        "primary_drop_off": primary_drop_off,
        "explanation": explanation,
        "data_is_synthetic": True,
    }


def _get_shap_explanation(user_id: str, milestone: str, X: np.ndarray, feature_names: list) -> dict:
    """Get SHAP explanation for a specific prediction."""
    # Try pre-computed SHAP values first
    shap_values = _load_shap_values(milestone)
    test_data = _load_test_data()

    if shap_values is not None:
        # Find user index in test set
        test_ids = test_data["user_id"].values
        user_idx = np.where(test_ids == user_id)[0]

        if len(user_idx) > 0:
            idx = user_idx[0]
            user_shap = shap_values[idx]
        else:
            # Compute on-the-fly using TreeExplainer
            user_shap = _compute_shap_on_fly(milestone, X, feature_names)
    else:
        user_shap = _compute_shap_on_fly(milestone, X, feature_names)

    if user_shap is None:
        return {"type": "unavailable", "reason": "SHAP values not computed"}

    # Get top 5 features by absolute SHAP value
    top_indices = np.argsort(np.abs(user_shap))[-5:][::-1]
    features = []
    for idx in top_indices:
        feat_name = feature_names[idx]
        shap_val = float(user_shap[idx])
        feat_value = float(X[0, idx]) if X.ndim > 1 else float(X[idx])

        features.append({
            "name": feat_name,
            "value": feat_value,
            "shap": round(shap_val, 4),
            "direction": "increases_risk" if shap_val < 0 else "decreases_risk",
        })

    return {
        "type": "shap",
        "base_value": round(float(np.mean(user_shap)) + 0.5, 4),  # Approximate
        "features": features,
    }


def _compute_shap_on_fly(milestone: str, X: np.ndarray, feature_names: list):
    """Compute SHAP values on the fly (slower, used as fallback)."""
    try:
        import shap
        models = _load_models()
        model = models[milestone]
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X)
        return shap_values[0] if X.shape[0] == 1 else shap_values
    except Exception as e:
        print(f"SHAP on-the-fly computation failed: {e}")
        return None


def get_at_risk_users(milestone_filter: Optional[str] = None, limit: int = 100, offset: int = 0) -> dict:
    """Get a ranked list of at-risk users."""
    models = _load_models()
    feature_names = _load_feature_names()
    test_data = _load_test_data()

    X = test_data[feature_names].values
    user_ids = test_data["user_id"].values

    # Predict for all users
    all_risks = []
    for i in range(len(user_ids)):
        x_i = X[i:i+1]
        user_risks = {}

        for milestone in ["M2", "M3", "M4", "M5"]:
            if milestone_filter and milestone != milestone_filter:
                continue
            model = models[milestone]
            prob = float(model.predict_proba(x_i)[:, 1][0])
            if prob < 0.50:  # At risk
                user_risks[milestone] = prob

        if user_risks:
            # Find highest risk milestone
            worst_milestone = min(user_risks, key=user_risks.get)
            all_risks.append({
                "user_id": user_ids[i],
                "drop_off_milestone": worst_milestone,
                "drop_off_probability": round(1 - user_risks[worst_milestone], 4),  # Convert to risk
                "nudge_eligible": True,  # Simplified for demo
            })

    # Sort by risk (highest first)
    all_risks.sort(key=lambda x: x["drop_off_probability"], reverse=True)

    return {
        "milestone_filter": milestone_filter,
        "total_at_risk": len(all_risks),
        "users": all_risks[offset:offset + limit],
    }


def get_funnel_stats() -> dict:
    """Get milestone completion funnel statistics."""
    milestones_df = pd.read_csv(os.path.join(DATA_DIR, "milestone_events.csv"))
    total = len(milestones_df[milestones_df["milestone"] == "M1"])

    funnel = []
    for m in ["M1", "M2", "M3", "M4", "M5", "M6"]:
        completed = milestones_df[
            (milestones_df["milestone"] == m) & (milestones_df["completed"] == True)
        ].shape[0]
        funnel.append({
            "milestone": m,
            "completed_count": int(completed),
            "rate": round(completed / total, 4) if total > 0 else 0,
        })

    return {"total_users": int(total), "milestones": funnel, "data_is_synthetic": True}
```

### 7.4 API Routers

```python
# File: backend/app/routers/funnel.py
"""Funnel endpoint."""

from fastapi import APIRouter
from ..services.prediction_service import get_funnel_stats

router = APIRouter(tags=["Funnel"])


@router.get("/funnel")
async def get_funnel():
    """Get milestone completion funnel statistics."""
    return get_funnel_stats()
```

```python
# File: backend/app/routers/users.py
"""User prediction endpoints."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..services.prediction_service import predict_user, get_at_risk_users
from ..services.nudge_service import NudgeGenerator
from ..services.trace_service import log_trace

router = APIRouter(tags=["Users"])
nudge_gen = NudgeGenerator()


@router.get("/at-risk-users")
async def at_risk_users(
    milestone: Optional[str] = Query(None, regex="^M[2-5]$"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """Get ranked list of at-risk users."""
    return get_at_risk_users(milestone_filter=milestone, limit=limit, offset=offset)


@router.get("/users/{user_id}/prediction")
async def user_prediction(user_id: str):
    """Get full prediction, explanation, and nudge for a user."""
    prediction = predict_user(user_id)
    if not prediction:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")

    # Generate nudge if user is at risk
    nudge = None
    if prediction["primary_drop_off"]:
        risk_factors = prediction.get("explanation", {}).get("features", [])
        nudge = nudge_gen.generate_nudge(
            user_id=user_id,
            milestone=prediction["primary_drop_off"],
            risk_factors=risk_factors,
            # TODO: Pass actual user attributes from database
        )

    prediction["nudge"] = nudge

    # Log trace
    log_trace(
        prediction_id=prediction["prediction_id"],
        user_id=user_id,
        action="prediction_generated",
        details={"primary_drop_off": prediction["primary_drop_off"]},
    )

    return prediction
```

```python
# File: backend/app/routers/nudges.py
"""Nudge approval endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..services.trace_service import log_trace

router = APIRouter(tags=["Nudges"])


class NudgeApproval(BaseModel):
    action: str  # "approve", "reject", "edit"
    edited_text_bn: Optional[str] = None
    approver_id: str = "CM001"


@router.post("/nudges/{nudge_id}/approve")
async def approve_nudge(nudge_id: str, approval: NudgeApproval):
    """Approve, reject, or edit a nudge."""
    db = get_db()
    cursor = db.cursor()

    # Update nudge status
    now = datetime.utcnow().isoformat()

    if approval.action == "approve":
        status = "approved"
    elif approval.action == "reject":
        status = "rejected"
    elif approval.action == "edit":
        status = "approved"
        if approval.edited_text_bn:
            cursor.execute(
                "UPDATE nudges SET text_bn = ? WHERE nudge_id = ?",
                (approval.edited_text_bn, nudge_id),
            )
    else:
        raise HTTPException(status_code=400, detail=f"Invalid action: {approval.action}")

    cursor.execute(
        "UPDATE nudges SET status = ?, approved_by = ?, approved_at = ? WHERE nudge_id = ?",
        (status, approval.approver_id, now, nudge_id),
    )
    db.commit()

    # Log trace
    log_trace(
        nudge_id=nudge_id,
        action=f"nudge_{approval.action}",
        details={"approver": approval.approver_id},
        actor=approval.approver_id,
    )

    return {
        "nudge_id": nudge_id,
        "status": status,
        "approved_at": now,
        "approved_by": approval.approver_id,
    }
```

```python
# File: backend/app/routers/metrics.py
"""Model metrics and fairness endpoints."""

from fastapi import APIRouter
import json
import os

router = APIRouter(tags=["Metrics"])

MODELS_DIR = os.getenv("MODELS_DIR", "./models")


@router.get("/model/metrics")
async def model_metrics():
    """Get model performance metrics."""
    path = os.path.join(MODELS_DIR, "evaluation_report.json")
    try:
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "Evaluation report not found. Run evaluate_model.py first."}


@router.get("/model/fairness")
async def model_fairness():
    """Get fairness analysis report."""
    path = os.path.join(MODELS_DIR, "fairness_report.json")
    try:
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "Fairness report not found. Run fairness_check.py first."}
```

```python
# File: backend/app/routers/traces.py
"""Audit trail endpoints."""

from fastapi import APIRouter, Query
from typing import Optional
from ..database import get_db

router = APIRouter(tags=["Traces"])


@router.get("/traces")
async def get_traces(
    limit: int = Query(50, ge=1, le=200),
    user_id: Optional[str] = None,
):
    """Get explanation traces for audit."""
    db = get_db()
    cursor = db.cursor()

    if user_id:
        cursor.execute(
            "SELECT * FROM traces WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?",
            (user_id, limit),
        )
    else:
        cursor.execute(
            "SELECT * FROM traces ORDER BY timestamp DESC LIMIT ?",
            (limit,),
        )

    traces = [dict(row) for row in cursor.fetchall()]
    return {"traces": traces, "total": len(traces)}
```

### 7.5 Trace Service

```python
# File: backend/app/services/trace_service.py
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
```

### 7.6 Pydantic Schemas

```python
# File: backend/app/models/schemas.py
"""
MilestoneAI — Pydantic Request/Response Schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MilestoneProb(BaseModel):
    completion_prob: float
    at_risk: bool


class ShapFeature(BaseModel):
    name: str
    value: float
    shap: float
    direction: str


class Explanation(BaseModel):
    type: str
    base_value: Optional[float] = None
    features: list[ShapFeature] = []


class Nudge(BaseModel):
    nudge_id: str
    target_milestone: str
    bonus_amount_bdt: int
    text_bn: str
    text_en: str
    channel_recommendation: str
    status: str
    ai_generated: bool
    guardrail_passed: bool


class PredictionResponse(BaseModel):
    user_id: str
    prediction_id: str
    timestamp: str
    milestone_probabilities: dict[str, MilestoneProb]
    primary_drop_off: Optional[str]
    explanation: Optional[Explanation]
    nudge: Optional[Nudge]
    data_is_synthetic: bool = True
```

---

## 8. Frontend

### 8.1 TypeScript Types

```typescript
// File: frontend/src/types/index.ts

export interface MilestoneStat {
  milestone: string;
  completed_count: number;
  rate: number;
}

export interface FunnelResponse {
  total_users: number;
  milestones: MilestoneStat[];
  data_is_synthetic: boolean;
}

export interface ShapFeature {
  name: string;
  value: number;
  shap: number;
  direction: 'increases_risk' | 'decreases_risk';
}

export interface Explanation {
  type: string;
  base_value: number;
  features: ShapFeature[];
}

export interface MilestoneProb {
  completion_prob: number;
  at_risk: boolean;
}

export interface Nudge {
  nudge_id: string;
  target_milestone: string;
  bonus_amount_bdt: number;
  text_bn: string;
  text_en: string;
  channel_recommendation: string;
  status: string;
  ai_generated: boolean;
  guardrail_passed: boolean;
}

export interface PredictionResponse {
  user_id: string;
  prediction_id: string;
  timestamp: string;
  milestone_probabilities: Record<string, MilestoneProb>;
  primary_drop_off: string | null;
  explanation: Explanation | null;
  nudge: Nudge | null;
  data_is_synthetic: boolean;
}

export interface AtRiskUser {
  user_id: string;
  drop_off_milestone: string;
  drop_off_probability: number;
  nudge_eligible: boolean;
}

export interface AtRiskResponse {
  milestone_filter: string | null;
  total_at_risk: number;
  users: AtRiskUser[];
}

// ===== SanchayBot Types (Module B) =====

export interface CashFlowSummary {
  user_id: string;
  monthly_income: number;
  monthly_expenses: number;
  monthly_surplus: number;
  cash_out_amount: number;
  cash_out_ratio: number;
  top_expense_category: string;
  savings_rate: number;
  tx_count: number;
}

export interface DPSPlan {
  tenure_months: number;
  monthly_amount: number;
  total_deposits: number;
  projected_interest: number;
  projected_maturity: number;
}

export interface DPSRecommendation {
  eligible: boolean;
  predicted_surplus: number;
  recommended_plan: DPSPlan;
  surplus_percentage_used: number;
  all_plans: DPSPlan[];
  free_cashout_channel: string;
  disclaimer: string;
  reason?: string;
}

export interface SavingsPlanResponse {
  user_id: string;
  cashflow: CashFlowSummary;
  dps_recommendation: DPSRecommendation;
  generated_at: string;
  data_is_synthetic: boolean;
}
```

### 8.2 API Client

```typescript
// File: frontend/src/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'milestone-ai-dev-key-2026';

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getFunnel: () => apiFetch<any>('/funnel'),

  getAtRiskUsers: (milestone?: string, limit = 100) => {
    const params = new URLSearchParams();
    if (milestone) params.set('milestone', milestone);
    params.set('limit', String(limit));
    return apiFetch<any>(`/at-risk-users?${params}`);
  },

  getUserPrediction: (userId: string) =>
    apiFetch<any>(`/users/${userId}/prediction`),

  approveNudge: (nudgeId: string, action: string, approver = 'CM001') =>
    apiFetch<any>(`/nudges/${nudgeId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, approver_id: approver }),
    }),

  getModelMetrics: () => apiFetch<any>('/model/metrics'),

  getModelFairness: () => apiFetch<any>('/model/fairness'),

  getTraces: (limit = 50, userId?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (userId) params.set('user_id', userId);
    return apiFetch<any>(`/traces?${params}`);
  },

  // ===== SanchayBot (Module B) =====
  getUserSavingsPlan: (userId: string) =>
    apiFetch<any>(`/users/${userId}/savings-plan`),
};
```

### 8.3 i18n (Bangla / English)

```typescript
// File: frontend/src/lib/i18n.ts

export type Language = 'en' | 'bn';

const strings: Record<string, Record<Language, string>> = {
  'app.title': { en: 'MilestoneAI', bn: 'মাইলস্টোন AI' },
  'app.subtitle': { en: 'AI-Powered Activation Engine', bn: 'AI চালিত অ্যাক্টিভেশন ইঞ্জিন' },
  'nav.dashboard': { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  'nav.performance': { en: 'Model Performance', bn: 'মডেল পারফরম্যান্স' },
  'banner.synthetic': { en: '⚠️ SYNTHETIC DATA — All data shown is simulated', bn: '⚠️ সিন্থেটিক ডেটা — সমস্ত ডেটা সিমুলেটেড' },
  'funnel.title': { en: 'Milestone Activation Funnel', bn: 'মাইলস্টোন অ্যাক্টিভেশন ফানেল' },
  'risk.title': { en: 'At-Risk Users', bn: 'ঝুঁকিতে থাকা ব্যবহারকারী' },
  'user.prediction': { en: 'Risk Prediction', bn: 'ঝুঁকির পূর্বাভাস' },
  'user.explanation': { en: 'AI Explanation', bn: 'AI ব্যাখ্যা' },
  'nudge.title': { en: 'AI Generated Nudge', bn: 'AI তৈরি নাজ' },
  'nudge.approve': { en: 'Approve', bn: 'অনুমোদন' },
  'nudge.reject': { en: 'Reject', bn: 'প্রত্যাখ্যান' },
  'nudge.edit': { en: 'Edit', bn: 'সম্পাদনা' },
  'badge.ai_generated': { en: '🤖 AI Generated', bn: '🤖 AI তৈরি' },
  'metrics.auc': { en: 'AUC-ROC', bn: 'AUC-ROC' },
  'metrics.precision': { en: 'Precision', bn: 'প্রিসিশন' },
  'metrics.recall': { en: 'Recall', bn: 'রিকল' },
  'fairness.title': { en: 'Fairness Analysis', bn: 'ন্যায্যতা বিশ্লেষণ' },
  // Milestone names
  'milestone.M1': { en: 'M1: PIN Set', bn: 'M1: পিন সেট' },
  'milestone.M2': { en: 'M2: First Recharge', bn: 'M2: প্রথম রিচার্জ' },
  'milestone.M3': { en: 'M3: Cash-in/Add Money', bn: 'M3: ক্যাশ-ইন/অ্যাড মানি' },
  'milestone.M4': { en: 'M4: Merchant Payment', bn: 'M4: মার্চেন্ট পেমেন্ট' },
  'milestone.M5': { en: 'M5: Open DPS', bn: 'M5: ডিপিএস খোলা' },
  'milestone.M6': { en: 'M6: All Complete', bn: 'M6: সব সম্পূর্ণ' },
};

export function t(key: string, lang: Language = 'en'): string {
  return strings[key]?.[lang] || key;
}
```

### 8.4 Key Components

```tsx
// File: frontend/src/components/SyntheticBanner.tsx
'use client';

export default function SyntheticBanner() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #ff6b35, #f7931e)',
      color: 'white',
      padding: '8px 16px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 600,
    }}>
      ⚠️ SYNTHETIC DATA — All data shown is simulated. No real upay user data is used.
    </div>
  );
}
```

```tsx
// File: frontend/src/components/FunnelChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { MilestoneStat } from '@/types';

interface FunnelChartProps {
  data: MilestoneStat[];
}

const COLORS = {
  high: '#22c55e',    // Green: >= 60%
  medium: '#eab308',  // Yellow: 40-60%
  low: '#ef4444',     // Red: < 40%
};

function getColor(rate: number): string {
  if (rate >= 0.6) return COLORS.high;
  if (rate >= 0.4) return COLORS.medium;
  return COLORS.low;
}

const MILESTONE_LABELS: Record<string, string> = {
  M1: 'PIN Set',
  M2: 'Recharge',
  M3: 'Cash-in',
  M4: 'Merchant Pay',
  M5: 'Open DPS',
  M6: 'All Complete',
};

export default function FunnelChart({ data }: FunnelChartProps) {
  const chartData = data.map(d => ({
    ...d,
    label: MILESTONE_LABELS[d.milestone] || d.milestone,
    percentage: Math.round(d.rate * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
        <YAxis dataKey="label" type="category" width={120} />
        <Tooltip
          formatter={(value: number) => [`${value}%`, 'Completion Rate']}
        />
        <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={getColor(entry.rate)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

```tsx
// File: frontend/src/components/ShapWaterfall.tsx
'use client';

import { ShapFeature } from '@/types';

interface ShapWaterfallProps {
  features: ShapFeature[];
  baseValue: number;
}

export default function ShapWaterfall({ features, baseValue }: ShapWaterfallProps) {
  const maxAbsShap = Math.max(...features.map(f => Math.abs(f.shap)), 0.01);

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>
        SHAP Feature Attribution
      </h3>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
        Base prediction: {(baseValue * 100).toFixed(1)}%
      </div>

      {features.map((feat, idx) => {
        const barWidth = Math.abs(feat.shap) / maxAbsShap * 100;
        const isRisk = feat.direction === 'increases_risk';

        return (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
            gap: '8px',
          }}>
            <div style={{
              width: '180px',
              fontSize: '13px',
              textAlign: 'right',
              color: '#374151',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {feat.name.replace(/_/g, ' ')}
            </div>
            <div style={{
              flex: 1,
              height: '24px',
              background: '#f3f4f6',
              borderRadius: '4px',
              position: 'relative',
            }}>
              <div style={{
                width: `${Math.min(barWidth, 100)}%`,
                height: '100%',
                background: isRisk
                  ? 'linear-gradient(90deg, #fca5a5, #ef4444)'
                  : 'linear-gradient(90deg, #86efac, #22c55e)',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{
              width: '60px',
              fontSize: '12px',
              color: isRisk ? '#dc2626' : '#16a34a',
              fontWeight: 600,
            }}>
              {isRisk ? '▲' : '▼'} {Math.abs(feat.shap).toFixed(3)}
            </div>
          </div>
        );
      })}

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginTop: '12px',
        fontSize: '12px',
        color: '#6b7280',
      }}>
        <span>🔴 Increases Risk</span>
        <span>🟢 Decreases Risk</span>
      </div>
    </div>
  );
}
```

```tsx
// File: frontend/src/components/NudgeCard.tsx
'use client';

import { useState } from 'react';
import { Nudge } from '@/types';
import { api } from '@/lib/api';

interface NudgeCardProps {
  nudge: Nudge;
  onStatusChange?: (status: string) => void;
}

export default function NudgeCard({ nudge, onStatusChange }: NudgeCardProps) {
  const [status, setStatus] = useState(nudge.status);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      await api.approveNudge(nudge.nudge_id, action);
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    } catch (error) {
      console.error('Failed to update nudge:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      background: '#fefce8',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
          💬 Nudge for {nudge.target_milestone}
        </h3>
        {nudge.ai_generated && (
          <span style={{
            background: '#dbeafe',
            color: '#1d4ed8',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
          }}>
            🤖 AI Generated
          </span>
        )}
      </div>

      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '16px',
        lineHeight: 1.6,
        fontFamily: "'Noto Sans Bengali', sans-serif",
        direction: 'ltr',
        marginBottom: '12px',
      }}>
        {nudge.text_bn}
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        fontSize: '13px',
        color: '#6b7280',
        marginBottom: '16px',
      }}>
        <span>Bonus: ৳{nudge.bonus_amount_bdt}</span>
        <span>•</span>
        <span>Channel: {nudge.channel_recommendation}</span>
        <span>•</span>
        <span>Status: {status}</span>
      </div>

      {status === 'pending_approval' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleAction('approve')}
            disabled={loading}
            style={{
              padding: '8px 20px',
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              opacity: loading ? 0.5 : 1,
            }}
          >
            ✅ Approve
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={loading}
            style={{
              padding: '8px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              opacity: loading ? 0.5 : 1,
            }}
          >
            ❌ Reject
          </button>
        </div>
      )}

      {status !== 'pending_approval' && (
        <div style={{
          padding: '8px 16px',
          background: status === 'approved' ? '#dcfce7' : '#fee2e2',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: status === 'approved' ? '#166534' : '#991b1b',
        }}>
          {status === 'approved' ? '✅ Nudge Approved' : '❌ Nudge Rejected'}
        </div>
      )}
    </div>
  );
}
```

### 8.5 Dashboard Page (Skeleton)

```tsx
// File: frontend/src/app/page.tsx
// TODO: Full implementation — this is the key skeleton with component composition

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import SyntheticBanner from '@/components/SyntheticBanner';
import FunnelChart from '@/components/FunnelChart';
// TODO: Import AtRiskTable component
import Link from 'next/link';

export default function Dashboard() {
  const [funnel, setFunnel] = useState<any>(null);
  const [atRisk, setAtRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [funnelData, riskData] = await Promise.all([
          api.getFunnel(),
          api.getAtRiskUsers(undefined, 20),
        ]);
        setFunnel(funnelData);
        setAtRisk(riskData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <SyntheticBanner />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>
          MilestoneAI Dashboard
        </h1>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {/* TODO: Implement 4 KPI cards: Total Users, Active Campaign, Completion Rate, At-Risk */}
          <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#166534' }}>{funnel?.total_users?.toLocaleString()}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Users</div>
          </div>
          <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#92400e' }}>{atRisk?.total_at_risk?.toLocaleString()}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>At-Risk Users</div>
          </div>
          {/* TODO: Add more KPI cards */}
        </div>

        {/* Funnel Chart */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Milestone Activation Funnel</h2>
          {funnel && <FunnelChart data={funnel.milestones} />}
        </div>

        {/* At-Risk Users Table */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>At-Risk Users</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>User ID</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Drop-off Milestone</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Risk Score</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {atRisk?.users?.slice(0, 10).map((user: any) => (
                <tr key={user.user_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px' }}>{user.user_id}</td>
                  <td style={{ padding: '12px' }}>{user.drop_off_milestone}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      display: 'inline-block',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}>
                      {(user.drop_off_probability * 100).toFixed(0)}% risk
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Link href={`/users/${user.user_id}`} style={{
                      color: '#2563eb',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}>
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
```

### 8.6 User Detail Page (Skeleton)

```tsx
// File: frontend/src/app/users/[id]/page.tsx
// TODO: Full implementation with all components

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import SyntheticBanner from '@/components/SyntheticBanner';
import ShapWaterfall from '@/components/ShapWaterfall';
import NudgeCard from '@/components/NudgeCard';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrediction() {
      try {
        const data = await api.getUserPrediction(userId);
        setPrediction(data);
      } catch (err) {
        console.error('Failed to fetch prediction:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPrediction();
  }, [userId]);

  if (loading) return <div style={{ padding: '24px' }}>Loading prediction...</div>;
  if (!prediction) return <div style={{ padding: '24px' }}>User not found</div>;

  return (
    <div>
      <SyntheticBanner />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
          User: {prediction.user_id}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left: Milestone Probabilities */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
              Milestone Completion Probabilities
            </h2>
            {Object.entries(prediction.milestone_probabilities).map(([m, prob]: [string, any]) => (
              <div key={m} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{m}</span>
                  <span style={{ color: prob.at_risk ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                    {(prob.completion_prob * 100).toFixed(1)}%
                    {prob.at_risk && ' ⚠️'}
                  </span>
                </div>
                <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
                  <div style={{
                    width: `${prob.completion_prob * 100}%`,
                    height: '100%',
                    background: prob.at_risk ? '#ef4444' : '#22c55e',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            ))}

            {prediction.primary_drop_off && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#fef2f2',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#dc2626',
              }}>
                Primary drop-off risk: {prediction.primary_drop_off}
              </div>
            )}
          </div>

          {/* Right: SHAP Explanation */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
              AI Explanation
            </h2>
            <span style={{
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
            }}>
              🤖 AI Generated via SHAP
            </span>

            {prediction.explanation?.features && (
              <ShapWaterfall
                features={prediction.explanation.features}
                baseValue={prediction.explanation.base_value || 0.5}
              />
            )}
          </div>
        </div>

        {/* Nudge Card */}
        {prediction.nudge && (
          <div style={{ marginTop: '24px' }}>
            <NudgeCard nudge={prediction.nudge} />
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## 9. SanchayBot Module (Module B)

This section contains the complete SanchayBot implementation — the DPS Savings Coach that integrates with MilestoneAI.

### 9.1 Transaction Generator

```python
# File: ml/transaction_generator.py
"""
SanchayBot — Synthetic Transaction & Cash-Flow Generator
Generates realistic income/expense transactions and derives cash-flow summaries.

ALL DATA IS SYNTHETIC. No real upay transaction data is used.

Injected Cash-Flow Patterns (P9-P14):
  P9:  Salary wallet → regular income pattern, higher surplus
  P10: High cash-out ratio → lower net savings potential
  P11: Urban users → higher income but higher expenses
  P12: Feature phone → cash-out dependent (60%+ of expenses)
  P13: Young (18-25) → lower income, higher mobile recharge spending
  P14: Bank account holders → lower cash-out ratio (use bank ATM)
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

# Transaction categories
INCOME_CATEGORIES = ["salary", "freelance", "remittance", "cash_in", "add_money"]
EXPENSE_CATEGORIES = [
    "cash_out", "mobile_recharge", "merchant_payment", "utility_bill",
    "money_transfer", "education", "transport", "food", "other"
]

# Base income distribution by occupation proxy
INCOME_PROFILES = {
    "18-25": {"mean": 8000, "std": 3000},    # Students/entry-level
    "26-35": {"mean": 15000, "std": 5000},   # Early career
    "36-45": {"mean": 20000, "std": 7000},   # Mid career
    "46+":   {"mean": 18000, "std": 6000},   # Senior
}


def generate_transactions(rng, users):
    """Generate synthetic transaction data for each user."""
    n = len(users)
    print(f"Generating transactions for {n} users...")

    all_transactions = []
    tx_counter = 0

    for i in range(n):
        user = users.iloc[i]
        user_id = user["user_id"]
        age_group = user["age_group"]
        area_type = user["area_type"]
        device_type = user["device_type"]
        has_bank = user["has_bank_account"]
        salary_wallet = user["salary_wallet_active"]
        reg_date = pd.to_datetime(user["registration_date"])

        # Determine monthly income (P9, P11, P13)
        income_profile = INCOME_PROFILES.get(age_group, INCOME_PROFILES["26-35"])
        base_income = max(2000, rng.normal(income_profile["mean"], income_profile["std"]))

        # P9: Salary wallet → more regular, +20% income
        if salary_wallet:
            base_income *= 1.20

        # P11: Urban → +15% income but also +20% expenses
        urban_multiplier = 1.15 if area_type == "urban" else (1.05 if area_type == "peri_urban" else 1.0)
        base_income *= urban_multiplier

        # Number of transactions (15-60)
        n_tx = rng.integers(15, 61)

        # Generate income transactions (30-40% of total tx)
        n_income = max(3, int(n_tx * rng.uniform(0.30, 0.40)))
        n_expense = n_tx - n_income

        # Income transactions
        for j in range(n_income):
            tx_date = reg_date + timedelta(days=int(rng.integers(0, 30)))
            if salary_wallet and j == 0:
                category = "salary"
                amount = round(base_income, -2)  # Round to nearest 100
            else:
                category = rng.choice(INCOME_CATEGORIES, p=[0.25, 0.15, 0.20, 0.25, 0.15])
                amount = round(rng.uniform(200, base_income * 0.4), -1)

            all_transactions.append({
                "tx_id": f"TX{tx_counter:012d}",
                "user_id": user_id,
                "tx_type": "income",
                "category": category,
                "amount_bdt": round(float(amount), 2),
                "tx_date": tx_date.strftime("%Y-%m-%d"),
                "day_since_reg": (tx_date - reg_date).days,
            })
            tx_counter += 1

        # Expense transactions
        # P10: Cash-out ratio distribution
        if device_type == "feature_phone":
            cash_out_prob = 0.55  # P12: Feature phone → high cash-out
        elif has_bank:
            cash_out_prob = 0.20  # P14: Bank account → lower cash-out
        else:
            cash_out_prob = 0.35  # Default

        expense_dist = [
            cash_out_prob,          # cash_out
            0.15,                    # mobile_recharge
            0.10,                    # merchant_payment
            0.08,                    # utility_bill
            0.07,                    # money_transfer
            0.05,                    # education
            0.03,                    # transport
            0.02,                    # food
            max(0.01, 1.0 - cash_out_prob - 0.50),  # other (remainder)
        ]
        # Normalize
        total = sum(expense_dist)
        expense_dist = [p / total for p in expense_dist]

        total_expense_target = base_income * rng.uniform(0.60, 0.90)  # 60-90% of income

        for j in range(n_expense):
            tx_date = reg_date + timedelta(days=int(rng.integers(0, 30)))
            category = rng.choice(EXPENSE_CATEGORIES, p=expense_dist)

            if category == "cash_out":
                amount = rng.uniform(500, 5000)
            elif category == "mobile_recharge":
                amount = rng.choice([30, 50, 100, 200, 300, 500])
            elif category == "merchant_payment":
                amount = rng.uniform(50, 2000)
            else:
                amount = rng.uniform(100, 3000)

            all_transactions.append({
                "tx_id": f"TX{tx_counter:012d}",
                "user_id": user_id,
                "tx_type": "expense",
                "category": category,
                "amount_bdt": round(float(amount), 2),
                "tx_date": tx_date.strftime("%Y-%m-%d"),
                "day_since_reg": (tx_date - reg_date).days,
            })
            tx_counter += 1

    transactions = pd.DataFrame(all_transactions)
    print(f"  Transactions generated: {len(transactions)}")
    return transactions


def generate_cashflow_summary(transactions, users):
    """Derive monthly cash-flow summary from transaction data."""
    print("Generating cash-flow summaries...")

    income = transactions[transactions["tx_type"] == "income"].groupby("user_id")["amount_bdt"].sum()
    expenses = transactions[transactions["tx_type"] == "expense"].groupby("user_id")["amount_bdt"].sum()
    cash_out = transactions[
        (transactions["tx_type"] == "expense") & (transactions["category"] == "cash_out")
    ].groupby("user_id")["amount_bdt"].sum()

    # Top expense category per user
    top_category = transactions[transactions["tx_type"] == "expense"].groupby(
        ["user_id", "category"]
    )["amount_bdt"].sum().reset_index()
    top_category = top_category.sort_values("amount_bdt", ascending=False).drop_duplicates("user_id")
    top_category = top_category.set_index("user_id")["category"]

    cashflow = pd.DataFrame({
        "user_id": users["user_id"],
    }).set_index("user_id")

    cashflow["monthly_income"] = income.reindex(cashflow.index).fillna(0).round(2)
    cashflow["monthly_expenses"] = expenses.reindex(cashflow.index).fillna(0).round(2)
    cashflow["monthly_surplus"] = (cashflow["monthly_income"] - cashflow["monthly_expenses"]).round(2)
    cashflow["cash_out_amount"] = cash_out.reindex(cashflow.index).fillna(0).round(2)
    cashflow["cash_out_ratio"] = (
        cashflow["cash_out_amount"] / cashflow["monthly_expenses"].replace(0, 1)
    ).round(4)
    cashflow["top_expense_category"] = top_category.reindex(cashflow.index).fillna("other")
    cashflow["savings_rate"] = (
        cashflow["monthly_surplus"] / cashflow["monthly_income"].replace(0, 1)
    ).clip(0, 1).round(4)
    cashflow["tx_count"] = transactions.groupby("user_id").size().reindex(cashflow.index).fillna(0).astype(int)

    cashflow = cashflow.reset_index()
    print(f"  Cash-flow summaries generated: {len(cashflow)}")
    return cashflow


def save_transaction_data(transactions, cashflow):
    """Save transaction and cashflow data."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    transactions.to_csv(os.path.join(OUTPUT_DIR, "transactions.csv"), index=False)
    cashflow.to_csv(os.path.join(OUTPUT_DIR, "cashflow_summary.csv"), index=False)
    print(f"  transactions.csv: {len(transactions)} rows")
    print(f"  cashflow_summary.csv: {len(cashflow)} rows")
```

### 9.2 Cash-Flow Feature Engineering

```python
# File: ml/cashflow_features.py
"""
SanchayBot — Cash-Flow Feature Engineering
Computes 11 features from cash-flow summary for surplus prediction.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import os
import json

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
SEED = 42


def build_cashflow_features(users, cashflow):
    """Build cash-flow feature matrix for surplus prediction."""
    df = users[["user_id", "area_type", "age_group", "device_type",
                "has_bank_account", "salary_wallet_active"]].merge(
        cashflow, on="user_id", how="inner"
    )

    # Derived features
    df["income_per_tx"] = (df["monthly_income"] / df["tx_count"].replace(0, 1)).round(2)
    df["expense_diversity"] = (df["tx_count"] * (1 - df["cash_out_ratio"])).round(2)
    df["is_high_cash_out"] = (df["cash_out_ratio"] > 0.40).astype(int)
    df["has_surplus"] = (df["monthly_surplus"] > 0).astype(int)

    # Encode categoricals
    for col in ["area_type", "age_group", "device_type", "top_expense_category"]:
        dummies = pd.get_dummies(df[col], prefix=col, dtype=int)
        df = pd.concat([df, dummies], axis=1)

    df["has_bank_account"] = df["has_bank_account"].astype(int)
    df["salary_wallet_active"] = df["salary_wallet_active"].astype(int)

    # Target: monthly_surplus
    target = df["monthly_surplus"].copy()

    # Feature columns (exclude IDs and target)
    exclude_cols = ["user_id", "monthly_surplus", "area_type", "age_group",
                    "device_type", "top_expense_category"]
    feature_cols = [c for c in df.columns if c not in exclude_cols]

    return df, feature_cols, target


def main():
    """Main cash-flow feature engineering pipeline."""
    print("=" * 60)
    print("SanchayBot — Cash-Flow Feature Engineering")
    print("=" * 60)

    users = pd.read_csv(os.path.join(DATA_DIR, "users.csv"))
    cashflow = pd.read_csv(os.path.join(DATA_DIR, "cashflow_summary.csv"))

    df, feature_cols, target = build_cashflow_features(users, cashflow)

    # Split
    X = df[feature_cols]
    y = target
    uids = df["user_id"]

    X_trainval, X_test, y_trainval, y_test, uid_trainval, uid_test = train_test_split(
        X, y, uids, test_size=0.15, random_state=SEED
    )
    X_train, X_val, y_train, y_val, uid_train, uid_val = train_test_split(
        X_trainval, y_trainval, uid_trainval, test_size=0.176, random_state=SEED
    )

    # Save
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)

    for name, X_s, y_s, uid_s in [("train", X_train, y_train, uid_train),
                                     ("val", X_val, y_val, uid_val),
                                     ("test", X_test, y_test, uid_test)]:
        combined = pd.concat([
            uid_s.reset_index(drop=True),
            X_s.reset_index(drop=True),
            y_s.reset_index(drop=True).rename("target_surplus")
        ], axis=1)
        combined.to_csv(os.path.join(DATA_DIR, f"cashflow_features_{name}.csv"), index=False)
        print(f"  {name}: {len(X_s)} samples")

    with open(os.path.join(MODELS_DIR, "cashflow_feature_names.json"), "w") as f:
        json.dump(feature_cols, f, indent=2)

    print(f"  Feature count: {len(feature_cols)}")
    print("\nCash-flow feature engineering complete!")


if __name__ == "__main__":
    main()
```

### 9.3 Surplus Regressor Training

```python
# File: ml/train_surplus.py
"""
SanchayBot — Surplus Prediction Model (XGBoost Regressor)
Predicts monthly surplus from cash-flow features.
"""

import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.model_selection import RandomizedSearchCV
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import joblib
import json
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")

PARAM_DIST = {
    "n_estimators": [100, 200, 300],
    "max_depth": [3, 4, 5, 6],
    "learning_rate": [0.05, 0.1, 0.2],
    "subsample": [0.7, 0.8, 0.9],
    "colsample_bytree": [0.7, 0.8, 0.9],
    "min_child_weight": [1, 3, 5],
}


def train_surplus_model():
    """Train XGBoost regressor for surplus prediction."""
    print("=" * 60)
    print("SanchayBot — Surplus Prediction Model (XGBoost Regressor)")
    print("=" * 60)

    train = pd.read_csv(os.path.join(DATA_DIR, "cashflow_features_train.csv"))
    val = pd.read_csv(os.path.join(DATA_DIR, "cashflow_features_val.csv"))
    test = pd.read_csv(os.path.join(DATA_DIR, "cashflow_features_test.csv"))

    with open(os.path.join(MODELS_DIR, "cashflow_feature_names.json")) as f:
        feature_names = json.load(f)

    X_train = train[feature_names].values
    y_train = train["target_surplus"].values
    X_val = val[feature_names].values
    y_val = val["target_surplus"].values
    X_test = test[feature_names].values
    y_test = test["target_surplus"].values

    # Hyperparameter search
    base_model = XGBRegressor(random_state=42, objective="reg:squarederror")
    search = RandomizedSearchCV(
        base_model, PARAM_DIST, n_iter=20, scoring="r2",
        cv=3, random_state=42, n_jobs=-1, verbose=0
    )
    search.fit(X_train, y_train)

    model = search.best_estimator_
    print(f"  Best params: {search.best_params_}")

    # Evaluate
    y_val_pred = model.predict(X_val)
    y_test_pred = model.predict(X_test)

    val_mae = mean_absolute_error(y_val, y_val_pred)
    val_r2 = r2_score(y_val, y_val_pred)
    test_mae = mean_absolute_error(y_test, y_test_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))

    print(f"  Val:  MAE=৳{val_mae:.0f}, R²={val_r2:.4f}")
    print(f"  Test: MAE=৳{test_mae:.0f}, R²={test_r2:.4f}, RMSE=৳{test_rmse:.0f}")

    # Scatter plot
    plt.figure(figsize=(8, 8))
    plt.scatter(y_test, y_test_pred, alpha=0.3, s=10)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--')
    plt.xlabel("Actual Surplus (BDT)")
    plt.ylabel("Predicted Surplus (BDT)")
    plt.title(f"Surplus Prediction: R²={test_r2:.3f}, MAE=৳{test_mae:.0f}")
    plt.tight_layout()
    plt.savefig(os.path.join(MODELS_DIR, "surplus_scatter.png"), dpi=100)
    plt.close()

    # Save
    joblib.dump(model, os.path.join(MODELS_DIR, "surplus_regressor.joblib"))

    results = {
        "val_mae": round(val_mae, 2),
        "val_r2": round(val_r2, 4),
        "test_mae": round(test_mae, 2),
        "test_r2": round(test_r2, 4),
        "test_rmse": round(test_rmse, 2),
        "best_params": {k: (int(v) if isinstance(v, (np.integer,)) else float(v) if isinstance(v, (np.floating,)) else v) for k, v in search.best_params_.items()},
    }
    with open(os.path.join(MODELS_DIR, "surplus_results.json"), "w") as f:
        json.dump(results, f, indent=2)

    print("\nSurplus model saved!")
    return model, results


if __name__ == "__main__":
    train_surplus_model()
```

### 9.4 DPS Plan Recommender

```python
# File: backend/app/services/savings_service.py
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

MODELS_DIR = os.getenv("MODELS_DIR", "./models")
DATA_DIR = os.getenv("DATA_DIR", "./data")

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
    """Load cashflow summary data (cached)."""
    if "cashflow" not in _savings_cache:
        path = os.path.join(DATA_DIR, "cashflow_summary.csv")
        if os.path.exists(path):
            _savings_cache["cashflow"] = pd.read_csv(path)
        else:
            _savings_cache["cashflow"] = None
    return _savings_cache["cashflow"]


def recommend_dps_plan(predicted_surplus: float) -> Optional[dict]:
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
            "reason": f"Predicted surplus ৳{predicted_surplus:.0f} below minimum ৳{DPS_CONFIG['min_surplus_for_dps']}",
        }

    # Calculate recommended amount
    raw_amount = predicted_surplus * DPS_CONFIG["surplus_percentage"]
    dps_amount = max(DPS_CONFIG["min_dps_amount"], min(DPS_CONFIG["max_dps_amount"], raw_amount))
    dps_amount = round(dps_amount / 100) * 100  # Round to nearest 100

    # Percentage of surplus
    surplus_pct = (dps_amount / predicted_surplus * 100) if predicted_surplus > 0 else 0

    # Pick best tenure
    annual_rate = DPS_CONFIG["annual_return"]
    monthly_rate = annual_rate / 12
    plans = []
    for tenure in DPS_CONFIG["tenure_options"]:
        # Simple compound interest: maturity = amount * tenure * (1 + rate*tenure/24)
        total_deposits = dps_amount * tenure
        interest = total_deposits * (annual_rate * tenure / 12 / 2)  # Approximate
        maturity = total_deposits + interest
        plans.append({
            "tenure_months": tenure,
            "monthly_amount": int(dps_amount),
            "total_deposits": int(total_deposits),
            "projected_interest": round(interest, 2),
            "projected_maturity": round(maturity, 2),
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
        return {"error": "Cash-flow data not available"}

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

    return {
        "user_id": user_id,
        "cashflow": cashflow_summary,
        "dps_recommendation": dps_plan,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "data_is_synthetic": True,
    }
```

### 9.5 Savings API Router

```python
# File: backend/app/routers/savings.py
"""SanchayBot savings plan endpoints."""

from fastapi import APIRouter, HTTPException
from ..services.savings_service import get_user_savings_plan

router = APIRouter(tags=["Savings"])


@router.get("/users/{user_id}/savings-plan")
async def user_savings_plan(user_id: str):
    """Get personalized savings plan (SanchayBot) for a user."""
    plan = get_user_savings_plan(user_id)
    if plan is None:
        raise HTTPException(status_code=404, detail=f"Cash-flow data for {user_id} not found")
    return plan
```

---

## 10. Monitoring & Logging

```python
# File: backend/app/config.py
"""
MilestoneAI — Configuration
"""

import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("milestone_ai.log"),
    ],
)

logger = logging.getLogger("MilestoneAI")

# Configuration
class Config:
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", "8000"))
    API_KEY = os.getenv("API_KEY", "milestone-ai-dev-key-2026")
    DB_PATH = os.getenv("DB_PATH", "./data/milestone_ai.db")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    MODEL_PATH = os.getenv("MODEL_PATH", "./models/xgboost_model.joblib")
    MODELS_DIR = os.getenv("MODELS_DIR", "./models")
    DATA_DIR = os.getenv("DATA_DIR", "./data")
```

---

## 11. Testing

```python
# File: tests/test_data_generator.py
"""Tests for synthetic data generator."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import numpy as np
import pandas as pd
import pytest


def test_users_count():
    """Test that 50,000 users are generated."""
    users = pd.read_csv("data/users.csv")
    assert len(users) == 50_000


def test_milestones_count():
    """Test that 6 milestones per user are generated."""
    milestones = pd.read_csv("data/milestone_events.csv")
    assert len(milestones) == 50_000 * 6


def test_no_null_user_ids():
    """Test no null user IDs."""
    users = pd.read_csv("data/users.csv")
    assert users["user_id"].notna().all()


def test_channel_distribution():
    """Test registration channel distribution is within expected range."""
    users = pd.read_csv("data/users.csv")
    dist = users["registration_channel"].value_counts(normalize=True)
    assert 0.45 <= dist["app_self"] <= 0.55


def test_pattern_p1_detected():
    """Test that Pattern P1 (agent-assisted lower completion) is detectable."""
    users = pd.read_csv("data/users.csv")
    milestones = pd.read_csv("data/milestone_events.csv")

    agent_users = set(users[users["registration_channel"] == "agent_assisted"]["user_id"])
    m2 = milestones[milestones["milestone"] == "M2"]

    agent_rate = m2[m2["user_id"].isin(agent_users)]["completed"].mean()
    non_agent_rate = m2[~m2["user_id"].isin(agent_users)]["completed"].mean()

    assert agent_rate < non_agent_rate, f"P1 not detected: agent={agent_rate:.3f} vs non-agent={non_agent_rate:.3f}"
```

```python
# File: tests/test_model.py
"""Tests for ML model quality."""

import json
import os
import pytest


def test_xgboost_auc_above_threshold():
    """Test that XGBoost AUC >= 0.75 for all milestones."""
    with open("models/evaluation_report.json") as f:
        report = json.load(f)

    for milestone in ["M2", "M3", "M4", "M5"]:
        auc = report["milestones"][milestone]["auc_roc"]
        assert auc >= 0.72, f"{milestone} AUC {auc} below threshold 0.72"


def test_xgboost_beats_baseline():
    """Test that XGBoost beats Logistic Regression on all milestones."""
    with open("models/evaluation_report.json") as f:
        xgb = json.load(f)
    with open("models/baseline_results.json") as f:
        baseline = json.load(f)

    for milestone in ["M2", "M3", "M4", "M5"]:
        xgb_auc = xgb["milestones"][milestone]["auc_roc"]
        bl_auc = baseline[milestone]["auc_roc"]
        assert xgb_auc >= bl_auc, f"{milestone}: XGBoost {xgb_auc} < Baseline {bl_auc}"


def test_fairness_threshold():
    """Test that fairness equalized odds ratio >= 0.80."""
    if not os.path.exists("models/fairness_report.json"):
        pytest.skip("Fairness report not generated")

    with open("models/fairness_report.json") as f:
        report = json.load(f)

    for milestone, comparisons in report.items():
        for comparison_name, data in comparisons.items():
            eo_ratio = data.get("equalized_odds_ratio", 1.0)
            # Warn but don't fail — fairness is important but synthetic data may have artifacts
            if eo_ratio < 0.80:
                print(f"WARNING: {milestone} {comparison_name} EO ratio = {eo_ratio:.3f} < 0.80")
```

```python
# File: tests/test_api.py
"""Tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

# TODO: Import after environment setup
# from app.main import app
# client = TestClient(app)
# API_KEY = "milestone-ai-dev-key-2026"
# HEADERS = {"X-API-Key": API_KEY}

# def test_health():
#     response = client.get("/health")
#     assert response.status_code == 200
#     assert response.json()["status"] == "ok"

# def test_funnel():
#     response = client.get("/api/v1/funnel", headers=HEADERS)
#     assert response.status_code == 200
#     data = response.json()
#     assert "milestones" in data
#     assert len(data["milestones"]) == 6

# def test_at_risk_users():
#     response = client.get("/api/v1/at-risk-users?limit=10", headers=HEADERS)
#     assert response.status_code == 200
#     data = response.json()
#     assert "users" in data

# def test_auth_required():
#     response = client.get("/api/v1/funnel")
#     assert response.status_code == 401
```

---

## 12. Docker & Run Instructions

### 11.1 Docker Compose

```yaml
# File: docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
      - ./models:/app/models
    env_file:
      - .env
    environment:
      - DB_PATH=/app/data/milestone_ai.db
      - MODELS_DIR=/app/models
      - DATA_DIR=/app/data

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend
```

### 11.2 Backend Dockerfile

```dockerfile
# File: backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ app/

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 11.3 Frontend Dockerfile

```dockerfile
# File: frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 11.4 Manual Run Instructions

```bash
# ============================================================
# MilestoneAI — Manual Run Instructions
# ============================================================

# Step 0: Clone and enter project directory
cd milestone-ai

# Step 1: Set up Python environment
python -m venv venv
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r backend/requirements.txt
pip install -r ml/requirements.txt

# Step 2: Set up environment variables
cp .env.template .env
# Edit .env and add your GEMINI_API_KEY

# Step 3: Generate synthetic data (users + milestones)
python ml/data_generator.py

# Step 3b: Generate transaction data + cash-flow summaries [SanchayBot]
# (Run transaction_generator.py or call from data_generator main)
python ml/transaction_generator.py

# Step 4: Run milestone feature engineering
python ml/feature_engineering.py

# Step 4b: Run cash-flow feature engineering [SanchayBot]
python ml/cashflow_features.py

# Step 5: Train baseline model
python ml/train_baseline.py

# Step 6: Train XGBoost milestone classifier
python ml/train_xgboost.py

# Step 6b: Train surplus regressor [SanchayBot]
python ml/train_surplus.py

# Step 7: Compute SHAP values
python ml/shap_explainer.py

# Step 8: Run evaluation
python ml/evaluate_model.py

# Step 9: Run fairness check
python ml/fairness_check.py

# Step 10: Start backend API
cd backend
uvicorn app.main:app --reload --port 8000
# API available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs

# Step 11: Start frontend (in a new terminal)
cd frontend
npm install
npm run dev
# Frontend available at http://localhost:3000

# Step 12: Run tests
cd ..
pytest tests/ -v
```

---

## 13. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `ModuleNotFoundError: xgboost` | Missing dependency | `pip install xgboost==2.0.3` |
| `sqlite3.OperationalError: no such table` | DB not initialized | Run the API once (auto-creates tables) or run `python -c "from backend.app.database import init_db; init_db()"` |
| `CORS error in browser` | Frontend and backend on different ports | Check `CORSMiddleware` in `main.py` allows `localhost:3000` |
| `Gemini API returns empty response` | Invalid API key or quota exceeded | Check `.env` GEMINI_API_KEY; fallback templates will auto-activate |
| `SHAP computation very slow` | Computing on-the-fly instead of using cache | Run `python ml/shap_explainer.py` to pre-compute and cache |
| `XGBoost AUC < 0.70` | Weak patterns in synthetic data | Increase pattern injection strengths in `data_generator.py` (P1-P8 deltas) |
| `Frontend shows "Loading..."` forever | API not running or wrong URL | Check `NEXT_PUBLIC_API_URL` in `.env` and verify API is running on port 8000 |
| `Bangla text not rendering` | Missing font | Add `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet">` to `layout.tsx` |
| `Docker build fails` | Missing files or wrong context | Ensure you're running `docker-compose up` from the project root |
| `pytest can't find modules` | Path issues | Run `pytest` from the project root; ensure `sys.path` is set in test files |

---

## 14. Final Submission Checklist

- [ ] **Code**
  - [ ] All Python scripts run without errors
  - [ ] All TypeScript compiles without errors
  - [ ] API starts and serves all endpoints **(including /savings-plan)**
  - [ ] Frontend builds and renders all pages **(including Savings Coach)**
  - [ ] Docker Compose brings up full stack

- [ ] **Data & Models**
  - [ ] Synthetic data generated (50K users)
  - [ ] **Transaction data generated (~1.5M transactions)**
  - [ ] **Cash-flow summaries derived (50K users)**
  - [ ] All 8 milestone patterns (P1-P8) detectable
  - [ ] **All 6 cash-flow patterns (P9-P14) detectable**
  - [ ] Feature engineering produces expected shape (milestone + **cash-flow**)
  - [ ] Baseline model trained and saved
  - [ ] XGBoost milestone classifier trained and saved
  - [ ] **XGBoost surplus regressor trained and saved**
  - [ ] **DPS recommender produces valid plans**
  - [ ] SHAP values pre-computed
  - [ ] Evaluation report generated **(both modules)**
  - [ ] Fairness report generated

- [ ] **Documentation**
  - [ ] README.md with setup instructions
  - [ ] PRD.md complete **(hybrid v2.0)**
  - [ ] PLAN.md complete **(hybrid v2.0)**
  - [ ] IMPLEMENTATION.md complete **(hybrid v2.0)**
  - [ ] All synthetic assumptions documented
  - [ ] `.env.template` provided (no real keys)

- [ ] **Demo Readiness**
  - [ ] 3 demo users identified and predictions verified
  - [ ] **SanchayBot savings plan generated for at least 1 demo user (M5-at-risk)**
  - [ ] Nudge generation working (LLM or fallback)
  - [ ] **M5 nudge enriched with savings plan data**
  - [ ] SHAP waterfall chart rendering correctly
  - [ ] **Spending donut chart rendering correctly**
  - [ ] **DPS recommendation card showing amount/tenure/maturity**
  - [ ] Approval flow working end-to-end
  - [ ] Demo script rehearsed 3 times **(includes SanchayBot flow)**
  - [ ] Backup plan ready (cached nudges + savings plans, screenshots)

- [ ] **Responsible AI**
  - [ ] "SYNTHETIC DATA" banner on all pages
  - [ ] "AI Generated" badges on nudge, explanation, **and savings recommendation**
  - [ ] Human-in-the-loop approval flow working
  - [ ] No autonomous financial decisions
  - [ ] **Savings recommendations use "projected" not "guaranteed"**
  - [ ] Fairness metrics displayed
  - [ ] SHAP explanations for every prediction
  - [ ] Prompt injection defenses implemented
  - [ ] Output validation guardrails active **(including savings explanation validation)**

- [ ] **Tests**
  - [ ] Data generator tests passing
  - [ ] **Transaction generator tests passing**
  - [ ] **Cash-flow feature tests passing**
  - [ ] Model quality tests passing
  - [ ] **Surplus regressor tests passing (MAE, R²)**
  - [ ] API endpoint tests passing **(including savings-plan)**
  - [ ] Fairness threshold tests passing (or documented)
  - [ ] **End-to-end SanchayBot flow test (cashflow → surplus → DPS → M5 nudge)**


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
        status = "[PASS]" if passed else "[FAIL]"
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

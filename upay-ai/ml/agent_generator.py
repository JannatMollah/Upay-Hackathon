"""
Upay AI — Synthetic Agent Point & Liquidity Data Generator
Generates realistic agent transaction data for liquidity forecasting.

ALL DATA IS SYNTHETIC. No real upay agent data is used.

Agent Patterns:
  - Urban agents: higher daily volume, more cash-out heavy
  - Rural agents: lower volume, payday spikes
  - RMG district agents: massive payday surges (garment worker salaries)
  - Market-day patterns: weekly cycle based on local market days
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
SEED = 42

# Agent configuration
N_AGENTS = 500
DAYS = 90  # 3 months of daily data

AREA_DIST = {"urban": 0.35, "peri_urban": 0.30, "rural": 0.35}
AGENT_TIERS = {"platinum": 0.10, "gold": 0.25, "silver": 0.40, "bronze": 0.25}

# Daily cash-out volume profiles (BDT)
VOLUME_PROFILES = {
    "urban":     {"base_cashout": 120000, "std": 40000, "cashin_ratio": 0.6},
    "peri_urban": {"base_cashout": 80000,  "std": 25000, "cashin_ratio": 0.5},
    "rural":     {"base_cashout": 45000,  "std": 15000, "cashin_ratio": 0.4},
}

# Float (available cash) profiles
FLOAT_PROFILES = {
    "platinum": {"float_capacity": 500000, "rebalance_freq": "daily"},
    "gold":     {"float_capacity": 300000, "rebalance_freq": "daily"},
    "silver":   {"float_capacity": 150000, "rebalance_freq": "weekly"},
    "bronze":   {"float_capacity": 80000,  "rebalance_freq": "weekly"},
}

# Day-of-week multipliers (Sun=0 in Bangladesh work week)
DOW_MULTIPLIERS = {
    0: 1.15,  # Sunday - start of work week
    1: 1.05,  # Monday
    2: 1.0,   # Tuesday
    3: 1.0,   # Wednesday
    4: 1.10,  # Thursday - pre-weekend
    5: 0.70,  # Friday - weekend
    6: 0.85,  # Saturday - half day
}


def generate_agents(rng):
    """Generate synthetic agent point data."""
    print("Generating agent points...")
    agents = []

    areas = list(AREA_DIST.keys())
    area_probs = list(AREA_DIST.values())
    tiers = list(AGENT_TIERS.keys())
    tier_probs = list(AGENT_TIERS.values())

    divisions = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Sylhet", "Rangpur", "Barishal", "Mymensingh"]
    rmg_districts = ["Gazipur", "Narayanganj", "Savar", "Ashulia", "Tongi"]

    for i in range(N_AGENTS):
        area = rng.choice(areas, p=area_probs)
        tier = rng.choice(tiers, p=tier_probs)
        division = rng.choice(divisions, p=[0.30, 0.20, 0.10, 0.10, 0.08, 0.08, 0.07, 0.07])
        is_rmg = rng.random() < 0.15 if area in ["urban", "peri_urban"] else False
        district = rng.choice(rmg_districts) if is_rmg else f"{division}_D{rng.integers(1, 6)}"

        float_cap = FLOAT_PROFILES[tier]["float_capacity"]
        # Add some noise to float capacity
        float_cap = int(float_cap * rng.uniform(0.8, 1.2))

        agents.append({
            "agent_id": f"AG{i:05d}",
            "area_type": area,
            "division": division,
            "district": district,
            "tier": tier,
            "is_rmg_zone": is_rmg,
            "float_capacity_bdt": float_cap,
            "rebalance_frequency": FLOAT_PROFILES[tier]["rebalance_freq"],
            "latitude": round(rng.uniform(20.5, 26.6), 4),
            "longitude": round(rng.uniform(88.0, 92.7), 4),
        })

    df = pd.DataFrame(agents)
    print(f"  Generated {len(df)} agent points")
    return df


def generate_daily_transactions(rng, agents):
    """Generate daily cash-in/cash-out volumes for each agent."""
    print(f"Generating {DAYS} days of daily transactions for {len(agents)} agents...")

    start_date = datetime(2026, 7, 1)
    records = []

    # Salary dates (common in Bangladesh): 1st, 5th, 10th, 15th of month
    salary_dates = {1, 5, 10, 15}

    for day_offset in range(DAYS):
        current_date = start_date + timedelta(days=day_offset)
        dow = current_date.weekday()  # Monday=0, Sunday=6
        day_of_month = current_date.day
        is_salary_day = day_of_month in salary_dates
        is_month_end = day_of_month >= 28

        dow_mult = DOW_MULTIPLIERS.get(dow, 1.0)

        for _, agent in agents.iterrows():
            profile = VOLUME_PROFILES[agent["area_type"]]
            base = profile["base_cashout"]
            std = profile["std"]

            # Base cash-out volume
            cashout = max(0, rng.normal(base, std))

            # Day-of-week effect
            cashout *= dow_mult

            # Salary day effect (+30-60%)
            if is_salary_day:
                salary_mult = 1.30 + rng.uniform(0, 0.30)
                cashout *= salary_mult

            # RMG zone salary surge (even bigger on salary days)
            if agent["is_rmg_zone"] and is_salary_day:
                cashout *= rng.uniform(1.4, 2.0)  # Massive surge

            # Month-end effect
            if is_month_end:
                cashout *= rng.uniform(1.1, 1.25)

            # Tier effect (higher tier = more volume)
            tier_mult = {"platinum": 1.5, "gold": 1.2, "silver": 1.0, "bronze": 0.7}
            cashout *= tier_mult.get(agent["tier"], 1.0)

            # Cash-in volume (fraction of cash-out)
            cashin = cashout * profile["cashin_ratio"] * rng.uniform(0.8, 1.2)

            # Net flow (negative = agent needs more cash)
            net_flow = cashin - cashout

            # Current float estimation
            float_cap = agent["float_capacity_bdt"]
            # Float depletes based on net flow
            current_float = max(0, float_cap + net_flow * rng.uniform(0.5, 1.0))

            # Liquidity status
            float_ratio = current_float / float_cap if float_cap > 0 else 0
            if float_ratio < 0.15:
                status = "critical"
            elif float_ratio < 0.30:
                status = "low"
            elif float_ratio < 0.60:
                status = "adequate"
            else:
                status = "healthy"

            # Transaction count (number of individual transactions)
            tx_count_out = max(1, int(cashout / rng.uniform(1000, 5000)))
            tx_count_in = max(1, int(cashin / rng.uniform(800, 3000)))

            records.append({
                "agent_id": agent["agent_id"],
                "date": current_date.strftime("%Y-%m-%d"),
                "day_of_week": dow,
                "day_of_month": day_of_month,
                "is_salary_day": is_salary_day,
                "is_month_end": is_month_end,
                "cash_out_volume": round(cashout, 2),
                "cash_in_volume": round(cashin, 2),
                "net_flow": round(net_flow, 2),
                "tx_count_out": tx_count_out,
                "tx_count_in": tx_count_in,
                "estimated_float": round(current_float, 2),
                "float_ratio": round(float_ratio, 4),
                "liquidity_status": status,
            })

    df = pd.DataFrame(records)
    print(f"  Generated {len(df)} daily records ({N_AGENTS} agents × {DAYS} days)")
    return df


def save_agent_data(agents, daily_data):
    """Save agent and liquidity data."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    agents.to_csv(os.path.join(OUTPUT_DIR, "agents.csv"), index=False)
    daily_data.to_csv(os.path.join(OUTPUT_DIR, "agent_daily.csv"), index=False)
    print(f"  agents.csv: {len(agents)} rows")
    print(f"  agent_daily.csv: {len(daily_data)} rows")


def main():
    print("=" * 60)
    print("Upay AI — Agent Liquidity Data Generator")
    print("=" * 60)

    rng = np.random.default_rng(SEED)
    agents = generate_agents(rng)
    daily = generate_daily_transactions(rng, agents)
    save_agent_data(agents, daily)

    # Summary stats
    print("\n--- Summary ---")
    print(f"  Agents: {len(agents)}")
    print(f"  Daily records: {len(daily)}")
    status_counts = daily["liquidity_status"].value_counts()
    for s in ["critical", "low", "adequate", "healthy"]:
        pct = status_counts.get(s, 0) / len(daily) * 100
        print(f"  {s}: {pct:.1f}%")
    print("\nAgent liquidity data generation complete!")


if __name__ == "__main__":
    main()

# Upay AI — A/B Test Design Document

> Addresses Judge 3: "Run controlled policy replay or an A/B test measuring incremental conversion, CAC saved, DPS completion, failed cash-outs, and revenue preserved."

---

## 1. Objective

Validate that Upay AI's ML-driven interventions produce **measurable incremental outcomes** over existing campaign baselines.

## 2. Experiment Design

### Experiment A: Activation Nudge Effectiveness

| Parameter | Control Group | Treatment Group |
|:---|:---|:---|
| **Targeting** | Random 30% of new users | Top 30% at-risk (XGBoost score < 0.5) |
| **Nudge Content** | Generic SMS: "Complete your milestones!" | SHAP-personalized Bangla nudge |
| **Sample Size** | 5,000 users | 5,000 users |
| **Duration** | 30 days (campaign window) | 30 days |
| **Randomization** | Hash-based (user_id % 2 == 0) | Hash-based (user_id % 2 == 1) |

**Primary Metrics:**
- M2-M5 milestone completion rate (incremental conversion)
- Cost per converted user (CAC)
- Full funnel completion rate (M6)

**Secondary Metrics:**
- Nudge CTR (click-through rate)
- Time-to-milestone-completion
- Nudge fatigue rate (dismiss/block rate)

**Statistical Requirements:**
- Minimum detectable effect: 5 percentage points
- Significance level: α = 0.05
- Power: 1 - β = 0.80
- Required sample: ~1,600 per group (for 5pp MDE at 35% baseline)

### Experiment B: DPS Adoption via SanchayBot

| Parameter | Control | Treatment |
|:---|:---|:---|
| **Nudge Type** | Generic: "Open a DPS today!" | Surplus-aware: "Save ৳{amount}/month, get ৳{maturity} in 12 months" |
| **Targeting** | All M5-eligible users | M5-eligible + surplus > ৳500 |
| **Sample** | 2,000 users | 2,000 users |

**Primary Metrics:**
- DPS account opening rate
- Average monthly DPS contribution
- DPS retention at 3 months

### Experiment C: Agent Liquidity Forecast

| Parameter | Control | Treatment |
|:---|:---|:---|
| **Alert System** | No proactive alerts | ML forecast alerts (critical/warning) |
| **Agents** | 250 agents (random) | 250 agents (random) |
| **Duration** | 60 days (2 salary cycles) |

**Primary Metrics:**
- Failed cash-out transactions (stockout events)
- Agent float utilization efficiency
- Customer satisfaction (NPS at agent point)

## 3. Guardrails

- **Do-no-harm**: If treatment group shows >5% degradation in any primary metric, auto-halt experiment
- **Fairness**: Monitor equalized odds across gender/geography during experiment
- **Budget cap**: Maximum ৳200,000 in nudge delivery costs per experiment

## 4. Current Status (Phase 1)

| Validation Method | Status | Evidence |
|:---|:---|:---|
| **Offline Backtest** | ✅ Implemented | `ml/backtest.py` — policy replay on test data |
| **Ablation Study** | ✅ Implemented | `ml/ablation_study.py` — 4-stage incremental value |
| **Live A/B Test** | 🔲 Planned | Requires production deployment with upay's user base |
| **Causal Inference** | 🔲 Future | Uplift modeling / counterfactual analysis |

## 5. Honest Assessment

The following claims from Phase 1 are **projections pending A/B validation**:

| Claim | Phase 1 Status | Required Evidence |
|:---|:---|:---|
| +15pp activation improvement | ❌ Assumption | A/B test incremental conversion |
| +15pp DPS adoption | ❌ Assumption | A/B test DPS opening rate |
| 85% stockout reduction | ❌ Assumption | Agent experiment stockout comparison |
| ৳1,260/year fee savings | ⚠️ Calculated | Validate actual user cash-out behavior change |

> These projections are based on model precision and targeting lift measured in offline backtesting.
> They do NOT demonstrate that an AI nudge **causes** activation, that a DPS recommendation
> **causes** saving behavior, or that forecasting **actually reduces** stockouts.

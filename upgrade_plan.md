# 🚀 Upay AI — Architecture Upgrade Plan

## Vision: Single-Tool → Multi-Tool AI Platform

```
BEFORE: "MilestoneAI" (confusing, milestone-centric)
 └── Single dashboard with M1, M2, M3... jargon

AFTER: "Upay AI" (clear, multi-tool platform)
 ├── 🎯 Tool 1: Activation Predictor (Track 04 — Campaign Intelligence)
 ├── 💰 Tool 2: DPS Coach (Track 03 — Financial Independence)
 └── 📊 Tool 3: Agent Liquidity Forecast (Track 05 — Merchant & Agent Intelligence)
```

> **3 hackathon tracks covered** instead of 1 — massively stronger entry.

---

## 1. Naming & Branding Changes

| Before | After | Why |
|--------|-------|-----|
| `milestone-ai/` folder | `upay-ai/` folder | Platform name, not single-tool |
| "MilestoneAI" | "Upay AI" | Already done in header |
| "SanchayBot" | **DPS Coach** | Clear, understandable |
| M1, M2, M3... jargon | Human-readable step names | "PIN Setup", "First Recharge", etc. |
| "Milestone Completion Predictor" | **Activation Predictor** | Clearer purpose |
| N/A (new) | **Agent Liquidity Forecast** | New tool |
| "Funnel Dashboard" | **AI Tools Hub** | Landing page shows all 3 tools |

---

## 2. UX Architecture Overhaul

### Landing Page: AI Tools Hub (new `/`)
Instead of jumping straight into a funnel chart, the landing page is a **tool selector hub**:

```
┌─────────────────────────────────────────────────────────┐
│  🏠 Upay AI — Intelligent MFS Operations Platform       │
│  "3 AI-powered tools for smarter financial services"    │
├───────────────┬──────────────────┬───────────────────────┤
│ 🎯 Activation │ 💰 DPS Coach     │ 📊 Agent Liquidity   │
│ Predictor     │                  │ Forecast             │
│               │ Analyze cash-    │                      │
│ Predict user  │ flow & recommend │ Predict cash demand  │
│ drop-offs in  │ personalized     │ at agent points to   │
│ the 6-step    │ DPS savings      │ prevent shortages    │
│ onboarding    │ plans            │                      │
│ campaign      │                  │                      │
│ [Open Tool →] │ [Open Tool →]   │ [Open Tool →]        │
├───────────────┴──────────────────┴───────────────────────┤
│ Platform KPIs: 50K Users | 3 AI Models | 39 Tests Pass  │
└─────────────────────────────────────────────────────────┘
```

### Page Structure

| Route | Purpose | Before |
|-------|---------|--------|
| `/` | **AI Tools Hub** — card grid to pick a tool | Was: funnel dashboard |
| `/activation` | **Activation Predictor** — funnel + at-risk table + user detail | Was: `/` (homepage) |
| `/activation/[id]` | User detail (prediction + SHAP + nudge) | Was: `/users/[id]` |
| `/dps-coach` | **DPS Coach** — cashflow analysis + DPS plans | Was: `/savings` |
| `/liquidity` | **Agent Liquidity Forecast** — agent demand prediction (NEW) | N/A |
| `/performance` | Model metrics & fairness (all 3 models) | Same |

### UX Clarity Fixes
- Replace all "M1", "M2" etc. with **full descriptive names** (e.g. "Step 1: PIN Setup")
- Add **context cards** explaining what each step means and why it matters
- Add **tooltips** on technical terms (AUC, SHAP, Brier)
- Show the **6-step campaign flow** visually with icons, not just codes

---

## 3. Folder Restructure

```diff
 d:\Upay-Hackathon\
-  milestone-ai/           →  upay-ai/
+  upay-ai/
   ├── backend/
   │   ├── app/
   │   │   ├── routers/
-  │   │   │   ├── funnel.py
-  │   │   │   ├── users.py
-  │   │   │   ├── savings.py
+  │   │   │   ├── activation.py      (merged funnel + users)
+  │   │   │   ├── dps_coach.py       (renamed savings)
+  │   │   │   ├── liquidity.py       (NEW)
   │   │   │   ├── nudges.py
   │   │   │   ├── metrics.py
   │   │   │   └── traces.py
   │   │   ├── services/
-  │   │   │   ├── prediction_service.py
-  │   │   │   ├── savings_service.py
+  │   │   │   ├── activation_service.py  (renamed)
+  │   │   │   ├── dps_service.py         (renamed)
+  │   │   │   ├── liquidity_service.py   (NEW)
   │   │   │   ├── nudge_service.py
   │   │   │   ├── rules_engine.py
   │   │   │   └── trace_service.py
   ├── ml/
+  │   ├── agent_generator.py         (NEW — agent point data)
+  │   ├── train_liquidity.py         (NEW — demand model)
   │   ├── data_generator.py
   │   ├── transaction_generator.py
   │   └── ...
   ├── frontend/
   │   ├── src/
   │   │   ├── app/
-  │   │   │   ├── page.tsx           (was: dashboard)
+  │   │   │   ├── page.tsx           (NEW: AI Tools Hub)
+  │   │   │   ├── activation/
+  │   │   │   │   ├── page.tsx       (funnel + at-risk)
+  │   │   │   │   └── [id]/page.tsx  (user detail)
-  │   │   │   ├── savings/
+  │   │   │   ├── dps-coach/
   │   │   │   │   └── page.tsx
+  │   │   │   ├── liquidity/         (NEW)
+  │   │   │   │   └── page.tsx
-  │   │   │   ├── users/[id]/
   │   │   │   └── performance/
   │   │   ├── components/
+  │   │   │   ├── ToolCard.tsx       (NEW — hub card)
+  │   │   │   ├── AgentMap.tsx       (NEW — agent grid)
+  │   │   │   ├── LiquidityChart.tsx (NEW — demand chart)
+  │   │   │   ├── CampaignSteps.tsx  (NEW — visual 6-step)
   │   │   │   └── ... (existing)
   ├── tests/
+  │   ├── test_liquidity.py          (NEW)
   │   └── ...
```

---

## 4. Tool 3: Agent Liquidity Forecast (NEW)

### Problem
upay agents are physical points where users cash-in and cash-out. Agents frequently:
- **Run out of cash** during peak hours (can't serve cash-out requests)
- **Hold too much idle cash** during off-peak (opportunity cost)
- **No prediction system** — they rely on gut feeling

### Solution: AI-Powered Demand Forecasting

**Data**: Synthetic agent transaction data
- 500 agent points across Bangladesh (urban/rural/peri-urban)
- Daily cash-in/cash-out volumes
- Time-of-day, day-of-week, payday patterns
- Area demographics (RMG districts, urban hubs, rural markets)

**Model**: XGBoost Regressor
- Predict next-day cash-out demand per agent
- Features: historical volume, day-of-week, area type, salary cycle proximity
- Alert agents when predicted demand > current float

**UI**: Agent Dashboard
- Grid of agents with liquidity status (🟢 OK / 🟡 Low / 🔴 Critical)
- Demand forecast chart (next 7 days)
- Top-10 agents likely to face liquidity crunch
- Recommended rebalancing actions

### Hackathon Track Alignment
**Track 05: Merchant & Agent Intelligence** — "Agent liquidity forecasting: predict future cash-out demand and likely liquidity pressure."

---

## 5. PRD Updates

### Key Fixes
1. **Remove "milestone" jargon** from user-facing text
2. **Add clear campaign context** — explain the 6-step bonus campaign to judges
3. **Platform vision** — "Upay AI" as an extensible AI toolkit, not a single model
4. **Add Tool 3 (Agent Liquidity)** requirements
5. **Fix UX section** — tool hub, clearer navigation, contextual help
6. **Multi-track coverage** — explicitly state Tracks 03, 04, 05

---

## 6. Execution Order

| Step | Task | Risk |
|------|------|------|
| 1 | Rename `milestone-ai/` → `upay-ai/` | Low (git mv) |
| 2 | Update PRD.md with new scope + Tool 3 | Low |
| 3 | Create Agent Liquidity ML pipeline (data gen + model) | Medium |
| 4 | Create Liquidity API endpoints | Low |
| 5 | Build new landing page (AI Tools Hub) | Medium |
| 6 | Move dashboard to `/activation`, rename routes | Medium |
| 7 | Rename savings → DPS Coach everywhere | Low |
| 8 | Replace M1-M6 codes with descriptive names in UI | Low |
| 9 | Create Liquidity frontend page | Medium |
| 10 | Update all tests, README, docs | Low |
| 11 | Run full test suite, verify build | Low |

---

## 7. What Judges Will See

```
"Upay AI isn't just one model — it's a platform with 3 AI-powered tools
 covering 3 hackathon tracks. Each tool solves a real MFS problem."

 🎯 Activation Predictor → Campaign Intelligence (Track 04)
    "Predicts which new users will drop off in the 6-step bonus campaign"

 💰 DPS Coach → Financial Independence (Track 03)  
    "Analyzes cash-flow and recommends personalized DPS savings plans"

 📊 Agent Liquidity Forecast → Merchant & Agent Intelligence (Track 05)
    "Predicts cash demand at agent points to prevent liquidity shortages"
```

> Shall I proceed with execution?

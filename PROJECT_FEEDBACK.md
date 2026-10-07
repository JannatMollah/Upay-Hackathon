# DIU Hackathon

### **Problem relevance**

#### Phase 1 Comments:

JUDGE 1

"Targets three clearly defined MFS challenges: customer retention, savings adoption, and agent liquidity."

JUDGE 2

"Addresses specific upay/MFS problems with clear users and measurable objectives. Claimed problem frequencies and customer needs lack documented empirical or user validation."

JUDGE 3

"Narrow the product around one primary business problem before claiming a unified three-track solution. Activation drop-off, DPS adoption, and agent liquidity are individually relevant, but the causal connection between all three is largely hypothesized rather than demonstrated. Validate each problem with independent evidence and prioritize the KPI with the strongest measurable economic value."

### **AI/ML depth**

#### Phase 1 Comments:

JUDGE 1

"Specifies XGBoost, SHAP, forecasting, and metrics, but validation methods and synthetic-data generalization remain unclear."

JUDGE 2

"Activation and liquidity XGBoost models are implemented and their metrics reproduce. Surplus ML reconstructs an available calculation and is bypassed by the API; dropout recall is misinterpreted and seven-day forecasting lacks temporal validation."

JUDGE 3

"Strengthen the ML evaluation by eliminating synthetic-target shortcuts and temporal leakage. The DPS surplus target is directly calculated as monthly income minus monthly expenses, while those underlying quantities are available as model features, making the reported R²=0.9986 largely a reconstruction task rather than difficult forecasting. The agent forecaster also uses a random train/test split across temporal observations, so future-period information can influence training; replace it with chronological/rolling-origin evaluation and report MAE/RMSE by peak salary periods."

### **Business/customer impact**

#### Phase 1 Comments:

JUDGE 1

"Reports measurable benefits across three use cases, but adoption gains and stockout reductions need supporting evidence."

JUDGE 2

"Provides explicit KPIs and scenario calculations, but no measured conversion, savings-behavior or stockout improvement. Claimed impact percentages are assumptions rather than demonstrated outcomes."

JUDGE 3

"Replace the projected +15pp activation, +15pp DPS adoption, and 85% stockout reduction with experimentally measured incremental outcomes. The current economics extrapolate expected improvements from synthetic predictions; they do not demonstrate that an AI nudge causes activation, that a DPS recommendation causes saving behavior, or that forecasting actually reduces stockouts. Run controlled policy replay or an A/B test measuring incremental conversion, CAC saved, DPS completion, failed cash-outs, and revenue preserved."

### **Prototype quality**

#### Phase 1 Comments:

JUDGE 1

"Names a concrete implementation stack, but working workflows and reliability require demo verification."

JUDGE 2

"Functional and polished prototype with separate working modules and good visualization. Some flows still appear demo-oriented rather than production-ready."

JUDGE 3

"Preserve the strong multi-module implementation, serialized models, FastAPI services, SHAP explanations, dashboards, database traces, and automated test structure. Strengthen runtime correctness around edge cases: the prediction service uses precomputed test/train/validation datasets for user lookup, while M1/M6 “risk” handling contains fixed probabilities rather than trained predictions; clearly label these as demo rules instead of ML outputs."

### **Innovation**

#### Phase 1 Comments:

JUDGE 1

"Integrates complementary predictive and advisory tools into a coordinated MFS platform."

JUDGE 2

"Good integration of customer activation, savings recommendation, and agent liquidity forecasting in one MFS platform."

JUDGE 3

"Prove that the three-tool “synergistic triad” creates value beyond three independent dashboards. Run ablations such as generic campaign → XGBoost targeting → XGBoost+SHAP nudge → XGBoost+SHAP+DPS personalization, and separately compare liquidity forecasting against seasonal/last-week baselines. The architecture is novel at the product level, but the claimed cross-tool flywheel currently lacks measured incremental benefit."

### **Scalability & integration**

#### Phase 1 Comments:

JUDGE 1

"Describes API-based architecture and a 500-agent forecasting scope, but live integration and load testing are unverified."

JUDGE 2

"Good technology stack and scalable concept, but actual integration with Upay's live systems is not demonstrated."

JUDGE 3

"Demonstrate production scalability rather than relying on Docker, cached .joblib models, and claimed sub-15ms inference. Add p95/p99 latency under concurrent load, database throughput, model versioning, drift monitoring, scheduled retraining, event-time ingestion, and failure recovery. Kafka/Core Banking integration is currently a future deployment pathway, not an implemented integration."

### **Responsible AI & security**

#### Phase 1 Comments:

JUDGE 1

"Mentions synthetic data and Equalized Odds, but fairness results, access controls, and security testing are absent."

JUDGE 2

"SHAP, fairness consideration, and synthetic data are positive. Security, consent, and production-level governance need more evidence."

JUDGE 3

"Fix critical security defects before claiming production readiness: the repository contains a hard-coded Supabase database credential, a default API key, wildcard CORS with credentials, and API-key middleware that accepts an empty x-api-key, effectively making protected routes callable without authentication. The nudge approval endpoint also accepts an arbitrary approver_id without demonstrated authorization. Remove exposed credentials, require authentication rather than optional API keys, enforce RBAC for analyst actions, restrict CORS, rotate the leaked database credential, and add authorization/audit tests."
"""
MilestoneAI + SanchayBot — Pydantic Request/Response Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


# ===== Module A: MilestoneAI Schemas =====

class MilestoneProb(BaseModel):
    completion_prob: float
    at_risk: bool


class ShapFeature(BaseModel):
    name: str
    value: float
    shap: float
    direction: str  # 'increases_risk' | 'decreases_risk'


class Explanation(BaseModel):
    type: str = "shap_waterfall"
    base_value: Optional[float] = None
    features: list[ShapFeature] = []


class Nudge(BaseModel):
    nudge_id: str
    target_milestone: str
    bonus_amount_bdt: int
    text_bn: str
    text_en: str
    channel_recommendation: str
    status: str = "pending_approval"
    ai_generated: bool = True
    guardrail_passed: bool = True
    generation_method: Optional[str] = "gemini"


class PredictionResponse(BaseModel):
    user_id: str
    prediction_id: str
    timestamp: str
    milestone_probabilities: dict[str, MilestoneProb]
    primary_drop_off: Optional[str] = None
    explanation: Optional[Explanation] = None
    nudge: Optional[Nudge] = None
    data_is_synthetic: bool = True


class AtRiskUser(BaseModel):
    user_id: str
    drop_off_milestone: str
    drop_off_probability: float
    nudge_eligible: bool = True


class AtRiskResponse(BaseModel):
    milestone_filter: Optional[str] = None
    total_at_risk: int
    users: list[AtRiskUser]
    data_is_synthetic: bool = True


class MilestoneStat(BaseModel):
    milestone: str
    name_en: str
    name_bn: str
    completed_count: int
    rate: float


class FunnelResponse(BaseModel):
    total_users: int
    milestones: list[MilestoneStat]
    data_is_synthetic: bool = True


class NudgeApproveRequest(BaseModel):
    action: str = Field(..., description="'approved' or 'rejected'")
    approver_id: str = "CM001"
    modified_text_bn: Optional[str] = None
    modified_text_en: Optional[str] = None


class NudgeApproveResponse(BaseModel):
    nudge_id: str
    status: str
    approved_by: str
    approved_at: str
    data_is_synthetic: bool = True


# ===== Module B: SanchayBot Schemas =====

class CashFlowSummary(BaseModel):
    user_id: str
    monthly_income: float
    monthly_expenses: float
    monthly_surplus: float
    cash_out_amount: float
    cash_out_ratio: float
    top_expense_category: str
    savings_rate: float
    tx_count: int


class DPSPlan(BaseModel):
    tenure_months: int
    monthly_amount: int
    total_deposits: int
    projected_interest: float
    projected_maturity: float


class DPSRecommendation(BaseModel):
    eligible: bool
    predicted_surplus: float
    recommended_plan: Optional[DPSPlan] = None
    surplus_percentage_used: float = 0.0
    all_plans: list[DPSPlan] = []
    free_cashout_channel: str = "UCB ATM"
    disclaimer: str = "Projections are indicative based on prevailing profit rates."
    reason: Optional[str] = None


class SavingsPlanResponse(BaseModel):
    user_id: str
    cashflow: CashFlowSummary
    dps_recommendation: DPSRecommendation
    nudge_text_bn: Optional[str] = None
    nudge_text_en: Optional[str] = None
    generated_at: str
    data_is_synthetic: bool = True


# ===== Metrics & Traces Schemas =====

class ModelMetricsResponse(BaseModel):
    model_version: str
    overall_auc_roc: float
    overall_brier: float
    milestones: dict[str, Any]
    data_is_synthetic: bool = True


class FairnessResponse(BaseModel):
    fairness_report: dict[str, Any]
    fairness_threshold: float = 0.80
    data_is_synthetic: bool = True


class TraceItem(BaseModel):
    trace_id: int
    prediction_id: Optional[str] = None
    nudge_id: Optional[str] = None
    user_id: Optional[str] = None
    action: str
    details: Optional[str] = None
    actor: Optional[str] = None
    timestamp: str

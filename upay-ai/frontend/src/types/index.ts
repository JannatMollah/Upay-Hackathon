export interface MilestoneStat {
  milestone: string;
  name_en: string;
  name_bn: string;
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
  generation_method?: string;
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
  data_is_synthetic: boolean;
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
  recommended_plan?: DPSPlan;
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
  nudge_text_bn?: string;
  nudge_text_en?: string;
  generated_at: string;
  data_is_synthetic: boolean;
}

export interface FairnessGroup {
  group: string;
  n: number;
  positive_rate: number;
  predicted_positive_rate: number;
  tpr: number;
  fpr: number;
  auc_roc: number;
}

export interface FairnessComparison {
  group_a: FairnessGroup;
  group_b: FairnessGroup;
  equalized_odds_ratio: number;
  passed: boolean;
}

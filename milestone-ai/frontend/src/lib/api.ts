import {
  FunnelResponse,
  AtRiskResponse,
  PredictionResponse,
  SavingsPlanResponse,
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'milestone-ai-dev-key-2026';

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        ...options?.headers,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Fetch error at ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  getFunnel: () => apiFetch<FunnelResponse>('/funnel'),

  getAtRiskUsers: (milestone?: string, limit = 50, offset = 0) => {
    const params = new URLSearchParams();
    if (milestone) params.set('milestone', milestone);
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    return apiFetch<AtRiskResponse>(`/at-risk-users?${params}`);
  },

  getUserPrediction: (userId: string) =>
    apiFetch<PredictionResponse>(`/users/${userId}/prediction`),

  getUserSavingsPlan: (userId: string) =>
    apiFetch<SavingsPlanResponse>(`/users/${userId}/savings-plan`),

  approveNudge: (nudgeId: string, action: string, approver = 'CM001', modifiedTextBn?: string) =>
    apiFetch<{ nudge_id: string; status: string; approved_at: string; approved_by: string }>(
      `/nudges/${nudgeId}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({
          action,
          approver_id: approver,
          modified_text_bn: modifiedTextBn,
        }),
      }
    ),

  getModelMetrics: () => apiFetch<any>('/model/metrics'),

  getModelFairness: () => apiFetch<any>('/model/fairness'),

  getTraces: (limit = 50, userId?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (userId) params.set('user_id', userId);
    return apiFetch<{ traces: any[]; total: number }>(`/traces?${params}`);
  },
};

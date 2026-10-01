'use client';

import React, { useState } from 'react';
import { SavingsPlanResponse } from '../types';
import { Language, t } from '../lib/i18n';
import { SpendingDonut } from './SpendingDonut';
import { SavingsGrowthChart } from './SavingsGrowthChart';
import { PiggyBank, ArrowDownRight, Wallet, ShieldAlert, Award, Sparkles, Check } from 'lucide-react';

interface SanchayBotPanelProps {
  savingsData: SavingsPlanResponse | null;
  lang: Language;
}

export const SanchayBotPanel: React.FC<SanchayBotPanelProps> = ({ savingsData, lang }) => {
  const [selectedTenure, setSelectedTenure] = useState<number>(12);

  if (!savingsData || !savingsData.cashflow) {
    return (
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
          {t('sanchay.title', lang)}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          {lang === 'bn' ? 'ক্যাশ-ফ্লো ডেটা লোড হচ্ছে...' : 'Loading cash-flow and savings analysis...'}
        </p>
      </div>
    );
  }

  const { cashflow, dps_recommendation } = savingsData;
  const recommendedPlan = dps_recommendation.recommended_plan;
  const currentPlan =
    dps_recommendation.all_plans?.find((p) => p.tenure_months === selectedTenure) || recommendedPlan;

  const isHighCashOut = cashflow.cash_out_ratio >= 0.40;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        border: '1px solid rgba(0, 210, 180, 0.25)',
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(0, 210, 180, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00d2b4',
            }}
          >
            <PiggyBank size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
              {t('sanchay.title', lang)}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {t('sanchay.subtitle', lang)}
            </p>
          </div>
        </div>

        <span className="badge badge-brand">
          <Sparkles size={11} />
          AI Savings Coach
        </span>
      </div>

      {/* Cashflow Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>{t('sanchay.income', lang)}</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
            ৳{cashflow.monthly_income.toLocaleString()}
          </p>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>{t('sanchay.expenses', lang)}</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f43f5e' }}>
            ৳{cashflow.monthly_expenses.toLocaleString()}
          </p>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>{t('sanchay.surplus', lang)}</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: cashflow.monthly_surplus >= 0 ? '#34d399' : '#fb7185' }}>
            ৳{cashflow.monthly_surplus.toLocaleString()}
          </p>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>{t('sanchay.cashout_ratio', lang)}</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>
            {(cashflow.cash_out_ratio * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* High Cash-Out Warning / Financial Opportunity Banner */}
      {isHighCashOut && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <ShieldAlert size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div style={{ fontSize: '0.84rem', color: '#fbbf24', lineHeight: 1.5 }}>
            <strong>{lang === 'bn' ? 'সঞ্চয় সুযোগ শনাক্ত:' : 'High Cash-Out Pattern Detected:'}</strong>{' '}
            {lang === 'bn'
              ? `এই গ্রাহক খরচের ${(cashflow.cash_out_ratio * 100).toFixed(0)}% ক্যাশ আউট করেন। ডিপিএস ও মার্চেন্ট পেমেন্টে ক্যাশ-আউট চার্জ বেঁচে যাবে এবং সঞ্চয় বাড়বে!`
              : `User cashes out ${(cashflow.cash_out_ratio * 100).toFixed(0)}% of expenses. Transitioning surplus to upay DPS avoids cash-out fees and builds compound returns!`}
          </div>
        </div>
      )}

      {/* Main Breakdown: Spending Donut + DPS Plan recommendation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Spending Donut */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginBottom: '14px' }}>
            {lang === 'bn' ? 'ব্যয়ের বিভাজন (Expense Breakdown)' : 'Monthly Spending Distribution'}
          </h4>
          <SpendingDonut cashflow={cashflow} lang={lang} />
        </div>

        {/* Recommended DPS Plan Card */}
        {dps_recommendation.eligible && currentPlan ? (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 28, 48, 0.9) 0%, rgba(12, 36, 44, 0.9) 100%)',
              padding: '18px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 210, 180, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge badge-brand">
                  <Award size={12} />
                  {lang === 'bn' ? 'উপযুক্ত ডিপিএস স্কিম' : 'Personalized DPS Recommendation'}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {currentPlan.tenure_months} Months Plan
                </span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('sanchay.recommended_dps', lang)}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
                    ৳{currentPlan.monthly_amount.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#00d2b4', fontWeight: 600 }}>
                    {t('sanchay.per_month', lang)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>{lang === 'bn' ? 'মোট সঞ্চয় আসল:' : 'Total Principal:'}</span>
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>৳{currentPlan.total_deposits.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>{lang === 'bn' ? 'প্রত্যাশিত মুনাফা:' : 'Est. Interest (5% p.a.):'}</span>
                  <span style={{ fontWeight: 600, color: '#34d399' }}>+৳{Math.round(currentPlan.projected_interest).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{t('sanchay.maturity_value', lang)}:</span>
                  <span style={{ fontWeight: 800, color: '#00d2b4' }}>৳{Math.round(currentPlan.projected_maturity).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Free cashout highlight from upay PRD */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.78rem',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '6px 10px',
                borderRadius: '6px',
              }}
            >
              <Check size={14} />
              <span>{t('sanchay.free_cashout', lang)}</span>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              {dps_recommendation.reason || 'Surplus insufficient for DPS.'}
            </p>
          </div>
        )}
      </div>

      {/* Wealth Growth Interactive Chart */}
      {dps_recommendation.eligible && dps_recommendation.all_plans && (
        <SavingsGrowthChart
          plans={dps_recommendation.all_plans}
          selectedTenure={selectedTenure}
          onSelectTenure={setSelectedTenure}
          lang={lang}
        />
      )}
    </div>
  );
};

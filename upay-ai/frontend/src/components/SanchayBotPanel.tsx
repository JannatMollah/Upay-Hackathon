'use client';

import React, { useState } from 'react';
import { SavingsPlanResponse } from '../types';
import { Language, t } from '../lib/i18n';
import { SpendingDonut } from './SpendingDonut';
import { SavingsGrowthChart } from './SavingsGrowthChart';
import { PiggyBank, ShieldAlert, Award, Sparkles, Check } from 'lucide-react';

interface SanchayBotPanelProps {
  savingsData: SavingsPlanResponse | null;
  lang: Language;
}

export const SanchayBotPanel: React.FC<SanchayBotPanelProps> = ({ savingsData, lang }) => {
  const [selectedTenure, setSelectedTenure] = useState<number>(12);

  if (!savingsData || !savingsData.cashflow) {
    return (
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {t('sanchay.title', lang)}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
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
        padding: '24px 28px',
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-success)',
            }}
          >
            <PiggyBank size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('sanchay.title', lang)}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {t('sanchay.subtitle', lang)}
            </p>
          </div>
        </div>

        <span className="badge badge-brand">
          <Sparkles size={10} />
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
        {[
          { label: t('sanchay.income', lang), value: `৳${cashflow.monthly_income.toLocaleString()}`, color: 'var(--upay-blue)' },
          { label: t('sanchay.expenses', lang), value: `৳${cashflow.monthly_expenses.toLocaleString()}`, color: 'var(--color-danger)' },
          { label: t('sanchay.surplus', lang), value: `৳${cashflow.monthly_surplus.toLocaleString()}`, color: cashflow.monthly_surplus >= 0 ? 'var(--color-success)' : 'var(--color-danger)' },
          { label: t('sanchay.cashout_ratio', lang), value: `${(cashflow.cash_out_ratio * 100).toFixed(0)}%`, color: 'var(--color-warning)' },
        ].map((item, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-subtle)',
            padding: '14px 16px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
          }}>
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.03em',
            }}>
              {item.label}
            </span>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: item.color, marginTop: '4px' }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* High Cash-Out Warning */}
      {isHighCashOut && (
        <div
          style={{
            background: 'var(--color-warning-bg)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <ShieldAlert size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--color-warning)' }}>
              {lang === 'bn' ? 'সঞ্চয় সুযোগ শনাক্ত:' : 'High Cash-Out Pattern Detected:'}
            </strong>{' '}
            {lang === 'bn'
              ? `এই গ্রাহক খরচের ${(cashflow.cash_out_ratio * 100).toFixed(0)}% ক্যাশ আউট করেন। ডিপিএস ও মার্চেন্ট পেমেন্টে ক্যাশ-আউট চার্জ বেঁচে যাবে এবং সঞ্চয় বাড়বে!`
              : `User cashes out ${(cashflow.cash_out_ratio * 100).toFixed(0)}% of expenses. Transitioning surplus to upay DPS avoids cash-out fees and builds compound returns!`}
          </div>
        </div>
      )}

      {/* Spending Donut + DPS Plan */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
      }}>
        {/* Spending Donut */}
        <div style={{
          background: 'var(--bg-subtle)',
          padding: '18px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
        }}>
          <h4 style={{
            fontSize: '0.88rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '14px',
          }}>
            {lang === 'bn' ? 'ব্যয়ের বিভাজন' : 'Monthly Spending Distribution'}
          </h4>
          <SpendingDonut cashflow={cashflow} lang={lang} />
        </div>

        {/* DPS Plan Card */}
        {dps_recommendation.eligible && currentPlan ? (
          <div
            style={{
              background: 'var(--bg-white)',
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}>
                <span className="badge badge-success">
                  <Award size={11} />
                  {lang === 'bn' ? 'উপযুক্ত ডিপিএস স্কিম' : 'Recommended DPS'}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {currentPlan.tenure_months} {lang === 'bn' ? 'মাস' : 'Months'}
                </span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {t('sanchay.recommended_dps', lang)}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                  <span style={{
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                  }}>
                    ৳{currentPlan.monthly_amount.toLocaleString()}
                  </span>
                  <span style={{
                    fontSize: '0.82rem',
                    color: 'var(--color-success)',
                    fontWeight: 600,
                  }}>
                    {t('sanchay.per_month', lang)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '12px',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  marginBottom: '6px',
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {lang === 'bn' ? 'মোট সঞ্চয় আসল:' : 'Total Principal:'}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    ৳{currentPlan.total_deposits.toLocaleString()}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  marginBottom: '6px',
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {lang === 'bn' ? 'প্রত্যাশিত মুনাফা:' : 'Est. Interest (5% p.a.):'}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                    +৳{Math.round(currentPlan.projected_interest).toLocaleString()}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.88rem',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '8px',
                  marginTop: '4px',
                }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t('sanchay.maturity_value', lang)}:
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--color-success)' }}>
                    ৳{Math.round(currentPlan.projected_maturity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Free cashout */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.78rem',
                color: 'var(--upay-blue)',
                background: 'var(--upay-blue-soft)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
              }}
            >
              <Check size={14} />
              <span>{t('sanchay.free_cashout', lang)}</span>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-subtle)',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-light)',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {dps_recommendation.reason || 'Surplus insufficient for DPS.'}
            </p>
          </div>
        )}
      </div>

      {/* Growth Chart */}
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

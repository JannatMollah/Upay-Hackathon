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
  const [applied, setApplied] = useState<boolean>(false);

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
          <SpendingDonut
            categories={[
              { category: cashflow.top_expense_category, amount: cashflow.monthly_expenses * 0.45, percentage: 45 },
              { category: 'cash_withdrawal', amount: cashflow.cash_out_amount, percentage: Math.round(cashflow.cash_out_ratio * 100) },
              { category: 'utilities', amount: cashflow.monthly_expenses * 0.15, percentage: 15 },
              { category: 'other', amount: cashflow.monthly_expenses * (0.4 - cashflow.cash_out_ratio), percentage: Math.round((0.4 - cashflow.cash_out_ratio) * 100) },
            ]}
            totalExpense={cashflow.monthly_expenses}
            lang={lang}
          />
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
                fontSize: '0.82rem',
                color: 'var(--upay-blue)',
                background: 'var(--upay-blue-soft)',
                padding: '9px 14px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
                marginTop: '10px',
              }}
            >
              <Check size={15} />
              <span>{t('sanchay.free_cashout', lang)}</span>
            </div>

            {/* DPS Enrollment Action */}
            {applied ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--color-success-bg)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-success)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  marginTop: '12px',
                }}
              >
                <Check size={17} />
                <span>
                  {lang === 'bn'
                    ? 'ইউসিবি ডিপিএস আবেদন সফলভাবে প্রক্রিয়াকরণ শুরু হয়েছে!'
                    : 'UCB DPS Enrollment initiated successfully!'}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setApplied(true)}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '11px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-success)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.90rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--shadow-sm)',
                  fontFamily: 'inherit',
                }}
              >
                <Award size={16} />
                <span>{lang === 'bn' ? 'ডিপিএস একাউন্ট খুলুন' : 'Open DPS Account with UCB'}</span>
              </button>
            )}
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
      {dps_recommendation.eligible && dps_recommendation.all_plans && currentPlan && (
        <SavingsGrowthChart
          monthlyAmount={currentPlan.monthly_amount}
          tenureMonths={currentPlan.tenure_months}
          maturityValue={currentPlan.projected_maturity}
          lang={lang}
        />
      )}

      {/* UCB Zero-Charge ATM Fee Savings Calculator (Quantified Real-World Value) */}
      <div className="fee-savings-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EDBC1B', color: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              ৳
            </div>
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {lang === 'bn' ? 'ইউসিবি এটিএম ও ডিপিএস ফি সাশ্রয় ক্যালকুলেটর' : 'UCB ATM & DPS Fee Savings Calculator'}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {lang === 'bn'
                  ? 'প্রতিযোগীদের ১.৮৫% ফি বনাম উপায় ইউসিবি এটিএম প্রতি হাজারে মাত্র ৮ টাকা এবং ডিপিএস মেয়াদে ১০০% ফ্রি ক্যাশ-আউট।'
                  : 'Competitor 1.85% fee vs Upay UCB ATM rate of ৳8/৳1,000 and 100% free cash-out on matured DPS.'}
              </p>
            </div>
          </div>

          <span className="badge badge-success" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
            {lang === 'bn' ? 'ইউসিবি পার্টনারশিপ বেনিফিট' : 'UCB Bank Advantage'}
          </span>
        </div>

        {(() => {
          const cashOutAmt = Math.max(2000, Math.round(cashflow.monthly_expenses * (cashflow.cash_out_ratio || 0.35)));
          const competitorFee = Math.round(cashOutAmt * 0.0185);
          const upayFee = Math.round(cashOutAmt * 0.008);
          const monthlySaving = Math.max(0, competitorFee - upayFee);
          const annualSaving = monthlySaving * 12;

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {lang === 'bn' ? 'প্রতিযোগী ক্যাশ-আউট খরচ' : 'Competitor Fee (1.85%)'}
                </span>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-danger)', marginTop: '2px' }}>
                  ৳{competitorFee} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/{lang === 'bn' ? 'মাস' : 'mo'}</span>
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>৳{cashOutAmt.toLocaleString()} {lang === 'bn' ? 'ক্যাশ-আউটে' : 'volume'}</span>
              </div>

              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {lang === 'bn' ? 'উপায় + ইউসিবি এটিএম খরচ' : 'Upay UCB ATM Fee (0.8%)'}
                </span>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--upay-blue)', marginTop: '2px' }}>
                  ৳{upayFee} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/{lang === 'bn' ? 'মাস' : 'mo'}</span>
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 600 }}>{lang === 'bn' ? 'মাত্র ৮ টাকা প্রতি হাজারে' : 'Only ৳8 per ৳1,000'}</span>
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.12) 0%, rgba(237, 188, 27, 0.15) 100%)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(5, 150, 105, 0.3)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {lang === 'bn' ? 'বার্ষিক প্রত্যক্ষ সাশ্রয়' : 'Annual Cash Savings'}
                </span>
                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-success)', marginTop: '2px' }}>
                  +৳{annualSaving.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>/{lang === 'bn' ? 'বছর' : 'yr'}</span>
                </p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {lang === 'bn' ? 'ডিপিএস মেয়াদের জিরো-ফি বোনাস সহ' : 'Plus 0% cash-out on DPS maturity'}
                </span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

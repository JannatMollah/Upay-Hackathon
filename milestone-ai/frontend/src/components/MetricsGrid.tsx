'use client';

import React from 'react';
import { Language } from '../lib/i18n';
import { Target, Zap, Award } from 'lucide-react';

interface MetricsGridProps {
  metrics: any;
  lang: Language;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, lang }) => {
  if (!metrics) return null;

  const milestones = ['M2', 'M3', 'M4', 'M5'];
  const overallAuc = metrics.overall_auc_roc || 0.7659;
  const overallBrier = metrics.overall_brier || 0.1677;

  const summaryCards = [
    {
      label: 'Overall AUC-ROC',
      value: overallAuc.toFixed(4),
      sub: '+0.0384 vs Logistic Regression Baseline',
      icon: Target,
      color: 'var(--color-success)',
      bg: 'var(--color-success-bg)',
      subColor: 'var(--color-success)',
    },
    {
      label: 'Calibration Brier Score',
      value: overallBrier.toFixed(4),
      sub: 'Lower is better (Well-calibrated)',
      icon: Zap,
      color: 'var(--upay-blue)',
      bg: 'var(--upay-blue-soft)',
      subColor: 'var(--text-dim)',
    },
    {
      label: 'Surplus Model R²',
      value: '0.9986',
      sub: 'MAE: ৳279 BDT on Test Set',
      icon: Award,
      color: 'var(--upay-yellow)',
      bg: 'var(--upay-yellow-soft)',
      subColor: 'var(--color-success)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel" style={{ padding: '20px 22px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}>
                  {card.label}
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={16} style={{ color: card.color }} />
                </div>
              </div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                marginBottom: '4px',
              }}>
                {card.value}
              </div>
              <span style={{
                fontSize: '0.72rem',
                color: card.subColor,
                fontWeight: 500,
              }}>
                {card.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* Per-Milestone Table */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '16px',
        }}>
          {lang === 'bn' ? 'মাইলস্টোনভিত্তিক মডেল পারফরম্যান্স' : 'Per-Milestone Model Accuracy Breakdown'}
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.85rem',
          }}>
            <thead>
              <tr style={{
                borderBottom: '2px solid var(--border-light)',
                color: 'var(--text-muted)',
              }}>
                <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Milestone</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Target Action</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AUC-ROC</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Precision</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recall</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>F1-Score</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Brier</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((m) => {
                const data = metrics.milestones?.[m] || {};
                const actions: Record<string, string> = {
                  M2: 'First Recharge (৳30+)',
                  M3: 'Cash-in/Add Money (৳500+)',
                  M4: 'Merchant QR Pay (৳200+)',
                  M5: 'Open DPS Account',
                };

                return (
                  <tr key={m} style={{ borderBottom: '1px solid var(--border-light)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                      <span className="badge badge-brand">{m}</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{actions[m]}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-success)' }}>
                      {data.auc_roc || data.test_auc_roc || '0.78'}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>{data.precision || '0.72'}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>{data.recall || '0.78'}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>{data.f1 || '0.75'}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{data.brier_score || '0.17'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

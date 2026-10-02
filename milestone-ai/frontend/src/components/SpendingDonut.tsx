'use client';

import React from 'react';
import { CashFlowSummary } from '../types';
import { Language } from '../lib/i18n';

interface SpendingDonutProps {
  cashflow: CashFlowSummary;
  lang: Language;
}

export const SpendingDonut: React.FC<SpendingDonutProps> = ({ cashflow, lang }) => {
  const cashOutAmount = cashflow.cash_out_amount;
  const merchantAmount = Math.round(cashflow.monthly_expenses * 0.15);
  const rechargeAmount = Math.round(cashflow.monthly_expenses * 0.12);
  const otherAmount = Math.max(0, cashflow.monthly_expenses - cashOutAmount - merchantAmount - rechargeAmount);

  const segments = [
    { label: lang === 'bn' ? 'ক্যাশ আউট' : 'Cash Out', amount: cashOutAmount, color: '#DC2626' },
    { label: lang === 'bn' ? 'মার্চেন্ট পেমেন্ট' : 'Merchant Pay', amount: merchantAmount, color: '#1E4D8C' },
    { label: lang === 'bn' ? 'মোবাইল রিচার্জ' : 'Recharge', amount: rechargeAmount, color: '#EDBC1B' },
    { label: lang === 'bn' ? 'অন্যান্য খরচ' : 'Utilities/Other', amount: otherAmount, color: '#9CA3AF' },
  ];

  const total = segments.reduce((sum, s) => sum + s.amount, 0) || 1;

  let cumulativeAngle = 0;
  const size = 160;
  const center = size / 2;
  const radius = 58;
  const strokeWidth = 22;

  const arcs = segments.map((seg) => {
    const fraction = seg.amount / total;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + fraction * 360;
    cumulativeAngle = endAngle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = fraction > 0.5 ? 1 : 0;
    const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

    return { ...seg, pathData, pct: Math.round(fraction * 100) };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {arcs.map((arc, i) => (
            <path
              key={i}
              d={arc.pathData}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{ transition: 'stroke-width 0.2s ease' }}
            />
          ))}
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <span style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            {lang === 'bn' ? 'ক্যাশ আউট' : 'Cash Out'}
          </span>
          <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-danger)' }}>
            {(cashflow.cash_out_ratio * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '150px' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '3px',
                backgroundColor: seg.color,
                flexShrink: 0,
              }} />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{seg.label}</span>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              ৳{seg.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

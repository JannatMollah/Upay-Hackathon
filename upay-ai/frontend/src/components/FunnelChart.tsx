'use client';

import React from 'react';
import { MilestoneStat } from '../types';
import { Language, t } from '../lib/i18n';
import { TrendingDown, Users, Check } from 'lucide-react';

interface FunnelChartProps {
  milestones: MilestoneStat[];
  totalUsers: number;
  selectedMilestone: string | null;
  onSelectMilestone: (m: string | null) => void;
  lang: Language;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  milestones,
  totalUsers,
  selectedMilestone,
  onSelectMilestone,
  lang,
}) => {
  const colors = [
    '#1E4D8C',
    '#2563EB',
    '#0EA5E9',
    '#06B6D4',
    '#059669',
    '#10B981',
  ];

  return (
    <div className="glass-panel" style={{ padding: '28px 28px 24px' }}>
      {/* Section Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">{t('funnel.title', lang)}</h2>
          <p className="section-subtitle" style={{ fontSize: '0.94rem', marginTop: '4px' }}>
            {t('funnel.subtitle', lang)} •{' '}
            <span style={{ color: 'var(--upay-blue)', fontWeight: 600 }}>
              {lang === 'bn'
                ? 'যেকোনো ধাপে ক্লিক করলে নিচের টেবিলে সেই মাইলস্টোন সক্রিয় হবে'
                : 'Click any step to activate its tab in the table below'}
            </span>
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.90rem',
          color: 'var(--text-muted)',
          padding: '7px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-light)',
        }}>
          <Users size={15} />
          <span>
            {lang === 'bn' ? 'মোট গ্রাহক: ' : 'Total: '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {totalUsers.toLocaleString()}
            </strong>
          </span>
        </div>
      </div>

      {/* Funnel Bars — 6 milestone interactive bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {milestones.map((m, idx) => {
          const isSelected = selectedMilestone === m.milestone;
          const prevRate = idx > 0 ? milestones[idx - 1].rate : 1.0;
          const dropOffPct = idx > 0 ? ((prevRate - m.rate) * 100).toFixed(1) : null;
          const pct = (m.rate * 100).toFixed(1);
          const color = colors[idx % colors.length];

          return (
            <div
              key={m.milestone}
              onClick={() => onSelectMilestone(isSelected ? null : m.milestone)}
              className={`funnel-bar ${isSelected ? 'active' : ''}`}
              style={{
                animationDelay: `${idx * 0.06}s`,
                padding: '14px 18px',
                cursor: 'pointer',
                border: isSelected ? '1.5px solid var(--upay-blue)' : '1px solid transparent',
                boxShadow: isSelected ? '0 3px 12px rgba(37, 99, 235, 0.12)' : 'none',
                transition: 'all 0.2s ease',
              }}
              title={
                lang === 'bn'
                  ? `ক্লিক করে নিচের টেবিলে '${m.name_bn}' সক্রিয় করুন`
                  : `Click to activate '${m.name_en}' in the table below`
              }
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Step circle indicator */}
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: color,
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--upay-blue)' : 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                  }}>
                    {lang === 'bn' ? m.name_bn : m.name_en}
                  </span>
                  {isSelected && (
                    <span
                      className="badge badge-brand"
                      style={{
                        fontSize: '0.74rem',
                        padding: '2px 8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Check size={11} />
                      {lang === 'bn' ? 'সক্রিয় ফিল্টার' : 'Active Filter'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {dropOffPct && parseFloat(dropOffPct) > 0 && (
                    <div className="badge badge-risk" style={{ fontSize: '0.78rem', gap: '4px', padding: '3px 8px' }}>
                      <TrendingDown size={12} />
                      <span>-{dropOffPct}%</span>
                    </div>
                  )}
                  <span style={{
                    fontSize: '0.90rem',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    <strong style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.94rem' }}>
                      {m.completed_count.toLocaleString()}
                    </strong>
                    {' '}
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.84rem' }}>({pct}%)</span>
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="funnel-progress" style={{ height: '8px' }}>
                <div
                  className="funnel-progress-fill"
                  style={{
                    width: `${pct}%`,
                    background: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

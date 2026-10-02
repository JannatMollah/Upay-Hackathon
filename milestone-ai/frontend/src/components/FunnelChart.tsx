'use client';

import React from 'react';
import { MilestoneStat } from '../types';
import { Language, t } from '../lib/i18n';
import { TrendingDown, Users, ChevronRight, Activity } from 'lucide-react';

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

  const colorsBg = [
    'rgba(30, 77, 140, 0.08)',
    'rgba(37, 99, 235, 0.08)',
    'rgba(14, 165, 233, 0.08)',
    'rgba(6, 182, 212, 0.08)',
    'rgba(5, 150, 105, 0.08)',
    'rgba(16, 185, 129, 0.08)',
  ];

  return (
    <div className="glass-panel" style={{ padding: '28px 28px 24px' }}>
      {/* Section Header */}
      <div className="section-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--upay-blue-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Activity size={14} style={{ color: 'var(--upay-blue)' }} />
            </div>
            <h2 className="section-title">{t('funnel.title', lang)}</h2>
          </div>
          <p className="section-subtitle" style={{ marginLeft: '36px' }}>
            {t('funnel.subtitle', lang)}
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-light)',
        }}>
          <Users size={14} />
          <span>
            {lang === 'bn' ? 'মোট: ' : 'Total: '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {totalUsers.toLocaleString()}
            </strong>
          </span>
        </div>
      </div>

      {/* Funnel Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {milestones.map((m, idx) => {
          const isSelected = selectedMilestone === m.milestone;
          const prevRate = idx > 0 ? milestones[idx - 1].rate : 1.0;
          const dropOffPct = idx > 0 ? ((prevRate - m.rate) * 100).toFixed(1) : null;
          const pct = (m.rate * 100).toFixed(1);
          const color = colors[idx % colors.length];
          const bgColor = colorsBg[idx % colorsBg.length];

          return (
            <div
              key={m.milestone}
              onClick={() => onSelectMilestone(isSelected ? null : m.milestone)}
              className={`funnel-bar ${isSelected ? 'active' : ''}`}
              style={{
                animationDelay: `${idx * 0.06}s`,
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? color : bgColor,
                      color: isSelected ? '#fff' : color,
                      letterSpacing: '0.02em',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {m.milestone}
                  </span>
                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}>
                    {lang === 'bn' ? m.name_bn : m.name_en}
                  </span>
                  {isSelected && (
                    <ChevronRight size={14} style={{ color: 'var(--upay-blue)', marginLeft: '-4px' }} />
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {dropOffPct && parseFloat(dropOffPct) > 0 && (
                    <div className="badge badge-risk" style={{ fontSize: '0.72rem', gap: '3px' }}>
                      <TrendingDown size={11} />
                      <span>-{dropOffPct}%</span>
                    </div>
                  )}
                  <span style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {m.completed_count.toLocaleString()}
                    </strong>
                    {' '}
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>({pct}%)</span>
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="funnel-progress">
                <div
                  className="funnel-progress-fill"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}dd)`,
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

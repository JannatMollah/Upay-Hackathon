'use client';

import React from 'react';
import { MilestoneStat } from '../types';
import { Language, t } from '../lib/i18n';
import { TrendingDown, Users } from 'lucide-react';

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
    'var(--upay-blue)',
    '#3B82F6',
    '#0EA5E9',
    '#06B6D4',
    'var(--color-success)',
    '#10B981',
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px 28px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <div>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '2px',
          }}>
            {t('funnel.title', lang)}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('funnel.subtitle', lang)}
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}>
          <Users size={15} />
          <span>
            {lang === 'bn' ? 'মোট: ' : 'Total: '}
            <strong style={{ color: 'var(--text-primary)' }}>{totalUsers.toLocaleString()}</strong>
          </span>
        </div>
      </div>

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
              style={{
                cursor: 'pointer',
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                background: isSelected ? 'var(--upay-blue-soft)' : 'var(--bg-subtle)',
                border: isSelected
                  ? '1px solid rgba(30, 77, 140, 0.25)'
                  : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--upay-blue)' : 'var(--bg-muted)',
                      color: isSelected ? '#fff' : color,
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
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {dropOffPct && parseFloat(dropOffPct) > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.75rem',
                        color: 'var(--color-danger)',
                        background: 'var(--color-danger-bg)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                      }}
                    >
                      <TrendingDown size={12} />
                      <span>-{dropOffPct}%</span>
                    </div>
                  )}
                  <span style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                  }}>
                    {m.completed_count.toLocaleString()} ({pct}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-muted)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: 'var(--radius-full)',
                    background: color,
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
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

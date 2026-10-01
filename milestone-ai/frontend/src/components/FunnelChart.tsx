'use client';

import React from 'react';
import { MilestoneStat } from '../types';
import { Language, t } from '../lib/i18n';
import { ArrowDown, TrendingDown, Users } from 'lucide-react';

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
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
            {t('funnel.title', lang)}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            {t('funnel.subtitle', lang)}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
          <Users size={16} />
          <span>
            {lang === 'bn' ? 'মোট গ্রাহক: ' : 'Total Monitored: '}
            <strong style={{ color: '#f8fafc' }}>{totalUsers.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {milestones.map((m, idx) => {
          const isSelected = selectedMilestone === m.milestone;
          const prevRate = idx > 0 ? milestones[idx - 1].rate : 1.0;
          const dropOffPct = idx > 0 ? ((prevRate - m.rate) * 100).toFixed(1) : null;
          const pct = (m.rate * 100).toFixed(1);

          // Color gradient based on stage
          const colors = [
            '#2563eb', // M1
            '#3b82f6', // M2
            '#0284c7', // M3
            '#0ea5e9', // M4
            '#00d2b4', // M5
            '#10b981', // M6
          ];
          const color = colors[idx % colors.length];

          return (
            <div
              key={m.milestone}
              onClick={() => onSelectMilestone(isSelected ? null : m.milestone)}
              style={{
                cursor: 'pointer',
                padding: '12px 16px',
                borderRadius: '12px',
                background: isSelected ? 'rgba(0, 210, 180, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: isSelected ? '1px solid rgba(0, 210, 180, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: color,
                    }}
                  >
                    {m.milestone}
                  </span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f1f5f9' }}>
                    {lang === 'bn' ? m.name_bn : m.name_en}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {dropOffPct && parseFloat(dropOffPct) > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.78rem',
                        color: '#fb7185',
                        background: 'rgba(244, 63, 94, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      <TrendingDown size={13} />
                      <span>-{dropOffPct}% drop</span>
                    </div>
                  )}

                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {m.completed_count.toLocaleString()} ({pct}%)
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div
                style={{
                  height: '8px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: '999px',
                    background: `linear-gradient(90deg, ${color} 0%, #00d2b4 100%)`,
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
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

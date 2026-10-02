'use client';

import React from 'react';
import { MilestoneProb } from '../types';
import { Language, t } from '../lib/i18n';
import { AlertCircle } from 'lucide-react';

interface MilestoneProgressProps {
  probabilities: Record<string, MilestoneProb>;
  primaryDropOff: string | null;
  lang: Language;
}

export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
  probabilities,
  primaryDropOff,
  lang,
}) => {
  const milestones = ['M2', 'M3', 'M4', 'M5'];

  return (
    <div className="glass-panel" style={{ padding: '24px 28px' }}>
      <h3 style={{
        fontSize: '1.05rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '16px',
      }}>
        {lang === 'bn' ? 'মাইলস্টোন সম্পন্নতার পূর্বাভাস' : 'Milestone Completion Probabilities'}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {milestones.map((m) => {
          const item = probabilities[m] || { completion_prob: 0.5, at_risk: false };
          const isPrimary = m === primaryDropOff;
          const pct = Math.round(item.completion_prob * 100);

          return (
            <div
              key={m}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                background: isPrimary ? 'var(--color-danger-bg)' : 'var(--bg-subtle)',
                border: isPrimary
                  ? '1px solid var(--color-danger-border)'
                  : '1px solid var(--border-light)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: isPrimary ? 'var(--color-danger)' : 'var(--upay-blue)',
                  }}>
                    {m}
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}>
                    {t(`m.${m}`, lang)}
                  </span>
                  {isPrimary && (
                    <span className="badge badge-risk" style={{ fontSize: '0.68rem' }}>
                      <AlertCircle size={10} />
                      {lang === 'bn' ? 'প্রধান ঝুঁকি' : 'Primary Risk'}
                    </span>
                  )}
                </div>

                <span style={{
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: isPrimary ? 'var(--color-danger)' : 'var(--color-success)',
                }}>
                  {pct}%
                </span>
              </div>

              {/* Bar */}
              <div style={{
                height: '6px',
                width: '100%',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-muted)',
                overflow: 'hidden',
              }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: 'var(--radius-full)',
                    background: isPrimary ? 'var(--color-danger)' : 'var(--upay-blue)',
                    transition: 'width 0.5s ease',
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

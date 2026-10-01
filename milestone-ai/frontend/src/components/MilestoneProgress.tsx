'use client';

import React from 'react';
import { MilestoneProb } from '../types';
import { Language, t } from '../lib/i18n';
import { AlertCircle, CheckCircle } from 'lucide-react';

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
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
        {lang === 'bn' ? 'মাইলস্টোন সম্পন্নতার পূর্বাভাস' : 'Milestone Completion Probabilities'}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {milestones.map((m) => {
          const item = probabilities[m] || { completion_prob: 0.5, at_risk: false };
          const isPrimary = m === primaryDropOff;
          const pct = Math.round(item.completion_prob * 100);

          return (
            <div
              key={m}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: isPrimary ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: isPrimary ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isPrimary ? '#f43f5e' : '#38bdf8' }}>
                    {m}
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9' }}>
                    {t(`m.${m}`, lang)}
                  </span>
                  {isPrimary && (
                    <span className="badge badge-risk" style={{ fontSize: '0.7rem' }}>
                      <AlertCircle size={11} />
                      {lang === 'bn' ? 'প্রধান ঝুঁকি' : 'Primary Drop-off Risk'}
                    </span>
                  )}
                </div>

                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isPrimary ? '#f87171' : '#34d399' }}>
                  {pct}%
                </span>
              </div>

              {/* Bar */}
              <div style={{ height: '6px', width: '100%', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: '999px',
                    background: isPrimary
                      ? 'linear-gradient(90deg, #f43f5e, #f59e0b)'
                      : 'linear-gradient(90deg, #3b82f6, #00d2b4)',
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

'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Language, t } from '../lib/i18n';

interface SyntheticBannerProps {
  lang: Language;
}

export const SyntheticBanner: React.FC<SyntheticBannerProps> = ({ lang }) => {
  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(217, 119, 6, 0.06), rgba(217, 119, 6, 0.03))',
        borderBottom: '1px solid var(--color-warning-border)',
        padding: '7px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'var(--color-warning)',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={13} style={{ flexShrink: 0 }} />
        <span>
          <strong>{lang === 'bn' ? 'সতর্কবার্তা:' : 'DEMO MODE:'}</strong>{' '}
          {t('banner.synthetic', lang)}
        </span>
      </div>
      <div
        className="badge badge-success"
        style={{
          fontSize: '0.68rem',
          fontWeight: 600,
          flexShrink: 0,
          padding: '3px 10px',
        }}
      >
        <ShieldCheck size={12} />
        <span>{lang === 'bn' ? 'গার্ডরেইল সক্রিয়' : 'Guardrails Active'}</span>
      </div>
    </div>
  );
};

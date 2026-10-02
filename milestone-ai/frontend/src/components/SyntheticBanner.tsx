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
        background: 'var(--color-warning-bg)',
        borderBottom: '1px solid var(--color-warning-border)',
        padding: '8px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: 'var(--color-warning)',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={15} style={{ flexShrink: 0 }} />
        <span>
          <strong>{lang === 'bn' ? 'সতর্কবার্তা:' : 'NOTE:'}</strong>{' '}
          {t('banner.synthetic', lang)}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.72rem',
          fontWeight: 600,
          flexShrink: 0,
        }}
        className="badge badge-success"
      >
        <ShieldCheck size={13} />
        <span>{lang === 'bn' ? 'গার্ডরেইল সক্রিয়' : 'Guardrails Active'}</span>
      </div>
    </div>
  );
};

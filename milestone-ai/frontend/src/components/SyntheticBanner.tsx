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
        background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(37, 99, 235, 0.12) 100%)',
        borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        color: '#fbbf24',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <span>
          <strong>{lang === 'bn' ? 'সতর্কবার্তা:' : 'NOTE:'}</strong>{' '}
          {t('banner.synthetic', lang)}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#34d399',
          fontSize: '0.78rem',
          fontWeight: 600,
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '3px 10px',
          borderRadius: '999px',
          border: '1px solid rgba(16, 185, 129, 0.25)',
        }}
      >
        <ShieldCheck size={14} />
        <span>{lang === 'bn' ? 'গার্ডরেইল সক্রিয়' : 'Guardrails Active'}</span>
      </div>
    </div>
  );
};

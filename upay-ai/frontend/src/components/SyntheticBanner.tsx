'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Language, t } from '../lib/i18n';

interface SyntheticBannerProps {
  lang: Language;
}

export const SyntheticBanner: React.FC<SyntheticBannerProps> = ({ lang }) => {
  return (
    <div
      style={{
        background: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border-light)',
        padding: '6px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.74rem',
        color: 'var(--text-muted)',
        gap: '8px',
        fontWeight: 500,
      }}
    >
      <AlertTriangle size={13} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
      <span>
        {t('banner.synthetic', lang)}
      </span>
    </div>
  );
};

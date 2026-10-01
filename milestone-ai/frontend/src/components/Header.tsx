'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Shield, PiggyBank, BarChart3, Globe } from 'lucide-react';
import { Language, t } from '../lib/i18n';

interface HeaderProps {
  lang: Language;
  onLanguageToggle: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onLanguageToggle }) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', labelKey: 'nav.dashboard', icon: Activity },
    { href: '/savings', labelKey: 'nav.savings', icon: PiggyBank },
    { href: '/performance', labelKey: 'nav.performance', icon: BarChart3 },
  ];

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-card)',
        background: 'rgba(7, 13, 24, 0.85)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #00d2b4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0, 210, 180, 0.4)',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem' }}>u</span>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
              {t('brand.name', lang)}
            </h1>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                background: 'rgba(0, 210, 180, 0.15)',
                color: '#00d2b4',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(0, 210, 180, 0.3)',
              }}
            >
              v2.0 Hybrid
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {t('brand.slogan', lang)}
          </p>
        </div>
      </Link>

      {/* Nav items */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#00d2b4' : '#94a3b8',
                background: isActive ? 'rgba(0, 210, 180, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(0, 210, 180, 0.25)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} />
              <span>{t(item.labelKey, lang)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Controls & Language */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => onLanguageToggle(lang === 'en' ? 'bn' : 'en')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#f8fafc',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          <Globe size={16} style={{ color: '#00d2b4' }} />
          <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>
            {lang === 'bn' ? 'API লাইভ' : 'API Live'}
          </span>
        </div>
      </div>
    </header>
  );
};

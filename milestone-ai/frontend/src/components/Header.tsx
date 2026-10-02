'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, PiggyBank, BarChart3, Globe, Menu, X } from 'lucide-react';
import { Language, t } from '../lib/i18n';

interface HeaderProps {
  lang: Language;
  onLanguageToggle: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onLanguageToggle }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '/', labelKey: 'nav.dashboard', icon: Activity },
    { href: '/savings', labelKey: 'nav.savings', icon: PiggyBank },
    { href: '/performance', labelKey: 'nav.performance', icon: BarChart3 },
  ];

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-light)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src="/upay-logo.webp"
          alt="upay logo"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            objectFit: 'contain',
          }}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}>
              {t('brand.name', lang)}
            </h1>
          </div>
          <p style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}>
            {t('brand.slogan', lang)}
          </p>
        </div>
      </Link>

      {/* Nav items — center */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        background: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '3px',
      }}>
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
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '9px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--upay-blue)' : 'var(--text-muted)',
                background: isActive ? 'var(--bg-white)' : 'transparent',
                boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} />
              <span>{t(item.labelKey, lang)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => onLanguageToggle(lang === 'en' ? 'bn' : 'en')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
        >
          <Globe size={14} style={{ color: 'var(--upay-blue)' }} />
          <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success)',
              boxShadow: '0 0 6px rgba(5, 150, 105, 0.5)',
              animation: 'pulseGlow 2s infinite ease-in-out',
            }}
          />
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--color-success)',
          }}>
            {lang === 'bn' ? 'API লাইভ' : 'API Live'}
          </span>
        </div>
      </div>
    </header>
  );
};

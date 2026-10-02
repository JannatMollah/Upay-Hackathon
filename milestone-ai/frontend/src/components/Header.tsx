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
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0 32px',
        height: '60px',
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
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            objectFit: 'contain',
          }}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
            }}>
              {t('brand.name', lang)}
            </h1>
          </div>
          <p style={{
            fontSize: '0.65rem',
            color: 'var(--text-dim)',
            fontWeight: 500,
            letterSpacing: '0.02em',
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
        border: '1px solid var(--border-light)',
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
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s var(--ease-smooth)',
              }}
            >
              <Icon size={15} />
              <span>{t(item.labelKey, lang)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => onLanguageToggle(lang === 'en' ? 'bn' : 'en')}
          className="btn-ghost"
          style={{
            padding: '6px 12px',
            fontSize: '0.78rem',
          }}
        >
          <Globe size={13} style={{ color: 'var(--upay-blue)' }} />
          <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-success-bg)',
          border: '1px solid var(--color-success-border)',
        }}>
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

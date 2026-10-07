'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, PiggyBank, Landmark, BarChart3, Globe, Sparkles, Moon, Sun } from 'lucide-react';
import { Language, t } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { JudgeTourModal } from './JudgeTourModal';

interface HeaderProps {
  lang: Language;
  onLanguageToggle: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onLanguageToggle }) => {
  const pathname = usePathname();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: '/', labelEn: 'Hub', labelBn: 'হাব', icon: Home, exact: true },
    { href: '/activation', labelEn: 'Activation', labelBn: 'অ্যাক্টিভেশন', icon: Target },
    { href: '/dps-coach', labelEn: 'DPS Coach', labelBn: 'ডিপিএস কোচ', icon: PiggyBank },
    { href: '/liquidity', labelEn: 'Liquidity', labelBn: 'তারল্য', icon: Landmark },
    { href: '/performance', labelEn: 'Innovation Lab', labelBn: 'ইনোভেশন ল্যাব', icon: BarChart3 },
  ];

  return (
    <>
      <header className="main-navbar-wrapper">
        <div className="main-navbar-inner">
          {/* Brand */}
          <Link href="/" className="navbar-brand-link">
            <img
              src="/upay-logo.webp"
              alt="upay logo"
              className="navbar-brand-logo"
            />
            <span className="navbar-brand-title">
              {lang === 'en' ? 'Upay' : 'উপায়'}{' '}
              <span className="navbar-brand-accent">AI</span>
            </span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                background: 'rgba(5, 150, 105, 0.1)',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                borderRadius: '9999px',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--color-success)',
                marginLeft: '6px',
              }}
              title="60/60 Pytest Automated Tests Passed Across 10 Test Suites"
            >
              <span className="beacon-dot" style={{ background: 'var(--color-success)' }} />
              <span>60/60 Verified</span>
            </div>
          </Link>

          {/* Nav items — center */}
          <nav className="navbar-nav-group">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`navbar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={15} />
                  <span>{lang === 'bn' ? item.labelBn : item.labelEn}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Judge Tour, Theme toggle & Language toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsTourOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #EDBC1B 0%, #E5A800 100%)',
                color: '#1E293B',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(237, 188, 27, 0.35)',
                transition: 'all 0.2s ease',
              }}
              title="60-Second Guided Tour for Hackathon Judges"
            >
              <Sparkles size={14} style={{ color: '#1E4D8C' }} />
              <span>{lang === 'bn' ? '🚀 জাজ ট্যুর' : '🚀 Judge Tour'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label="Toggle dark/light mode"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={() => onLanguageToggle(lang === 'en' ? 'bn' : 'en')}
              className="navbar-lang-btn"
              aria-label="Toggle language"
            >
              <Globe size={14} style={{ color: 'var(--upay-blue)' }} />
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Guided Tour Modal */}
      <JudgeTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        lang={lang}
      />
    </>
  );
};

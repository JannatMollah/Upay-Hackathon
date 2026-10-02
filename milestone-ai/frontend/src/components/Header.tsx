'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, PiggyBank, BarChart3, Globe } from 'lucide-react';
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
        </Link>

        {/* Nav items — center */}
        <nav className="navbar-nav-group">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`navbar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={15} />
                <span>{t(item.labelKey, lang)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Language toggle */}
        <button
          onClick={() => onLanguageToggle(lang === 'en' ? 'bn' : 'en')}
          className="navbar-lang-btn"
          aria-label="Toggle language"
        >
          <Globe size={14} style={{ color: 'var(--upay-blue)' }} />
          <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
        </button>
      </div>
    </header>
  );
};

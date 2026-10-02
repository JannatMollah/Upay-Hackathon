'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, PiggyBank, Landmark, BarChart3, Globe } from 'lucide-react';
import { Language, t } from '../lib/i18n';

interface HeaderProps {
  lang: Language;
  onLanguageToggle: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onLanguageToggle }) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', labelEn: 'Hub', labelBn: 'হাব', icon: Home, exact: true },
    { href: '/activation', labelEn: 'Activation', labelBn: 'অ্যাক্টিভেশন', icon: Target },
    { href: '/dps-coach', labelEn: 'DPS Coach', labelBn: 'ডিপিএস কোচ', icon: PiggyBank },
    { href: '/liquidity', labelEn: 'Liquidity', labelBn: 'তারল্য', icon: Landmark },
    { href: '/performance', labelEn: 'Performance', labelBn: 'পারফরম্যান্স', icon: BarChart3 },
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

'use client';

import React from 'react';
import { Language } from '../lib/i18n';
import { User, Smartphone, MapPin, CreditCard, Briefcase } from 'lucide-react';

interface UserProfileProps {
  userId: string;
  lang: Language;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, lang }) => {
  const profileItems = [
    { icon: Smartphone, label: lang === 'bn' ? 'ডিভাইস' : 'Device', value: 'Android App', color: 'var(--text-primary)' },
    { icon: MapPin, label: lang === 'bn' ? 'অঞ্চল' : 'Region', value: 'Dhaka (Urban)', color: 'var(--text-primary)' },
    { icon: Briefcase, label: lang === 'bn' ? 'স্যালারি ওয়ালেট' : 'Salary Wallet', value: lang === 'bn' ? 'সক্রিয়' : 'Active', color: 'var(--color-success)' },
    { icon: CreditCard, label: lang === 'bn' ? 'ব্যাংক সংযুক্ত' : 'Bank Linked', value: 'UCB Linked', color: 'var(--upay-blue)' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--upay-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <User size={22} />
        </div>
        <div>
          <h2 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '-0.02em',
          }}>
            {userId}
          </h2>
          <span style={{
            fontSize: '0.84rem',
            color: 'var(--color-success)',
            fontWeight: 600,
          }}>
            {lang === 'bn' ? 'সক্রিয় উপায় গ্রাহক' : 'Active upay Subscriber'}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
        }}
      >
        {profileItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} style={{
              background: 'var(--bg-subtle)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                fontSize: '0.73rem',
                marginBottom: '4px',
                fontWeight: 500,
              }}>
                <Icon size={12} />
                <span>{item.label}</span>
              </div>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: item.color,
              }}>
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

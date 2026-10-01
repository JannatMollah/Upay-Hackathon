'use client';

import React from 'react';
import { Language } from '../lib/i18n';
import { User, Smartphone, MapPin, CreditCard, Briefcase, Bell } from 'lucide-react';

interface UserProfileProps {
  userId: string;
  lang: Language;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, lang }) => {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <User size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
            {userId}
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#00d2b4', fontWeight: 600 }}>
            Active upay Subscriber
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
        }}
      >
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
            <Smartphone size={13} />
            <span>Device</span>
          </div>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>Android App</p>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
            <MapPin size={13} />
            <span>Region</span>
          </div>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>Dhaka (Urban)</p>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
            <Briefcase size={13} />
            <span>Salary Wallet</span>
          </div>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>Active</p>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
            <CreditCard size={13} />
            <span>Bank Linked</span>
          </div>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8' }}>UCB Linked</p>
        </div>
      </div>
    </div>
  );
};

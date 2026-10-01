'use client';

import React from 'react';
import Link from 'next/link';
import { AtRiskUser } from '../types';
import { Language, t } from '../lib/i18n';
import { ArrowUpRight, Filter, AlertCircle, Sparkles } from 'lucide-react';

interface AtRiskTableProps {
  users: AtRiskUser[];
  totalAtRisk: number;
  currentFilter: string | null;
  onFilterChange: (m: string | null) => void;
  lang: Language;
}

export const AtRiskTable: React.FC<AtRiskTableProps> = ({
  users,
  totalAtRisk,
  currentFilter,
  onFilterChange,
  lang,
}) => {
  const filterOptions = [
    { key: null, label: t('table.filter_all', lang) },
    { key: 'M2', label: 'M2: Recharge' },
    { key: 'M3', label: 'M3: Cash-In' },
    { key: 'M4', label: 'M4: Merchant' },
    { key: 'M5', label: 'M5: DPS' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
            {t('table.title', lang)}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            {lang === 'bn'
              ? `মোট ${totalAtRisk.toLocaleString()} জন গ্রাহকের জন্য তাৎক্ষণিক ইন্টারভেনশন প্রয়োজন`
              : `Ranked by drop-off severity • ${totalAtRisk.toLocaleString()} users flagged`}
          </p>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Filter size={15} style={{ color: '#94a3b8', marginRight: '4px' }} />
          {filterOptions.map((opt) => {
            const active = currentFilter === opt.key;
            return (
              <button
                key={opt.key || 'all'}
                onClick={() => onFilterChange(opt.key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: active ? 600 : 500,
                  background: active ? 'rgba(0, 210, 180, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: active ? '1px solid rgba(0, 210, 180, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: active ? '#00d2b4' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#64748b' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t('table.user_id', lang)}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t('table.drop_off', lang)}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t('table.risk_score', lang)}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t('table.status', lang)}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>{t('table.action', lang)}</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  {lang === 'bn' ? 'কোনো ঝুঁকিপূর্ণ গ্রাহক পাওয়া যায়নি।' : 'No users found matching current filter.'}
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const riskPct = (u.drop_off_probability * 100).toFixed(1);
                const isHighRisk = u.drop_off_probability >= 0.70;

                return (
                  <tr
                    key={u.user_id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#f8fafc' }}>
                      <span style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}>{u.user_id}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          background: 'rgba(244, 63, 94, 0.12)',
                          color: '#fda4af',
                          border: '1px solid rgba(244, 63, 94, 0.25)',
                        }}
                      >
                        <AlertCircle size={12} />
                        {u.drop_off_milestone}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '80px',
                            height: '6px',
                            borderRadius: '999px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${riskPct}%`,
                              borderRadius: '999px',
                              background: isHighRisk
                                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                : 'linear-gradient(90deg, #3b82f6, #f59e0b)',
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 600, color: isHighRisk ? '#f87171' : '#fbbf24' }}>
                          {riskPct}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-success">
                        <Sparkles size={11} />
                        {lang === 'bn' ? 'নাজ যোগ্য' : 'Nudge Ready'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <Link
                        href={`/users/${u.user_id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          background: 'rgba(0, 210, 180, 0.1)',
                          border: '1px solid rgba(0, 210, 180, 0.25)',
                          color: '#00d2b4',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span>{t('table.view_detail', lang)}</span>
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

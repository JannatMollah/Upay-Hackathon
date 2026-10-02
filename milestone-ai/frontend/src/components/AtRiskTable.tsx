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
    <div className="glass-panel" style={{ padding: '24px 28px' }}>
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
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '2px',
          }}>
            {t('table.title', lang)}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {lang === 'bn'
              ? `মোট ${totalAtRisk.toLocaleString()} জন গ্রাহকের জন্য তাৎক্ষণিক ইন্টারভেনশন প্রয়োজন`
              : `Ranked by severity • ${totalAtRisk.toLocaleString()} users flagged`}
          </p>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Filter size={14} style={{ color: 'var(--text-dim)', marginRight: '2px' }} />
          {filterOptions.map((opt) => {
            const active = currentFilter === opt.key;
            return (
              <button
                key={opt.key || 'all'}
                onClick={() => onFilterChange(opt.key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  fontWeight: active ? 600 : 500,
                  background: active ? 'var(--upay-blue)' : 'var(--bg-subtle)',
                  border: active
                    ? '1px solid var(--upay-blue)'
                    : '1px solid var(--border-light)',
                  color: active ? '#fff' : 'var(--text-muted)',
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
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.85rem',
        }}>
          <thead>
            <tr style={{
              borderBottom: '2px solid var(--border-light)',
              color: 'var(--text-muted)',
            }}>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('table.user_id', lang)}</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('table.drop_off', lang)}</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('table.risk_score', lang)}</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('table.status', lang)}</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>{t('table.action', lang)}</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{
                  padding: '32px',
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                }}>
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
                      borderBottom: '1px solid var(--border-light)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{
                      padding: '12px 14px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}>
                      <span style={{
                        fontFamily: "'SF Mono', 'Fira Code', monospace",
                        fontSize: '0.82rem',
                        letterSpacing: '0.02em',
                      }}>
                        {u.user_id}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-risk">
                        <AlertCircle size={11} />
                        {u.drop_off_milestone}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '72px',
                            height: '5px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--bg-muted)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${riskPct}%`,
                              borderRadius: 'var(--radius-full)',
                              background: isHighRisk
                                ? 'var(--color-danger)'
                                : 'var(--color-warning)',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span style={{
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          color: isHighRisk ? 'var(--color-danger)' : 'var(--color-warning)',
                        }}>
                          {riskPct}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-success">
                        <Sparkles size={10} />
                        {lang === 'bn' ? 'নাজ যোগ্য' : 'Nudge Ready'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <Link
                        href={`/users/${u.user_id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: 'var(--upay-blue)',
                          color: '#fff',
                          transition: 'all 0.15s',
                          boxShadow: 'var(--shadow-xs)',
                        }}
                      >
                        <span>{t('table.view_detail', lang)}</span>
                        <ArrowUpRight size={13} />
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

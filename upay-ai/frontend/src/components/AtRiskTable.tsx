'use client';

import React from 'react';
import Link from 'next/link';
import { AtRiskUser } from '../types';
import { Language, t } from '../lib/i18n';
import { ArrowUpRight, Filter, AlertCircle, Sparkles, ShieldAlert, Users } from 'lucide-react';

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
    <div className="glass-panel" style={{ padding: '28px 28px 24px' }}>
      {/* Section Header */}
      <div className="section-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-danger-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldAlert size={14} style={{ color: 'var(--color-danger)' }} />
            </div>
            <h2 className="section-title">{t('table.title', lang)}</h2>
          </div>
          <p className="section-subtitle" style={{ marginLeft: '36px' }}>
            {lang === 'bn'
              ? `মোট ${totalAtRisk.toLocaleString()} জন গ্রাহকের জন্য তাৎক্ষণিক ইন্টারভেনশন প্রয়োজন`
              : `Ranked by severity • ${totalAtRisk.toLocaleString()} users flagged for intervention`}
          </p>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Filter size={14} style={{ color: 'var(--text-dim)', marginRight: '2px' }} />
          {filterOptions.map((opt) => (
            <button
              key={opt.key || 'all'}
              onClick={() => onFilterChange(opt.key)}
              className={`pill-filter ${currentFilter === opt.key ? 'active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
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
            }}>
              {[
                { text: t('table.user_id', lang), align: 'left' as const },
                { text: t('table.drop_off', lang), align: 'left' as const },
                { text: t('table.risk_score', lang), align: 'left' as const },
                { text: t('table.status', lang), align: 'left' as const },
                { text: t('table.action', lang), align: 'right' as const },
              ].map((col, i) => (
                <th key={i} style={{
                  padding: '12px 14px',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-dim)',
                  textAlign: col.align,
                }}>
                  {col.text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{
                  padding: '48px 32px',
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Users size={24} style={{ color: 'var(--text-dim)', opacity: 0.5 }} />
                    <span>
                      {lang === 'bn' ? 'কোনো ঝুঁকিপূর্ণ গ্রাহক পাওয়া যায়নি।' : 'No users found matching current filter.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u, index) => {
                const riskPct = (u.drop_off_probability * 100).toFixed(1);
                const isHighRisk = u.drop_off_probability >= 0.70;

                return (
                  <tr
                    key={u.user_id}
                    className="table-row"
                    style={{
                      animation: `fadeInUp 0.3s var(--ease-out) ${index * 0.02}s both`,
                    }}
                  >
                    <td style={{ padding: '14px 14px', fontWeight: 600 }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.82rem',
                        letterSpacing: '0.02em',
                        color: 'var(--text-primary)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-subtle)',
                      }}>
                        {u.user_id}
                      </span>
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <span className="badge badge-risk">
                        <AlertCircle size={11} />
                        {u.drop_off_milestone}
                      </span>
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '72px',
                          height: '5px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-muted)',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${riskPct}%`,
                            borderRadius: 'var(--radius-full)',
                            background: isHighRisk ? 'var(--color-danger)' : 'var(--color-warning)',
                            transition: 'width 0.4s var(--ease-out)',
                          }} />
                        </div>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: isHighRisk ? 'var(--color-danger)' : 'var(--color-warning)',
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {riskPct}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <span className="badge badge-success">
                        <Sparkles size={10} />
                        {lang === 'bn' ? 'নাজ যোগ্য' : 'Nudge Ready'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                      <Link
                        href={`/activation/${u.user_id}`}
                        className="btn-primary"
                        style={{
                          padding: '7px 14px',
                          fontSize: '0.78rem',
                          borderRadius: 'var(--radius-md)',
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

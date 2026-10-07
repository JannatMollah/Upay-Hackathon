'use client';

import React from 'react';
import Link from 'next/link';
import { AtRiskUser } from '../types';
import { Language, t, getMilestoneName } from '../lib/i18n';
import { AlertCircle, Sparkles, Users, ChevronDown, RefreshCw } from 'lucide-react';

interface AtRiskTableProps {
  users: AtRiskUser[];
  totalAtRisk: number;
  currentFilter: string | null;
  onFilterChange: (m: string | null) => void;
  lang: Language;
  isLoading?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export const AtRiskTable: React.FC<AtRiskTableProps> = ({
  users,
  totalAtRisk,
  currentFilter,
  onFilterChange,
  lang,
  isLoading = false,
  onLoadMore,
  isLoadingMore = false,
}) => {
  // All 6 milestone filters matching the 6 Funnel items
  const filterOptions = [
    { key: 'M1', label: lang === 'bn' ? 'পিন সেটআপ' : 'PIN Setup' },
    { key: 'M2', label: lang === 'bn' ? 'প্রথম রিচার্জ' : 'First Recharge' },
    { key: 'M3', label: lang === 'bn' ? 'ক্যাশ-ইন / অ্যাড মানি' : 'Cash-in / Add Money' },
    { key: 'M4', label: lang === 'bn' ? 'মার্চেন্ট পেমেন্ট' : 'Merchant Payment' },
    { key: 'M5', label: lang === 'bn' ? 'ডিপিএস একাউন্ট' : 'Open DPS Account' },
    { key: 'M6', label: lang === 'bn' ? 'সব ধাপ সম্পূর্ণ' : 'All Steps Complete' },
  ];

  return (
    <div id="at-risk-table-section" className="glass-panel" style={{ padding: '28px 28px 24px', scrollMarginTop: '20px' }}>
      {/* Section Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">{t('table.title', lang)}</h2>
          <p className="section-subtitle" style={{ fontSize: '0.94rem', marginTop: '4px' }}>
            {lang === 'bn'
              ? `মোট ${totalAtRisk.toLocaleString()} জন গ্রাহকের জন্য তাৎক্ষণিক ইন্টারভেনশন প্রয়োজন`
              : `Ranked by severity • ${totalAtRisk.toLocaleString()} users flagged for intervention`}
          </p>
        </div>

        {/* Filter pills for the 6 milestones without filter icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onFilterChange(currentFilter === opt.key ? null : opt.key)}
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
          fontSize: '0.95rem',
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
                  padding: '14px 16px',
                  fontWeight: 700,
                  fontSize: '0.80rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-dim)',
                  textAlign: col.align,
                }}>
                  {col.text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{
                  padding: '52px 32px',
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                  fontSize: '0.94rem',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--upay-blue)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {lang === 'bn' ? 'গ্রাহকদের তথ্য লোড হচ্ছে...' : 'Loading at-risk users...'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{
                  padding: '48px 32px',
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                  fontSize: '0.94rem',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Users size={26} style={{ color: 'var(--text-dim)', opacity: 0.5 }} />
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
                const rowRiskColor = isHighRisk ? '#EF4444' : (u.drop_off_probability >= 0.40 ? '#F59E0B' : '#10B981');

                return (
                  <tr
                    key={`${u.user_id}-${index}`}
                    className="table-row table-row-premium"
                    style={{
                      ['--row-risk-color' as any]: rowRiskColor,
                      animation: `fadeInUp 0.3s var(--ease-out) ${Math.min(index * 0.02, 0.4)}s both`,
                    }}
                  >
                    {/* User ID — Inter font, avatar + ID */}
                    <td style={{ padding: '16px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--bg-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-light)'
                        }}>
                          {u.user_id.slice(-2)}
                        </div>
                        <span style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.98rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          letterSpacing: '0.02em',
                        }}>
                          {u.user_id}
                        </span>
                      </div>
                    </td>

                    {/* Milestone */}
                    <td style={{ padding: '16px 16px' }}>
                      <span className="badge badge-risk" style={{ fontSize: '0.82rem', padding: '5px 12px' }}>
                        <AlertCircle size={13} />
                        {getMilestoneName(u.drop_off_milestone, lang)}
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td style={{ padding: '16px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontWeight: 700,
                          color: isHighRisk ? 'var(--color-danger)' : 'var(--text-primary)',
                          fontVariantNumeric: 'tabular-nums',
                          width: '45px'
                        }}>
                          {riskPct}%
                        </span>
                        <div className="risk-bar-inline">
                          <div
                            className="risk-bar-fill"
                            style={{
                              width: `${u.drop_off_probability * 100}%`,
                              background: rowRiskColor
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 16px' }}>
                      <span className={`badge ${u.nudge_eligible ? 'badge-brand' : 'badge-gold'}`}>
                        {u.nudge_eligible ? (
                          <>
                            <Sparkles size={12} />
                            {lang === 'bn' ? 'নাজ সুপারিশকৃত' : 'Nudge Recommended'}
                          </>
                        ) : (
                          <>
                            <AlertCircle size={12} />
                            {lang === 'bn' ? 'ম্যানুয়াল রিভিও' : 'Needs Review'}
                          </>
                        )}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '16px 16px', textAlign: 'right' }}>
                      <Link
                        href={`/activation/${u.user_id}`}
                        className="btn-primary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          fontSize: '0.82rem',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {lang === 'bn' ? 'বিস্তারিত' : 'View Details'}
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Load More Button — 10 at a time */}
      {users.length < totalAtRisk && onLoadMore && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginTop: '22px',
          paddingTop: '18px',
          borderTop: '1px solid var(--border-light)',
        }}>
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="btn-primary"
            style={{
              padding: '10px 28px',
              fontSize: '0.92rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: isLoadingMore ? 'not-allowed' : 'pointer',
              opacity: isLoadingMore ? 0.75 : 1,
            }}
          >
            {isLoadingMore ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading more users...'}</span>
              </>
            ) : (
              <>
                <ChevronDown size={17} />
                <span>{lang === 'bn' ? 'আরও ১০ জন দেখুন (Load More)' : 'Load 10 More Users'}</span>
              </>
            )}
          </button>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            {lang === 'bn'
              ? `মোট ${totalAtRisk.toLocaleString()} জনের মধ্যে ${users.length} জন প্রদর্শিত`
              : `Showing ${users.length} of ${totalAtRisk.toLocaleString()} users`}
          </span>
        </div>
      )}

      {users.length >= totalAtRisk && users.length > 0 && (
        <div style={{
          textAlign: 'center',
          marginTop: '18px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-light)',
          fontSize: '0.86rem',
          color: 'var(--text-dim)',
        }}>
          {lang === 'bn'
            ? `সবগুলো ${totalAtRisk.toLocaleString()} জন গ্রাহক প্রদর্শিত হয়েছে`
            : `All ${totalAtRisk.toLocaleString()} users loaded`}
        </div>
      )}
    </div>
  );
};

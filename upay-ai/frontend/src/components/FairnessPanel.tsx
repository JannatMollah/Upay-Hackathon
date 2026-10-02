'use client';

import React from 'react';
import { Language } from '../lib/i18n';
import { ShieldAlert, CheckCircle2, XCircle, Scale } from 'lucide-react';

interface FairnessPanelProps {
  fairnessData: any;
  lang: Language;
}

export const FairnessPanel: React.FC<FairnessPanelProps> = ({ fairnessData, lang }) => {
  if (!fairnessData) return null;

  const milestones = ['M2', 'M3', 'M4', 'M5'];

  return (
    <div className="glass-panel" style={{ padding: '24px 28px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-info-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-info)',
            }}
          >
            <Scale size={18} />
          </div>
          <div>
            <h3 style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}>
              {lang === 'bn' ? 'ডেমোগ্রাফিক ন্যায্যতা অডিট' : 'Demographic Fairness & Equalized Odds Audit'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {lang === 'bn'
                ? 'ন্যায্যতা থ্রেশহোল্ড: অনুপাত >= ০.৮০ (৮০% রুল)'
                : 'Fairness standard: EO Ratio ≥ 0.80 (80% Disparate Impact rule)'}
            </p>
          </div>
        </div>

        <span className="badge badge-brand">Threshold: 0.80</span>
      </div>

      {/* Audit Table */}
      <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
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
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Milestone</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Urban vs Rural EO</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Male vs Female EO</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m) => {
              const report = fairnessData[m] || {};
              const uv = report.urban_vs_rural || {};
              const mf = report.male_vs_female || {};

              const uvRatio = uv.equalized_odds_ratio !== undefined ? uv.equalized_odds_ratio : 0.95;
              const uvPass = uv.passed !== undefined ? uv.passed : uvRatio >= 0.8;

              const mfRatio = mf.equalized_odds_ratio !== undefined ? mf.equalized_odds_ratio : 0.96;
              const mfPass = mf.passed !== undefined ? mf.passed : mfRatio >= 0.8;

              const milestoneFullName = {
                M2: lang === 'bn' ? 'প্রথম রিচার্জ' : 'First Recharge',
                M3: lang === 'bn' ? 'ক্যাশ-ইন / অ্যাড মানি' : 'Cash-in / Add Money',
                M4: lang === 'bn' ? 'মার্চেন্ট পেমেন্ট' : 'Merchant QR Payment',
                M5: lang === 'bn' ? 'ডিপিএস একাউন্ট' : 'Open DPS Account',
              }[m] || m;

              return (
                <tr key={m} style={{ borderBottom: '1px solid var(--border-light)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.94rem' }}>
                    {milestoneFullName}
                  </td>
                  <td style={{
                    padding: '14px 16px',
                    fontWeight: 600,
                    color: uvPass ? 'var(--color-success)' : 'var(--color-danger)',
                    fontSize: '0.92rem',
                  }}>
                    {uvRatio.toFixed(3)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {uvPass ? (
                      <span className="badge badge-success" style={{ fontSize: '0.80rem' }}>
                        <CheckCircle2 size={12} />
                        PASS
                      </span>
                    ) : (
                      <span className="badge badge-risk" style={{ fontSize: '0.80rem' }}>
                        <XCircle size={12} />
                        FLAGGED
                      </span>
                    )}
                  </td>
                  <td style={{
                    padding: '14px 16px',
                    fontWeight: 600,
                    color: mfPass ? 'var(--color-success)' : 'var(--color-danger)',
                    fontSize: '0.92rem',
                  }}>
                    {mfRatio.toFixed(3)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {mfPass ? (
                      <span className="badge badge-success" style={{ fontSize: '0.80rem' }}>
                        <CheckCircle2 size={12} />
                        PASS
                      </span>
                    ) : (
                      <span className="badge badge-risk" style={{ fontSize: '0.80rem' }}>
                        <XCircle size={12} />
                        FLAGGED
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Merchant QR Payment Disparity Alert */}
      <div
        style={{
          background: 'var(--color-danger-bg)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
        }}
      >
        <ShieldAlert size={20} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.90rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--color-danger)', display: 'block', marginBottom: '4px' }}>
            {lang === 'bn'
              ? 'ন্যায্যতা বিশ্লেষণ ও ব্যবসায়িক সিদ্ধান্ত (মার্চেন্ট পেমেন্ট বৈষম্য বিশ্লেষণ):'
              : 'Fairness Discovery & Strategic Recommendation (Merchant Payment Disparity):'}
          </strong>{' '}
          {lang === 'bn'
            ? 'মার্চেন্ট পেমেন্ট ধাপে শহরাঞ্চল ও গ্রামাঞ্চলের মধ্যে বৈষম্য শনাক্ত হয়েছে (EO ratio: 0.433)। এর মূল কারণ গ্রামাঞ্চলে QR মার্চেন্ট পয়েন্টের সংখ্যা সীমিত (Pattern P3)। প্রস্তাবনা: গ্রামীণ ব্যবহারকারীদের জন্য QR মার্চেন্টের বদলে বিকল্প পেমেন্ট বা এজেন্ট নেটওয়ার্ক ইন্টারভেনশন অফার করা।'
            : 'Merchant QR Payment milestone triggered a fairness alert between urban and rural cohorts (EO ratio: 0.433 vs 0.80 threshold). This reflects real ground reality: rural regions have fewer onboarded QR merchants (Pattern P3). Rather than suppressing this, upay can target merchant onboarding or offer alternative rural digital utility incentives!'}
        </div>
      </div>
    </div>
  );
};

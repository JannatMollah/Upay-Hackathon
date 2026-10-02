'use client';

import React from 'react';
import { Explanation } from '../types';
import { Language, t, getMilestoneName } from '../lib/i18n';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ShapWaterfallProps {
  explanation: Explanation | null;
  targetMilestone: string | null;
  lang: Language;
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({
  explanation,
  targetMilestone,
  lang,
}) => {
  if (!explanation || !explanation.features || explanation.features.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {t('user.shap_title', lang)}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {lang === 'bn' ? 'এই গ্রাহকের জন্য কোনো ড্রপ-অফ শনাক্ত হয়নি।' : 'User is not at imminent risk for this stage.'}
        </p>
      </div>
    );
  }

  const maxAbs = Math.max(...explanation.features.map((f) => Math.abs(f.shap)), 0.01);

  const featureLabels: Record<string, { en: string; bn: string }> = {
    app_opens_day1: { en: 'App Opens on Day 1', bn: '১ম দিনে অ্যাপ ওপেন সংখ্যা' },
    notification_enabled: { en: 'Push Notifications Enabled', bn: 'পুশ নোটিফিকেশন অন রাখা' },
    registration_channel_agent_assisted: { en: 'Registered via Agent', bn: 'এজেন্টের মাধ্যমে রেজিস্ট্রেশন' },
    registration_channel_referral: { en: 'Registered via Friend Referral', bn: 'রেফারালের মাধ্যমে রেজিস্ট্রেশন' },
    device_type_feature_phone: { en: 'Uses Feature Phone', bn: 'বাটন/ফিচার ফোন ব্যবহার' },
    area_type_rural: { en: 'Rural Location', bn: 'গ্রামাঞ্চল ভৌগোলিক এলাকা' },
    salary_wallet_active: { en: 'Active Salary Wallet', bn: 'অ্যাক্টিভ স্যালারি ওয়ালেট' },
    registration_day_of_week: { en: 'Registered on Weekend', bn: 'সাপ্তাহিক ছুটির দিনে রেজিস্ট্রেশন' },
    time_in_app_minutes_day1: { en: 'Day 1 Time in App', bn: '১ম দিনে অ্যাপ ব্যবহারের সময়' },
    ussd_sessions_day1_3: { en: 'USSD Sessions (Day 1-3)', bn: 'ইউএসএসডি ডায়াল সেশন' },
    has_bank_account: { en: 'Linked Bank Account', bn: 'সংযুক্ত ব্যাংক অ্যাকাউন্ট' },
  };

  return (
    <div className="glass-panel" style={{ padding: '24px 28px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('user.shap_title', lang)}
            </h3>
            {targetMilestone && (
              <span className="badge badge-risk" style={{ fontSize: '0.80rem', padding: '3px 10px' }}>
                {lang === 'bn' ? 'ঝুঁকির মাইলস্টোন: ' : 'Target: '}
                {getMilestoneName(targetMilestone, lang)}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('user.shap_subtitle', lang)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', fontSize: '0.76rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              background: 'var(--color-danger)',
            }} />
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              {t('user.increases_risk', lang)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              background: 'var(--color-success)',
            }} />
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              {t('user.decreases_risk', lang)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {explanation.features.map((feat, idx) => {
          const isRisk = feat.shap < 0 || feat.direction === 'increases_risk';
          const color = isRisk ? 'var(--color-danger)' : 'var(--color-success)';
          const bgColor = isRisk ? 'var(--color-danger-bg)' : 'var(--color-success-bg)';
          const barWidth = Math.min(100, Math.round((Math.abs(feat.shap) / maxAbs) * 100));
          const labelObj = featureLabels[feat.name];
          const displayName = labelObj ? (lang === 'bn' ? labelObj.bn : labelObj.en) : feat.name;

          return (
            <div
              key={idx}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-light)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                transition: 'background 0.1s',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-sm)',
                    background: bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isRisk ? (
                      <ArrowUpRight size={13} style={{ color }} />
                    ) : (
                      <ArrowDownRight size={13} style={{ color }} />
                    )}
                  </div>
                  <div>
                    <span style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}>
                      {displayName}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-dim)',
                      marginLeft: '8px',
                    }}>
                      ({feat.name} = {feat.value})
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: color,
                  }}
                >
                  {feat.shap > 0 ? `+${feat.shap.toFixed(4)}` : feat.shap.toFixed(4)}
                </span>
              </div>

              {/* Bar */}
              <div
                style={{
                  height: '5px',
                  width: '100%',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-muted)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${barWidth}%`,
                    borderRadius: 'var(--radius-full)',
                    background: color,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

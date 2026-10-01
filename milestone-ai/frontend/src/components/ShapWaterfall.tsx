'use client';

import React from 'react';
import { Explanation } from '../types';
import { Language, t } from '../lib/i18n';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

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
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
          {t('user.shap_title', lang)}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          {lang === 'bn' ? 'এই গ্রাহকের জন্য কোনো ড্রপ-অফ শনাক্ত হয়নি।' : 'User is not at imminent risk for this stage.'}
        </p>
      </div>
    );
  }

  // Find max abs shap for scaling
  const maxAbs = Math.max(...explanation.features.map((f) => Math.abs(f.shap)), 0.01);

  // Friendly human-readable feature descriptions
  const featureLabels: Record<string, { en: string; bn: string }> = {
    app_opens_day1: { en: 'App Opens on Day 1', bn: '১ম দিনে অ্যাপ ওপেন সংখ্যা' },
    notification_enabled: { en: 'Push Notifications Enabled', bn: 'পুশ নোটিফিকেশন অন রাখা' },
    registration_channel_agent_assisted: { en: 'Registered via Agent', bn: 'এজেন্টের মাধ্যমে রেজিস্ট্রেশন' },
    registration_channel_referral: { en: 'Registered via Friend Referral', bn: 'রেফারালের মাধ্যমে রেজিস্ট্রেশন' },
    device_type_feature_phone: { en: 'Uses Feature Phone (Non-Smartphone)', bn: 'বাটন/ফিচার ফোন ব্যবহার' },
    area_type_rural: { en: 'Rural Geographic Location', bn: 'গ্রামাঞ্চল ভৌগোলিক এলাকা' },
    salary_wallet_active: { en: 'Active Payroll / Salary Wallet', bn: 'অ্যাক্টিভ স্যালারি ওয়ালেট' },
    registration_day_of_week: { en: 'Registered on Weekend', bn: 'সাপ্তাহিক ছুটির দিনে রেজিস্ট্রেশন' },
    time_in_app_minutes_day1: { en: 'Day 1 Time in App', bn: '১ম দিনে অ্যাপ ব্যবহারের সময়' },
    ussd_sessions_day1_3: { en: 'USSD Dial Sessions (Day 1-3)', bn: 'ইউএসএসডি ডায়াল সেশন' },
    has_bank_account: { en: 'Linked Commercial Bank Account', bn: 'সংযুক্ত ব্যাংক অ্যাকাউন্ট' },
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
              {t('user.shap_title', lang)}
            </h3>
            {targetMilestone && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(244, 63, 94, 0.15)',
                  color: '#fda4af',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                }}
              >
                Target: {targetMilestone}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            {t('user.shap_subtitle', lang)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f43f5e' }} />
            <span>{t('user.increases_risk', lang)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00d2b4' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#00d2b4' }} />
            <span>{t('user.decreases_risk', lang)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {explanation.features.map((feat, idx) => {
          const isRisk = feat.shap < 0 || feat.direction === 'increases_risk';
          const color = isRisk ? '#f43f5e' : '#00d2b4';
          const barWidth = Math.min(100, Math.round((Math.abs(feat.shap) / maxAbs) * 100));
          const labelObj = featureLabels[feat.name];
          const displayName = labelObj ? (lang === 'bn' ? labelObj.bn : labelObj.en) : feat.name;

          return (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '12px 16px',
                borderRadius: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isRisk ? (
                    <ArrowUpRight size={16} style={{ color: '#f43f5e', flexShrink: 0 }} />
                  ) : (
                    <ArrowDownRight size={16} style={{ color: '#00d2b4', flexShrink: 0 }} />
                  )}
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>
                      {displayName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px' }}>
                      ({feat.name} = {feat.value})
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: color,
                    }}
                  >
                    {feat.shap > 0 ? `+${feat.shap.toFixed(4)}` : feat.shap.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Magnitude bar */}
              <div
                style={{
                  height: '6px',
                  width: '100%',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${barWidth}%`,
                    borderRadius: '999px',
                    background: color,
                    transition: 'width 0.5s ease',
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

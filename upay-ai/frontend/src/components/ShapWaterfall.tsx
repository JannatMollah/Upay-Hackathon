'use client';

import React from 'react';
import { Explanation } from '../types';
import { Language, t, getMilestoneName } from '../lib/i18n';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

interface ShapWaterfallProps {
  explanation: Explanation | null;
  targetMilestone: string | null;
  lang: Language;
}

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

const CustomTooltip = ({ active, payload, lang }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const isRisk = data.shap < 0 || data.direction === 'increases_risk';

  return (
    <div className="chart-tooltip-glass">
      <div className="tooltip-label">{data.displayName}</div>
      <div className="tooltip-value" style={{ color: isRisk ? '#EF4444' : '#10B981', fontSize: '1.05rem' }}>
        {data.shap > 0 ? '+' : ''}{data.shap.toFixed(3)} SHAP
      </div>
      <div className="tooltip-sub" style={{ marginTop: '4px' }}>
        {lang === 'bn' ? 'অরিজিনাল ভ্যালু: ' : 'Original Value: '}
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
          {typeof data.value === 'number' ? data.value.toFixed(2) : data.value}
        </span>
      </div>
      <div className="tooltip-sub" style={{ color: 'var(--text-muted)' }}>
        {isRisk
          ? (lang === 'bn' ? '⚠️ ড্রপ-অফ ঝুঁকি বাড়ায়' : '⚠️ Increases Drop-off Risk')
          : (lang === 'bn' ? '✅ ড্রপ-অফ ঝুঁকি কমায়' : '✅ Decreases Drop-off Risk')}
      </div>
    </div>
  );
};

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

  // Format data for Recharts
  const chartData = explanation.features.map((feat) => {
    const labelObj = featureLabels[feat.name];
    const displayName = labelObj ? (lang === 'bn' ? labelObj.bn : labelObj.en) : feat.name;
    const isRisk = feat.shap < 0 || feat.direction === 'increases_risk';
    return {
      ...feat,
      displayName,
      isRisk,
      fill: isRisk ? '#EF4444' : '#10B981',
      // Invert shap so negative (increases drop-off risk) shows clearly on one side if we want,
      // but let's just use raw shap. Usually negative SHAP in this context might mean drop-off.
    };
  }).sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap)); // sort by magnitude

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
              <span className="badge badge-risk" style={{ fontSize: '0.80rem', padding: '3px 10px', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
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
              background: '#EF4444',
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
              background: '#10B981',
            }} />
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              {t('user.decreases_risk', lang)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 320, marginTop: '16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            barSize={16}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="var(--border-light)" />
            <XAxis
              type="number"
              tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border-light)' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border-light)' }}
              tickLine={false}
              width={140}
            />
            <Tooltip
              content={<CustomTooltip lang={lang} />}
              cursor={{ fill: 'var(--bg-muted)', opacity: 0.4 }}
            />
            <ReferenceLine x={0} stroke="var(--text-muted)" strokeWidth={1} />
            <Bar
              dataKey="shap"
              radius={[2, 2, 2, 2]}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
        {lang === 'bn' ? 'বেস ভ্যালু: ' : 'Base Value: '}
        <span style={{ fontWeight: 600 }}>{explanation.base_value.toFixed(3)}</span>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { MilestoneStat } from '../types';
import { Language, t } from '../lib/i18n';
import { TrendingDown, Users, Check } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';

interface FunnelChartProps {
  milestones: MilestoneStat[];
  totalUsers: number;
  selectedMilestone: string | null;
  onSelectMilestone: (m: string | null) => void;
  lang: Language;
}

const MILESTONE_COLORS = [
  '#1E4D8C',
  '#2563EB',
  '#0EA5E9',
  '#06B6D4',
  '#059669',
  '#10B981',
];

const MILESTONE_LABELS_EN: Record<string, string> = {
  M1: 'App + PIN',
  M2: 'Recharge',
  M3: 'Cash-in',
  M4: 'QR Pay',
  M5: 'Open DPS',
  M6: 'Complete',
};

const MILESTONE_LABELS_BN: Record<string, string> = {
  M1: 'অ্যাপ + পিন',
  M2: 'রিচার্জ',
  M3: 'ক্যাশ-ইন',
  M4: 'কিউআর পে',
  M5: 'ডিপিএস',
  M6: 'সম্পূর্ণ',
};

const CustomTooltip = ({ active, payload, lang }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="chart-tooltip-glass">
      <div className="tooltip-label">{data.fullName}</div>
      <div className="tooltip-value">{(data.rate * 100).toFixed(1)}%</div>
      <div className="tooltip-sub">
        {data.completed?.toLocaleString() || '—'} / {data.total?.toLocaleString() || '—'} {lang === 'bn' ? 'গ্রাহক' : 'users'}
      </div>
      {data.dropOff != null && (
        <div className="tooltip-sub" style={{ color: '#EF4444', marginTop: '4px' }}>
          ↓ {data.dropOff}% {lang === 'bn' ? 'ড্রপ' : 'drop from previous'}
        </div>
      )}
    </div>
  );
};

export const FunnelChart: React.FC<FunnelChartProps> = ({
  milestones,
  totalUsers,
  selectedMilestone,
  onSelectMilestone,
  lang,
}) => {
  const labels = lang === 'bn' ? MILESTONE_LABELS_BN : MILESTONE_LABELS_EN;

  const chartData = milestones.map((m, i) => {
    const prev = i > 0 ? milestones[i - 1].rate : 1;
    const dropOff = i > 0 ? ((prev - m.rate) / prev * 100).toFixed(1) : null;
    return {
      name: labels[m.milestone] || m.milestone,
      fullName: `${m.milestone} — ${labels[m.milestone] || m.milestone}`,
      milestone: m.milestone,
      rate: m.rate,
      ratePercent: parseFloat((m.rate * 100).toFixed(1)),
      completed: m.completed_count,
      total: totalUsers,
      dropOff,
      fill: MILESTONE_COLORS[i] || '#64748B',
    };
  });

  return (
    <div className="glass-panel" style={{ padding: '28px 28px 20px' }}>
      {/* Section Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-display)' }}>
            {t('funnel.title', lang)}
          </h2>
          <p className="section-subtitle" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
            {t('funnel.subtitle', lang)} •{' '}
            <span style={{ color: 'var(--upay-blue)', fontWeight: 600 }}>
              {lang === 'bn'
                ? 'চার্টের বারে ক্লিক করে ফিল্টার করুন'
                : 'Click any bar to filter the table below'}
            </span>
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          color: 'var(--text-muted)',
          padding: '7px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-light)',
        }}>
          <Users size={15} />
          <span>
            {lang === 'bn' ? 'মোট গ্রাহক: ' : 'Total: '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {totalUsers.toLocaleString()}
            </strong>
          </span>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div style={{ width: '100%', height: 280, marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            barCategoryGap="22%"
          >
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              stroke="var(--border-light)"
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(v) => `${v}%`}
              axisLine={{ stroke: 'var(--border-light)' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={75}
            />
            <Tooltip
              content={<CustomTooltip lang={lang} />}
              cursor={{ fill: 'var(--gradient-card-hover)', radius: 6 }}
            />
            <Bar
              dataKey="ratePercent"
              radius={[0, 8, 8, 0]}
              onClick={(data: any) => {
                if (data && data.milestone) {
                  onSelectMilestone(
                    selectedMilestone === data.milestone ? null : data.milestone
                  );
                }
              }}
              style={{ cursor: 'pointer' }}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.milestone}
                  fill={entry.fill}
                  opacity={
                    selectedMilestone
                      ? entry.milestone === selectedMilestone
                        ? 1
                        : 0.35
                      : 0.85
                  }
                  stroke={
                    entry.milestone === selectedMilestone
                      ? entry.fill
                      : 'transparent'
                  }
                  strokeWidth={entry.milestone === selectedMilestone ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Milestone Pills (click to filter) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '12px',
        flexWrap: 'wrap',
      }}>
        <button
          className={`pill-filter ${!selectedMilestone ? 'active' : ''}`}
          onClick={() => onSelectMilestone(null)}
          style={{ fontSize: '0.82rem' }}
        >
          {lang === 'bn' ? 'সব দেখুন' : 'All Steps'}
        </button>
        {milestones.map((m, i) => (
          <button
            key={m.milestone}
            className={`pill-filter ${selectedMilestone === m.milestone ? 'active' : ''}`}
            onClick={() =>
              onSelectMilestone(
                selectedMilestone === m.milestone ? null : m.milestone
              )
            }
            style={{ fontSize: '0.82rem' }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: MILESTONE_COLORS[i],
                marginRight: 6,
              }}
            />
            {m.milestone}
          </button>
        ))}
      </div>
    </div>
  );
};

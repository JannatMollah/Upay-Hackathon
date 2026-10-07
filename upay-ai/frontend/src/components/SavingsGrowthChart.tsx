'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface SavingsGrowthChartProps {
  monthlyAmount: number;
  tenureMonths: number;
  maturityValue: number;
  lang: 'en' | 'bn';
}

const CustomTooltip = ({ active, payload, lang }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="chart-tooltip-glass">
      <div className="tooltip-label">
        {lang === 'bn' ? `মাস ${data.month}` : `Month ${data.month}`}
      </div>
      <div className="tooltip-value" style={{ color: '#059669' }}>
        ৳{data.withDPS?.toLocaleString()}
      </div>
      <div className="tooltip-sub" style={{ marginTop: '6px' }}>
        {lang === 'bn' ? 'ডিপিএস ছাড়া: ' : 'Without DPS: '}
        <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
          ৳{data.withoutDPS?.toLocaleString()}
        </span>
      </div>
      <div className="tooltip-sub" style={{ color: '#10B981' }}>
        + ৳{(data.withDPS - data.withoutDPS).toLocaleString()} {lang === 'bn' ? 'মুনাফা' : 'interest earned'}
      </div>
    </div>
  );
};

export const SavingsGrowthChart: React.FC<SavingsGrowthChartProps> = ({
  monthlyAmount,
  tenureMonths,
  maturityValue,
  lang,
}) => {
  // Generate month-by-month projection data
  const annualRate = 0.085; // ~8.5% annual
  const monthlyRate = annualRate / 12;

  const data = Array.from({ length: tenureMonths + 1 }, (_, month) => {
    const deposited = monthlyAmount * month;
    // Compound interest calculation
    let withDPS = 0;
    for (let m = 0; m < month; m++) {
      withDPS += monthlyAmount;
      withDPS *= (1 + monthlyRate);
    }
    return {
      month,
      withDPS: Math.round(withDPS),
      withoutDPS: deposited,
      label: month % Math.max(1, Math.floor(tenureMonths / 6)) === 0 ? `${month}` : '',
    };
  });

  // Override last point with actual maturity value
  if (data.length > 0) {
    data[data.length - 1].withDPS = maturityValue;
  }

  const interestEarned = maturityValue - (monthlyAmount * tenureMonths);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Summary chips */}
      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <div style={{
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-success-bg)',
          border: '1px solid var(--color-success-border)',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--color-success)',
        }}>
          {lang === 'bn' ? 'মোট মুনাফা' : 'Interest Earned'}: ৳{interestEarned.toLocaleString()}
        </div>
        <div style={{
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--upay-blue-soft)',
          border: '1px solid rgba(30, 77, 140, 0.15)',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--upay-blue)',
        }}>
          {lang === 'bn' ? 'ম্যাচুরিটি' : 'Maturity'}: ৳{maturityValue.toLocaleString()}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dpsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="noDpsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-light)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border-light)' }}
              tickLine={false}
              label={{
                value: lang === 'bn' ? 'মাস' : 'Months',
                position: 'insideBottomRight',
                offset: -5,
                fill: 'var(--text-dim)',
                fontSize: 11,
              }}
            />
            <YAxis
              tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}K`}
              width={52}
            />
            <Tooltip content={<CustomTooltip lang={lang} />} />
            {/* Without DPS line (flat deposits) */}
            <Area
              type="monotone"
              dataKey="withoutDPS"
              stroke="#94A3B8"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              fill="url(#noDpsFill)"
              dot={false}
              animationDuration={1500}
            />
            {/* With DPS line (compound growth) */}
            <Area
              type="monotone"
              dataKey="withDPS"
              stroke="#059669"
              strokeWidth={2.5}
              fill="url(#dpsFill)"
              dot={false}
              activeDot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1800}
            />
            {/* Maturity reference line */}
            <ReferenceLine
              y={maturityValue}
              stroke="#059669"
              strokeDasharray="3 3"
              strokeOpacity={0.4}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 16, height: 3, background: '#059669', borderRadius: 2 }} />
          <span style={{ fontWeight: 600 }}>{lang === 'bn' ? 'ডিপিএস সঞ্চয়' : 'With DPS (compound)'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 16, height: 2, background: '#94A3B8', borderRadius: 2, borderTop: '1px dashed #94A3B8' }} />
          <span style={{ fontWeight: 600 }}>{lang === 'bn' ? 'ডিপিএস ছাড়া' : 'Without DPS (flat)'}</span>
        </div>
      </div>
    </div>
  );
};

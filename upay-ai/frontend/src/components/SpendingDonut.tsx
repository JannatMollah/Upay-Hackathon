'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';

interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
}

interface SpendingDonutProps {
  categories: SpendingCategory[];
  totalExpense: number;
  lang: 'en' | 'bn';
}

const CATEGORY_COLORS: Record<string, string> = {
  food: '#EF4444',
  transport: '#F59E0B',
  utilities: '#3B82F6',
  shopping: '#8B5CF6',
  recharge: '#06B6D4',
  transfer: '#10B981',
  cash_withdrawal: '#EC4899',
  other: '#64748B',
};

const CATEGORY_LABELS_BN: Record<string, string> = {
  food: 'খাদ্য',
  transport: 'পরিবহন',
  utilities: 'বিল',
  shopping: 'কেনাকাটা',
  recharge: 'রিচার্জ',
  transfer: 'ট্রান্সফার',
  cash_withdrawal: 'ক্যাশ আউট',
  other: 'অন্যান্য',
};

const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;

  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--text-primary)" fontSize={18} fontWeight={800} fontFamily="var(--font-family)">
        ৳{value?.toLocaleString()}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-muted)" fontSize={12} fontWeight={600}>
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={1}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

export const SpendingDonut: React.FC<SpendingDonutProps> = ({
  categories,
  totalExpense,
  lang,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!categories || categories.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
        {lang === 'bn' ? 'ব্যয় ডেটা নেই' : 'No spending data available'}
      </div>
    );
  }

  const data = categories.map((cat) => ({
    name: lang === 'bn' ? (CATEGORY_LABELS_BN[cat.category] || cat.category) : cat.category,
    value: cat.amount,
    percentage: cat.percentage,
    color: CATEGORY_COLORS[cat.category] || '#64748B',
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Chart */}
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              {...{ activeIndex, activeShape: renderActiveShape } as any}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={90}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              animationDuration={800}
              animationEasing="ease-out"
              stroke="var(--bg-white)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={index === activeIndex ? 1 : 0.7}
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '8px',
      }}>
        {data.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIndex(idx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: idx === activeIndex ? `${item.color}12` : 'transparent',
              border: `1px solid ${idx === activeIndex ? `${item.color}30` : 'transparent'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: item.color,
              flexShrink: 0,
              boxShadow: idx === activeIndex ? `0 0 6px ${item.color}50` : 'none',
            }} />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {item.name}
              </div>
              <div style={{
                fontSize: '0.72rem',
                color: 'var(--text-dim)',
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
              }}>
                ৳{item.value.toLocaleString()} ({item.percentage}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

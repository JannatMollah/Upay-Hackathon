'use client';

import React from 'react';
import { DPSPlan } from '../types';
import { Language } from '../lib/i18n';

interface SavingsGrowthChartProps {
  plans: DPSPlan[];
  selectedTenure: number;
  onSelectTenure: (tenure: number) => void;
  lang: Language;
}

export const SavingsGrowthChart: React.FC<SavingsGrowthChartProps> = ({
  plans,
  selectedTenure,
  onSelectTenure,
  lang,
}) => {
  if (!plans || plans.length === 0) return null;

  const maxVal = Math.max(...plans.map((p) => p.projected_maturity), 1000);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
          {lang === 'bn' ? 'মেয়াদভিত্তিক সঞ্চয় প্রবৃদ্ধি (ডিপিএস প্রজেকশন):' : 'Projected Wealth Growth by Tenure:'}
        </span>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }} />
            <span>{lang === 'bn' ? 'জমা আসল' : 'Deposits'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#00d2b4' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#00d2b4' }} />
            <span>{lang === 'bn' ? 'মুনাফাসহ প্রাপ্তি' : 'Total Maturity'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${plans.length}, 1fr)`, gap: '10px' }}>
        {plans.map((p) => {
          const isSelected = p.tenure_months === selectedTenure;
          const depositHeight = Math.round((p.total_deposits / maxVal) * 90);
          const maturityHeight = Math.round((p.projected_maturity / maxVal) * 90);

          return (
            <div
              key={p.tenure_months}
              onClick={() => onSelectTenure(p.tenure_months)}
              style={{
                cursor: 'pointer',
                padding: '12px 8px',
                borderRadius: '10px',
                background: isSelected ? 'rgba(0, 210, 180, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? '1px solid rgba(0, 210, 180, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Bar visualization */}
              <div
                style={{
                  height: '100px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '4px',
                  paddingBottom: '4px',
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: `${depositHeight}%`,
                    borderRadius: '4px 4px 0 0',
                    background: '#3b82f6',
                    transition: 'height 0.3s ease',
                  }}
                  title={`Deposit: ৳${p.total_deposits.toLocaleString()}`}
                />
                <div
                  style={{
                    width: '14px',
                    height: `${maturityHeight}%`,
                    borderRadius: '4px 4px 0 0',
                    background: 'linear-gradient(180deg, #00d2b4 0%, #059669 100%)',
                    transition: 'height 0.3s ease',
                  }}
                  title={`Maturity: ৳${p.projected_maturity.toLocaleString()}`}
                />
              </div>

              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? '#00d2b4' : '#cbd5e1' }}>
                {p.tenure_months}m
              </span>

              <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
                ৳{Math.round(p.projected_maturity).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

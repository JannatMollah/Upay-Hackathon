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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <span style={{
          fontSize: '0.88rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          {lang === 'bn' ? 'মেয়াদভিত্তিক সঞ্চয় প্রবৃদ্ধি:' : 'Projected Wealth Growth by Tenure:'}
        </span>
        <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              background: 'var(--upay-blue)',
            }} />
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              {lang === 'bn' ? 'জমা আসল' : 'Deposits'}
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
              {lang === 'bn' ? 'মুনাফাসহ প্রাপ্তি' : 'Total Maturity'}
            </span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${plans.length}, 1fr)`,
        gap: '10px',
      }}>
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
                padding: '14px 8px',
                borderRadius: 'var(--radius-lg)',
                background: isSelected ? 'var(--upay-blue-soft)' : 'var(--bg-subtle)',
                border: isSelected
                  ? '2px solid var(--upay-blue)'
                  : '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Bars */}
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
                    background: 'var(--upay-blue)',
                    transition: 'height 0.3s ease',
                    opacity: isSelected ? 1 : 0.6,
                  }}
                  title={`Deposit: ৳${p.total_deposits.toLocaleString()}`}
                />
                <div
                  style={{
                    width: '14px',
                    height: `${maturityHeight}%`,
                    borderRadius: '4px 4px 0 0',
                    background: 'var(--color-success)',
                    transition: 'height 0.3s ease',
                    opacity: isSelected ? 1 : 0.6,
                  }}
                  title={`Maturity: ৳${p.projected_maturity.toLocaleString()}`}
                />
              </div>

              <span style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: isSelected ? 'var(--upay-blue)' : 'var(--text-secondary)',
              }}>
                {p.tenure_months}{lang === 'bn' ? 'মাস' : 'm'}
              </span>

              <span style={{
                fontSize: '0.72rem',
                color: 'var(--color-success)',
                fontWeight: 600,
              }}>
                ৳{Math.round(p.projected_maturity).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

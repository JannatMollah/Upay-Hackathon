'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Language, t } from '../../lib/i18n';
import { useLanguage } from '../../lib/LanguageContext';
import { MetricsGrid } from '../../components/MetricsGrid';
import { FairnessPanel } from '../../components/FairnessPanel';
import { BarChart3, RefreshCw } from 'lucide-react';

export default function PerformancePage() {
  const { lang } = useLanguage();
  const [metrics, setMetrics] = useState<any>(null);
  const [fairness, setFairness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsData, fairnessData] = await Promise.all([
        api.getModelMetrics(),
        api.getModelFairness(),
      ]);
      setMetrics(metricsData);
      setFairness(fairnessData);
    } catch (e) {
      console.error('Error loading model metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Title Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderLeft: '4px solid var(--upay-blue)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--upay-blue-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--upay-blue)',
            }}
          >
            <BarChart3 size={22} />
          </div>
          <div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              {lang === 'bn' ? 'মডেল পারফরম্যান্স ও ন্যায্যতা মূল্যায়ন' : 'Model Performance & Demographic Fairness'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {lang === 'bn'
                ? 'XGBoost মাল্টি-আউটপুট ক্লাসিফায়ার, সারপ্লাস রিগ্রেসর ও ন্যায্যতা অডিট মেট্রিক্স'
                : 'Rigorous validation against baseline, calibration scores, and demographic equality checks'}
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <RefreshCw size={14} />
          Reload
        </button>
      </div>

      {loading ? (
        <div style={{
          padding: '48px 0',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <RefreshCw size={22} style={{
            animation: 'spin 1s linear infinite',
            marginBottom: '10px',
            display: 'inline-block',
          }} />
          <p style={{ fontSize: '0.88rem' }}>Loading evaluation artifacts...</p>
        </div>
      ) : (
        <>
          <MetricsGrid metrics={metrics} lang={lang} />
          <FairnessPanel fairnessData={fairness} lang={lang} />
        </>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Language, t } from '../../lib/i18n';
import { useLanguage } from '../../lib/LanguageContext';
import { MetricsGrid } from '../../components/MetricsGrid';
import { FairnessPanel } from '../../components/FairnessPanel';
import { BarChart3, RefreshCw, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(16, 28, 48, 0.95) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(37, 99, 235, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
              {lang === 'bn' ? 'মডেল পারফরম্যান্স ও ন্যায্যতা মূল্যায়ন' : 'Model Performance & Demographic Fairness'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
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
            padding: '7px 16px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#cbd5e1',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} />
          Reload Report
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
          <p>Loading evaluation artifacts...</p>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <MetricsGrid metrics={metrics} lang={lang} />

          {/* Demographic Fairness Audit */}
          <FairnessPanel fairnessData={fairness} lang={lang} />
        </>
      )}
    </div>
  );
}

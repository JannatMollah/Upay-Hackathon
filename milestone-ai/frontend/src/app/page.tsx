'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { FunnelResponse, AtRiskUser } from '../types';
import { Language, t } from '../lib/i18n';
import { useLanguage } from '../lib/LanguageContext';
import { FunnelChart } from '../components/FunnelChart';
import { AtRiskTable } from '../components/AtRiskTable';
import { Users, AlertTriangle, TrendingUp, Search, Sparkles, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [funnel, setFunnel] = useState<FunnelResponse | null>(null);
  const [atRiskUsers, setAtRiskUsers] = useState<AtRiskUser[]>([]);
  const [totalAtRisk, setTotalAtRisk] = useState<number>(0);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [searchUserId, setSearchUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Load data
  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [funnelData, riskData] = await Promise.all([
          api.getFunnel(),
          api.getAtRiskUsers(selectedMilestone || undefined, 25),
        ]);
        setFunnel(funnelData);
        setAtRiskUsers(riskData.users);
        setTotalAtRisk(riskData.total_at_risk);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [selectedMilestone]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUserId.trim()) {
      router.push(`/users/${searchUserId.trim()}`);
    }
  };

  const activationRate = funnel && funnel.milestones.length > 5
    ? `${(funnel.milestones[5].rate * 100).toFixed(1)}%`
    : '19.3%';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Banner / Hero Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, rgba(16, 28, 48, 0.9) 0%, rgba(13, 23, 40, 0.95) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="badge badge-brand">
              <Sparkles size={12} />
              AI Lifecycle Intelligence
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Real-time upay customer activation tracking
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            {lang === 'bn' ? 'গ্রাহক অ্যাক্টিভেশন ও সঞ্চয় ড্যাশবোর্ড' : 'Activation & Growth Command Center'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '650px' }}>
            {lang === 'bn'
              ? 'মেশিন লার্নিং দ্বারা মাইলস্টোন ড্রপ-অফ পূর্বাভাস, SHAP ব্যাখ্যা ও স্বয়ংক্রিয় বাংলা নাজ বার্তা প্রেরণের সমন্বিত প্ল্যাটফর্ম।'
              : 'Predict drop-offs across registration milestones, inspect SHAP drivers, and trigger hyper-personalized Bangla nudges before drop-off occurs.'}
          </p>
        </div>

        {/* Quick User Search */}
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '4px 6px',
            maxWidth: '320px',
            width: '100%',
          }}
        >
          <Search size={18} style={{ color: '#94a3b8', marginLeft: '10px' }} />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'গ্রাহক আইডি খুঁজুন (উদা: U000013573)...' : 'Lookup user (e.g. U000013573)...'}
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '10px 12px',
              color: '#f8fafc',
              fontSize: '0.88rem',
              width: '100%',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #00d2b4)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ArrowRight size={16} />
          </button>
        </form>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              {t('kpi.total_users', lang)}
            </span>
            <Users size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f8fafc' }}>
            {funnel ? funnel.total_users.toLocaleString() : '50,000'}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
            Simulated MFS User Base
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              {t('kpi.overall_completion', lang)}
            </span>
            <TrendingUp size={18} style={{ color: '#00d2b4' }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#00d2b4' }}>
            {activationRate}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#34d399' }}>
            Completed All 6 Milestones
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              {t('kpi.at_risk_users', lang)}
            </span>
            <AlertTriangle size={18} style={{ color: '#f43f5e' }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f43f5e' }}>
            {totalAtRisk.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#fb7185' }}>
            Flagged for AI Nudge Delivery
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              {t('kpi.model_auc', lang)}
            </span>
            <Sparkles size={18} style={{ color: '#fbbf24' }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fbbf24' }}>
            0.7659
          </div>
          <span style={{ fontSize: '0.75rem', color: '#34d399' }}>
            XGBoost Multi-Output Model
          </span>
        </div>
      </div>

      {/* Funnel Chart */}
      {funnel && (
        <FunnelChart
          milestones={funnel.milestones}
          totalUsers={funnel.total_users}
          selectedMilestone={selectedMilestone}
          onSelectMilestone={setSelectedMilestone}
          lang={lang}
        />
      )}

      {/* At-Risk Table */}
      <AtRiskTable
        users={atRiskUsers}
        totalAtRisk={totalAtRisk}
        currentFilter={selectedMilestone}
        onFilterChange={setSelectedMilestone}
        lang={lang}
      />
    </div>
  );
}

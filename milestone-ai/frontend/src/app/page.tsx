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

  const kpiCards = [
    {
      label: t('kpi.total_users', lang),
      value: funnel ? funnel.total_users.toLocaleString() : '50,000',
      sub: lang === 'bn' ? 'সিমুলেটেড MFS ইউজার বেস' : 'Simulated MFS User Base',
      icon: Users,
      color: 'var(--upay-blue)',
      bg: 'var(--upay-blue-soft)',
    },
    {
      label: t('kpi.overall_completion', lang),
      value: activationRate,
      sub: lang === 'bn' ? '৬টি মাইলস্টোন সম্পন্ন' : 'Completed All 6 Milestones',
      icon: TrendingUp,
      color: 'var(--color-success)',
      bg: 'var(--color-success-bg)',
    },
    {
      label: t('kpi.at_risk_users', lang),
      value: totalAtRisk.toLocaleString(),
      sub: lang === 'bn' ? 'AI নাজ ডেলিভারির জন্য চিহ্নিত' : 'Flagged for AI Nudge Delivery',
      icon: AlertTriangle,
      color: 'var(--color-danger)',
      bg: 'var(--color-danger-bg)',
    },
    {
      label: t('kpi.model_auc', lang),
      value: '0.7659',
      sub: 'XGBoost Multi-Output Model',
      icon: Sparkles,
      color: 'var(--upay-yellow)',
      bg: 'var(--upay-yellow-soft)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Hero Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          borderLeft: '4px solid var(--upay-blue)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-brand">
              <Sparkles size={11} />
              AI Lifecycle Intelligence
            </span>
          </div>
          <h2 style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
          }}>
            {lang === 'bn' ? 'গ্রাহক অ্যাক্টিভেশন ও সঞ্চয় ড্যাশবোর্ড' : 'Activation & Growth Command Center'}
          </h2>
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            maxWidth: '600px',
            marginTop: '6px',
            lineHeight: 1.5,
          }}>
            {lang === 'bn'
              ? 'মেশিন লার্নিং দ্বারা মাইলস্টোন ড্রপ-অফ পূর্বাভাস, SHAP ব্যাখ্যা ও স্বয়ংক্রিয় বাংলা নাজ বার্তা প্রেরণের সমন্বিত প্ল্যাটফর্ম।'
              : 'Predict drop-offs across registration milestones, inspect SHAP drivers, and trigger hyper-personalized Bangla nudges.'}
          </p>
        </div>

        {/* Quick User Search */}
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '4px 4px 4px 14px',
            maxWidth: '320px',
            width: '100%',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--upay-blue)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
        >
          <Search size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'গ্রাহক আইডি খুঁজুন...' : 'Lookup user (e.g. U000013573)...'}
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '8px 10px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'var(--upay-blue)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.15s ease',
              flexShrink: 0,
            }}
          >
            <ArrowRight size={15} />
          </button>
        </form>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-panel" style={{ padding: '20px 22px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}>
                  {kpi.label}
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: kpi.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={16} style={{ color: kpi.color }} />
                </div>
              </div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                marginBottom: '4px',
              }}>
                {kpi.value}
              </div>
              <span style={{
                fontSize: '0.72rem',
                color: 'var(--text-dim)',
                fontWeight: 500,
              }}>
                {kpi.sub}
              </span>
            </div>
          );
        })}
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

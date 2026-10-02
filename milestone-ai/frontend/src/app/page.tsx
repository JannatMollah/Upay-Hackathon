'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { FunnelResponse, AtRiskUser } from '../types';
import { Language, t } from '../lib/i18n';
import { useLanguage } from '../lib/LanguageContext';
import { FunnelChart } from '../components/FunnelChart';
import { AtRiskTable } from '../components/AtRiskTable';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Search,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Brain,
} from 'lucide-react';

/* ── Animated counter hook ── */
function useCountUp(target: number, duration: number = 1200, start: boolean = true) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!start || startedRef.current) return;
    startedRef.current = true;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };
    requestAnimationFrame(animate);
  }, [target, duration, start]);

  return value;
}

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

  const activationRateNum = funnel && funnel.milestones.length > 5
    ? parseFloat((funnel.milestones[5].rate * 100).toFixed(1))
    : 19.3;

  const totalUsersNum = funnel ? funnel.total_users : 50000;

  // Animated counters
  const animTotalUsers = useCountUp(totalUsersNum, 1400, !loading);
  const animAtRisk = useCountUp(totalAtRisk, 1200, !loading);

  const featurePills = [
    { icon: Brain, label: lang === 'bn' ? 'XGBoost মডেল' : 'XGBoost ML', color: 'var(--upay-blue)' },
    { icon: Zap, label: lang === 'bn' ? 'SHAP ব্যাখ্যা' : 'SHAP Explainability', color: 'var(--color-info)' },
    { icon: Shield, label: lang === 'bn' ? 'গার্ডরেইল' : 'AI Guardrails', color: 'var(--color-success)' },
  ];

  const kpiCards = [
    {
      label: t('kpi.total_users', lang),
      value: animTotalUsers.toLocaleString(),
      sub: lang === 'bn' ? 'সিমুলেটেড MFS ইউজার বেস' : 'Simulated MFS User Base',
      icon: Users,
      color: 'var(--upay-blue)',
      bg: 'var(--upay-blue-soft)',
      borderAccent: 'var(--upay-blue)',
    },
    {
      label: t('kpi.overall_completion', lang),
      value: `${activationRateNum}%`,
      sub: lang === 'bn' ? '৬টি মাইলস্টোন সম্পন্ন' : 'Completed All 6 Milestones',
      icon: TrendingUp,
      color: 'var(--color-success)',
      bg: 'var(--color-success-bg)',
      borderAccent: 'var(--color-success)',
    },
    {
      label: t('kpi.at_risk_users', lang),
      value: animAtRisk.toLocaleString(),
      sub: lang === 'bn' ? 'AI নাজ ডেলিভারির জন্য চিহ্নিত' : 'Flagged for AI Nudge Delivery',
      icon: AlertTriangle,
      color: 'var(--color-danger)',
      bg: 'var(--color-danger-bg)',
      borderAccent: 'var(--color-danger)',
    },
    {
      label: t('kpi.model_auc', lang),
      value: '0.7659',
      sub: 'XGBoost Multi-Output Model',
      icon: Sparkles,
      color: '#92600e',
      bg: 'var(--upay-yellow-soft)',
      borderAccent: 'var(--upay-yellow)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* ━━━━━━━━ HERO SECTION ━━━━━━━━ */}
      <div className="hero-section">
        <div className="hero-grid-bg" />
        <div className="hero-glow" />

        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '28px',
        }}>
          {/* Left: Value Proposition */}
          <div style={{ maxWidth: '620px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span className="badge badge-brand">
                <Sparkles size={11} />
                AI-Powered Platform
              </span>
              <span className="badge badge-brand" style={{ background: 'rgba(237, 188, 27, 0.15)', color: 'var(--upay-yellow-light)', borderColor: 'rgba(237, 188, 27, 0.25)' }}>
                <Zap size={11} />
                upay × UCB Hackathon
              </span>
            </div>

            <h2 style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              marginBottom: '10px',
            }}>
              {lang === 'bn'
                ? 'গ্রাহক অ্যাক্টিভেশন ও সঞ্চয় ইন্টেলিজেন্স'
                : 'Activation & Growth Intelligence'}
            </h2>

            <p style={{
              fontSize: '0.92rem',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.65,
              marginBottom: '18px',
            }}>
              {lang === 'bn'
                ? 'মেশিন লার্নিং দ্বারা মাইলস্টোন ড্রপ-অফ পূর্বাভাস, SHAP ব্যাখ্যা ও স্বয়ংক্রিয় বাংলা নাজ বার্তা প্রেরণ করুন।'
                : 'Predict milestone drop-offs with XGBoost, explain with SHAP, and deliver hyper-personalized Bangla nudges — all in one platform.'}
            </p>

            {/* Feature pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {featurePills.map((pill, i) => {
                const PillIcon = pill.icon;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '0.76rem',
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    <PillIcon size={12} style={{ color: pill.color, filter: 'brightness(1.5)' }} />
                    {pill.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Quick Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '280px' }}>
            <span style={{
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
            }}>
              {lang === 'bn' ? 'দ্রুত গ্রাহক অনুসন্ধান' : 'Quick User Lookup'}
            </span>
            <form onSubmit={handleSearch} className="search-container">
              <Search size={16} style={{ color: 'rgba(255, 255, 255, 0.35)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'গ্রাহক আইডি (যেমন U000013573)...' : 'Search user ID (e.g. U000013573)...'}
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Mini stats in hero */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '4px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: 'var(--color-success)',
                  boxShadow: '0 0 8px rgba(5, 150, 105, 0.6)',
                  animation: 'pulseGlow 2s infinite ease-in-out',
                }} />
                <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>
                  {lang === 'bn' ? 'API সক্রিয়' : 'System Live'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={12} style={{ color: 'var(--upay-yellow)' }} />
                <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>
                  {lang === 'bn' ? '৬ মাইলস্টোন ট্র্যাক' : '6 Milestones Tracked'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━ KPI CARDS ━━━━━━━━ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
      }}>
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`kpi-card animate-fade-in-delay-${idx + 1}`}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <span className="kpi-label">{kpi.label}</span>
                <div
                  className="kpi-icon-box"
                  style={{
                    background: kpi.bg,
                    boxShadow: `0 2px 8px ${kpi.bg}`,
                  }}
                >
                  <Icon size={18} style={{ color: kpi.color }} />
                </div>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              <span className="kpi-sub">{kpi.sub}</span>
            </div>
          );
        })}
      </div>

      {/* ━━━━━━━━ FUNNEL CHART ━━━━━━━━ */}
      {funnel && (
        <div className="animate-fade-in-delay-5">
          <FunnelChart
            milestones={funnel.milestones}
            totalUsers={funnel.total_users}
            selectedMilestone={selectedMilestone}
            onSelectMilestone={setSelectedMilestone}
            lang={lang}
          />
        </div>
      )}

      {/* ━━━━━━━━ AT-RISK TABLE ━━━━━━━━ */}
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

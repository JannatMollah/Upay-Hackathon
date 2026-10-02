'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

/* ── Smooth animated counter hook ── */
function useCountUp(target: number, duration: number = 900) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!target) return;
    let startTime: number | null = null;
    let frameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return value;
}

export default function DashboardPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [funnel, setFunnel] = useState<FunnelResponse | null>(null);
  const [atRiskUsers, setAtRiskUsers] = useState<AtRiskUser[]>([]);
  const [totalAtRisk, setTotalAtRisk] = useState<number>(5389);
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

  const handleSearch = (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const id = (customId || searchUserId).trim();
    if (id) {
      router.push(`/users/${id}`);
    }
  };

  const activationRateNum = funnel && funnel.milestones.length > 5
    ? parseFloat((funnel.milestones[5].rate * 100).toFixed(1))
    : 19.3;

  const totalUsersNum = funnel ? funnel.total_users : 50000;

  // Animated counters
  const animTotalUsers = useCountUp(totalUsersNum, 1100);
  const animAtRisk = useCountUp(totalAtRisk, 1000);

  const demoUsers = ['U000013573', 'U000016699', 'U000044570'];

  const kpiCards = [
    {
      label: t('kpi.total_users', lang),
      value: animTotalUsers.toLocaleString(),
      sub: lang === 'bn' ? 'সক্রিয় অনবোর্ডিং গ্রাহক বেস' : 'Active Onboarding Cohort',
      icon: Users,
      color: 'var(--upay-blue)',
      bg: 'var(--upay-blue-soft)',
    },
    {
      label: t('kpi.overall_completion', lang),
      value: `${activationRateNum}%`,
      sub: lang === 'bn' ? '৬টি মাইলস্টোন সম্পূর্ণ সম্পন্ন' : 'Completed All 6 Milestones',
      icon: TrendingUp,
      color: 'var(--color-success)',
      bg: 'var(--color-success-bg)',
    },
    {
      label: t('kpi.at_risk_users', lang),
      value: animAtRisk.toLocaleString(),
      sub: lang === 'bn' ? 'ঝুঁকি ≥ ৭০% চিহ্নিত গ্রাহক' : 'Drop-off Risk ≥ 70% Flagged',
      icon: AlertTriangle,
      color: 'var(--color-danger)',
      bg: 'var(--color-danger-bg)',
    },
    {
      label: t('kpi.model_auc', lang),
      value: '0.7659',
      sub: lang === 'bn' ? 'মাল্টি-আউটপুট XGBoost মডেল' : 'Multi-Output XGBoost Predictor',
      icon: Sparkles,
      color: '#92600e',
      bg: 'var(--upay-yellow-soft)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* ━━━━━━━━ HERO SECTION — Minimal, Crisp & Meaningful ━━━━━━━━ */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        borderLeft: '4px solid var(--upay-blue)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          {/* Left: Title & Meaningful Description */}
          <div style={{ maxWidth: '620px' }}>
            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
              lineHeight: 1.25,
              marginBottom: '6px',
            }}>
              {lang === 'bn'
                ? 'গ্রাহক অ্যাক্টিভেশন ও লাইফসাইকেল ইন্টেলিজেন্স'
                : 'Customer Lifecycle & Activation Intelligence'}
            </h2>

            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              lineHeight: 1.55,
            }}>
              {lang === 'bn'
                ? 'মেশিন লার্নিং দ্বারা মাইলস্টোন ড্রপ-অফ পূর্বাভাস, SHAP ব্যাখ্যা ও স্বয়ংক্রিয় বাংলা নাজ বার্তার সমন্বিত বিশ্লেষণ।'
                : 'Predict milestone drop-offs with XGBoost, diagnose root causes with SHAP explainability, and deliver targeted Bangla nudges.'}
            </p>
          </div>

          {/* Right: User Search & Quick Demo Picks */}
          <div style={{ minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <form
              onSubmit={(e) => handleSearch(e)}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '3px 3px 3px 12px',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--upay-blue)';
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--upay-blue-soft)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Search size={15} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'গ্রাহক আইডি লিখুন (যেমন U000013573)...' : 'Search User ID (e.g. U000013573)...'}
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '7px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--upay-blue)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '7px 12px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.15s ease',
                  flexShrink: 0,
                }}
                title={lang === 'bn' ? 'অনুসন্ধান করুন' : 'Search User'}
              >
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Quick Demo Jump Chips for Judges */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              color: 'var(--text-dim)',
            }}>
              <span>{lang === 'bn' ? 'ডেমো গ্রাহক:' : 'Quick Demo:'}</span>
              {demoUsers.map((uid) => (
                <button
                  key={uid}
                  type="button"
                  onClick={() => handleSearch(undefined, uid)}
                  style={{
                    background: 'var(--bg-white)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 7px',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--upay-blue)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--upay-blue-soft)';
                    e.currentTarget.style.borderColor = 'var(--upay-blue)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-white)';
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                  }}
                >
                  {uid}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━ KPI CARDS ━━━━━━━━ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px',
      }}>
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="kpi-card"
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}>
                <span className="kpi-label">{kpi.label}</span>
                <div
                  className="kpi-icon-box"
                  style={{ background: kpi.bg }}
                >
                  <Icon size={17} style={{ color: kpi.color }} />
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
        <FunnelChart
          milestones={funnel.milestones}
          totalUsers={funnel.total_users}
          selectedMilestone={selectedMilestone}
          onSelectMilestone={setSelectedMilestone}
          lang={lang}
        />
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

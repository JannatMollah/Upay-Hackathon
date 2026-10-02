'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { FunnelResponse, AtRiskUser } from '../../types';
import { Language, t } from '../../lib/i18n';
import { useLanguage } from '../../lib/LanguageContext';
import { FunnelChart } from '../../components/FunnelChart';
import { AtRiskTable } from '../../components/AtRiskTable';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Target,
  Info,
} from 'lucide-react';

/* ── Animated counter ── */
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
      if (progress < 1) frameId = requestAnimationFrame(animate);
      else setValue(target);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);
  return value;
}

/* Campaign steps - human readable instead of M1/M2 codes */
const CAMPAIGN_STEPS = [
  { code: 'M1', en: 'PIN Setup', bn: 'পিন সেটআপ', icon: '🔐', bonus: '৳20' },
  { code: 'M2', en: 'First Recharge (৳30+)', bn: 'প্রথম রিচার্জ (৳৩০+)', icon: '📱', bonus: '৳30' },
  { code: 'M3', en: 'Cash-in / Add Money (৳500+)', bn: 'ক্যাশ-ইন / অ্যাড মানি (৳৫০০+)', icon: '💵', bonus: '৳50' },
  { code: 'M4', en: 'Merchant QR Payment (৳200+)', bn: 'মার্চেন্ট QR পেমেন্ট (৳২০০+)', icon: '🛒', bonus: '৳50' },
  { code: 'M5', en: 'Open DPS Account', bn: 'ডিপিএস খোলা', icon: '🏦', bonus: '৳50' },
  { code: 'M6', en: 'All Steps Complete', bn: 'সব ধাপ সম্পূর্ণ', icon: '🏆', bonus: '—' },
];

export default function ActivationPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [funnel, setFunnel] = useState<FunnelResponse | null>(null);
  const [atRiskUsers, setAtRiskUsers] = useState<AtRiskUser[]>([]);
  const [totalAtRisk, setTotalAtRisk] = useState<number>(5389);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [searchUserId, setSearchUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showCampaignInfo, setShowCampaignInfo] = useState(false);

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
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [selectedMilestone]);

  const handleSearch = (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const id = (customId || searchUserId).trim();
    if (id) router.push(`/activation/${id}`);
  };

  const activationRateNum = funnel && funnel.milestones.length > 5
    ? parseFloat((funnel.milestones[5].rate * 100).toFixed(1))
    : 19.3;
  const totalUsersNum = funnel ? funnel.total_users : 50000;

  const animTotalUsers = useCountUp(totalUsersNum, 1100);
  const animAtRisk = useCountUp(totalAtRisk, 1000);
  const demoUsers = ['U000013573', 'U000016699', 'U000044570'];

  const kpiCards = [
    {
      label: lang === 'bn' ? 'পর্যবেক্ষণকৃত গ্রাহক' : 'Monitored Users',
      value: animTotalUsers.toLocaleString(),
      sub: lang === 'bn' ? 'সক্রিয় অনবোর্ডিং কোহর্ট' : 'Active Onboarding Cohort',
      icon: Users, color: 'var(--upay-blue)', bg: 'var(--upay-blue-soft)',
    },
    {
      label: lang === 'bn' ? 'সম্পূর্ণ সক্রিয়তার হার' : 'Full Activation Rate',
      value: `${activationRateNum}%`,
      sub: lang === 'bn' ? '৬টি ধাপ সম্পূর্ণ সম্পন্ন' : 'Completed All 6 Steps',
      icon: TrendingUp, color: 'var(--color-success)', bg: 'var(--color-success-bg)',
    },
    {
      label: lang === 'bn' ? 'চিহ্নিত ঝুঁকিপূর্ণ' : 'Identified At-Risk',
      value: animAtRisk.toLocaleString(),
      sub: lang === 'bn' ? 'ড্রপ-অফ ঝুঁকি ≥ ৭০%' : 'Drop-off Risk ≥ 70%',
      icon: AlertTriangle, color: 'var(--color-danger)', bg: 'var(--color-danger-bg)',
    },
    {
      label: lang === 'bn' ? 'মডেলের সঠিকতা (AUC)' : 'Model Accuracy (AUC)',
      value: '0.7659',
      sub: lang === 'bn' ? 'মাল্টি-আউটপুট XGBoost' : 'Multi-Output XGBoost',
      icon: Sparkles, color: '#92600e', bg: 'var(--upay-yellow-soft)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Title */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '620px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={20} style={{ color: '#2563eb' }} />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {lang === 'bn' ? 'অ্যাক্টিভেশন প্রেডিক্টর' : 'Activation Predictor'}
                </h2>
                <span className="badge badge-brand">Tool 1</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              {lang === 'bn'
                ? 'নতুন গ্রাহকদের ৬-ধাপ বোনাস ক্যাম্পেইনে কোন ধাপে ড্রপ-অফ হবে তা পূর্বাভাস করুন এবং লক্ষ্যভিত্তিক নাজ পাঠান।'
                : 'Predict which step in the 6-step bonus campaign new users will drop off and send targeted nudges to re-engage them.'}
            </p>

            {/* Campaign Info Toggle */}
            <button
              onClick={() => setShowCampaignInfo(!showCampaignInfo)}
              style={{
                marginTop: '8px',
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '4px 12px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-subtle)', border: '1px solid var(--border-light)',
                color: 'var(--upay-blue)', fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Info size={12} />
              {showCampaignInfo
                ? (lang === 'bn' ? 'ক্যাম্পেইন বিবরণ লুকান' : 'Hide Campaign Details')
                : (lang === 'bn' ? 'ক্যাম্পেইন কী? বিস্তারিত দেখুন' : 'What is this campaign? Learn more')}
            </button>
          </div>

          {/* Search */}
          <div style={{ minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <form onSubmit={(e) => handleSearch(e)} style={{
              display: 'flex', alignItems: 'center',
              background: 'var(--bg-subtle)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)', padding: '3px 3px 3px 12px',
            }}>
              <Search size={15} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'গ্রাহক আইডি...' : 'Search User ID...'}
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  padding: '7px 10px', color: 'var(--text-primary)',
                  fontSize: '0.84rem', width: '100%', fontFamily: 'inherit',
                }}
              />
              <button type="submit" style={{
                background: 'var(--upay-blue)', border: 'none', borderRadius: 'var(--radius-sm)',
                padding: '7px 12px', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', flexShrink: 0,
              }}>
                <ArrowRight size={14} />
              </button>
            </form>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              <span>{lang === 'bn' ? 'ডেমো:' : 'Demo:'}</span>
              {demoUsers.map((uid) => (
                <button key={uid} type="button" onClick={() => handleSearch(undefined, uid)}
                  style={{
                    background: 'var(--bg-white)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)', padding: '2px 7px',
                    fontSize: '0.72rem', fontFamily: 'var(--font-mono)',
                    color: 'var(--upay-blue)', cursor: 'pointer',
                  }}
                >{uid}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Steps Explainer (collapsible) */}
        {showCampaignInfo && (
          <div style={{
            marginTop: '16px', padding: '16px 20px',
            background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
          }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.6 }}>
              {lang === 'bn'
                ? 'উপায়ের সেলফ-রেজিস্ট্রেশন ক্যাম্পেইনে নতুন গ্রাহকরা নিচের ৬টি ধাপ সম্পন্ন করলে সর্বোচ্চ ৳২০০ পর্যন্ত ক্যাশ রিওয়ার্ড পান। কিন্তু বেশিরভাগ গ্রাহক মাঝপথে থেমে যান — AI এই ড্রপ-অফ পূর্বাভাস করে।'
                : 'In upay\'s self-registration campaign, new users earn up to ৳200 in cash rewards by completing 6 onboarding steps. But most users stall mid-way — our AI predicts where they\'ll drop off.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
              {CAMPAIGN_STEPS.map((step) => (
                <div key={step.code} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-white)', border: '1px solid var(--border-light)',
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {lang === 'bn' ? step.bn : step.en}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      {step.code} · Bonus: {step.bonus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="kpi-label">{kpi.label}</span>
                <div className="kpi-icon-box" style={{ background: kpi.bg }}>
                  <Icon size={17} style={{ color: kpi.color }} />
                </div>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              <span className="kpi-sub">{kpi.sub}</span>
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

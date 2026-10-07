'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { PredictionResponse, SavingsPlanResponse } from '../../../types';
import { Language, t, getMilestoneName } from '../../../lib/i18n';
import { useLanguage } from '../../../lib/LanguageContext';
import { UserProfile } from '../../../components/UserProfile';
import { MilestoneProgress } from '../../../components/MilestoneProgress';
import { ShapWaterfall } from '../../../components/ShapWaterfall';
import { NudgeCard } from '../../../components/NudgeCard';
import { SanchayBotPanel } from '../../../components/SanchayBotPanel';
import {
  RefreshCw,
  AlertCircle,
  Target,
  AlertTriangle,
  ShieldAlert,
  Award,
  Sparkles,
  Search,
  X,
  User,
  ArrowRight,
} from 'lucide-react';
import * as Recharts from 'recharts';
import { useToast } from '../../../components/Toast';

export default function UserDetailPage() {
  const { lang } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const userId = params?.id as string;

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [savingsPlan, setSavingsPlan] = useState<SavingsPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic user switcher search state
  const [searchUserId, setSearchUserId] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const demoUsers = ['U000013573', 'U000041289', 'U000008421', 'U000029514', 'U000003781'];

  const loadUserData = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [predData, savData] = await Promise.all([
        api.getUserPrediction(userId).catch(() => null),
        api.getUserSavingsPlan(userId).catch(() => null),
      ]);

      if (!predData && !savData) {
        setError(`User ${userId} not found in database.`);
      } else {
        setPrediction(predData);
        setSavingsPlan(savData);
        showToast('info', lang === 'bn' ? 'ডাটা লোড হয়েছে' : 'Analysis Complete', lang === 'bn' ? 'এআই প্রেডিকশন প্রস্তুত' : 'User diagnostic data loaded successfully');
      }
    } catch (err: any) {
      setError(err?.message || 'Error loading user information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  // Click outside listener for search suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search autocomplete
  useEffect(() => {
    const query = searchUserId.trim();
    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.searchUsers(query, 8);
        if (res && res.results) {
          setSuggestions(res.results);
          setShowSuggestions(res.results.length > 0);
          setSelectedIndex(-1);
        }
      } catch (err) {
        // Fallback
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchUserId]);

  const handleSelectUser = (id: string) => {
    const trimmed = id.trim();
    if (trimmed) {
      setShowSuggestions(false);
      setSearchUserId('');
      router.push(`/activation/${trimmed}`);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchUserId.trim()) {
      handleSelectUser(searchUserId.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        const selected = suggestions[selectedIndex];
        handleSelectUser(selected.user_id);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleApproveNudge = async (nudgeId: string, action: string, modifiedTextBn?: string) => {
    try {
      await api.approveNudge(nudgeId, action, 'CM001', modifiedTextBn);
      if (action === 'approve') {
        showToast('success', lang === 'bn' ? 'নাজ অনুমোদিত' : 'Nudge Approved', lang === 'bn' ? 'ক্যাম্পেইন সফলভাবে চালু করা হয়েছে' : 'Campaign triggered successfully');
      } else {
        showToast('error', lang === 'bn' ? 'নাজ বাতিল' : 'Nudge Rejected', lang === 'bn' ? 'ক্যাম্পেইন বাতিল করা হয়েছে' : 'Campaign has been rejected');
      }
    } catch (err) {
      showToast('error', 'Error', 'Failed to update nudge status');
    }
  };

  if (loading) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '80px 20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          maxWidth: '540px',
          margin: '40px auto',
        }}
      >
        <RefreshCw
          size={26}
          style={{
            animation: 'spin 1s linear infinite',
            marginBottom: '14px',
            display: 'inline-block',
            color: 'var(--upay-blue)',
          }}
        />
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {lang === 'bn'
            ? `গ্রাহক ${userId} এর এআই বিশ্লেষণ লোড হচ্ছে...`
            : `Analyzing intelligence artifacts for user ${userId}...`}
        </p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '44px 32px',
          textAlign: 'center',
          maxWidth: '480px',
          margin: '40px auto',
        }}
      >
        <AlertCircle size={36} style={{ color: 'var(--color-danger)', marginBottom: '14px' }} />
        <h3
          style={{
            fontSize: '1.25rem',
            color: 'var(--text-primary)',
            marginBottom: '8px',
            fontWeight: 800,
          }}
        >
          {lang === 'bn' ? 'গ্রাহক খুঁজে পাওয়া যায়নি' : 'User Not Found'}
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '22px', fontSize: '0.92rem', lineHeight: 1.5 }}>
          {error}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <Link
            href="/activation"
            style={{
              padding: '9px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-secondary)',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: 'inherit',
            }}
          >
            Back
          </Link>
          <button
            onClick={loadUserData}
            style={{
              padding: '9px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--upay-blue)',
              border: 'none',
              color: '#fff',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const primaryMilestoneName = getMilestoneName(prediction.primary_drop_off, lang);
  const primaryProb = prediction.primary_drop_off
    ? prediction.milestone_probabilities?.[prediction.primary_drop_off]
    : null;
  const riskPct = primaryProb
    ? Math.round((1 - primaryProb.completion_prob) * 100)
    : 78;

  const kpiCards = [
    {
      label: lang === 'bn' ? 'প্রধান ড্রপ-অফ মাইলস্টোন' : 'Primary Drop-off Risk',
      value: primaryMilestoneName,
      sub: lang === 'bn' ? 'সর্বোচ্চ বিচ্যুতির সম্ভাবনা' : 'Highest Churn Likelihood',
      icon: AlertTriangle,
      color: 'var(--color-danger)',
      bg: 'var(--color-danger-bg)',
    },
    {
      label: lang === 'bn' ? 'ঝুঁকির মাত্রা স্কোর' : 'Predicted Risk Score',
      value: `${riskPct}%`,
      sub: riskPct >= 70
        ? (lang === 'bn' ? 'উচ্চ ঝুঁকি (তাৎক্ষণিক নাজ)' : 'Critical (Immediate Action)')
        : (lang === 'bn' ? 'মধ্যম ঝুঁকি' : 'Moderate Attention'),
      icon: ShieldAlert,
      color: 'var(--color-warning)',
      bg: 'var(--color-warning-bg)',
    },
    {
      label: lang === 'bn' ? 'নির্ধারিত বোনাস ইনসেন্টিভ' : 'Targeted Incentive',
      value: `৳${prediction.nudge?.bonus_amount_bdt || 50} BDT`,
      sub: lang === 'bn' ? 'ব্যক্তিগতকৃত ভাউচার অফার' : 'Automated Retention Voucher',
      icon: Award,
      color: 'var(--color-success)',
      bg: 'var(--color-success-bg)',
    },
    {
      label: lang === 'bn' ? 'প্রস্তাবিত ডেলিভারি চ্যানেল' : 'Engagement Channel',
      value: (prediction.nudge?.channel_recommendation || 'IN-APP').toUpperCase(),
      sub: prediction.nudge?.ai_generated ? 'Gemini 1.5 Personalized' : 'Smart Template Verified',
      icon: Sparkles,
      color: 'var(--upay-blue)',
      bg: 'var(--upay-blue-soft)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }} className="animate-fade-in">
      {/* Top Banner with Navigation Actions & User Switcher */}
      <div
        className="glass-panel"
        style={{
          padding: '26px 30px',
          overflow: 'visible',
          position: 'relative',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '22px' }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={24} style={{ color: 'var(--upay-blue)' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {lang === 'bn' ? 'গ্রাহক বিশ্লেষণ ও ড্রপ-অফ প্রিডিকশন' : 'User Diagnostic & Prediction'}
                </h2>
                <span className="badge badge-brand" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>Tool 1</span>
              </div>
            </div>
            <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              {lang === 'bn'
                ? `গ্রাহক ${userId} এর বিস্তারিত অনবোর্ডিং ফানেল বিশ্লেষণ, SHAP প্রভাবক এবং ব্যক্তিগতকৃত ইন্টারভেনশন নাজ।`
                : `Detailed onboarding funnel diagnosis, SHAP risk drivers, and personalized intervention for user ${userId}.`}
            </p>

            {/* Left-side Navigation Actions: Back & Refresh side-by-side, same size, no arrow icon, text just 'Back' */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                href="/activation"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-muted)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                Back
              </Link>

              <button
                onClick={loadUserData}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-muted)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Right side: Real-time user switcher with autocomplete dropdown */}
          <div
            ref={searchContainerRef}
            style={{
              minWidth: '320px',
              maxWidth: '420px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
              position: 'relative',
              zIndex: 60,
            }}
          >
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-white)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '4px 4px 4px 14px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder={
                  lang === 'bn'
                    ? 'অন্য গ্রাহক বিশ্লেষণ করুন (উদাঃ U000041289)...'
                    : 'Switch User (e.g. U000041289)...'
                }
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                style={{
                  border: 'none',
                  outline: 'none',
                  padding: '9px 12px',
                  fontSize: '0.92rem',
                  fontFamily: "'Inter', sans-serif",
                  color: 'var(--text-primary)',
                  width: '100%',
                  background: 'transparent',
                }}
              />
              {searchUserId && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchUserId('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                style={{
                  background: 'var(--upay-blue)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 16px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'opacity 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {lang === 'bn' ? 'যাচাই' : 'Switch'}
              </button>
            </form>

            {/* Floating Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-white)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: '1.5px solid var(--border-medium)',
                  zIndex: 9999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-subtle)',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{lang === 'bn' ? 'সুপারিশকৃত গ্রাহক' : 'Suggested Users'}</span>
                  <span>{suggestions.length} results</span>
                </div>

                <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                  {suggestions.map((item, idx) => {
                    const isHovered = idx === selectedIndex;
                    return (
                      <div
                        key={item.user_id}
                        onClick={() => handleSelectUser(item.user_id)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{
                          padding: '11px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          background: isHovered ? 'var(--upay-blue-soft)' : 'transparent',
                          transition: 'background 0.15s ease',
                          borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--border-light)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              background: isHovered ? 'var(--upay-blue)' : 'var(--bg-subtle)',
                              color: isHovered ? '#fff' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            <User size={14} />
                          </div>
                          <div>
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 700,
                                fontSize: '0.94rem',
                                color: isHovered ? 'var(--upay-blue)' : 'var(--text-primary)',
                              }}
                            >
                              {item.user_id}
                            </span>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: isHovered ? 'var(--upay-blue)' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {lang === 'bn' ? 'নির্বাচন' : 'Select'} <ArrowRight size={12} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Demo ID selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600 }}>{lang === 'bn' ? 'ডেমো গ্রাহক:' : 'Quick Demo:'}</span>
              {demoUsers.map((uid) => (
                <button
                  key={uid}
                  type="button"
                  onClick={() => handleSelectUser(uid)}
                  style={{
                    background: userId === uid ? 'var(--upay-blue-soft)' : 'var(--bg-white)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '3px 8px',
                    fontSize: '0.84rem',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    color: userId === uid ? 'var(--upay-blue)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--upay-blue-soft)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      userId === uid ? 'var(--upay-blue-soft)' : 'var(--bg-white)';
                  }}
                >
                  {uid}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Cards for this User */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          // Dummy sparkline data
          const sparkData = Array.from({ length: 7 }, (_, i) => ({ value: 50 + Math.random() * 50 + (i * 10) }));
          
          return (
            <div key={idx} className="kpi-card-premium" style={{ ['--card-accent' as any]: kpi.color }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="kpi-label" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{kpi.label}</span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: kpi.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: kpi.color,
                }}>
                  <Icon size={16} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '8px' }}>
                <div>
                  <div style={{
                    fontSize: kpi.value.length > 12 ? '1.5rem' : '1.8rem',
                    fontWeight: 800,
                    color: kpi.color,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}>
                    {kpi.value}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>
                    {kpi.sub}
                  </div>
                </div>

                {/* Sparkline mini-chart */}
                <div style={{ width: '80px', height: '36px' }}>
                  <Recharts.ResponsiveContainer width="100%" height="100%">
                    <Recharts.AreaChart data={sparkData}>
                      <defs>
                        <linearGradient id={`spark-user-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={kpi.color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={kpi.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Recharts.Area type="monotone" dataKey="value" stroke={kpi.color} strokeWidth={2} fill={`url(#spark-user-${idx})`} isAnimationActive={true} animationDuration={1500} />
                    </Recharts.AreaChart>
                  </Recharts.ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Grid: User Profile + Milestone Probabilities */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '22px',
        }}
      >
        <UserProfile userId={userId} lang={lang} />
        <MilestoneProgress
          probabilities={prediction.milestone_probabilities}
          primaryDropOff={prediction.primary_drop_off}
          lang={lang}
        />
      </div>

      {/* Middle Grid: SHAP Waterfall + Nudge Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '22px',
        }}
      >
        <ShapWaterfall
          explanation={prediction.explanation}
          targetMilestone={prediction.primary_drop_off}
          lang={lang}
        />
        <NudgeCard
          nudge={prediction.nudge}
          onApprove={handleApproveNudge}
          lang={lang}
        />
      </div>

      {/* Bottom: DPS Coach Section */}
      <SanchayBotPanel savingsData={savingsPlan} lang={lang} />
    </div>
  );
}

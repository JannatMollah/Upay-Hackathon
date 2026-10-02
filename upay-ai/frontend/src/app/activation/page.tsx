'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { FunnelResponse, AtRiskUser } from '../../types';
import { Language, t, getMilestoneName } from '../../lib/i18n';
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
  Target,
  X,
  UserCheck,
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

interface SuggestionItem {
  user_id: string;
  drop_off_milestone?: string;
  drop_off_probability?: number;
}

export default function ActivationPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [funnel, setFunnel] = useState<FunnelResponse | null>(null);
  const [atRiskUsers, setAtRiskUsers] = useState<AtRiskUser[]>([]);
  const [totalAtRisk, setTotalAtRisk] = useState<number>(5389);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [searchUserId, setSearchUserId] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load dashboard data: funnel + first 10 at-risk users
  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [funnelData, riskData] = await Promise.all([
          api.getFunnel(),
          api.getAtRiskUsers(selectedMilestone || undefined, 10, 0),
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

  // Load more 10 users at a time
  const handleLoadMore = async () => {
    if (isLoadingMore || atRiskUsers.length >= totalAtRisk) return;
    setIsLoadingMore(true);
    try {
      const nextData = await api.getAtRiskUsers(
        selectedMilestone || undefined,
        10,
        atRiskUsers.length
      );
      if (nextData && nextData.users && nextData.users.length > 0) {
        setAtRiskUsers((prev) => [...prev, ...nextData.users]);
      }
    } catch (err) {
      console.error('Failed to load more users:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Funnel bar selection: updates selectedMilestone and scrolls down to the table section
  const handleMilestoneSelect = (milestoneKey: string | null) => {
    setSelectedMilestone(milestoneKey);
    setTimeout(() => {
      const section = document.getElementById('at-risk-table-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // Click outside listener for search suggestions dropdown
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

  const demoUsers = ['U000013573', 'U000016699', 'U000044570'];

  // Dynamic user search suggestions as user types
  useEffect(() => {
    const q = searchUserId.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    // 1. Instant local match from at-risk users list
    const localMatches: SuggestionItem[] = atRiskUsers
      .filter((u) => u.user_id.toLowerCase().includes(q))
      .map((u) => ({
        user_id: u.user_id,
        drop_off_milestone: u.drop_off_milestone,
        drop_off_probability: u.drop_off_probability,
      }));

    // Check demo users
    demoUsers.forEach((demoId) => {
      if (
        demoId.toLowerCase().includes(q) &&
        !localMatches.some((m) => m.user_id === demoId)
      ) {
        localMatches.push({
          user_id: demoId,
          drop_off_milestone: 'M2',
          drop_off_probability: 0.78,
        });
      }
    });

    setSuggestions(localMatches.slice(0, 8));
    setShowSuggestions(true);
    setSelectedIndex(-1);

    // 2. Debounced API search for full dataset
    const timer = setTimeout(async () => {
      try {
        const res = await api.searchUsers(q, 8);
        if (res && res.results && res.results.length > 0) {
          setSuggestions((prev) => {
            const map = new Map<string, SuggestionItem>();
            prev.forEach((item) => map.set(item.user_id, item));
            res.results.forEach((item) => {
              if (!map.has(item.user_id)) {
                map.set(item.user_id, { user_id: item.user_id });
              }
            });
            return Array.from(map.values()).slice(0, 8);
          });
        }
      } catch (err) {
        // Fallback to local suggestions
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchUserId, atRiskUsers]);

  const handleSearch = (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const id = (customId || searchUserId).trim();
    if (id) {
      setShowSuggestions(false);
      router.push(`/activation/${id}`);
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
        setShowSuggestions(false);
        router.push(`/activation/${selected.user_id}`);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const activationRateNum = funnel && funnel.milestones.length > 5
    ? parseFloat((funnel.milestones[5].rate * 100).toFixed(1))
    : 19.3;
  const totalUsersNum = funnel ? funnel.total_users : 50000;

  const animTotalUsers = useCountUp(totalUsersNum, 1100);
  const animAtRisk = useCountUp(totalAtRisk, 1000);

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
      sub: lang === 'bn' ? 'সবগুলো ধাপ সম্পূর্ণ সম্পন্ন' : 'Completed All Lifecycle Steps',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }} className="animate-fade-in">
      {/* Title & Dynamic Search Banner — overflow visible so suggestions dropdown is NEVER clipped */}
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
                  {lang === 'bn' ? 'অ্যাক্টিভেশন প্রেডিক্টর' : 'Activation Predictor'}
                </h2>
                <span className="badge badge-brand" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>Tool 1</span>
              </div>
            </div>
            <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {lang === 'bn'
                ? 'নতুন গ্রাহকদের অনবোর্ডিং ক্যাম্পেইনে কোন ধাপে ড্রপ-অফ হবে তা নির্ভুলভাবে পূর্বাভাস করুন এবং স্বয়ংক্রিয় লক্ষ্যভিত্তিক নাজ পাঠান।'
                : 'Predict which step new users will drop off and send hyper-personalized automated nudges to re-engage them.'}
            </p>
          </div>

          {/* Dynamic Search with real-time suggestions floating above */}
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
              onSubmit={(e) => handleSearch(e)}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-white)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '4px 4px 4px 14px',
                boxShadow: 'var(--shadow-xs)',
                transition: 'border-color 0.2s',
              }}
            >
              <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'গ্রাহক আইডি খুঁজুন...' : 'Search User ID...'}
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                onFocus={() => {
                  if (searchUserId.trim().length > 0) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '9px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.94rem',
                  width: '100%',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              {searchUserId && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchUserId('');
                    setShowSuggestions(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Clear"
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="submit"
                style={{
                  background: 'var(--upay-blue)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 14px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                }}
                title={lang === 'bn' ? 'অনুসন্ধান করুন' : 'Search'}
              >
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Suggestions Dropdown — floating seamlessly on top */}
            {showSuggestions && searchUserId.trim().length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-white)',
                  border: '1.5px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.16)',
                  zIndex: 9999,
                  overflow: 'hidden',
                  maxHeight: '340px',
                  overflowY: 'auto',
                }}
              >
                {suggestions.length === 0 ? (
                  <div style={{ padding: '16px 18px', fontSize: '0.92rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {lang === 'bn' ? 'কোনো গ্রাহক পাওয়া যায়নি' : 'No matching users found'}
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--text-dim)',
                        background: 'var(--bg-subtle)',
                        borderBottom: '1px solid var(--border-light)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <span>{lang === 'bn' ? 'সুপারিশকৃত ফলাফল' : 'Suggested Users'}</span>
                      <span>{suggestions.length} {lang === 'bn' ? 'টি মিল' : 'matches'}</span>
                    </div>
                    {suggestions.map((s, idx) => (
                      <div
                        key={s.user_id}
                        onClick={() => {
                          setShowSuggestions(false);
                          router.push(`/activation/${s.user_id}`);
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{
                          padding: '11px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          background: selectedIndex === idx ? 'var(--bg-subtle)' : 'transparent',
                          borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--border-light)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <UserCheck size={16} style={{ color: 'var(--upay-blue)', flexShrink: 0 }} />
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '0.98rem',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {s.user_id}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {s.drop_off_milestone && (
                            <span
                              className="badge badge-risk"
                              style={{
                                fontSize: '0.78rem',
                                padding: '3px 9px',
                              }}
                            >
                              {getMilestoneName(s.drop_off_milestone, lang)}
                            </span>
                          )}
                          {s.drop_off_probability && (
                            <span
                              style={{
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                color: 'var(--color-danger)',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {Math.round(s.drop_off_probability * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Demo ID selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 600 }}>{lang === 'bn' ? 'ডেমো গ্রাহক:' : 'Quick Demo:'}</span>
              {demoUsers.map((uid) => (
                <button
                  key={uid}
                  type="button"
                  onClick={() => handleSearch(undefined, uid)}
                  style={{
                    background: 'var(--bg-white)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '3px 8px',
                    fontSize: '0.84rem',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    color: 'var(--upay-blue)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--upay-blue-soft)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-white)';
                  }}
                >
                  {uid}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="kpi-label">{kpi.label}</span>
                <div className="kpi-icon-box" style={{ background: kpi.bg }}>
                  <Icon size={19} style={{ color: kpi.color }} />
                </div>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              <span className="kpi-sub">{kpi.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Funnel Chart — Clicking any of the 6 bars filters & activates the table */}
      {funnel && (
        <FunnelChart
          milestones={funnel.milestones}
          totalUsers={funnel.total_users}
          selectedMilestone={selectedMilestone}
          onSelectMilestone={handleMilestoneSelect}
          lang={lang}
        />
      )}

      {/* At-Risk Table — 10 users initially + Load More 10 at a time */}
      <AtRiskTable
        users={atRiskUsers}
        totalAtRisk={totalAtRisk}
        currentFilter={selectedMilestone}
        onFilterChange={setSelectedMilestone}
        lang={lang}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
      />
    </div>
  );
}

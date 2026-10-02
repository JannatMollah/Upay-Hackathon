'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { SavingsPlanResponse, AtRiskUser } from '../../types';
import { Language, t } from '../../lib/i18n';
import { useLanguage } from '../../lib/LanguageContext';
import { SanchayBotPanel } from '../../components/SanchayBotPanel';
import {
  PiggyBank,
  Search,
  X,
  TrendingUp,
  Wallet,
  Award,
  Sparkles,
  Users,
  CheckCircle2,
  RefreshCw,
  User,
  ArrowRight,
} from 'lucide-react';

function useCountUp(target: number, durationMs = 900): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const stepTime = 16;
    const steps = Math.max(1, Math.round(durationMs / stepTime));
    const increment = target / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(Math.round(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, durationMs]);
  return val;
}

export default function DPSCoachPage() {
  const { lang } = useLanguage();
  const [selectedUserId, setSelectedUserId] = useState<string>('U000013573');
  const [savingsData, setSavingsData] = useState<SavingsPlanResponse | null>(null);
  const [atRiskList, setAtRiskList] = useState<AtRiskUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Dynamic search autocomplete state
  const [searchUserId, setSearchUserId] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const demoUsers = ['U000013573', 'U000041289', 'U000008421', 'U000029514', 'U000003781'];

  // Load sample at-risk users on initial render
  useEffect(() => {
    async function loadInitial() {
      try {
        const risk = await api.getAtRiskUsers(undefined, 8);
        setAtRiskList(risk.users || []);
        if (risk.users && risk.users.length > 0) {
          setSelectedUserId(risk.users[0].user_id);
        }
      } catch (e) {
        console.error('Failed to load users:', e);
      }
    }
    loadInitial();
  }, []);

  // Fetch savings plan whenever selectedUserId changes
  useEffect(() => {
    async function loadPlan() {
      if (!selectedUserId) return;
      setLoading(true);
      try {
        const data = await api.getUserSavingsPlan(selectedUserId);
        setSavingsData(data);
      } catch (e) {
        console.error('Error fetching savings plan:', e);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, [selectedUserId]);

  // Click outside listener for suggestions dropdown
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

  // Debounced dynamic search suggestions from API
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
        // Fallback to local atRisk matching
        const localMatches = atRiskList.filter((u) =>
          u.user_id.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(localMatches);
        setShowSuggestions(localMatches.length > 0);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchUserId, atRiskList]);

  const handleSelectUser = (id: string) => {
    const trimmed = id.trim();
    if (trimmed) {
      setSelectedUserId(trimmed);
      setSearchUserId('');
      setShowSuggestions(false);
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

  const animSurplus = useCountUp(3420, 1000);
  const animUsers = useCountUp(50000, 1100);

  const kpiCards = [
    {
      label: lang === 'bn' ? 'গড় মাসিক উদ্বৃত্ত' : 'Avg Monthly Surplus',
      value: `৳${animSurplus.toLocaleString()}`,
      sub: lang === 'bn' ? 'নগদ উদ্বৃত্ত ক্যাশ প্রবাহ' : 'Net Monthly Disposable Cash',
      icon: Wallet,
      color: 'var(--color-success)',
      bg: 'var(--color-success-bg)',
    },
    {
      label: lang === 'bn' ? 'উচ্চ ক্যাশ-আউট হার' : 'High Cash-Out Ratio',
      value: '46.2%',
      sub: lang === 'bn' ? 'ডিপিএস রূপান্তরের সুযোগ' : 'Opportunity to Convert to DPS',
      icon: TrendingUp,
      color: 'var(--upay-blue)',
      bg: 'var(--upay-blue-soft)',
    },
    {
      label: lang === 'bn' ? 'সর্বোচ্চ ডিপিএস মুনাফা' : 'Max DPS Yield',
      value: '8.50%',
      sub: lang === 'bn' ? 'UCB আমানত স্কিম p.a.' : 'UCB Compound Deposit Rate',
      icon: Award,
      color: 'var(--upay-yellow)',
      bg: 'var(--upay-yellow-soft)',
    },
    {
      label: lang === 'bn' ? 'মডেল সঠিকতা (R²)' : 'Model Accuracy (R²)',
      value: '0.9986',
      sub: lang === 'bn' ? 'MAE ৳২৭৯ টেস্ট সেট' : 'MAE ৳279 on Cash-Flow Test Set',
      icon: Sparkles,
      color: 'var(--text-secondary)',
      bg: 'var(--bg-subtle)',
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
                <PiggyBank size={24} style={{ color: 'var(--color-success)' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {lang === 'bn' ? 'ডিপিএস সঞ্চয় কোচ' : 'DPS Savings Coach'}
                </h2>
                <span className="badge badge-brand" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>Tool 2</span>
              </div>
            </div>
            <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {lang === 'bn'
                ? 'মাসিক ক্যাশ-ফ্লো উদ্বৃত্ত বিশ্লেষণ করে গ্রাহকদের জন্য মানানসই ডিপিএস সঞ্চয় পরিকল্পনা তৈরি করুন এবং ইউসিবি আমানত স্কিমের মাধ্যমে আর্থিক সুরক্ষা নিশ্চিত করুন।'
                : 'Analyze monthly cash-flow surplus to generate personalized DPS savings recommendations. Empower users to build wealth via UCB deposit schemes.'}
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
              onSubmit={handleSearchSubmit}
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
                placeholder={
                  lang === 'bn'
                    ? 'গ্রাহক আইডি খুঁজুন (উদাঃ U000013573)...'
                    : 'Search User ID (e.g. U000013573)...'
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
                  background: 'var(--color-success)',
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
                {lang === 'bn' ? 'বিশ্লেষণ' : 'Analyze'}
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
                          background: isHovered ? 'var(--color-success-bg)' : 'transparent',
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
                              background: isHovered ? 'var(--color-success)' : 'var(--bg-subtle)',
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
                                color: isHovered ? 'var(--color-success)' : 'var(--text-primary)',
                              }}
                            >
                              {item.user_id}
                            </span>
                            {item.phone_number && (
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {item.phone_number}
                              </div>
                            )}
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: isHovered ? 'var(--color-success)' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {lang === 'bn' ? 'নির্বাচন করুন' : 'Select'} <ArrowRight size={12} />
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
                    background: selectedUserId === uid ? 'var(--color-success-bg)' : 'var(--bg-white)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '3px 8px',
                    fontSize: '0.84rem',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    color: selectedUserId === uid ? 'var(--color-success)' : 'var(--upay-blue)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-success-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      selectedUserId === uid ? 'var(--color-success-bg)' : 'var(--bg-white)';
                  }}
                >
                  {uid}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
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

      {/* Sample Users Quick Switcher Bar */}
      {atRiskList.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} style={{ color: 'var(--upay-blue)' }} />
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {lang === 'bn' ? 'অন্যান্য ডিপিএস আগ্রহী গ্রাহকগণ:' : 'Recent Candidate Users:'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {atRiskList.map((u) => {
              const isSelected = u.user_id === selectedUserId;
              return (
                <button
                  key={u.user_id}
                  onClick={() => handleSelectUser(u.user_id)}
                  className={`pill-filter ${isSelected ? 'active' : ''}`}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    padding: '6px 14px',
                  }}
                >
                  {u.user_id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main DPS Coach Panel */}
      {loading ? (
        <div
          className="glass-panel"
          style={{
            padding: '60px 0',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <RefreshCw
            size={24}
            style={{
              animation: 'spin 1s linear infinite',
              marginBottom: '12px',
              display: 'inline-block',
              color: 'var(--color-success)',
            }}
          />
          <p style={{ fontSize: '0.94rem', fontWeight: 600 }}>
            {lang === 'bn'
              ? `${selectedUserId} এর ক্যাশ-ফ্লো ও ডিপিএস পরিকল্পনা গণনা করা হচ্ছে...`
              : `Calculating cash-flow & DPS recommendation for ${selectedUserId}...`}
          </p>
        </div>
      ) : (
        <SanchayBotPanel savingsData={savingsData} lang={lang} />
      )}
    </div>
  );
}

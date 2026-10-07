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

  const [customDeposit, setCustomDeposit] = useState<number>(1000);
  const [customTenure, setCustomTenure] = useState<number>(12);

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
      value: '0.9401',
      sub: lang === 'bn' ? 'MAE ৳২,৬৫৭ (লিক-মুক্ত টেস্ট সেট)' : 'MAE ৳2,657 (Leakage-Free Holdout)',
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
        <>
          <SanchayBotPanel savingsData={savingsData} lang={lang} />

          {/* Interactive Wealth Accumulator Slider & Strategy Allocator */}
          <div className="wealth-slider-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <TrendingUp size={20} style={{ color: 'var(--color-success)' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {lang === 'bn' ? 'ইন্টারেক্টিভ ওয়েলথ অ্যাকুমুলেটর' : 'Interactive Wealth Accumulator'}
                  </h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {lang === 'bn'
                    ? 'মাসিক সঞ্চয় ও মেয়াদের স্লাইডার টেনে চক্রবৃদ্ধি মুনাফা ও ভবিষ্যৎ মূলধন প্রক্ষেপণ দেখুন।'
                    : 'Simulate custom monthly contributions and tenure horizons with compounded UCB interest.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <span className="badge badge-brand">7.5% p.a. UCB Rate</span>
                <span className="badge badge-success">Zero Maintenance Fee</span>
              </div>
            </div>

            {/* Range Slider and Amount Display */}
            <div style={{ background: 'var(--bg-subtle)', padding: '20px', borderRadius: '16px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {lang === 'bn' ? 'মাসিক জমা নির্ধারণ করুন:' : 'Monthly Contribution Amount:'}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--upay-blue)' }}>
                    ৳{customDeposit.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ {lang === 'bn' ? 'মাস' : 'month'}</span>
                </div>
              </div>

              <input
                type="range"
                min={200}
                max={5000}
                step={100}
                value={customDeposit}
                onChange={(e) => setCustomDeposit(Number(e.target.value))}
                className="range-slider-input"
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span>৳200</span>
                <span>৳1,000</span>
                <span>৳2,500</span>
                <span>৳5,000</span>
              </div>

              {/* Tenure Pills */}
              <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {lang === 'bn' ? 'সঞ্চয় মেয়াদ:' : 'Tenure Horizon:'}
                </span>
                {[6, 12, 18, 24, 36].map((months) => (
                  <button
                    key={months}
                    onClick={() => setCustomTenure(months)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: customTenure === months ? '1.5px solid var(--upay-blue)' : '1px solid var(--border-default)',
                      background: customTenure === months ? 'var(--upay-blue)' : '#ffffff',
                      color: customTenure === months ? '#ffffff' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {months} {lang === 'bn' ? 'মাস' : 'Months'}
                  </button>
                ))}
              </div>
            </div>

            {/* Projection Cards */}
            {(() => {
              const totalPrincipal = customDeposit * customTenure;
              const annualRate = 0.075;
              const estInterest = Math.round(totalPrincipal * annualRate * (customTenure / 12) * 0.52);
              const totalMaturity = totalPrincipal + estInterest;

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '22px' }}>
                  <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {lang === 'bn' ? 'মোট আসল জমা' : 'Total Principal'}
                    </span>
                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                      ৳{totalPrincipal.toLocaleString()}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ৳{customDeposit} × {customTenure} {lang === 'bn' ? 'মাস' : 'months'}
                    </span>
                  </div>

                  <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {lang === 'bn' ? 'ইউসিবি প্রদেয় মুনাফা (৭.৫%)' : 'Est. Interest (7.5%)'}
                    </span>
                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px' }}>
                      +৳{estInterest.toLocaleString()}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 600 }}>
                      {lang === 'bn' ? 'চক্রবৃদ্ধি মুনাফা লাভ' : 'Compound Gain'}
                    </span>
                  </div>

                  <div style={{ background: 'linear-gradient(135deg, rgba(30, 77, 140, 0.08) 0%, rgba(237, 188, 27, 0.12) 100%)', padding: '16px', borderRadius: '14px', border: '1.5px solid rgba(30, 77, 140, 0.25)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--upay-blue)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {lang === 'bn' ? 'মেয়াদ শেষে মোট প্রাপ্তি' : 'Total Maturity Payout'}
                    </span>
                    <p style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--upay-blue)', marginTop: '4px' }}>
                      ৳{totalMaturity.toLocaleString()}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {lang === 'bn' ? 'ইউসিবি এটিএম ১০০% ফ্রি ক্যাশ-আউট' : '100% Free UCB ATM Withdrawal'}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* 3-Tier Allocation Strategy Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px', background: '#fafbfc' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>
                  {lang === 'bn' ? '🛡️ রক্ষণশীল (৩০% উদ্বৃত্ত)' : '🛡️ Conservative (30% Surplus)'}
                </span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                  {lang === 'bn' ? 'দৈনন্দিন খরচের পর ঝুঁকিহীন ন্যূনতম সঞ্চয় নিরাপত্তা।' : 'Guaranteed liquidity buffer with stress-free micro-deposits.'}
                </p>
              </div>

              <div style={{ border: '1.5px solid var(--color-success)', borderRadius: '12px', padding: '14px', background: 'rgba(5, 150, 105, 0.04)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)' }}>
                  {lang === 'bn' ? '⭐ ভারসাম্যপূর্ণ (৫০% উদ্বৃত্ত - প্রস্তাবিত)' : '⭐ Balanced (50% Surplus - Recommended)'}
                </span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {lang === 'bn' ? 'আর্থিক স্বচ্ছলতা বজায় রেখে সর্বোত্তম সম্পদ বৃদ্ধি।' : 'Optimal wealth growth while retaining cashflow flexibility.'}
                </p>
              </div>

              <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px', background: '#fafbfc' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>
                  {lang === 'bn' ? '🚀 উচ্চ সঞ্চয় (৭০% উদ্বৃত্ত)' : '🚀 Aggressive (70% Surplus)'}
                </span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                  {lang === 'bn' ? 'সর্বোচ্চ মুনাফা অর্জন ও দ্রুত মূলধন সঞ্চয়ন লক্ষ্য।' : 'Maximum capital accumulation for disciplined savers.'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

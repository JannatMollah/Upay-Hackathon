'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { useLanguage } from '../../lib/LanguageContext';
import {
  Landmark,
  Search,
  X,
  RefreshCw,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  Zap,
  ChevronDown,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label_en: string; label_bn: string }> = {
  critical: { color: '#dc2626', bg: '#fef2f2', label_en: 'Critical', label_bn: 'জরুরি তারল্য' },
  low: { color: '#d97706', bg: '#fffbeb', label_en: 'Low Float', label_bn: 'স্বল্প ফ্লোট' },
  adequate: { color: '#2563eb', bg: '#eff6ff', label_en: 'Adequate', label_bn: 'পর্যাপ্ত' },
  healthy: { color: '#059669', bg: '#ecfdf5', label_en: 'Healthy', label_bn: 'স্বাস্থ্যকর' },
};

function useCountUp(target: number, durationMs = 800): number {
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

export default function LiquidityPage() {
  const { lang } = useLanguage();
  const [overview, setOverview] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [totalMatching, setTotalMatching] = useState(0);
  const [totalAgents, setTotalAgents] = useState(500);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [areaFilter, setAreaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [replenishSuccess, setReplenishSuccess] = useState(false);

  // Dynamic Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const demoAgents = ['AG0001', 'AG0015', 'AG0042', 'AG0128', 'AG0250'];

  const loadOverview = async (resetList = true, currentSearch = searchQuery) => {
    if (resetList) setLoading(true);
    try {
      const data = await api.getAgentsOverview(
        areaFilter !== 'all' ? areaFilter : undefined,
        statusFilter !== 'all' ? statusFilter : undefined,
        10,
        0,
        currentSearch.trim() || undefined
      );
      if (data) {
        setOverview(data);
        setAgents(data.agents || []);
        setTotalMatching(data.total_matching ?? data.agents?.length ?? 0);
        setTotalAgents(data.total_agents ?? 500);

        // Auto-select first agent if none selected or selected agent not in current list
        if (data.agents && data.agents.length > 0) {
          setSelectedAgent((prev) => {
            if (!prev || !data.agents.some((a: any) => a.agent_id === prev)) {
              loadForecast(data.agents[0].agent_id);
              return data.agents[0].agent_id;
            }
            return prev;
          });
        }
      }
    } catch (e) {
      console.error('Failed to load agents:', e);
    } finally {
      if (resetList) setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || agents.length >= totalMatching) return;
    setIsLoadingMore(true);
    try {
      const nextData = await api.getAgentsOverview(
        areaFilter !== 'all' ? areaFilter : undefined,
        statusFilter !== 'all' ? statusFilter : undefined,
        10,
        agents.length,
        searchQuery.trim() || undefined
      );
      if (nextData && nextData.agents && nextData.agents.length > 0) {
        setAgents((prev) => [...prev, ...nextData.agents]);
      }
    } catch (err) {
      console.error('Failed to load more agents:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadOverview(true, searchQuery);
  }, [areaFilter, statusFilter]);

  const loadForecast = async (agentId: string) => {
    setSelectedAgent(agentId);
    setForecastLoading(true);
    setReplenishSuccess(false);
    try {
      const data = await api.getAgentForecast(agentId);
      setForecast(data);
    } catch (e) {
      console.error('Failed to load forecast:', e);
    } finally {
      setForecastLoading(false);
    }
  };

  // Close suggestions on click outside
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

  // Debounced search autocomplete & dynamic table filtering
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      loadOverview(true, '');
      return;
    }

    const timer = setTimeout(async () => {
      // 1. Fetch autocomplete suggestions
      try {
        const res = await api.searchAgents(q, 8);
        if (res && res.results) {
          setSuggestions(res.results);
          setShowSuggestions(res.results.length > 0);
          setSelectedIndex(-1);
        }
      } catch (err) {
        // Fallback
      }

      // 2. Dynamically filter the Agent Distribution Network table
      loadOverview(true, q);
    }, 240);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgent(agentId);
    loadForecast(agentId);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    loadOverview(true, searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') handleSearchSubmit(e);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const selected = suggestions[selectedIndex];
        setSearchQuery(selected.agent_id);
        handleSelectAgent(selected.agent_id);
        loadOverview(true, selected.agent_id);
      } else {
        handleSearchSubmit(e);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const summary = overview?.status_summary || { critical: 0, low: 0, adequate: 0, healthy: 0 };
  const animCritical = useCountUp(summary.critical || 0);
  const animLow = useCountUp(summary.low || 0);
  const animAdequate = useCountUp(summary.adequate || 0);
  const animHealthy = useCountUp(summary.healthy || 0);

  const kpiCards = [
    {
      key: 'critical',
      label: lang === 'bn' ? 'জরুরি তারল্য ঝুঁকি' : 'Critical Stockout Risk',
      value: animCritical,
      sub: lang === 'bn' ? 'ফ্লোট দ্রুত শেষ হওয়ার আশঙ্কা' : 'Immediate Float Depletion Risk',
      icon: AlertOctagon,
      color: '#dc2626',
      bg: '#fef2f2',
    },
    {
      key: 'low',
      label: lang === 'bn' ? 'স্বল্প ফ্লোট সতর্কতা' : 'Low Float Warning',
      value: animLow,
      sub: lang === 'bn' ? 'আগামী ২৪ ঘণ্টায় রিচার্জ প্রয়োজন' : 'Requires Float Top-Up < 24h',
      icon: AlertTriangle,
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      key: 'adequate',
      label: lang === 'bn' ? 'পর্যাপ্ত তারল্য' : 'Adequate Liquidity',
      value: animAdequate,
      sub: lang === 'bn' ? 'স্বাভাবিক লেনদেন পরিচালনা' : 'Operating Within Normal Band',
      icon: TrendingUp,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      key: 'healthy',
      label: lang === 'bn' ? 'উদ্বৃত্ত স্বাস্থ্যকর ফ্লোট' : 'Healthy Float Reserve',
      value: animHealthy,
      sub: lang === 'bn' ? 'সর্বোচ্চ ক্যাশ-আউট সক্ষমতা' : 'Optimal Reserve for Surges',
      icon: ShieldCheck,
      color: '#059669',
      bg: '#ecfdf5',
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
                <Landmark size={24} style={{ color: '#d97706' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {lang === 'bn' ? 'এজেন্ট তারল্য পূর্বাভাস' : 'Agent Liquidity Forecast'}
                </h2>
                <span className="badge badge-brand" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>Tool 3</span>
              </div>
            </div>
            <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {lang === 'bn'
                ? '৫০০ এজেন্ট পয়েন্টে নগদ উত্তোলনের চাহিদা পূর্বাভাস। বেতন দিবসের চাপ শনাক্তকরণ সহ ৭-দিনের প্রোজেকশন এবং কার্যকর ফ্লোট পুনঃভারসাম্য ব্যবস্থাপনা।'
                : 'Forecast daily cash-out volume across 500 agent points to prevent stockouts. 7-day demand projections with salary surge detection and automated rebalancing.'}
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
                    ? 'এজেন্ট বা এলাকা খুঁজুন (উদাঃ AG0042, Dhaka)...'
                    : 'Search Agent or Area (e.g. AG0042, Dhaka)...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                    loadOverview(true, '');
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
                {lang === 'bn' ? 'অনুসন্ধান' : 'Search'}
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
                  <span>{lang === 'bn' ? 'শনাক্তকৃত এজেন্ট পয়েন্ট' : 'Matching Agent Points'}</span>
                  <span>{suggestions.length} results</span>
                </div>

                <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                  {suggestions.map((item, idx) => {
                    const isHovered = idx === selectedIndex;
                    const statusCfg = STATUS_CONFIG[item.liquidity_status] || STATUS_CONFIG.adequate;
                    return (
                      <div
                        key={item.agent_id}
                        onClick={() => {
                          setSearchQuery(item.agent_id);
                          handleSelectAgent(item.agent_id);
                          loadOverview(true, item.agent_id);
                        }}
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
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: isHovered ? 'var(--upay-blue)' : 'var(--bg-subtle)',
                              color: isHovered ? '#fff' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            <Landmark size={15} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  fontFamily: "'Inter', sans-serif",
                                  fontWeight: 700,
                                  fontSize: '0.94rem',
                                  color: isHovered ? 'var(--upay-blue)' : 'var(--text-primary)',
                                }}
                              >
                                {item.agent_id}
                              </span>
                              {item.is_rmg_zone && (
                                <span
                                  style={{
                                    fontSize: '0.65rem',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                  }}
                                >
                                  RMG
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                              {item.division} · {item.area_type}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: statusCfg.bg,
                              color: statusCfg.color,
                            }}
                          >
                            {lang === 'bn' ? statusCfg.label_bn : statusCfg.label_en}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Demo Agent selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600 }}>{lang === 'bn' ? 'ডেমো এজেন্ট:' : 'Quick Demo:'}</span>
              {demoAgents.map((aid) => (
                <button
                  key={aid}
                  type="button"
                  onClick={() => {
                    setSearchQuery(aid);
                    handleSelectAgent(aid);
                    loadOverview(true, aid);
                  }}
                  style={{
                    background: selectedAgent === aid ? 'var(--upay-blue-soft)' : 'var(--bg-white)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '3px 8px',
                    fontSize: '0.84rem',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    color: selectedAgent === aid ? 'var(--upay-blue)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--upay-blue-soft)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      selectedAgent === aid ? 'var(--upay-blue-soft)' : 'var(--bg-white)';
                  }}
                >
                  {aid}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary KPI Cards (Click to Filter) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const isActive = statusFilter === kpi.key;
          return (
            <div
              key={kpi.key}
              className="kpi-card"
              onClick={() => setStatusFilter(isActive ? 'all' : kpi.key)}
              style={{
                cursor: 'pointer',
                background: isActive ? `${kpi.bg}` : 'var(--bg-white)',
                transition: 'all 0.25s ease',
              }}
              title={lang === 'bn' ? 'ফিল্টার করতে ক্লিক করুন' : 'Click to filter'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="kpi-label">{kpi.label}</span>
                <div className="kpi-icon-box" style={{ background: kpi.bg }}>
                  <Icon size={19} style={{ color: kpi.color }} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: kpi.color }}>
                {kpi.value.toLocaleString()}
              </div>
              <span className="kpi-sub">
                {isActive ? (lang === 'bn' ? '✓ ফিল্টার সক্রিয়' : '✓ Filter Active') : kpi.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {lang === 'bn' ? 'এলাকা নির্বাচন:' : 'Filter Region:'}
          </span>
          {['all', 'urban', 'peri_urban', 'rural'].map((area) => (
            <button
              key={area}
              onClick={() => setAreaFilter(area)}
              className={`pill-filter ${areaFilter === area ? 'active' : ''}`}
            >
              {area === 'all'
                ? lang === 'bn' ? 'সকল এলাকা' : 'All Areas'
                : area === 'peri_urban'
                ? 'Peri-Urban'
                : area.charAt(0).toUpperCase() + area.slice(1)}
            </button>
          ))}
        </div>

        {statusFilter !== 'all' && (
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--upay-blue)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'inherit',
            }}
          >
            {lang === 'bn' ? 'সব স্ট্যাটাস দেখান (রিসেট)' : 'Reset Status Filter'}
          </button>
        )}
      </div>

      {/* Main Content: Agent Table + Forecast Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: forecast ? '1.15fr 0.85fr' : '1fr',
          gap: '22px',
          alignItems: 'stretch',
        }}
      >
        {/* Agent Points Table */}
        <div
          className="glass-panel"
          style={{
            height: forecast ? '670px' : 'auto',
            minHeight: '520px',
            padding: '24px 24px 18px',
            scrollMarginTop: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="section-header" style={{ marginBottom: '14px', flexShrink: 0 }}>
            <div>
              <h2 className="section-title">
                {lang === 'bn' ? 'এজেন্ট পয়েন্টসমূহ' : 'Agent Distribution Network'}
              </h2>
              <p className="section-subtitle" style={{ fontSize: '0.94rem', marginTop: '4px' }}>
                {searchQuery.trim()
                  ? (lang === 'bn'
                      ? `"${searchQuery.trim()}" এর জন্য ${totalMatching} জন এজেন্ট পাওয়া গেছে`
                      : `Found ${totalMatching} agents matching "${searchQuery.trim()}"`)
                  : (lang === 'bn'
                      ? `মোট ${totalAgents} জন এজেন্টের রিয়েল-টাইম তারল্য পর্যালোচনা`
                      : `Showing ${agents.length} of ${totalMatching} agents sorted by liquidity urgency`)}
              </p>
            </div>
          </div>

          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0',
                color: 'var(--text-muted)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RefreshCw size={22} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', color: 'var(--upay-blue)' }} />
              <p style={{ marginTop: '10px', fontSize: '0.88rem' }}>Loading agent data...</p>
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowX: 'auto',
                overflowY: 'auto',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-white)' }}>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Agent ID
                    </th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Location
                    </th>
                    <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Daily Cash-Out
                    </th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Status
                    </th>
                    <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(agents || []).map((agent: any) => {
                    const cfg = STATUS_CONFIG[agent.liquidity_status] || STATUS_CONFIG.healthy;
                    const isSelected = agent.agent_id === selectedAgent;

                    return (
                      <tr
                        key={agent.agent_id}
                        onClick={() => loadForecast(agent.agent_id)}
                        style={{
                          borderBottom: '1px solid var(--border-light)',
                          background: isSelected ? 'var(--upay-blue-soft)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td style={{ padding: '14px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 700,
                                fontSize: '1.02rem',
                                color: isSelected ? 'var(--upay-blue)' : 'var(--text-primary)',
                              }}
                            >
                              {agent.agent_id}
                            </span>
                            {agent.is_rmg_zone && (
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                }}
                              >
                                RMG
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '14px 14px', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                            <span>{agent.area_type}</span>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            {agent.division} · {agent.district}
                          </div>
                        </td>

                        <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.96rem' }}>
                            ৳{Math.round(agent.cash_out_volume).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            Cap: ৳{Math.round(agent.float_capacity / 1000)}k
                          </div>
                        </td>

                        <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background: cfg.bg,
                              color: cfg.color,
                              display: 'inline-block',
                            }}
                          >
                            {lang === 'bn' ? cfg.label_bn : cfg.label_en}
                          </span>
                        </td>

                        <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              loadForecast(agent.agent_id);
                            }}
                            className="btn-primary"
                            style={{
                              padding: '6px 14px',
                              fontSize: '0.82rem',
                              borderRadius: 'var(--radius-sm)',
                              boxShadow: 'var(--shadow-xs)',
                            }}
                          >
                            {lang === 'bn' ? 'পূর্বাভাস' : 'Forecast'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {agents.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                  <Landmark size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600, fontSize: '0.94rem' }}>
                    {lang === 'bn' ? 'কোনো এজেন্ট পাওয়া যায়নি' : 'No matching agents found'}
                  </p>
                  <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                    {lang === 'bn' ? 'অন্য কোনো শব্দ দিয়ে অনুসন্ধান করুন' : 'Try searching with a different keyword'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Load More Footer */}
          {agents.length < totalMatching ? (
            <div
              style={{
                paddingTop: '12px',
                marginTop: '10px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {lang === 'bn'
                  ? `${totalMatching} জনের মধ্যে ${agents.length} জন প্রদর্শিত`
                  : `Showing ${agents.length} of ${totalMatching} agents`}
              </span>
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="btn-secondary"
                style={{
                  padding: '7px 16px',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  color: 'var(--upay-blue)',
                  background: 'var(--upay-blue-soft)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    <span>{lang === 'bn' ? 'আরও ১০ জন এজেন্ট (+১০)' : 'Load More (+10 Agents)'}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            agents.length > 0 && (
              <div
                style={{
                  paddingTop: '10px',
                  marginTop: '8px',
                  borderTop: '1px solid var(--border-light)',
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {lang === 'bn'
                  ? `সকল ${totalMatching} জন এজেন্ট প্রদর্শিত হয়েছে`
                  : `All ${totalMatching} agents displayed`}
              </div>
            )
          )}
        </div>

        {/* 7-Day Liquidity Forecast Panel */}
        {forecast && (
          <div
            className="glass-panel"
            style={{
              height: '670px',
              padding: '24px 24px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                  paddingBottom: '14px',
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={17} style={{ color: 'var(--upay-blue)' }} />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {lang === 'bn' ? '৭-দিনের চাহিদা পূর্বাভাস' : '7-Day Demand Forecast'}
                    </h3>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      color: 'var(--upay-blue)',
                      marginTop: '4px',
                    }}
                  >
                    {forecast.agent_id}
                  </div>
                  <p style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>
                    {forecast.agent_info?.division} · {forecast.agent_info?.district} · Tier {forecast.agent_info?.tier}
                  </p>
                </div>

                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: forecast.agent_info?.is_rmg_zone ? '#fee2e2' : 'var(--bg-subtle)',
                    color: forecast.agent_info?.is_rmg_zone ? '#dc2626' : 'var(--text-muted)',
                  }}
                >
                  {forecast.agent_info?.is_rmg_zone ? 'RMG Industrial Hub' : forecast.agent_info?.area_type}
                </span>
              </div>

              {/* 7-Day Forecast bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {(forecast.forecast || []).map((day: any, i: number) => {
                  const maxPred = Math.max(...(forecast.forecast || []).map((d: any) => d.predicted_cashout));
                  const pct = maxPred > 0 ? (day.predicted_cashout / maxPred) * 100 : 0;
                  const riskColor =
                    day.risk_level === 'critical'
                      ? '#dc2626'
                      : day.risk_level === 'warning'
                      ? '#d97706'
                      : '#059669';

                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: day.is_salary_day ? '#fffbeb' : 'var(--bg-subtle)',
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      <div style={{ width: '84px', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {day.day_name?.slice(0, 3)}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--text-dim)' }}>{day.date}</div>
                      </div>

                      <div style={{ flex: 1, height: '22px', background: 'var(--bg-white)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            borderRadius: '6px',
                            background: `linear-gradient(90deg, ${riskColor}70, ${riskColor})`,
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>

                      <div style={{ width: '92px', textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.90rem', fontWeight: 800, color: riskColor }}>
                          ৳{Math.round(day.predicted_cashout).toLocaleString()}
                        </span>
                      </div>

                      {day.is_salary_day && (
                        <div
                          title="Salary Surge Day"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#fef3c7',
                            color: '#b45309',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          <Calendar size={11} />
                          <span>Payday</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Float Capacity & Liquidity Health Summary */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {lang === 'bn' ? 'ফ্লোট সক্ষমতা' : 'Float Capacity'}
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    ৳{(forecast.agent_info?.float_capacity || 0).toLocaleString()}
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {lang === 'bn' ? 'মডেল কনফিডেন্স' : 'Model Confidence'}
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '2px' }}>
                    R² 0.673
                  </div>
                </div>
              </div>
            </div>

            {/* Replenish Action Button */}
            <div>
              {replenishSuccess ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--color-success-bg)',
                    padding: '11px 16px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-success)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>
                    {lang === 'bn'
                      ? 'এজেন্ট ফ্লোট রিচার্জ ট্রিগার সফলভাবে সম্পন্ন হয়েছে!'
                      : 'Automated float dispatch dispatched successfully!'}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setReplenishSuccess(true)}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '11px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    background: 'var(--upay-blue)',
                  }}
                >
                  <Send size={16} />
                  <span>
                    {lang === 'bn'
                      ? `ট্রিগার ফ্লোট রিচার্জ (${forecast.agent_id})`
                      : `Trigger Automated Float Replenishment (${forecast.agent_id})`}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

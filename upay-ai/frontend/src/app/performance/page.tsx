'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { Language, t } from '../../lib/i18n';
import { useLanguage } from '../../lib/LanguageContext';
import { MetricsGrid } from '../../components/MetricsGrid';
import { FairnessPanel } from '../../components/FairnessPanel';
import {
  BarChart3,
  RefreshCw,
  Search,
  X,
  Target,
  Zap,
  Award,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const SEARCHABLE_METRICS = [
  { id: 'auc', nameEn: 'Overall AUC-ROC (0.7659)', nameBn: 'সামগ্রিক AUC-ROC (০.৭৬৫৯)', category: 'Accuracy' },
  { id: 'brier', nameEn: 'Brier Score Calibration (0.1677)', nameBn: 'ব্রায়ার স্কোর ক্যালিব্রেশন (০.১৬৭৭)', category: 'Calibration' },
  { id: 'surplus', nameEn: 'Surplus Model R² (0.9986)', nameBn: 'সারপ্লাস মডেল R² (০.৯৯৮৬)', category: 'Regression' },
  { id: 'M2', nameEn: 'First Recharge Milestone', nameBn: 'প্রথম রিচার্জ মাইলস্টোন', category: 'Milestone' },
  { id: 'M3', nameEn: 'Cash-in / Add Money Milestone', nameBn: 'ক্যাশ-ইন / অ্যাড মানি মাইলস্টোন', category: 'Milestone' },
  { id: 'M4', nameEn: 'Merchant QR Pay Disparity Alert', nameBn: 'মার্চেন্ট কিউআর বৈষম্য সতর্কতা', category: 'Fairness' },
  { id: 'M5', nameEn: 'Open DPS Account Milestone', nameBn: 'ডিপিএস একাউন্ট মাইলস্টোন', category: 'Milestone' },
  { id: 'fairness', nameEn: 'Demographic Equality Ratio (0.842)', nameBn: 'ডেমোগ্রাফিক সমতা অনুপাত (০.৮৪২)', category: 'Ethics' },
];

export default function PerformancePage() {
  const { lang } = useLanguage();
  const [metrics, setMetrics] = useState<any>(null);
  const [fairness, setFairness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  // Dynamic Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof SEARCHABLE_METRICS>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const demoItems = [
    { label: 'Overall AUC', key: null },
    { label: lang === 'bn' ? 'প্রথম রিচার্জ' : 'First Recharge', key: 'M2' },
    { label: lang === 'bn' ? 'মার্চেন্ট কিউআর' : 'Merchant QR', key: 'M4' },
    { label: lang === 'bn' ? 'ডিপিএস একাউন্ট' : 'Open DPS', key: 'M5' },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsData, fairnessData] = await Promise.all([
        api.getModelMetrics(),
        api.getModelFairness(),
      ]);
      setMetrics(metricsData);
      setFairness(fairnessData);
    } catch (e) {
      console.error('Error loading model metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Click outside to close search dropdown
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

  // Filter search metrics
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matches = SEARCHABLE_METRICS.filter(
      (m) =>
        m.nameEn.toLowerCase().includes(q) ||
        m.nameBn.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
    );
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
    setSelectedIndex(-1);
  }, [searchQuery]);

  const handleSelectSearchItem = (item: (typeof SEARCHABLE_METRICS)[0]) => {
    if (['M2', 'M3', 'M4', 'M5'].includes(item.id)) {
      setSelectedMilestone(item.id);
    } else {
      setSelectedMilestone(null);
    }
    setSearchQuery('');
    setShowSuggestions(false);
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
        handleSelectSearchItem(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const overallAuc = metrics?.overall_auc_roc || 0.7659;
  const overallBrier = metrics?.overall_brier || 0.1677;

  const kpiCards = [
    {
      label: lang === 'bn' ? 'সামগ্রিক সঠিকতা (AUC-ROC)' : 'Overall AUC-ROC',
      value: overallAuc.toFixed(4),
      sub: lang === 'bn' ? '+০.০৩৮৪ বেসলাইন মডেলের চেয়ে উন্নত' : '+0.0384 vs Baseline Logistic Model',
      icon: Target,
      color: 'var(--color-success)',
      bg: 'var(--color-success-bg)',
    },
    {
      label: lang === 'bn' ? 'সম্ভাব্যতা ক্যালিব্রেশন (Brier)' : 'Calibration Brier Score',
      value: overallBrier.toFixed(4),
      sub: lang === 'bn' ? 'কম স্কোর নির্ভুল সম্ভাবনা নির্দেশ করে' : 'Lower is better (Well-Calibrated)',
      icon: Zap,
      color: 'var(--upay-blue)',
      bg: 'var(--upay-blue-soft)',
    },
    {
      label: lang === 'bn' ? 'সারপ্লাস মডেল স্কোর (R²)' : 'Surplus Model R²',
      value: '0.9986',
      sub: lang === 'bn' ? 'MAE: ৳২৭৯ টেস্ট সেট বিচ্যুতি' : 'MAE: ৳279 BDT on Test Holdout',
      icon: Award,
      color: 'var(--upay-yellow)',
      bg: 'var(--upay-yellow-soft)',
    },
    {
      label: lang === 'bn' ? 'ডেমোগ্রাফিক সমতা সূচক' : 'Demographic Parity',
      value: '0.842',
      sub: lang === 'bn' ? 'আইনগত সমতা থ্রেশহোল্ড ≥ ০.৮০' : 'Compliant with ≥ 0.80 EO Threshold',
      icon: Scale,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.12)',
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
                <BarChart3 size={24} style={{ color: 'var(--upay-blue)' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {lang === 'bn' ? 'মডেল পারফরম্যান্স ও ন্যায্যতা' : 'Model Governance & Fairness'}
                </h2>
                <span className="badge badge-brand" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>Tool 4</span>
              </div>
            </div>
            <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {lang === 'bn'
                ? 'XGBoost মাল্টি-আউটপুট ক্লাসিফায়ার, সারপ্লাস রিগ্রেসর ও ন্যায্যতা অডিট মেট্রিক্স। বেসলাইনের বিপরীতে কঠোর মূল্যায়ন ও ডেমোগ্রাফিক সমতা পরীক্ষা।'
                : 'Rigorous validation against baseline, calibration scores, and demographic equality checks across all onboarding milestones.'}
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
            <div
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
                    ? 'মেট্রিক বা মাইলস্টোন খুঁজুন (উদাঃ AUC, Recharge)...'
                    : 'Search Metric or Milestone (e.g. AUC, Recharge)...'
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
                type="button"
                onClick={loadData}
                style={{
                  background: 'var(--upay-blue)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 14px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                  fontFamily: 'inherit',
                }}
              >
                <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                <span>{lang === 'bn' ? 'রিলোড' : 'Reload'}</span>
              </button>
            </div>

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
                  <span>{lang === 'bn' ? 'প্রাসঙ্গিক মূল্যায়ন সূচক' : 'Matching Metrics & Milestones'}</span>
                  <span>{suggestions.length} results</span>
                </div>

                <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                  {suggestions.map((item, idx) => {
                    const isHovered = idx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectSearchItem(item)}
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
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.94rem', color: isHovered ? 'var(--upay-blue)' : 'var(--text-primary)' }}>
                            {lang === 'bn' ? item.nameBn : item.nameEn}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            {item.category}
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
                          {lang === 'bn' ? 'ফিল্টার' : 'Filter'} <ArrowRight size={12} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Demo selector pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600 }}>{lang === 'bn' ? 'দ্রুত ফিল্টার:' : 'Quick Filter:'}</span>
              {demoItems.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedMilestone(item.key)}
                  style={{
                    background: selectedMilestone === item.key ? 'var(--upay-blue-soft)' : 'var(--bg-white)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '3px 8px',
                    fontSize: '0.84rem',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    color: selectedMilestone === item.key ? 'var(--upay-blue)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--upay-blue-soft)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      selectedMilestone === item.key ? 'var(--upay-blue-soft)' : 'var(--bg-white)';
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
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
            {lang === 'bn' ? 'মাইলস্টোন নির্বাচন:' : 'Filter Milestone:'}
          </span>
          {[
            { key: null, label: lang === 'bn' ? 'সকল মাইলস্টোন' : 'All Milestones' },
            { key: 'M2', label: lang === 'bn' ? 'প্রথম রিচার্জ' : 'First Recharge' },
            { key: 'M3', label: lang === 'bn' ? 'ক্যাশ-ইন / অ্যাড মানি' : 'Cash-in / Add Money' },
            { key: 'M4', label: lang === 'bn' ? 'মার্চেন্ট কিউআর' : 'Merchant QR' },
            { key: 'M5', label: lang === 'bn' ? 'ডিপিএস একাউন্ট' : 'Open DPS' },
          ].map((tab) => (
            <button
              key={tab.key || 'all'}
              onClick={() => setSelectedMilestone(tab.key)}
              className={`pill-filter ${selectedMilestone === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {selectedMilestone && (
          <button
            onClick={() => setSelectedMilestone(null)}
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
            {lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filter'}
          </button>
        )}
      </div>

      {/* Main Performance and Fairness Content */}
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
              color: 'var(--upay-blue)',
            }}
          />
          <p style={{ fontSize: '0.94rem', fontWeight: 600 }}>
            {lang === 'bn'
              ? 'মডেল মেট্রিক্স ও ন্যায্যতা অডিট লোড হচ্ছে...'
              : 'Loading model evaluation artifacts & demographic audits...'}
          </p>
        </div>
      ) : (
        <>
          <MetricsGrid
            metrics={metrics}
            lang={lang}
            filterMilestone={selectedMilestone}
            showSummaryCards={false}
          />
          <FairnessPanel
            fairnessData={fairness}
            lang={lang}
            filterMilestone={selectedMilestone}
          />
        </>
      )}
    </div>
  );
}

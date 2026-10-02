'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useLanguage } from '../../lib/LanguageContext';
import {
  Landmark,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Calendar,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label_en: string; label_bn: string }> = {
  critical: { color: '#dc2626', bg: '#fef2f2', label_en: 'Critical', label_bn: 'জরুরি' },
  low: { color: '#d97706', bg: '#fffbeb', label_en: 'Low Float', label_bn: 'কম ফ্লোট' },
  adequate: { color: '#2563eb', bg: '#eff6ff', label_en: 'Adequate', label_bn: 'পর্যাপ্ত' },
  healthy: { color: '#059669', bg: '#ecfdf5', label_en: 'Healthy', label_bn: 'স্বাস্থ্যকর' },
};

export default function LiquidityPage() {
  const { lang } = useLanguage();
  const [overview, setOverview] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [areaFilter, setAreaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const data = await api.getAgentsOverview(
        areaFilter !== 'all' ? areaFilter : undefined,
        statusFilter !== 'all' ? statusFilter : undefined,
        50
      );
      setOverview(data);
    } catch (e) {
      console.error('Failed to load agents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOverview(); }, [areaFilter, statusFilter]);

  const loadForecast = async (agentId: string) => {
    setSelectedAgent(agentId);
    try {
      const data = await api.getAgentForecast(agentId);
      setForecast(data);
    } catch (e) {
      console.error('Failed to load forecast:', e);
    }
  };

  const summary = overview?.status_summary || { critical: 0, low: 0, adequate: 0, healthy: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: 'var(--radius-lg)',
            background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Landmark size={22} style={{ color: '#d97706' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {lang === 'bn' ? 'এজেন্ট তারল্য পূর্বাভাস' : 'Agent Liquidity Forecast'}
              </h2>
              <span className="badge badge-brand">Tool 3</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {lang === 'bn'
                ? 'এজেন্ট পয়েন্টে ক্যাশ-আউট চাহিদা পূর্বাভাস ও তারল্য ব্যবস্থাপনা'
                : 'Predict cash-out demand at agent points and manage float liquidity'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="glass-panel" style={{ padding: '16px 20px', cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              {lang === 'bn' ? cfg.label_bn : cfg.label_en}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: cfg.color }}>
              {summary[key] || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              {lang === 'bn' ? 'এজেন্ট' : 'agents'}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {lang === 'bn' ? 'ফিল্টার:' : 'Filter:'}
        </span>
        {['all', 'urban', 'peri_urban', 'rural'].map((area) => (
          <button key={area} onClick={() => setAreaFilter(area)}
            style={{
              padding: '5px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', fontWeight: 600,
              background: areaFilter === area ? 'var(--upay-blue)' : 'var(--bg-subtle)',
              border: areaFilter === area ? '1px solid var(--upay-blue)' : '1px solid var(--border-light)',
              color: areaFilter === area ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {area === 'all' ? (lang === 'bn' ? 'সকল' : 'All Areas') :
             area === 'peri_urban' ? 'Peri-Urban' : area.charAt(0).toUpperCase() + area.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Content: Agent Table + Forecast */}
      <div style={{ display: 'grid', gridTemplateColumns: forecast ? '1fr 1fr' : '1fr', gap: '20px' }}>
        {/* Agent Table */}
        <div className="glass-panel" style={{ padding: '20px 24px', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
            {lang === 'bn' ? 'এজেন্ট পয়েন্টসমূহ' : 'Agent Points'}{' '}
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 500 }}>
              ({overview?.total_agents || 500} total)
            </span>
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} />
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Agent</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Area</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Cash-Out</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(overview?.agents || []).map((agent: any) => {
                    const cfg = STATUS_CONFIG[agent.liquidity_status] || STATUS_CONFIG.healthy;
                    const isSelected = agent.agent_id === selectedAgent;
                    return (
                      <tr key={agent.agent_id}
                        style={{
                          borderBottom: '1px solid var(--border-light)',
                          background: isSelected ? 'var(--upay-blue-soft)' : 'transparent',
                          cursor: 'pointer',
                        }}
                        onClick={() => loadForecast(agent.agent_id)}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '10px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                          {agent.agent_id}
                          {agent.is_rmg_zone && <span style={{ marginLeft: '4px', fontSize: '0.65rem', background: '#fee2e2', color: '#dc2626', padding: '1px 5px', borderRadius: '4px' }}>RMG</span>}
                        </td>
                        <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} />
                            {agent.area_type}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{agent.division}</div>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>
                          ৳{Math.round(agent.cash_out_volume).toLocaleString()}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600,
                            background: cfg.bg, color: cfg.color,
                          }}>
                            {lang === 'bn' ? cfg.label_bn : cfg.label_en}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); loadForecast(agent.agent_id); }}
                            style={{
                              padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontWeight: 600,
                              background: 'var(--upay-blue)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
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
            </div>
          )}
        </div>

        {/* Forecast Panel */}
        {forecast && (
          <div className="glass-panel" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {lang === 'bn' ? '৭-দিনের পূর্বাভাস' : '7-Day Forecast'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {forecast.agent_id} · {forecast.agent_info?.division} · {forecast.agent_info?.tier}
                </p>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600,
                background: forecast.agent_info?.is_rmg_zone ? '#fee2e2' : 'var(--bg-subtle)',
                color: forecast.agent_info?.is_rmg_zone ? '#dc2626' : 'var(--text-muted)',
              }}>
                {forecast.agent_info?.is_rmg_zone ? 'RMG Zone' : forecast.agent_info?.area_type}
              </span>
            </div>

            {/* Forecast bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(forecast.forecast || []).map((day: any, i: number) => {
                const maxPred = Math.max(...(forecast.forecast || []).map((d: any) => d.predicted_cashout));
                const pct = maxPred > 0 ? (day.predicted_cashout / maxPred) * 100 : 0;
                const riskColor = day.risk_level === 'critical' ? '#dc2626' :
                                  day.risk_level === 'warning' ? '#d97706' : '#059669';

                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: 'var(--radius-md)',
                    background: day.is_salary_day ? '#fffbeb' : 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                  }}>
                    <div style={{ width: '80px', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {day.day_name?.slice(0, 3)}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{day.date}</div>
                    </div>

                    <div style={{ flex: 1, height: '20px', background: 'var(--bg-white)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`, borderRadius: '6px',
                        background: `linear-gradient(90deg, ${riskColor}80, ${riskColor})`,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>

                    <div style={{ width: '85px', textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: riskColor }}>
                        ৳{Math.round(day.predicted_cashout).toLocaleString()}
                      </span>
                    </div>

                    {day.is_salary_day && (
                      <Calendar size={13} style={{ color: '#d97706', flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Float info */}
            <div style={{
              marginTop: '16px', padding: '12px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)', border: '1px solid var(--border-light)',
            }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {lang === 'bn' ? 'ফ্লোট ক্ষমতা' : 'Float Capacity'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ৳{(forecast.agent_info?.float_capacity || 0).toLocaleString()} BDT
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

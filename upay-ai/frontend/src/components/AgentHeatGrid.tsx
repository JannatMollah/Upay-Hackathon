'use client';

import React from 'react';
import { Language } from '../lib/i18n';
import { MapPin, Users, AlertOctagon } from 'lucide-react';
import { Tooltip, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis } from 'recharts';

interface AgentHeatGridProps {
  summary: { critical: number; low: number; adequate: number; healthy: number };
  totalAgents: number;
  lang: Language;
}

export const AgentHeatGrid: React.FC<AgentHeatGridProps> = ({ summary, totalAgents, lang }) => {
  // Generate dummy grid data representing 500 agents
  const cols = 25;
  const rows = 20; // 500 agents
  const data: any[] = [];
  
  const statusCounts = {
    critical: summary.critical || 0,
    low: summary.low || 0,
    adequate: summary.adequate || 0,
    healthy: summary.healthy || 0,
  };

  // We assign status to each cell based on counts to simulate a real heatmap
  let criticalLeft = statusCounts.critical;
  let lowLeft = statusCounts.low;
  let adequateLeft = statusCounts.adequate;
  let healthyLeft = statusCounts.healthy;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let status = 'healthy';
      if (criticalLeft > 0) {
        status = 'critical';
        criticalLeft--;
      } else if (lowLeft > 0) {
        status = 'low';
        lowLeft--;
      } else if (adequateLeft > 0) {
        status = 'adequate';
        adequateLeft--;
      } else {
        status = 'healthy';
        healthyLeft--;
      }

      // Add some randomness to positioning for visual interest
      data.push({
        x: x + (Math.random() * 0.4 - 0.2),
        y: y + (Math.random() * 0.4 - 0.2),
        status,
        agentId: `AG${Math.floor(Math.random() * 9000) + 1000}`
      });
    }
  }

  // Shuffle array slightly so colors are distributed
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [data[i].status, data[j].status] = [data[j].status, data[i].status];
  }

  const getColor = (status: string) => {
    switch (status) {
      case 'critical': return '#EF4444'; // Red
      case 'low': return '#F59E0B'; // Amber
      case 'adequate': return '#3B82F6'; // Blue
      case 'healthy': return '#10B981'; // Green
      default: return '#64748B';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="chart-tooltip-glass" style={{ padding: '8px 12px', minWidth: 'auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {p.agentId}
          </div>
          <div style={{ fontSize: '0.7rem', color: getColor(p.status), textTransform: 'capitalize', marginTop: '2px' }}>
            {p.status}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel" style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {lang === 'bn' ? 'এজেন্ট নেটওয়ার্ক হিটম্যাপ' : 'Agent Network Heatmap'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {lang === 'bn' ? `মোট ${totalAgents} এজেন্ট পয়েন্ট` : `${totalAgents} Active Agent Points`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }}/> {lang === 'bn' ? 'জরুরি' : 'Critical'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}/> {lang === 'bn' ? 'স্বল্প' : 'Low'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }}/> {lang === 'bn' ? 'পর্যাপ্ত' : 'Adequate'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}/> {lang === 'bn' ? 'স্বাভাবিক' : 'Healthy'}</div>
        </div>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <XAxis type="number" dataKey="x" hide domain={[0, cols]} />
            <YAxis type="number" dataKey="y" hide domain={[0, rows]} />
            <ZAxis type="number" range={[20, 20]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            {['critical', 'low', 'adequate', 'healthy'].map((status) => (
              <Scatter
                key={status}
                name={status}
                data={data.filter(d => d.status === status)}
                fill={getColor(status)}
                opacity={status === 'critical' ? 1 : 0.6}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      {summary.critical > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '10px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertOctagon size={18} style={{ color: '#EF4444' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
            <strong style={{ color: '#EF4444' }}>{summary.critical}</strong> {lang === 'bn' ? 'এজেন্টের তারল্য এখনই নিশ্চিত করা প্রয়োজন!' : 'agents require immediate liquidity replenishment!'}
          </span>
        </div>
      )}
    </div>
  );
};

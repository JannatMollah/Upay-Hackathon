'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { SavingsPlanResponse, AtRiskUser } from '../../types';
import { Language, t } from '../../lib/i18n';
import { useLanguage } from '../../lib/LanguageContext';
import { SanchayBotPanel } from '../../components/SanchayBotPanel';
import { PiggyBank, Search, Sparkles, Users } from 'lucide-react';

export default function SavingsCoachPage() {
  const { lang } = useLanguage();
  const [selectedUserId, setSelectedUserId] = useState<string>('U000013573');
  const [savingsData, setSavingsData] = useState<SavingsPlanResponse | null>(null);
  const [atRiskList, setAtRiskList] = useState<AtRiskUser[]>([]);
  const [inputUserId, setInputUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      try {
        const risk = await api.getAtRiskUsers(undefined, 8);
        setAtRiskList(risk.users);
        if (risk.users.length > 0) {
          setSelectedUserId(risk.users[0].user_id);
        }
      } catch (e) {
        console.error('Failed to load users:', e);
      }
    }
    loadInitial();
  }, []);

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

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUserId.trim()) {
      setSelectedUserId(inputUserId.trim());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(0, 210, 180, 0.12) 0%, rgba(16, 28, 48, 0.95) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(0, 210, 180, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00d2b4',
            }}
          >
            <PiggyBank size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                {t('sanchay.title', lang)}
              </h2>
              <span className="badge badge-brand">Module B</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
              {t('sanchay.subtitle', lang)}
            </p>
          </div>
        </div>

        {/* User Lookup */}
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="User ID (e.g. U000013573)..."
            value={inputUserId}
            onChange={(e) => setInputUserId(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 14px',
              color: '#f8fafc',
              fontSize: '0.85rem',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #00d2b4, #059669)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#070d18',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Analyze
          </button>
        </form>
      </div>

      {/* Suggested Users Row */}
      {atRiskList.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            {lang === 'bn' ? 'নমুনা গ্রাহকগণ:' : 'Sample Users:'}
          </span>
          {atRiskList.map((u) => {
            const isSelected = u.user_id === selectedUserId;
            return (
              <button
                key={u.user_id}
                onClick={() => setSelectedUserId(u.user_id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? 'rgba(0, 210, 180, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1px solid rgba(0, 210, 180, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#00d2b4' : '#cbd5e1',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {u.user_id}
              </button>
            );
          })}
        </div>
      )}

      {/* Main SanchayBot Panel */}
      <SanchayBotPanel savingsData={savingsData} lang={lang} />
    </div>
  );
}

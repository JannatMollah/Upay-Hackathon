'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { SavingsPlanResponse, AtRiskUser } from '../../types';
import { Language, t } from '../../lib/i18n';
import { useLanguage } from '../../lib/LanguageContext';
import { SanchayBotPanel } from '../../components/SanchayBotPanel';
import { PiggyBank, Search, ArrowLeft } from 'lucide-react';

export default function DPSCoachPage() {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
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
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-success)',
            }}
          >
            <PiggyBank size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}>
                {lang === 'bn' ? 'ডিপিএস কোচ' : 'DPS Coach'}
              </h2>
              <span className="badge badge-brand">Tool 2</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {lang === 'bn'
                ? 'ক্যাশ-ফ্লো বিশ্লেষণ ও ব্যক্তিগতকৃত ডিপিএস সঞ্চয় পরিকল্পনা'
                : 'Cash-flow analysis & personalized DPS savings recommendation'}
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
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--upay-blue)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
          />
          <button
            type="submit"
            style={{
              background: 'var(--color-success)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '8px 18px',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Analyze
          </button>
        </form>
      </div>

      {/* Sample Users */}
      {atRiskList.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
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
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.76rem',
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontWeight: isSelected ? 600 : 500,
                  background: isSelected ? 'var(--upay-blue)' : 'var(--bg-subtle)',
                  border: isSelected ? '1px solid var(--upay-blue)' : '1px solid var(--border-light)',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {u.user_id}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Panel */}
      <SanchayBotPanel savingsData={savingsData} lang={lang} />
    </div>
  );
}

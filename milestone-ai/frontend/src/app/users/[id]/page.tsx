'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { PredictionResponse, SavingsPlanResponse } from '../../../types';
import { Language, t } from '../../../lib/i18n';
import { useLanguage } from '../../../lib/LanguageContext';
import { UserProfile } from '../../../components/UserProfile';
import { MilestoneProgress } from '../../../components/MilestoneProgress';
import { ShapWaterfall } from '../../../components/ShapWaterfall';
import { NudgeCard } from '../../../components/NudgeCard';
import { SanchayBotPanel } from '../../../components/SanchayBotPanel';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export default function UserDetailPage() {
  const { lang } = useLanguage();
  const params = useParams();
  const userId = params?.id as string;

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [savingsPlan, setSavingsPlan] = useState<SavingsPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleApproveNudge = async (nudgeId: string, action: string, modifiedTextBn?: string) => {
    await api.approveNudge(nudgeId, action, 'CM001', modifiedTextBn);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <p>{lang === 'bn' ? 'বিশ্লেষণ লোড হচ্ছে...' : `Analyzing intelligence for user ${userId}...`}</p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
        <AlertCircle size={32} style={{ color: '#f43f5e', marginBottom: '12px' }} />
        <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '8px' }}>User Not Found</h3>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{error}</p>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#f8fafc',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          Back to Overview
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Navigation header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#94a3b8',
            fontSize: '0.88rem',
            fontWeight: 500,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#00d2b4')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <ArrowLeft size={16} />
          <span>{lang === 'bn' ? 'ফানেল ড্যাশবোর্ডে ফিরুন' : 'Back to Command Center'}</span>
        </Link>

        <button
          onClick={loadUserData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Top Grid: User Profile + Milestone Probabilities */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <UserProfile userId={userId} lang={lang} />
        <MilestoneProgress
          probabilities={prediction.milestone_probabilities}
          primaryDropOff={prediction.primary_drop_off}
          lang={lang}
        />
      </div>

      {/* Middle Grid: Module A (SHAP Explainability Waterfall + Personalized Nudge Card) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
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

      {/* Bottom: Module B (SanchayBot Savings Coach Panel) */}
      <SanchayBotPanel savingsData={savingsPlan} lang={lang} />
    </div>
  );
}

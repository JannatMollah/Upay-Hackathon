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
      <div style={{
        padding: '60px 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
      }}>
        <RefreshCw size={22} style={{
          animation: 'spin 1s linear infinite',
          marginBottom: '12px',
          display: 'inline-block',
        }} />
        <p style={{ fontSize: '0.88rem' }}>
          {lang === 'bn' ? 'বিশ্লেষণ লোড হচ্ছে...' : `Analyzing intelligence for user ${userId}...`}
        </p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="glass-panel" style={{
        padding: '40px',
        textAlign: 'center',
        maxWidth: '480px',
        margin: '40px auto',
      }}>
        <AlertCircle size={32} style={{ color: 'var(--color-danger)', marginBottom: '14px' }} />
        <h3 style={{
          fontSize: '1.15rem',
          color: 'var(--text-primary)',
          marginBottom: '8px',
          fontWeight: 700,
        }}>
          {lang === 'bn' ? 'গ্রাহক খুঁজে পাওয়া যায়নি' : 'User Not Found'}
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.88rem' }}>
          {error}
        </p>
        <Link
          href="/activation"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--upay-blue)',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <ArrowLeft size={15} />
          {lang === 'bn' ? 'প্রেডিক্টরে ফিরুন' : 'Back to Activation Predictor'}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          href="/activation"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: 500,
            transition: 'color 0.15s',
            padding: '4px 0',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--upay-blue)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={15} />
          <span>{lang === 'bn' ? 'অ্যাক্টিভেশন প্রেডিক্টরে ফিরুন' : 'Back to Activation Predictor'}</span>
        </Link>

        <button
          onClick={loadUserData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s',
            fontFamily: 'inherit',
          }}
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Top Grid: User Profile + Milestone Probabilities */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        <UserProfile userId={userId} lang={lang} />
        <MilestoneProgress
          probabilities={prediction.milestone_probabilities}
          primaryDropOff={prediction.primary_drop_off}
          lang={lang}
        />
      </div>

      {/* Middle Grid: SHAP + Nudge */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
      }}>
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

      {/* Bottom: DPS Coach */}
      <SanchayBotPanel savingsData={savingsPlan} lang={lang} />
    </div>
  );
}

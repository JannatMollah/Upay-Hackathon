'use client';

import React, { useState } from 'react';
import { Nudge } from '../types';
import { Language, t } from '../lib/i18n';
import { Sparkles, ShieldCheck, Send, CheckCircle2, XCircle, Edit3, MessageSquare } from 'lucide-react';

interface NudgeCardProps {
  nudge: Nudge | null;
  onApprove: (nudgeId: string, action: string, modifiedTextBn?: string) => Promise<void>;
  lang: Language;
}

export const NudgeCard: React.FC<NudgeCardProps> = ({ nudge, onApprove, lang }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(nudge?.text_bn || '');
  const [loading, setLoading] = useState(false);
  const [approvedState, setApprovedState] = useState<string | null>(nudge?.status || null);
  const [showEnglish, setShowEnglish] = useState(false);

  if (!nudge) {
    return (
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
          {t('nudge.title', lang)}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          {lang === 'bn' ? 'কোনো ইন্টারভেনশন প্রয়োজন নেই।' : 'No active nudge recommended for this user.'}
        </p>
      </div>
    );
  }

  const handleAction = async (action: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await onApprove(
        nudge.nudge_id,
        action,
        isEditing ? editedText : undefined
      );
      setApprovedState(action);
      setIsEditing(false);
    } catch (err) {
      console.error('Nudge approval failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        border: '1px solid rgba(0, 210, 180, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 210, 180, 0.1)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: '#00d2b4' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
            {t('nudge.title', lang)}
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-brand">
            <Sparkles size={11} />
            {nudge.ai_generated ? 'Gemini 1.5' : 'Smart Template'}
          </span>
          {nudge.guardrail_passed && (
            <span className="badge badge-success">
              <ShieldCheck size={12} />
              Guardrail Verified
            </span>
          )}
        </div>
      </div>

      {/* Meta Specs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '12px',
          borderRadius: '10px',
        }}
      >
        <div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
            {t('nudge.channel', lang)}
          </span>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
            {nudge.channel_recommendation.toUpperCase()}
          </p>
        </div>

        <div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
            {t('nudge.bonus', lang)}
          </span>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24' }}>
            ৳{nudge.bonus_amount_bdt} BDT
          </p>
        </div>

        <div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
            Target Milestone
          </span>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
            {nudge.target_milestone}
          </p>
        </div>

        <div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
            Status
          </span>
          <p
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: approvedState === 'approved' ? '#34d399' : approvedState === 'rejected' ? '#f87171' : '#facc15',
            }}
          >
            {approvedState ? approvedState.toUpperCase() : 'PENDING'}
          </p>
        </div>
      </div>

      {/* Bangla Nudge Content Box */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
            {lang === 'bn' ? 'প্রস্তাবিত বার্তা (বাংলা):' : 'Proposed Nudge Copy (Bangla):'}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowEnglish(!showEnglish)}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                cursor: 'pointer',
                fontSize: '0.78rem',
                textDecoration: 'underline',
              }}
            >
              {showEnglish ? 'Hide English' : 'Show English Translation'}
            </button>
            {!isEditing && approvedState === 'pending_approval' && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00d2b4',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Edit3 size={12} />
                Edit
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid #00d2b4',
              color: '#f8fafc',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              lineHeight: 1.6,
            }}
          />
        ) : (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '10px',
              background: 'rgba(0, 210, 180, 0.05)',
              border: '1px solid rgba(0, 210, 180, 0.2)',
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#f1f5f9',
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
          >
            "{nudge.text_bn}"
          </div>
        )}

        {showEnglish && (
          <div
            style={{
              marginTop: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.85rem',
              color: '#94a3b8',
              fontStyle: 'italic',
            }}
          >
            "{nudge.text_en}"
          </div>
        )}
      </div>

      {/* Actions */}
      {approvedState === 'approved' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#34d399',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <CheckCircle2 size={18} />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
            {t('nudge.approved_success', lang)}
          </span>
        </div>
      ) : approvedState === 'rejected' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#f87171',
            background: 'rgba(244, 63, 94, 0.1)',
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(244, 63, 94, 0.3)',
          }}
        >
          <XCircle size={18} />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
            {lang === 'bn' ? 'নাজ বার্তাটি বাতিল করা হয়েছে।' : 'Nudge was rejected.'}
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            disabled={loading}
            onClick={() => handleAction('rejected')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t('nudge.reject', lang)}
          </button>

          <button
            disabled={loading}
            onClick={() => handleAction('approved')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 22px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00d2b4 0%, #059669 100%)',
              border: 'none',
              color: '#070d18',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(0, 210, 180, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            <Send size={15} />
            <span>{loading ? 'Processing...' : t('nudge.approve', lang)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

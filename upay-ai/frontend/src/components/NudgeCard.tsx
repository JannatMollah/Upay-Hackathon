'use client';

import React, { useState } from 'react';
import { Nudge } from '../types';
import { Language, t } from '../lib/i18n';
import { Sparkles, ShieldCheck, Send, CheckCircle2, XCircle, Edit3 } from 'lucide-react';

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
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {t('nudge.title', lang)}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {lang === 'bn' ? 'কোনো ইন্টারভেনশন প্রয়োজন নেই।' : 'No active nudge recommended for this user.'}
        </p>
      </div>
    );
  }

  const handleAction = async (action: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await onApprove(nudge.nudge_id, action, isEditing ? editedText : undefined);
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
        padding: '24px 28px',
        borderLeft: '4px solid var(--upay-blue)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} style={{ color: 'var(--upay-blue)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('nudge.title', lang)}
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <span className="badge badge-brand">
            <Sparkles size={10} />
            {nudge.ai_generated ? 'Gemini 1.5' : 'Smart Template'}
          </span>
          {nudge.guardrail_passed && (
            <span className="badge badge-success">
              <ShieldCheck size={11} />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Meta Specs Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {[
          { label: t('nudge.channel', lang), value: nudge.channel_recommendation.toUpperCase(), color: 'var(--upay-blue)' },
          { label: t('nudge.bonus', lang), value: `৳${nudge.bonus_amount_bdt} BDT`, color: 'var(--color-warning)' },
          { label: 'Target Milestone', value: nudge.target_milestone, color: 'var(--text-primary)' },
          {
            label: 'Status',
            value: approvedState ? approvedState.toUpperCase() : 'PENDING',
            color: approvedState === 'approved' ? 'var(--color-success)' : approvedState === 'rejected' ? 'var(--color-danger)' : 'var(--color-warning)',
          },
        ].map((item, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-subtle)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
          }}>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.03em',
            }}>
              {item.label}
            </span>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: item.color, marginTop: '2px' }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Bangla Nudge Content */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}>
          <span style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
          }}>
            {lang === 'bn' ? 'প্রস্তাবিত বার্তা (বাংলা):' : 'Proposed Nudge Copy (Bangla):'}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowEnglish(!showEnglish)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--upay-blue)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 500,
                textDecoration: 'underline',
                fontFamily: 'inherit',
              }}
            >
              {showEnglish ? 'Hide English' : 'Show English'}
            </button>
            {!isEditing && approvedState === 'pending_approval' && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-success)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'inherit',
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
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-white)',
              border: '2px solid var(--upay-blue)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontFamily: "'Hind Siliguri', sans-serif",
              lineHeight: 1.6,
              outline: 'none',
              resize: 'vertical',
            }}
          />
        ) : (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--upay-blue-soft)',
              border: '1px solid rgba(30, 77, 140, 0.12)',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'var(--text-primary)',
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
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              lineHeight: 1.6,
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
            color: 'var(--color-success)',
            background: 'var(--color-success-bg)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-success-border)',
          }}
        >
          <CheckCircle2 size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {t('nudge.approved_success', lang)}
          </span>
        </div>
      ) : approvedState === 'rejected' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-danger)',
            background: 'var(--color-danger-bg)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-danger-border)',
          }}
        >
          <XCircle size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {lang === 'bn' ? 'নাজ বার্তাটি বাতিল করা হয়েছে।' : 'Nudge was rejected.'}
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            disabled={loading}
            onClick={() => handleAction('rejected')}
            style={{
              padding: '9px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-white)',
              border: '1px solid var(--color-danger-border)',
              color: 'var(--color-danger)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
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
              padding: '9px 24px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--upay-blue)',
              border: 'none',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
          >
            <Send size={14} />
            <span>{loading ? 'Processing...' : t('nudge.approve', lang)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Target,
  PiggyBank,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { Language } from '../lib/i18n';

interface JudgeTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

interface TourStep {
  step: number;
  tag: string;
  titleEn: string;
  titleBn: string;
  badge: string;
  summaryEn: string;
  summaryBn: string;
  bulletsEn: string[];
  bulletsBn: string[];
  linkHref: string;
  linkLabelEn: string;
  linkLabelBn: string;
  icon: React.ComponentType<any>;
  accentColor: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    tag: 'Executive Overview',
    titleEn: 'The Upay Triad Synergistic Engine',
    titleBn: 'উপায় ট্রায়াড সমন্বিত ইঞ্জিন',
    badge: 'Core Architecture',
    summaryEn: 'How Upay AI solves MFS user churn, capital idling, and agent cash-out stockouts in one closed-loop intelligence system.',
    summaryBn: 'কীভাবে উপায় এআই গ্রাহক ড্রপ-অফ, অলস সঞ্চয় এবং এজেন্ট তারল্য সংকটকে একক সমন্বিত ইন্টেলিজেন্সে রূপান্তর করে।',
    bulletsEn: [
      'Track 04 (Activation): Rescues dormant signups with XGBoost drop-off modeling & localized Bangla nudges.',
      'Track 03 (DPS Coach): Channels newly activated users’ surplus cash into high-yield UCB Deposit Schemes.',
      'Track 05 (Liquidity): Predicts seasonal & salary surge cash-out demand to ensure agent points never run dry.',
    ],
    bulletsBn: [
      'ট্র্যাক ০৪ (অ্যাক্টিভেশন): ৬-ধাপ বোনাস ফানেলে ড্রপ-অফ রোধ এবং ব্যক্তিগতকৃত বাংলা পুশ নোটিফিকেশন।',
      'Track ০৩ (ডিপিএস কোচ): উদ্বৃত্ত ক্যাশ-ফ্লো বিশ্লেষণ করে ইউসিবি ডিপিএস সঞ্চয় অ্যাকাউন্টে রূপান্তর।',
      'ট্র্যাক ০৫ (তারল্য পূর্বাভাস): ৫০০ এজেন্ট পয়েন্টে নগদ উত্তোলনের চাহিদা ও বেতন দিবসের চাপ পূর্বাভাস।',
    ],
    linkHref: '/',
    linkLabelEn: 'View Hub Architecture',
    linkLabelBn: 'হাব আর্কিটেকচার দেখুন',
    icon: Flame,
    accentColor: '#EDBC1B',
  },
  {
    step: 2,
    tag: 'Track 04 — Activation AI',
    titleEn: 'Multi-Milestone Funnel & Gemini Nudge Studio',
    titleBn: 'মাল্টি-মাইলস্টোন ফানেল ও জেমিনাই নাজ স্টুডিও',
    badge: 'AUC-ROC 0.7659',
    summaryEn: 'Identifies at-risk users before bonus expiry and generates culturally-grounded Bangla nudges with one-click Bengali audio voiceover.',
    summaryBn: 'বোনাস মেয়াদ শেষ হওয়ার পূর্বেই গ্রাহক ঝুঁকি শনাক্তকরণ এবং ভয়েস অডিও সহ স্থানীয় বাংলা নাজ তৈরি।',
    bulletsEn: [
      'Calibrated XGBoost classifier predicts drop-off probability at milestones M2, M3, M4, and M5.',
      'Bengali Text-to-Speech (TTS): Live audio synthesis so rural and unbanked users can hear instructions.',
      'RBAC Security Guardrail: Only verified Campaign Managers (CM001) can dispatch nudges to users.',
    ],
    bulletsBn: [
      'XGBoost মডেল M2 থেকে M5 মাইলস্টোনে ড্রপ-অফ সম্ভাবনা নির্ভুলভাবে পূর্বাভাস দেয়।',
      'বাংলা টেক্সট-টু-স্পিচ (TTS): ক্লিক করলেই খাঁটি বাংলা উচ্চারণে বার্তা শোনানোর ক্ষমতা।',
      'RBAC নিরাপত্তা যাচাই: কেবল অনুমোদিত ক্যাম্পেইন ম্যানেজারই নাজ অনুমোদন করতে পারেন।',
    ],
    linkHref: '/activation',
    linkLabelEn: 'Explore Activation Predictor',
    linkLabelBn: 'অ্যাক্টিভেশন প্রেডিক্টর দেখুন',
    icon: Target,
    accentColor: '#2563EB',
  },
  {
    step: 3,
    tag: 'Track 03 — DPS Wealth Coach',
    titleEn: 'SanchayBot: Leakage-Free Surplus & UCB DPS Plans',
    titleBn: 'সঞ্চয়বট: লিক-মুক্ত সারপ্লাস ও ইউসিবি ডিপিএস প্ল্যান',
    badge: 'R² 0.9401 | MAE ৳2,657',
    summaryEn: 'Converts cash-out spenders into disciplined savers while saving unbanked users ৳1,260+/year via zero-fee UCB ATMs.',
    summaryBn: 'উদ্বৃত্ত ক্যাশ বিশ্লেষণ করে ডিপিএস সঞ্চয় তৈরি এবং ইউসিবি এটিএমের মাধ্যমে বার্ষিক ৳১,২৬০+ ফি সাশ্রয়।',
    bulletsEn: [
      'Leakage-Free ML Regressor: Accurately predicts monthly discretionary surplus without target leakage.',
      'Interactive Wealth Accumulator Slider: Dynamically calculates maturity returns across 6 to 36 months.',
      'Zero-Charge UCB ATM Advantage: ৳8/৳1,000 ATM cash-out vs 1.85% competitors (৳149–৳185 saving per month).',
    ],
    bulletsBn: [
      'ডাটা লিক-মুক্ত সারপ্লাস রিগ্রেসর: গ্রাহকের মাসিক উদ্বৃত্ত ক্যাশ নির্ভুলভাবে হিসাব করে।',
      'ওয়েলথ অ্যাকুমুলেটর স্লাইডার: ৬ থেকে ৩৬ মাসের মেয়াদে চক্রবৃদ্ধি মুনাফা হিসাব করার ব্যবস্থা।',
      'ইউসিবি এটিএম সুবিধা: প্রতি হাজারে মাত্র ৮ টাকা ক্যাশ-আউট চার্জে বার্ষিক ব্যাপক সাশ্রয়।',
    ],
    linkHref: '/dps-coach',
    linkLabelEn: 'Try SanchayBot DPS Coach',
    linkLabelBn: 'সঞ্চয়বট ডিপিএস কোচ ব্যবহার করুন',
    icon: PiggyBank,
    accentColor: '#059669',
  },
  {
    step: 4,
    tag: 'Track 05 — Agent Liquidity',
    titleEn: 'Chronological Agent Liquidity Forecaster',
    titleBn: 'ক্রোনোলজিক্যাল এজেন্ট তারল্য ফোরকাস্টার',
    badge: 'R² 0.6760 | MAE ৳22,359',
    summaryEn: 'Prevents agent cash stockouts across 500 points with chronological time-series evaluation and RMG Garment cluster filters.',
    summaryBn: 'টাইম-সিরিজ বিভাজন ও তৈরি পোশাক শিল্প ক্লাস্টার ফিল্টার সহ ৫০০ এজেন্ট পয়েন্টে তারল্য সংকট প্রতিরোধ।',
    bulletsEn: [
      'Chronological Train/Test Split: Evaluated on strictly forward days (no future data contamination).',
      'Salary Day Surge Detection: Catches heavy wage disbursement peaks on 1st, 5th, and 10th of every month.',
      'Regional Float Replenishment: 1-click dispatch alert to field officers for critical agent nodes.',
    ],
    bulletsBn: [
      'ক্রোনোলজিক্যাল স্প্লিট: ভবিষ্যতের ডেটা কোনোভাবেই মডেলে ফাঁস হতে দেওয়া হয়নি।',
      'বেতন দিবসের চাহিদা শনাক্তকরণ: মাসের ১, ৫ ও ১০ তারিখে অতিরিক্ত চাহিদা চিহ্নিত করে।',
      'জরুরি তারল্য রিকুইজিশন: সংকটপূর্ণ এজেন্টের জন্য ফিল্ড অফিসারকে ১-ক্লিকে নোটিফিকেশন প্রেরণ।',
    ],
    linkHref: '/liquidity',
    linkLabelEn: 'Inspect Liquidity Forecaster',
    linkLabelBn: 'তারল্য ফোরকাস্টার দেখুন',
    icon: Landmark,
    accentColor: '#D97706',
  },
  {
    step: 5,
    tag: 'Innovation & Governance',
    titleEn: '4-Stage Ablation, Baselines & Security Proof',
    titleBn: '৪-ধাপ অ্যাবলেশন, বেসলাইন ও নিরাপত্তা প্রমাণ',
    badge: '60/60 Tests Passed | 14 Security Tests',
    summaryEn: 'Complete scientific rigor satisfying all feedback from Judge 1, Judge 2, and Judge 3.',
    summaryBn: 'বিচারকদের সমস্ত প্রশ্নের জবাবে বৈজ্ঞানিক গবেষণা, বেসলাইন তুলনা এবং সুরক্ষা যাচাই।',
    bulletsEn: [
      '4-Stage Ablation Study: Proves 1.92x lift over Random and 32.7% surplus eligibility for the full Triad.',
      'Baseline Scoreboard: ML Forecaster outperforms 7-day rolling avg by 23% and last-week baseline by 38%.',
      'Ethical AI & Compliance: Passes Equalized Odds demographic parity (>0.80 ratio) across Urban & Rural.',
    ],
    bulletsBn: [
      '৪-ধাপ অ্যাবলেশন স্টাডি: র‍্যান্ডম বেসলাইনের চেয়ে ১.৯২ গুণ বেশি প্রিভেন্টিভ প্রেডিকশন সক্ষমতা।',
      'বেসলাইন স্কোরবোর্ড: রোলিং এভারেজ এবং পূর্ববর্তী সপ্তাহের চেয়ে উল্লেখযোগ্য উন্নতি।',
      'ন্যায্যতা ও নৈতিকতা: শহর ও পল্লী অঞ্চলে ডেমোগ্রাফিক সমতা পরীক্ষা সফলভাবে উত্তীর্ণ।',
    ],
    linkHref: '/performance',
    linkLabelEn: 'View Innovation Lab & Ablation',
    linkLabelBn: 'ইনোভেশন ল্যাব ও অ্যাবলেশন দেখুন',
    icon: ShieldCheck,
    accentColor: '#6366F1',
  },
];

export const JudgeTourModal: React.FC<JudgeTourModalProps> = ({ isOpen, onClose, lang }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const current = TOUR_STEPS[currentStepIdx];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  return (
    <div className="judge-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="judge-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: `${current.accentColor}18`,
                color: current.accentColor,
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                border: `1px solid ${current.accentColor}35`,
              }}
            >
              {current.tag}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {lang === 'bn' ? `ধাপ ${current.step} / ৫` : `Step ${current.step} of 5`}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Close Tour"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Visual Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 20px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${current.accentColor}12 0%, rgba(255, 255, 255, 0.9) 100%)`,
            border: `1px solid ${current.accentColor}30`,
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: current.accentColor,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 20px ${current.accentColor}40`,
              flexShrink: 0,
            }}
          >
            <Icon size={26} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {lang === 'bn' ? current.titleBn : current.titleEn}
              </h3>
            </div>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: current.accentColor,
                background: '#ffffff',
                padding: '2px 8px',
                borderRadius: '6px',
                border: `1px solid ${current.accentColor}25`,
              }}
            >
              {current.badge}
            </span>
          </div>
        </div>

        {/* Summary */}
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
          {lang === 'bn' ? current.summaryBn : current.summaryEn}
        </p>

        {/* Bullet Points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {(lang === 'bn' ? current.bulletsBn : current.bulletsEn).map((bullet, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={16} style={{ color: current.accentColor, marginTop: '3px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {bullet}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStepIdx(idx)}
              style={{
                width: currentStepIdx === idx ? '26px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentStepIdx === idx ? current.accentColor : 'var(--border-default)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
              aria-label={`Jump to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Bottom Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
          <div>
            <Link
              href={current.linkHref}
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: current.accentColor,
                textDecoration: 'none',
              }}
            >
              <span>{lang === 'bn' ? current.linkLabelBn : current.linkLabelEn}</span>
              <ExternalLink size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {currentStepIdx > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-white)',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={16} />
                <span>{lang === 'bn' ? 'পূর্ববর্তী' : 'Back'}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '10px',
                border: 'none',
                background: current.accentColor,
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: `0 4px 12px ${current.accentColor}35`,
              }}
            >
              <span>
                {currentStepIdx === TOUR_STEPS.length - 1
                  ? lang === 'bn' ? 'ট্যুর শেষ করুন' : 'Finish Tour'
                  : lang === 'bn' ? 'পরবর্তী' : 'Next Step'}
              </span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

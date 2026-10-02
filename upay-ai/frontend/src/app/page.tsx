'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../lib/LanguageContext';
import { Target, PiggyBank, Landmark } from 'lucide-react';

const TOOLS = [
  {
    id: 'activation',
    href: '/activation',
    icon: Target,
    color: '#2563eb',
    bg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    title_en: 'Activation Predictor',
    title_bn: 'অ্যাক্টিভেশন প্রেডিক্টর',
    desc_en: 'Predict which new users will drop off during the 6-step bonus onboarding campaign. XGBoost + SHAP explainability + personalized Bangla nudges.',
    desc_bn: '৬-ধাপ বোনাস ক্যাম্পেইনে কোন নতুন গ্রাহক ড্রপ-অফ করবে তা পূর্বাভাস করুন। XGBoost + SHAP ব্যাখ্যাযোগ্যতা + ব্যক্তিগতকৃত বাংলা নাজ।',
    stats_en: ['AUC: 0.766', '50K Users', '6 Steps'],
    stats_bn: ['AUC: 0.766', '৫০K গ্রাহক', '৬ ধাপ'],
  },
  {
    id: 'dps-coach',
    href: '/dps-coach',
    icon: PiggyBank,
    color: '#059669',
    bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    title_en: 'DPS Coach',
    title_bn: 'ডিপিএস কোচ',
    desc_en: 'Analyze monthly cash-flow surplus and recommend personalized DPS savings plans. Helps users build financial security through UCB deposit schemes.',
    desc_bn: 'মাসিক ক্যাশ-ফ্লো বিশ্লেষণ করে ব্যক্তিগতকৃত ডিপিএস সঞ্চয় পরিকল্পনা প্রস্তাব করুন। UCB আমানত স্কিমের মাধ্যমে আর্থিক নিরাপত্তা গড়ুন।',
    stats_en: ['R²: 0.999', 'MAE: ৳279', '5 Tenures'],
    stats_bn: ['R²: 0.999', 'MAE: ৳২৭৯', '৫ মেয়াদ'],
  },
  {
    id: 'liquidity',
    href: '/liquidity',
    icon: Landmark,
    color: '#d97706',
    bg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    title_en: 'Agent Liquidity Forecast',
    title_bn: 'এজেন্ট তারল্য পূর্বাভাস',
    desc_en: 'Predict cash-out demand at 500 agent points to prevent liquidity shortages. 7-day demand forecast with salary-day surge detection.',
    desc_bn: '৫০০ এজেন্ট পয়েন্টে ক্যাশ-আউট চাহিদা পূর্বাভাস করুন। বেতন দিবসের চাহিদা বৃদ্ধি শনাক্তকরণ সহ ৭-দিনের পূর্বাভাস।',
    stats_en: ['R²: 0.673', '500 Agents', '7-Day Forecast'],
    stats_bn: ['R²: 0.673', '৫০০ এজেন্ট', '৭-দিন পূর্বাভাস'],
  },
];

export default function HubPage() {
  const { lang } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
          marginBottom: '10px',
        }}>
          {lang === 'bn' ? (
            <>উপায় <span style={{ color: 'var(--upay-blue)' }}>AI</span></>
          ) : (
            <>Upay <span style={{ color: 'var(--upay-blue)' }}>AI</span></>
          )}
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-muted)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          {lang === 'bn'
            ? 'মোবাইল ফাইন্যান্সিয়াল সার্ভিসের জন্য AI-চালিত ইন্টেলিজেন্স প্ল্যাটফর্ম'
            : 'AI-powered intelligence platform for smarter mobile financial services'}
        </p>
      </div>

      {/* Tool Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px',
      }}>
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const title = lang === 'bn' ? tool.title_bn : tool.title_en;
          const desc = lang === 'bn' ? tool.desc_bn : tool.desc_en;
          const stats = lang === 'bn' ? tool.stats_bn : tool.stats_en;

          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="glass-panel tool-card-hover"
              style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                textDecoration: 'none',
                color: 'inherit',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
            >
              {/* Card top icon */}
              <div>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: tool.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 6px 16px ${tool.color}35`,
                }}>
                  <Icon size={26} style={{ color: '#fff' }} />
                </div>
              </div>

              {/* Title & Description */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  marginBottom: '8px',
                }}>
                  {title}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                }}>
                  {desc}
                </p>
              </div>

              {/* Stats pills */}
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                {stats.map((s, i) => (
                  <span key={i} style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: `${tool.color}12`,
                    color: tool.color,
                    border: `1px solid ${tool.color}25`,
                  }}>
                    {s}
                  </span>
                ))}
              </div>

              {/* Open Tool Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '11px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: tool.bg,
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  marginTop: '4px',
                  boxShadow: `0 4px 14px ${tool.color}30`,
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.01em',
                }}
              >
                {lang === 'bn' ? 'টুল খুলুন' : 'Open Tool'}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../lib/LanguageContext';
import { Target, PiggyBank, Landmark } from 'lucide-react';

interface ToolItem {
  id: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  glow: string;
  bg: string;
  tag_en: string;
  tag_bn: string;
  title_en: string;
  title_bn: string;
  desc_en: string;
  desc_bn: string;
  stats_en: string[];
  stats_bn: string[];
}

const TOOLS: ToolItem[] = [
  {
    id: 'activation',
    href: '/activation',
    icon: Target,
    color: '#2563eb',
    glow: 'rgba(37, 99, 235, 0.22)',
    bg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    tag_en: 'Campaign AI',
    tag_bn: 'ক্যাম্পেইন এআই',
    title_en: 'Activation Predictor',
    title_bn: 'অ্যাক্টিভেশন প্রেডিক্টর',
    desc_en: 'Predict new user drop-off across the 6-stage bonus funnel with XGBoost scoring, SHAP explainability, and personalized Bangla nudges.',
    desc_bn: '৬-ধাপ বোনাস ফানেলে গ্রাহকের ড্রপ-অফ পূর্বাভাস। XGBoost মডেল, SHAP বিশ্লেষণ এবং ব্যক্তিগতকৃত বাংলা নাজ।',
    stats_en: ['AUC 0.766', '50K Users', '6 Funnel Steps'],
    stats_bn: ['AUC ০.৭৬৬', '৫০K গ্রাহক', '৬ ধাপ ফানেল'],
  },
  {
    id: 'dps-coach',
    href: '/dps-coach',
    icon: PiggyBank,
    color: '#059669',
    glow: 'rgba(5, 150, 105, 0.22)',
    bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    tag_en: 'Savings AI',
    tag_bn: 'সঞ্চয় এআই',
    title_en: 'DPS Savings Coach',
    title_bn: 'ডিপিএস সঞ্চয় কোচ',
    desc_en: 'Analyze monthly cash-flow surplus to generate personalized DPS savings plans. Empower users to build wealth via UCB deposit schemes.',
    desc_bn: 'মাসিক উদ্বৃত্ত ক্যাশ বিশ্লেষণ করে মানানসই ডিপিএস সঞ্চয় পরিকল্পনা। UCB আমানত স্কিমের মাধ্যমে আর্থিক সুরক্ষা।',
    stats_en: ['R² 0.999', 'MAE ৳279', '5 Tenure Schemes'],
    stats_bn: ['R² ০.৯৯৯', 'MAE ৳২৭৯', '৫ মেয়াদি স্কিম'],
  },
  {
    id: 'liquidity',
    href: '/liquidity',
    icon: Landmark,
    color: '#d97706',
    glow: 'rgba(217, 119, 6, 0.22)',
    bg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    tag_en: 'Liquidity AI',
    tag_bn: 'তারল্য এআই',
    title_en: 'Agent Liquidity Forecast',
    title_bn: 'এজেন্ট তারল্য পূর্বাভাস',
    desc_en: 'Forecast daily cash-out volume across 500 agent points to prevent stockouts. 7-day demand projections with salary surge detection.',
    desc_bn: '৫০০ এজেন্ট পয়েন্টে নগদ উত্তোলনের চাহিদা পূর্বাভাস। বেতন দিবসের চাপ শনাক্তকরণ সহ ৭-দিনের প্রোজেকশন।',
    stats_en: ['R² 0.673', '500 Agents', '7-Day Horizon'],
    stats_bn: ['R² ০.৬৭৩', '৫০০ এজেন্ট', '৭ দিন মেয়াদ'],
  },
];

export default function HubPage() {
  const { lang } = useLanguage();

  return (
    <div className="hub-container animate-fade-in">
      {/* Subtle Background Glow Orbs */}
      <div className="hub-glow-bg" aria-hidden="true">
        <div style={{
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          width: '340px',
          height: '340px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.10) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.11) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* Centered Hero Header */}
      <div className="hub-hero">
        <h1 className="hub-title">
          {lang === 'bn' ? (
            <>উপায় <span style={{ color: 'var(--upay-blue)' }}>AI</span></>
          ) : (
            <>Upay <span style={{ color: 'var(--upay-blue)' }}>AI</span></>
          )}
        </h1>

        <p className="hub-subtitle">
          {lang === 'bn'
            ? 'মোবাইল ফাইন্যান্সিয়াল সার্ভিসে গ্রাহক বৃদ্ধি, ডিপিএস সঞ্চয় ও এজেন্ট তারল্য ব্যবস্থাপনার সমন্বিত এআই প্ল্যাটফর্ম।'
            : 'AI-powered intelligence platform for user activation, personalized DPS savings, and agent network liquidity.'}
        </p>
      </div>

      {/* Centered Tool Cards Grid */}
      <div className="hub-grid">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const title = lang === 'bn' ? tool.title_bn : tool.title_en;
          const desc = lang === 'bn' ? tool.desc_bn : tool.desc_en;
          const tag = lang === 'bn' ? tool.tag_bn : tool.tag_en;
          const stats = lang === 'bn' ? tool.stats_bn : tool.stats_en;

          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="hub-card"
              style={{
                ['--card-glow' as any]: tool.glow,
              }}
            >
              {/* Centered Icon Container */}
              <div
                className="hub-card-icon"
                style={{
                  background: tool.bg,
                  boxShadow: `0 8px 22px ${tool.color}35`,
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                }}
              >
                <Icon size={28} style={{ color: '#ffffff' }} />
              </div>

              {/* Centered Tag */}
              <div
                className="hub-card-tag"
                style={{
                  background: `${tool.color}14`,
                  color: tool.color,
                  border: `1px solid ${tool.color}25`,
                }}
              >
                {tag}
              </div>

              {/* Centered Title */}
              <h2 className="hub-card-title">{title}</h2>

              {/* Centered Description */}
              <p className="hub-card-desc">{desc}</p>

              {/* Centered Stats Badges */}
              <div className="hub-card-stats">
                {stats.map((s, i) => (
                  <span
                    key={i}
                    className="hub-card-pill"
                    style={{
                      background: `${tool.color}10`,
                      color: tool.color,
                      border: `1px solid ${tool.color}20`,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Centered CTA Button */}
              <div
                className="hub-card-btn"
                style={{
                  background: tool.bg,
                  boxShadow: `0 4px 14px ${tool.color}35`,
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

'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../lib/LanguageContext';
import { motion } from 'framer-motion';
import { Target, PiggyBank, Landmark, Zap, Users, Brain, ArrowRight } from 'lucide-react';

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
  track_en: string;
  track_bn: string;
}

const TOOLS: ToolItem[] = [
  {
    id: 'activation',
    href: '/activation',
    icon: Target,
    color: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.25)',
    bg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    tag_en: 'Campaign AI',
    tag_bn: 'ক্যাম্পেইন এআই',
    title_en: 'Activation Predictor',
    title_bn: 'অ্যাক্টিভেশন প্রেডিক্টর',
    desc_en: 'Predict drop-off across the 6-stage bonus funnel with XGBoost, SHAP explainability, and personalized Bangla nudges.',
    desc_bn: '৬-ধাপ বোনাস ফানেলে ড্রপ-অফ পূর্বাভাস। XGBoost মডেল, SHAP বিশ্লেষণ ও বাংলা নাজ।',
    stats_en: ['AUC 0.766', '50K Users', '6 Steps'],
    stats_bn: ['AUC ০.৭৬৬', '৫০K গ্রাহক', '৬ ধাপ'],
    track_en: 'Track 04',
    track_bn: 'ট্র্যাক ০৪',
  },
  {
    id: 'dps-coach',
    href: '/dps-coach',
    icon: PiggyBank,
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.25)',
    bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    tag_en: 'Savings AI',
    tag_bn: 'সঞ্চয় এআই',
    title_en: 'DPS Savings Coach',
    title_bn: 'ডিপিএস সঞ্চয় কোচ',
    desc_en: 'Analyze cash-flow surplus to generate personalized DPS savings plans. Build wealth via UCB deposit schemes.',
    desc_bn: 'মাসিক উদ্বৃত্ত বিশ্লেষণ করে ডিপিএস সঞ্চয় পরিকল্পনা। UCB আমানত স্কিমে সঞ্চয়।',
    stats_en: ['R² 0.999', 'MAE ৳279', '5 Tenures'],
    stats_bn: ['R² ০.৯৯৯', 'MAE ৳২৭৯', '৫ মেয়াদি'],
    track_en: 'Track 03',
    track_bn: 'ট্র্যাক ০৩',
  },
  {
    id: 'liquidity',
    href: '/liquidity',
    icon: Landmark,
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.25)',
    bg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    tag_en: 'Liquidity AI',
    tag_bn: 'তারল্য এআই',
    title_en: 'Agent Liquidity Forecast',
    title_bn: 'এজেন্ট তারল্য পূর্বাভাস',
    desc_en: 'Forecast cash-out volume across 500 agent points. 7-day demand projections with salary surge detection.',
    desc_bn: '৫০০ এজেন্ট পয়েন্টে নগদ উত্তোলনের চাহিদা পূর্বাভাস। বেতন দিবসের সার্জ শনাক্তকরণ।',
    stats_en: ['R² 0.673', '500 Agents', '7-Day'],
    stats_bn: ['R² ০.৬৭৩', '৫০০ এজেন্ট', '৭ দিন'],
    track_en: 'Track 05',
    track_bn: 'ট্র্যাক ০৫',
  },
];

const containerVariants: any = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
};

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  }),
};

export default function HubPage() {
  const { lang } = useLanguage();

  return (
    <div className="hub-container" style={{ minHeight: 'calc(85vh - 60px)' }}>
      {/* Animated Mesh Background */}
      <div className="hub-hero-mesh" aria-hidden="true">
        <div className="mesh-orb mesh-orb-blue" />
        <div className="mesh-orb mesh-orb-green" />
        <div className="mesh-orb mesh-orb-gold" />
      </div>

      {/* Hero Header */}
      <div className="hub-hero" style={{ position: 'relative', zIndex: 1 }}>
        {/* Platform badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="hub-badge"
        >
          <span className="pulse-dot" />
          <span>{lang === 'bn' ? 'মাল্টি-টুল এআই ইন্টেলিজেন্স প্ল্যাটফর্ম' : 'Multi-Tool AI Intelligence Platform'}</span>
        </motion.div>

        {/* Animated Title */}
        <motion.h1
          custom={0.1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="hub-display-title"
        >
          {lang === 'bn' ? (
            <>উপায় <span className="gradient-shimmer-text">AI</span></>
          ) : (
            <>Upay <span className="gradient-shimmer-text">AI</span></>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          custom={0.2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="hub-subtitle"
          style={{ maxWidth: '640px' }}
        >
          {lang === 'bn'
            ? 'মোবাইল ফাইন্যান্সিয়াল সার্ভিসে গ্রাহক বৃদ্ধি, ডিপিএস সঞ্চয় ও এজেন্ট তারল্য ব্যবস্থাপনার সমন্বিত এআই প্ল্যাটফর্ম।'
            : 'AI-powered intelligence platform unifying user activation, personalized DPS savings, and agent network liquidity.'}
        </motion.p>

        {/* Live Status Strip */}
        <motion.div
          custom={0.3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="live-status-bar"
        >
          <div className="live-status-item">
            <span className="pulse-dot pulse-dot-blue" />
            <span>{lang === 'bn' ? '৩ এআই মডেল সক্রিয়' : '3 AI Models Active'}</span>
          </div>
          <div className="live-status-item">
            <span className="pulse-dot" />
            <span>{lang === 'bn' ? '৫০,০০০ গ্রাহক বিশ্লেষিত' : '50K Users Analyzed'}</span>
          </div>
          <div className="live-status-item">
            <span className="pulse-dot pulse-dot-gold" />
            <span>{lang === 'bn' ? 'রিয়েল-টাইম প্রেডিকশন' : 'Real-time Predictions'}</span>
          </div>
        </motion.div>
      </div>

      {/* Tool Cards Grid */}
      <motion.div
        className="hub-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {TOOLS.map((tool, index) => {
          const Icon = tool.icon;
          const title = lang === 'bn' ? tool.title_bn : tool.title_en;
          const desc = lang === 'bn' ? tool.desc_bn : tool.desc_en;
          const tag = lang === 'bn' ? tool.tag_bn : tool.tag_en;
          const stats = lang === 'bn' ? tool.stats_bn : tool.stats_en;
          const track = lang === 'bn' ? tool.track_bn : tool.track_en;

          return (
            <motion.div key={tool.id} variants={cardVariants}>
              <Link
                href={tool.href}
                className="hub-card"
                style={{
                  ['--card-glow' as any]: tool.glow,
                }}
              >
                {/* Track label */}
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  right: '16px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  {track}
                </div>

                {/* Icon */}
                <div
                  className="hub-card-icon"
                  style={{
                    background: tool.bg,
                    boxShadow: `0 8px 24px ${tool.color}40`,
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                  }}
                >
                  <Icon size={26} style={{ color: '#ffffff' }} />
                </div>

                {/* Tag */}
                <div
                  className="hub-card-tag"
                  style={{
                    background: `${tool.color}18`,
                    color: tool.color,
                    border: `1px solid ${tool.color}30`,
                  }}
                >
                  {tag}
                </div>

                {/* Title */}
                <h2 className="hub-card-title">{title}</h2>

                {/* Description */}
                <p className="hub-card-desc">{desc}</p>

                {/* Stats Badges */}
                <div className="hub-card-stats">
                  {stats.map((s, i) => (
                    <span
                      key={i}
                      className="hub-card-pill"
                      style={{
                        background: `${tool.color}12`,
                        color: tool.color,
                        border: `1px solid ${tool.color}25`,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* CTA Button */}
                <div
                  className="hub-card-btn"
                  style={{
                    background: tool.bg,
                    boxShadow: `0 4px 16px ${tool.color}40`,
                  }}
                >
                  {lang === 'bn' ? 'টুল খুলুন' : 'Open Tool'}
                  <ArrowRight size={15} style={{ marginLeft: '4px' }} />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Synergy Footer Strip */}
      <motion.div
        custom={0.6}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="live-status-bar"
        style={{ marginTop: '8px' }}
      >
        <div className="live-status-item">
          <Zap size={13} style={{ color: '#F59E0B' }} />
          <span>{lang === 'bn' ? 'সমন্বিত ট্রায়াড ইঞ্জিন' : 'Synergistic Triad Engine'}</span>
        </div>
        <div className="live-status-item">
          <Brain size={13} style={{ color: '#8B5CF6' }} />
          <span>{lang === 'bn' ? 'XGBoost + SHAP + Gemini LLM' : 'XGBoost + SHAP + Gemini LLM'}</span>
        </div>
        <div className="live-status-item">
          <Users size={13} style={{ color: '#3B82F6' }} />
          <span>{lang === 'bn' ? '৩ ট্র্যাক × ১ প্ল্যাটফর্ম' : '3 Tracks × 1 Platform'}</span>
        </div>
      </motion.div>
    </div>
  );
}

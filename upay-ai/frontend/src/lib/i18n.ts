export type Language = 'en' | 'bn';

export const translations: Record<string, Record<Language, string>> = {
  // Brand & Header
  'brand.name': { en: 'Upay AI', bn: 'উপায় AI' },
  'brand.slogan': { en: 'Activation & Savings Intelligence Platform', bn: 'অ্যাক্টিভেশন ও সঞ্চয় ইন্টেলিজেন্স প্ল্যাটফর্ম' },
  'nav.dashboard': { en: 'Overview Funnel', bn: 'ওভারভিউ ফানেল' },
  'nav.at_risk': { en: 'At-Risk Users', bn: 'ঝুঁকিপূর্ণ গ্রাহক' },
  'nav.savings': { en: 'SanchayBot Coach', bn: 'সঞ্চয়বট কোচ' },
  'nav.performance': { en: 'Model & Fairness', bn: 'মডেল ও ন্যায্যতা' },

  // Banner
  'banner.synthetic': {
    en: 'Evaluation Mode: Platform running on simulated MFS cohort (50,000 accounts) with live ML inference.',
    bn: 'মূল্যায়ন মোড: লাইভ এমএল ইনফারেন্স সহ সিমুলেটেড এমএফএস ডেটাসেটে (৫০,০০০ অ্যাকাউন্ট) প্ল্যাটফর্মটি পরিচালিত হচ্ছে।',
  },

  // KPI Cards
  'kpi.total_users': { en: 'Monitored Users', bn: 'পর্যবেক্ষণকৃত গ্রাহক' },
  'kpi.overall_completion': { en: 'Full Activation Rate', bn: 'সম্পূর্ণ সক্রিয়তার হার' },
  'kpi.at_risk_users': { en: 'Identified At-Risk', bn: 'চিহ্নিত ঝুঁকিপূর্ণ' },
  'kpi.model_auc': { en: 'Model Accuracy (AUC)', bn: 'মডেলের সঠিকতা (AUC)' },

  // Funnel
  'funnel.title': { en: 'Activation Milestone Funnel', bn: 'অ্যাক্টিভেশন মাইলস্টোন ফানেল' },
  'funnel.subtitle': { en: 'Drop-off monitoring across 6 key lifecycle milestones', bn: '৬টি মূল লাইফসাইকেল মাইলস্টোনে ড্রপ-অফ ট্র্যাকিং' },

  // Table
  'table.title': { en: 'Users Requiring Interventions', bn: 'হস্তক্ষেপ প্রয়োজন এমন গ্রাহকগণ' },
  'table.user_id': { en: 'User ID', bn: 'গ্রাহক আইডি' },
  'table.drop_off': { en: 'Predicted Drop-off', bn: 'ঝুঁকির মাইলস্টোন' },
  'table.risk_score': { en: 'Drop-off Probability', bn: 'ড্রপ-অফের সম্ভাবনা' },
  'table.status': { en: 'Eligibility', bn: 'যোগ্যতা' },
  'table.action': { en: 'Action', bn: 'পদক্ষেপ' },
  'table.view_detail': { en: 'Analyze & Nudge', bn: 'বিশ্লেষণ ও নাজ' },
  'table.filter_all': { en: 'All Milestones', bn: 'সকল মাইলস্টোন' },

  // User detail
  'user.title': { en: 'User Risk Analysis & Action Center', bn: 'গ্রাহক ঝুঁকি বিশ্লেষণ ও অ্যাকশন সেন্টার' },
  'user.primary_risk': { en: 'Primary Drop-off Risk', bn: 'প্রধান ড্রপ-অফ ঝুঁকি' },
  'user.risk_level': { en: 'Drop-off Likelihood', bn: 'ঝুঁকির সম্ভাবনা' },
  'user.shap_title': { en: 'SHAP Explainability Waterfall', bn: 'SHAP ব্যাখ্যাযোগ্যতা ওয়াটারফল' },
  'user.shap_subtitle': { en: 'Feature contributions driving the model prediction', bn: 'মডেলের পূর্বাভাসের পেছনের মূল কারণ ও প্রভাব' },
  'user.increases_risk': { en: 'Increases Risk (Negative)', bn: 'ঝুঁকি বৃদ্ধি করে (নেগেটিভ)' },
  'user.decreases_risk': { en: 'Reduces Risk (Positive)', bn: 'ঝুঁকি কমায় (পজিটিভ)' },

  // Nudge
  'nudge.title': { en: 'Hyper-Personalized Bangla Nudge', bn: 'ব্যক্তিগতকৃত বাংলা নাজ বার্তা' },
  'nudge.channel': { en: 'Recommended Channel', bn: 'প্রস্তাবিত মাধ্যম' },
  'nudge.bonus': { en: 'Guaranteed Incentive', bn: 'নির্ধারিত বোনাস' },
  'nudge.guardrail': { en: 'Guardrails & Safety', bn: 'নিরাপত্তা ও গার্ডরেইল' },
  'nudge.approve': { en: 'Approve & Dispatch', bn: 'অনুমোদন ও প্রেরণ' },
  'nudge.reject': { en: 'Reject Intervention', bn: 'প্রত্যাখ্যান করুন' },
  'nudge.approved_success': { en: 'Nudge successfully approved and logged to audit trail!', bn: 'নাজ বার্তা অনুমোদিত এবং অডিট ট্রেইলে সংরক্ষিত!' },

  // SanchayBot
  'sanchay.title': { en: 'SanchayBot — Intelligent Savings Coach', bn: 'সঞ্চয়বট — স্মার্ট সঞ্চয় পরামর্শক' },
  'sanchay.subtitle': { en: 'Cash-flow surplus analysis & personalized DPS recommendation', bn: 'ক্যাশ-ফ্লো উদ্বৃত্ত বিশ্লেষণ ও ব্যক্তিগত ডিপিএস সুপারিশ' },
  'sanchay.income': { en: 'Monthly Income', bn: 'মাসিক আয়' },
  'sanchay.expenses': { en: 'Monthly Expenses', bn: 'মাসিক খরচ' },
  'sanchay.surplus': { en: 'Available Surplus', bn: 'মাসিক উদ্বৃত্ত' },
  'sanchay.cashout_ratio': { en: 'Cash-out Ratio', bn: 'ক্যাশ আউট অনুপাত' },
  'sanchay.recommended_dps': { en: 'Recommended DPS Plan', bn: 'প্রস্তাবিত ডিপিএস স্কিম' },
  'sanchay.per_month': { en: '/ month', bn: '/ প্রতি মাসে' },
  'sanchay.maturity_value': { en: 'Estimated Maturity Amount', bn: 'মেয়াদান্তে আনুমানিক প্রাপ্তি' },
  'sanchay.free_cashout': { en: 'Zero Cash-Out Fee at UCB ATMs', bn: 'UCB এটিএম-এ সম্পূর্ণ ফ্রি ক্যাশ আউট' },

  // Milestones
  'm.M1': { en: 'PIN Setup', bn: 'পিন সেটআপ' },
  'm.M2': { en: 'First Mobile Recharge', bn: 'প্রথম রিচার্জ' },
  'm.M3': { en: 'Cash-In / Add Money', bn: 'ক্যাশ-ইন / অ্যাড মানি' },
  'm.M4': { en: 'Merchant QR Payment', bn: 'মার্চেন্ট QR পেমেন্ট' },
  'm.M5': { en: 'Open DPS Account', bn: 'ডিপিএস খোলা' },
  'm.M6': { en: 'Full Lifecycle Complete', bn: 'সব ধাপ সম্পন্ন' },
};

export function t(key: string, lang: Language = 'en'): string {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return key;
}

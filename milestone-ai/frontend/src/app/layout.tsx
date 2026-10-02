'use client';

import React from 'react';
import './globals.css';
import { Header } from '../components/Header';
import { SyntheticBanner } from '../components/SyntheticBanner';
import { LanguageProvider, useLanguage } from '../lib/LanguageContext';

function AppShell({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useLanguage();

  return (
    <>
      <SyntheticBanner lang={lang} />
      <Header lang={lang} onLanguageToggle={setLang} />
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '28px 24px 48px',
      }}>
        {children}
      </main>
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>upay MilestoneAI + SanchayBot</title>
        <meta
          name="description"
          content="Hybrid Activation & Savings Intelligence Platform for upay mobile financial services"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/upay-logo.webp" type="image/webp" />
      </head>
      <body>
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}

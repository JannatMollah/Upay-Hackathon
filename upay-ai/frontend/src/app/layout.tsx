'use client';

import React from 'react';
import './globals.css';
import { Header } from '../components/Header';
import { LanguageProvider, useLanguage } from '../lib/LanguageContext';
import { ThemeProvider } from '../lib/ThemeContext';
import { ToastProvider } from '../components/Toast';

function AppShell({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useLanguage();

  return (
    <>
      <Header lang={lang} onLanguageToggle={setLang} />
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '20px 24px 48px',
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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <title>Upay AI — Multi-Tool AI Intelligence Platform</title>
        <meta
          name="description"
          content="AI-powered intelligence platform for MFS user activation, personalized DPS savings, and agent network liquidity forecasting."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/upay-logo.webp" type="image/webp" />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

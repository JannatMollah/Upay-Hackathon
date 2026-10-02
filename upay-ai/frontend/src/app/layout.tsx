'use client';

import React from 'react';
import './globals.css';
import { Header } from '../components/Header';
import { LanguageProvider, useLanguage } from '../lib/LanguageContext';

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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Upay AI</title>
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

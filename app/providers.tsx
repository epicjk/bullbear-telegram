'use client';

import { ReactNode, useEffect, useState } from 'react';
import { TelegramProvider } from '@/contexts/TelegramContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { BalanceProvider } from '@/contexts/BalanceContext';
import { TonConnectProvider } from '@/contexts/TonConnectContext';
import { LanguageProvider } from '@/lib/i18n';
import { LegalProvider } from '@/contexts/LegalContext';
import { AgeConsentModal } from '@/components/legal';

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Buffer polyfill for TON libraries
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Buffer) {
      import('buffer').then(({ Buffer }) => {
        window.Buffer = Buffer;
      });
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <TelegramProvider>
      <TonConnectProvider>
        <AuthProvider>
          <BalanceProvider>
            <LanguageProvider>
              <LegalProvider>
                <AgeConsentModal />
                {children}
              </LegalProvider>
            </LanguageProvider>
          </BalanceProvider>
        </AuthProvider>
      </TonConnectProvider>
    </TelegramProvider>
  );
}

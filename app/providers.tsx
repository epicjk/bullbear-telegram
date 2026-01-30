'use client';

import { ReactNode } from 'react';
import { TelegramProvider } from '@/contexts/TelegramContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { BalanceProvider } from '@/contexts/BalanceContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TelegramProvider>
      <AuthProvider>
        <BalanceProvider>
          {children}
        </BalanceProvider>
      </AuthProvider>
    </TelegramProvider>
  );
}

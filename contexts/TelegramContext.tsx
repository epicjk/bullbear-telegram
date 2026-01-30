'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initTelegramApp, isTelegramWebApp, getTelegramUser, getInitDataRaw } from '../lib/telegram';

interface TelegramUser {
  id?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  languageCode?: string;
}

interface TelegramContextType {
  isReady: boolean;
  isTelegram: boolean;
  user: TelegramUser | null;
  initDataRaw: string | null;
}

const TelegramContext = createContext<TelegramContextType>({
  isReady: false,
  isTelegram: false,
  user: null,
  initDataRaw: null,
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initDataRaw, setInitDataRaw] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const inTelegram = isTelegramWebApp();
      setIsTelegram(inTelegram);

      if (inTelegram) {
        const success = await initTelegramApp();
        if (success) {
          setUser(getTelegramUser());
          setInitDataRaw(getInitDataRaw());
        }
      }

      setIsReady(true);
    };

    init();
  }, []);

  return (
    <TelegramContext.Provider value={{ isReady, isTelegram, user, initDataRaw }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  return useContext(TelegramContext);
}

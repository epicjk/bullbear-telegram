'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isTelegramWebApp, getTelegramUser } from '@/lib/telegram';

interface User {
  id: number;
  name: string;
  username?: string;
  photoUrl?: string;
}

interface AuthContextType {
  isLoading: boolean;
  isConnected: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isConnected: false,
  user: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      // 텔레그램 환경 체크
      if (isTelegramWebApp()) {
        const tgUser = getTelegramUser();
        if (tgUser?.id) {
          setUser({
            id: tgUser.id,
            name: [tgUser.firstName, tgUser.lastName].filter(Boolean).join(' ') || 'Player',
            username: tgUser.username,
            photoUrl: tgUser.photoUrl,
          });
          setIsConnected(true);
        }
      } else {
        // 데모 모드 (비텔레그램 환경)
        setUser({
          id: Date.now(),
          name: 'Demo Player',
        });
        setIsConnected(true);
      }
      setIsLoading(false);
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoading, isConnected, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

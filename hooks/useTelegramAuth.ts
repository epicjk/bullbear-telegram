// 텔레그램 WebApp 자동 인증 훅
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getInitDataRaw } from '@/lib/telegram';

interface UseTelegramAuthReturn {
  isReady: boolean;
  isAuthenticated: boolean;
  error: string | null;
  user: ReturnType<typeof useAuth>['user'];
}

export function useTelegramAuth(): UseTelegramAuthReturn {
  const { user, isLoading, isAuthenticated, login, error } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 이미 인증됐으면 스킵
    if (isAuthenticated) {
      setIsReady(true);
      return;
    }

    // 로딩 중이면 대기
    if (isLoading) {
      return;
    }

    // 텔레그램 WebApp initData 가져오기
    const initData = getInitDataRaw();

    if (initData) {
      // initData가 있으면 자동 로그인 시도
      login(initData).then((success) => {
        if (!success) {
          setAuthError('Telegram authentication failed');
        }
        setIsReady(true);
      });
    } else {
      // 텔레그램 환경이 아님
      setAuthError('Not running in Telegram');
      setIsReady(true);
    }
  }, [isAuthenticated, isLoading, login]);

  return {
    isReady,
    isAuthenticated,
    error: authError || error,
    user,
  };
}

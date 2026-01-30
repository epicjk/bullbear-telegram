'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBalance } from '@/contexts/BalanceContext';
import { useTelegram } from '@/contexts/TelegramContext';
import { BullBearGame } from '@/components/bullvsbear';
import { showBackButton, closeApp } from '@/lib/telegram';

export default function HomePage() {
  const { isLoading, isConnected } = useAuth();
  const { balance } = useBalance();
  const { isTelegram } = useTelegram();

  // 텔레그램 백버튼 설정
  useEffect(() => {
    if (isTelegram) {
      showBackButton(closeApp);
    }
  }, [isTelegram]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0b15] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0f0b15] flex items-center justify-center">
        <div className="text-white text-xl">Connecting...</div>
      </div>
    );
  }

  return <BullBearGame balance={balance} />;
}

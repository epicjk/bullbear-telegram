'use client';

import { ReactNode, createContext, useContext } from 'react';
import { TonConnectUIProvider, THEME } from '@tonconnect/ui-react';

// 텔레그램 미니앱에서는 상대 경로 사용
const manifestUrl = typeof window !== 'undefined' 
  ? `${window.location.origin}/tonconnect-manifest.json`
  : 'https://bullbear-telegram.vercel.app/tonconnect-manifest.json';

interface TonConnectProviderProps {
  children: ReactNode;
}

export function TonConnectProvider({ children }: TonConnectProviderProps) {
  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/BullBearGameBot/app',
      }}
      uiPreferences={{
        theme: THEME.DARK,
      }}
      walletsListConfiguration={{
        includeWallets: [
          {
            appName: 'tonkeeper',
            name: 'Tonkeeper',
            imageUrl: 'https://tonkeeper.com/assets/tonkeeper-logo.png',
            aboutUrl: 'https://tonkeeper.com',
            bridgeUrl: 'https://bridge.tonapi.io/bridge',
            platforms: ['ios', 'android', 'chrome', 'firefox', 'safari'],
            universalLink: 'https://app.tonkeeper.com/ton-connect',
          },
          {
            appName: 'mytonwallet',
            name: 'MyTonWallet',
            imageUrl: 'https://mytonwallet.io/icon-256.png',
            aboutUrl: 'https://mytonwallet.io',
            bridgeUrl: 'https://tonconnectbridge.mytonwallet.org/bridge/',
            platforms: ['ios', 'android', 'chrome', 'windows', 'macos', 'linux'],
            universalLink: 'https://connect.mytonwallet.org',
          },
        ],
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
}

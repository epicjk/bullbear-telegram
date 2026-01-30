'use client';

// Telegram WebApp 타입 정의
interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
      language_code?: string;
    };
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Telegram WebApp 초기화 상태
let isInitialized = false;

/**
 * Telegram WebApp 인스턴스 가져오기
 */
function getWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp || null;
}

/**
 * Telegram Mini App 초기화
 */
export async function initTelegramApp(): Promise<boolean> {
  if (isInitialized) return true;
  
  const webApp = getWebApp();
  if (!webApp) {
    console.warn('[Telegram] Not running in Telegram WebApp');
    return false;
  }

  try {
    // Ready 호출
    webApp.ready();
    
    // 전체 화면 확장
    webApp.expand();
    
    // 테마 색상 설정
    try {
      webApp.setHeaderColor('#0f0b15');
      webApp.setBackgroundColor('#0f0b15');
    } catch {}

    isInitialized = true;
    console.log('[Telegram] Mini App initialized');
    return true;
  } catch (error) {
    console.warn('[Telegram] Init error:', error);
    return false;
  }
}

/**
 * 텔레그램 환경인지 확인
 */
export function isTelegramWebApp(): boolean {
  return !!getWebApp();
}

/**
 * 텔레그램 유저 정보 가져오기
 */
export function getTelegramUser() {
  const webApp = getWebApp();
  const user = webApp?.initDataUnsafe?.user;
  if (!user) return null;
  
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    photoUrl: user.photo_url,
    languageCode: user.language_code,
  };
}

/**
 * initData 원본 가져오기 (서버 검증용)
 */
export function getInitDataRaw(): string | null {
  return getWebApp()?.initData || null;
}

/**
 * 백버튼 표시
 */
export function showBackButton(onClick: () => void) {
  const webApp = getWebApp();
  if (!webApp) return;
  
  try {
    webApp.BackButton.show();
    webApp.BackButton.onClick(onClick);
  } catch {}
}

/**
 * 백버튼 숨김
 */
export function hideBackButton() {
  const webApp = getWebApp();
  if (!webApp) return;
  
  try {
    webApp.BackButton.hide();
  } catch {}
}

/**
 * Haptic Feedback - 충격
 */
export function hapticImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
  try {
    getWebApp()?.HapticFeedback?.impactOccurred(style);
  } catch {}
}

/**
 * Haptic Feedback - 알림
 */
export function hapticNotification(type: 'error' | 'success' | 'warning') {
  try {
    getWebApp()?.HapticFeedback?.notificationOccurred(type);
  } catch {}
}

/**
 * Haptic Feedback - 선택
 */
export function hapticSelection() {
  try {
    getWebApp()?.HapticFeedback?.selectionChanged();
  } catch {}
}

/**
 * 앱 닫기
 */
export function closeApp() {
  try {
    getWebApp()?.close();
  } catch {}
}

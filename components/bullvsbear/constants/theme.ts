// 게임 전역 테마 상수
export const COLORS = {
  // 메인 게임 색상
  bull: '#22c55e',
  bullDark: '#16a34a',
  bullLight: '#4ade80',
  bear: '#ef4444',
  bearDark: '#dc2626',
  bearLight: '#f87171',
  tie: '#fbbf24',
  tieDark: '#f59e0b',

  // UI 색상
  primary: '#a855f7',
  primaryDark: '#9333ea',
  secondary: '#00ccff',

  // 배경 색상
  bgDarkest: '#0a0a0f',
  bgDark: '#12121a',
  bgCard: '#1a1a2e',
  bgCardLight: '#1f1f35',

  // Binance
  binance: '#f3ba2f',
  bitcoin: '#f7931a',

  // 텍스트 색상
  textWhite: '#ffffff',
  textMuted: '#9ca3af',
  textMutedLight: '#6b7280',
} as const;

// 그라디언트 정의
export const GRADIENTS = {
  bull: 'linear-gradient(145deg, #14532d, #166534, #22c55e)',
  bullHover: 'linear-gradient(145deg, #166534, #22c55e, #4ade80)',
  bear: 'linear-gradient(145deg, #7f1d1d, #991b1b, #ef4444)',
  bearHover: 'linear-gradient(145deg, #991b1b, #ef4444, #f87171)',
  primary: 'linear-gradient(135deg, #a855f7, #ec4899)',
  bitcoin: 'linear-gradient(135deg, #f7931a, #ffab40)',
  dark: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
} as const;

// Tailwind 클래스 조합
export const TAILWIND_CLASSES = {
  // 버튼 그라디언트
  bullButton: 'bg-gradient-to-br from-[#22c55e] to-[#16a34a]',
  bearButton: 'bg-gradient-to-br from-[#ef4444] to-[#dc2626]',
  primaryButton: 'bg-gradient-to-r from-[#a855f7] to-[#ec4899]',

  // 텍스트 색상
  bullText: 'text-[#22c55e]',
  bearText: 'text-[#ef4444]',
  tieText: 'text-[#fbbf24]',

  // 배경
  cardBg: 'bg-[#12121a]',
  darkBg: 'bg-[#0a0a0f]',

  // 보더
  cardBorder: 'border-white/10',
  bullBorder: 'border-[#22c55e]',
  bearBorder: 'border-[#ef4444]',
} as const;

// 박스 섀도우
export const SHADOWS = {
  bull: '0 0 20px rgba(34, 197, 94, 0.3)',
  bullGlow: '0 0 40px rgba(34, 197, 94, 0.5)',
  bear: '0 0 20px rgba(239, 68, 68, 0.3)',
  bearGlow: '0 0 40px rgba(239, 68, 68, 0.5)',
  primary: '0 0 20px rgba(168, 85, 247, 0.3)',
  card: '0 8px 32px rgba(0, 0, 0, 0.3)',
} as const;

// 애니메이션 duration
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const;

// 게임 설정 상수
export const GAME_CONFIG = {
  // 라운드 타이밍 (초)
  bettingDuration: 25,
  countdownDuration: 5,
  gameDuration: 30,
  roundDuration: 60,

  // 베팅 한도
  minBet: 1,
  maxBet: 10000,
  defaultBalance: 10000,

  // 배당률
  winMultiplier: 1.95,

  // 히스토리
  maxHistoryItems: 80,
  roadmapColumns: 35,
  roadmapRows: 6,

  // DOT 크기
  dotSize: 29,
  tieDotSize: 13,
} as const;

// 다크/라이트 모드 테마
export const getThemeColors = (isDarkMode: boolean) => ({
  bg: isDarkMode ? COLORS.bgDarkest : '#f8fafc',
  card: isDarkMode ? COLORS.bgDark : '#ffffff',
  cardBorder: isDarkMode ? 'border-white/10' : 'border-gray-200',
  text: isDarkMode ? COLORS.textWhite : '#1a1a2e',
  textMuted: isDarkMode ? COLORS.textMuted : '#64748b',
});

export type ThemeColors = ReturnType<typeof getThemeColors>;

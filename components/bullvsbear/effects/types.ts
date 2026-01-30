// 이펙트 타입 정의
export type EffectType = 'glowPulse' | 'waveSweep' | 'radialShockwave' | 'confetti' | 'countUp' | 'heartbeat';

export interface EffectSettings {
  glowPulse: boolean;
  waveSweep: boolean;
  radialShockwave: boolean;
  confetti: boolean;
  countUp: boolean;
  heartbeat: boolean;
}

export const DEFAULT_EFFECT_SETTINGS: EffectSettings = {
  glowPulse: false,
  waveSweep: false,
  radialShockwave: false,
  confetti: true, // 승리 시 폭죽 효과 - 기본 활성화
  countUp: true, // 잔액 카운팅 애니메이션 - 항상 활성화 (설정 숨김)
  heartbeat: true, // 기본 활성화
};

export const EFFECT_LABELS: Record<EffectType, { ko: string; en: string; icon: string; description: { ko: string; en: string } }> = {
  glowPulse: {
    ko: 'Glow Pulse',
    en: 'Glow Pulse',
    icon: '✨',
    description: { ko: '배경 오라 효과', en: 'Background aura effect' },
  },
  waveSweep: {
    ko: 'Wave Sweep',
    en: 'Wave Sweep',
    icon: '🌊',
    description: { ko: '그린 라인 스윕', en: 'Green line sweep' },
  },
  radialShockwave: {
    ko: 'Radial Shockwave',
    en: 'Radial Shockwave',
    icon: '💫',
    description: { ko: '원형 충격파', en: 'Circular shockwave' },
  },
  confetti: {
    ko: 'Confetti',
    en: 'Confetti',
    icon: '🎉',
    description: { ko: '폭죽 효과', en: 'Confetti effect' },
  },
  countUp: {
    ko: 'Number Count-Up',
    en: 'Number Count-Up',
    icon: '🔢',
    description: { ko: '숫자 카운트업', en: 'Number count animation' },
  },
  heartbeat: {
    ko: '심장박동',
    en: 'Heartbeat',
    icon: '💓',
    description: { ko: '마지막 5초 긴장감 효과', en: 'Final 5 seconds tension effect' },
  },
};

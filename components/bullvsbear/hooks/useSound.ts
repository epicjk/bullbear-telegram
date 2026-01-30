'use client';

import { useCallback, useRef } from 'react';

// ============================================================
// Sound System - Web Audio API
// ============================================================

// 음표 주파수 정의
const NOTES: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
  A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
  F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50
};

// 사운드 타입 정의
export type SoundType = 'placeBet' | 'cancelBet' | 'countdown' | 'bullWin' | 'bearWin' | 'lose' | 'click';

interface UseSoundOptions {
  enabled?: boolean;
  volume?: number;
}

interface UseSoundReturn {
  playSound: (type: SoundType, param?: number) => void;
  initAudio: () => void;
  isInitialized: boolean;
}

export function useSound(options: UseSoundOptions = {}): UseSoundReturn {
  const { enabled = true, volume = 0.7 } = options;
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playNote = useCallback((
    freq: number,
    duration: number,
    delay = 0,
    type: OscillatorType = 'square',
    noteVolume = 0.15,
    masterVolume = 0.7
  ) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    const adjustedVolume = noteVolume * masterVolume;
    gain.gain.setValueAtTime(adjustedVolume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }, []);

  const playSound = useCallback((type: SoundType, param?: number) => {
    if (!enabled) return;

    initAudio();
    const vol = volume;

    switch (type) {
      case 'placeBet':
        playNote(NOTES.E5, 0.06, 0, 'square', 0.18, vol);
        playNote(NOTES.G5, 0.06, 0.06, 'square', 0.18, vol);
        playNote(NOTES.C6, 0.12, 0.12, 'square', 0.12, vol);
        break;

      case 'cancelBet':
        playNote(NOTES.G4, 0.08, 0, 'square', 0.12, vol);
        playNote(NOTES.E4, 0.08, 0.08, 'square', 0.12, vol);
        playNote(NOTES.C4, 0.12, 0.16, 'square', 0.08, vol);
        break;

      case 'countdown':
        const freq = param === 1 ? NOTES.C6 : NOTES.G5;
        playNote(freq, 0.12, 0, 'square', 0.2, vol);
        playNote(freq / 2, 0.12, 0, 'square', 0.08, vol);
        break;

      case 'bullWin':
        [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6].forEach((f, i) => {
          playNote(f, 0.15, i * 0.12, 'square', 0.2, vol);
        });
        playNote(NOTES.C3, 0.3, 0, 'triangle', 0.2, vol);
        break;

      case 'bearWin':
        // BULL 승리와 동일한 효과음 사용
        [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6].forEach((f, i) => {
          playNote(f, 0.15, i * 0.12, 'square', 0.2, vol);
        });
        playNote(NOTES.C3, 0.3, 0, 'triangle', 0.2, vol);
        break;

      case 'lose':
        // 우울한 패배 사운드 - 하강하는 단조 멜로디
        [NOTES.E4, NOTES.D4, NOTES.C4, NOTES.B3].forEach((f, i) => {
          playNote(f, 0.25, i * 0.2, 'triangle', 0.15, vol);
        });
        // 저음 베이스
        playNote(NOTES.C3, 0.8, 0, 'sine', 0.1, vol);
        break;

      case 'click':
        playNote(NOTES.C5, 0.02, 0, 'square', 0.06, vol);
        break;
    }
  }, [enabled, volume, initAudio, playNote]);

  return {
    playSound,
    initAudio,
    isInitialized: !!audioCtxRef.current,
  };
}

// 레거시 호환을 위한 싱글톤 인스턴스 (BullBearGame.tsx에서 점진적 마이그레이션용)
let audioCtx: AudioContext | null = null;

function initAudioLegacy() {
  if (typeof window === 'undefined') return;
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playNoteLegacy(freq: number, duration: number, delay = 0, type: OscillatorType = 'square', volume = 0.15, masterVolume = 0.7) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
  const adjustedVolume = volume * masterVolume;
  gain.gain.setValueAtTime(adjustedVolume, audioCtx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + duration);
  osc.start(audioCtx.currentTime + delay);
  osc.stop(audioCtx.currentTime + delay + duration);
}

export const sounds = {
  placeBet: (vol: number) => {
    initAudioLegacy();
    playNoteLegacy(NOTES.E5, 0.06, 0, 'square', 0.18, vol);
    playNoteLegacy(NOTES.G5, 0.06, 0.06, 'square', 0.18, vol);
    playNoteLegacy(NOTES.C6, 0.12, 0.12, 'square', 0.12, vol);
  },
  // 심장박동 사운드 (긴장감 효과)
  heartbeat: (vol: number, intensity: number = 1) => {
    initAudioLegacy();
    if (!audioCtx) return;

    // intensity: 1~5 (5초 남았을 때 1, 1초 남았을 때 5)
    const baseVol = 0.15 + (intensity * 0.05); // 0.2 ~ 0.4
    const duration = 0.15 - (intensity * 0.015); // 점점 빨라짐

    // 첫 번째 박동 (둥)
    playNoteLegacy(60, duration, 0, 'sine', baseVol, vol);
    playNoteLegacy(40, duration * 0.8, 0, 'triangle', baseVol * 0.6, vol);

    // 두 번째 박동 (둥) - 약간 높은 음
    playNoteLegacy(70, duration * 0.8, 0.15, 'sine', baseVol * 0.7, vol);
    playNoteLegacy(50, duration * 0.6, 0.15, 'triangle', baseVol * 0.4, vol);
  },
  cancelBet: (vol: number) => {
    initAudioLegacy();
    playNoteLegacy(NOTES.G4, 0.08, 0, 'square', 0.12, vol);
    playNoteLegacy(NOTES.E4, 0.08, 0.08, 'square', 0.12, vol);
    playNoteLegacy(NOTES.C4, 0.12, 0.16, 'square', 0.08, vol);
  },
  countdown: (num: number, vol: number) => {
    initAudioLegacy();
    const freq = num === 1 ? NOTES.C6 : NOTES.G5;
    playNoteLegacy(freq, 0.12, 0, 'square', 0.2, vol);
    playNoteLegacy(freq / 2, 0.12, 0, 'square', 0.08, vol);
  },
  bullWin: (vol: number) => {
    initAudioLegacy();
    [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6].forEach((freq, i) => {
      playNoteLegacy(freq, 0.15, i * 0.12, 'square', 0.2, vol);
    });
    playNoteLegacy(NOTES.C3, 0.3, 0, 'triangle', 0.2, vol);
  },
  bearWin: (vol: number) => {
    // BULL 승리와 동일한 효과음 사용
    initAudioLegacy();
    [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6].forEach((freq, i) => {
      playNoteLegacy(freq, 0.15, i * 0.12, 'square', 0.2, vol);
    });
    playNoteLegacy(NOTES.C3, 0.3, 0, 'triangle', 0.2, vol);
  },
  lose: (vol: number) => {
    // 우울한 패배 사운드 - 하강하는 단조 멜로디
    initAudioLegacy();
    [NOTES.E4, NOTES.D4, NOTES.C4, NOTES.B3].forEach((freq, i) => {
      playNoteLegacy(freq, 0.25, i * 0.2, 'triangle', 0.15, vol);
    });
    // 저음 베이스
    playNoteLegacy(NOTES.C3, 0.8, 0, 'sine', 0.1, vol);
  },
  click: (vol: number) => {
    initAudioLegacy();
    playNoteLegacy(NOTES.C5, 0.02, 0, 'square', 0.06, vol);
  },
  // 라운드 시작 알림음 - 베팅 페이즈 시작 시 "띠링~"
  roundStart: (vol: number) => {
    initAudioLegacy();
    // 밝고 경쾌한 상승 멜로디
    playNoteLegacy(NOTES.G5, 0.08, 0, 'sine', 0.2, vol);
    playNoteLegacy(NOTES.C6, 0.08, 0.08, 'sine', 0.2, vol);
    playNoteLegacy(NOTES.E6 || 1318.51, 0.15, 0.16, 'sine', 0.25, vol);
    // 벨 소리 느낌의 고음 추가
    playNoteLegacy(NOTES.C6, 0.3, 0.16, 'triangle', 0.1, vol);
  },
  // 타이 결과 소리 - 무승부 전용
  tie: (vol: number) => {
    initAudioLegacy();
    // 중립적인 느낌 - 같은 음 두 번 반복
    playNoteLegacy(NOTES.A4, 0.15, 0, 'triangle', 0.18, vol);
    playNoteLegacy(NOTES.A4, 0.15, 0.2, 'triangle', 0.18, vol);
    // 물결 효과
    playNoteLegacy(NOTES.E4, 0.4, 0, 'sine', 0.1, vol);
    playNoteLegacy(NOTES.E4, 0.4, 0.2, 'sine', 0.1, vol);
  },
  // 슬롯머신 코인 카운팅 사운드 - 승리 시 잔액 올라갈 때
  coinCount: (vol: number) => {
    initAudioLegacy();
    if (!audioCtx) return null;

    // 코인 떨어지는 소리를 반복 재생하는 인터벌 반환
    const coinSounds = [
      { freq: 2200, duration: 0.03 },
      { freq: 2400, duration: 0.025 },
      { freq: 2600, duration: 0.03 },
      { freq: 2800, duration: 0.025 },
    ];

    let count = 0;
    const interval = setInterval(() => {
      if (!audioCtx) {
        clearInterval(interval);
        return;
      }

      const sound = coinSounds[count % coinSounds.length];

      // 메인 코인 소리 (금속성 높은 음)
      playNoteLegacy(sound.freq, sound.duration, 0, 'square', 0.12, vol);
      // 잔향 효과
      playNoteLegacy(sound.freq * 0.5, sound.duration * 2, 0.01, 'sine', 0.06, vol);
      // 랜덤 변주 (자연스러운 느낌)
      if (Math.random() > 0.5) {
        playNoteLegacy(sound.freq * 1.5, sound.duration * 0.5, 0.015, 'triangle', 0.04, vol);
      }

      count++;
    }, 50); // 50ms 간격으로 코인 소리

    return interval;
  },
  // 코인 카운팅 종료 사운드 - 카운팅 끝날 때 "찰칵" 마무리
  coinCountEnd: (vol: number) => {
    initAudioLegacy();
    // 마무리 벨 소리
    playNoteLegacy(NOTES.G5, 0.08, 0, 'sine', 0.2, vol);
    playNoteLegacy(NOTES.C6, 0.15, 0.05, 'sine', 0.25, vol);
    // 금속성 잔향
    playNoteLegacy(3000, 0.1, 0.1, 'triangle', 0.08, vol);
  }
};

// ============================================================
// 게임 중 배경음악 시스템 (이기고 있을 때만 재생)
// ============================================================
let gameMusicInterval: NodeJS.Timeout | null = null;
let isMusicPlaying = false;

// 신나는 말 달리는 음악 (이기고 있을 때) - 빠른 갤럽 리듬
function playWinningMusic(vol: number) {
  initAudioLegacy();
  if (!audioCtx) return;

  // 갤럽 리듬 패턴 (말발굽 소리)
  const gallopPattern = [
    { freq: NOTES.E5, delay: 0, dur: 0.08 },
    { freq: NOTES.G5, delay: 0.1, dur: 0.08 },
    { freq: NOTES.E5, delay: 0.2, dur: 0.06 },
    { freq: NOTES.C5, delay: 0.28, dur: 0.08 },
    { freq: NOTES.G5, delay: 0.38, dur: 0.08 },
    { freq: NOTES.E5, delay: 0.48, dur: 0.06 },
    { freq: NOTES.A5, delay: 0.56, dur: 0.1 },
    { freq: NOTES.G5, delay: 0.68, dur: 0.08 },
  ];

  gallopPattern.forEach(note => {
    playNoteLegacy(note.freq, note.dur, note.delay, 'square', 0.12, vol);
  });

  // 베이스 드럼 (발굽 효과)
  [0, 0.2, 0.4, 0.6].forEach(d => {
    playNoteLegacy(80, 0.05, d, 'triangle', 0.15, vol);
  });
}

// 게임 음악 시작 (이기고 있을 때만)
export function startGameMusic(isWinning: boolean, vol: number) {
  // 지고 있으면 음악 재생하지 않음
  if (!isWinning) {
    stopGameMusic();
    return;
  }

  // 이미 음악이 재생 중이면 무시
  if (isMusicPlaying && gameMusicInterval) return;

  // 기존 음악 중지
  stopGameMusic();

  isMusicPlaying = true;

  // 즉시 재생
  playWinningMusic(vol);

  // 반복 재생 (0.8초 간격)
  gameMusicInterval = setInterval(() => {
    playWinningMusic(vol);
  }, 800);
}

// 게임 음악 중지
export function stopGameMusic() {
  if (gameMusicInterval) {
    clearInterval(gameMusicInterval);
    gameMusicInterval = null;
  }
  isMusicPlaying = false;
}

// 현재 음악 상태 확인
export function getCurrentMusicType() {
  return isMusicPlaying ? 'winning' : null;
}

export { initAudioLegacy as initAudio };

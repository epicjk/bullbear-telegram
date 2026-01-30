'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { sounds } from '../hooks/useSound';

interface HeartbeatProps {
  active: boolean; // game phase + 5초 이하 + 베팅 있음
  secondsLeft: number; // 남은 초 (1-5)
  enabled: boolean; // 설정에서 ON/OFF
  soundEnabled: boolean;
  soundVolume: number;
}

export function Heartbeat({ active, secondsLeft, enabled, soundEnabled, soundVolume }: HeartbeatProps) {
  const lastSecondRef = useRef<number>(0);
  const [pulseOpacity, setPulseOpacity] = useState(0.3);

  const playHeartbeat = useCallback((intensity: number) => {
    if (soundEnabled) {
      sounds.heartbeat(soundVolume, intensity);
    }
  }, [soundEnabled, soundVolume]);

  // 사운드 재생
  useEffect(() => {
    if (!enabled || !active || secondsLeft > 5 || secondsLeft <= 0) {
      return;
    }

    // intensity: 5초 남음 = 1, 1초 남음 = 5
    const intensity = 6 - secondsLeft;

    // 초가 바뀔 때마다 즉시 재생
    if (lastSecondRef.current !== secondsLeft) {
      lastSecondRef.current = secondsLeft;
      playHeartbeat(intensity);
    }
  }, [active, secondsLeft, enabled, playHeartbeat]);

  // 시각적 펄스 애니메이션
  useEffect(() => {
    if (!enabled || !active || secondsLeft > 5 || secondsLeft <= 0) {
      setPulseOpacity(0.3);
      return;
    }

    const intensity = 6 - secondsLeft;
    const intervalTime = 150 - (intensity * 20); // 130ms ~ 50ms

    let phase = 0;
    const opacityPattern = [0.3, 1, 0.5, 0.9, 0.3];

    const interval = setInterval(() => {
      setPulseOpacity(opacityPattern[phase]);
      phase = (phase + 1) % opacityPattern.length;
    }, intervalTime);

    return () => clearInterval(interval);
  }, [active, secondsLeft, enabled]);

  // 시각 효과만 렌더링 (활성화 시)
  if (!enabled || !active || secondsLeft > 5 || secondsLeft <= 0) {
    return null;
  }

  // intensity에 따른 효과 강도
  const intensity = 6 - secondsLeft;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9997] transition-opacity duration-150"
      style={{
        boxShadow: `inset 0 0 ${30 + intensity * 15}px ${10 + intensity * 5}px rgba(239, 68, 68, ${0.15 + intensity * 0.08})`,
        opacity: pulseOpacity,
      }}
    />
  );
}

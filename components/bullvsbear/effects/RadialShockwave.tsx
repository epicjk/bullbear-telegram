'use client';

import { useEffect, useRef, useCallback } from 'react';

interface RadialShockwaveProps {
  trigger: boolean; // 승리 시 true로 전환
  enabled: boolean;
  onComplete?: () => void;
}

export function RadialShockwave({ trigger, enabled, onComplete }: RadialShockwaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const prevTriggerRef = useRef(false);

  const runShockwave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.max(canvas.width, canvas.height);
    const duration = 500; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (progress < 1) {
        const radius = progress * maxRadius;
        const opacity = 1 - progress;

        // Draw expanding ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.6})`;
        ctx.lineWidth = 4 + (1 - progress) * 8;
        ctx.stroke();

        // Inner glow
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(74, 222, 128, ${opacity * 0.3})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        animationRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [onComplete]);

  useEffect(() => {
    // trigger가 false → true로 변할 때만 실행
    if (enabled && trigger && !prevTriggerRef.current) {
      runShockwave();
    }
    prevTriggerRef.current = trigger;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, enabled, runShockwave]);

  // Canvas 크기 업데이트
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9998]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

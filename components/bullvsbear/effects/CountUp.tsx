'use client';

import { useEffect, useState, useRef } from 'react';

interface CountUpProps {
  value: number;
  enabled: boolean;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function CountUp({
  value,
  enabled,
  duration = 600,
  prefix = '',
  suffix = '',
  decimals = 2,
  className = '',
}: CountUpProps) {
  // Hydration 에러 방지: 초기값을 0으로 설정하고 마운트 후 실제 값으로 업데이트
  const [displayValue, setDisplayValue] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // 클라이언트 마운트 후 실제 값 설정
  useEffect(() => {
    setIsMounted(true);
    setDisplayValue(value);
    prevValueRef.current = value;
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!enabled || value === prevValueRef.current) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startValue = prevValueRef.current;
    const endValue = value;
    const startTime = performance.now();

    setIsAnimating(true);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
        prevValueRef.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, enabled, duration, isMounted]);

  // enabled가 false면 그냥 값 표시
  if (!enabled) {
    return (
      <span className={className}>
        {prefix}{value.toFixed(decimals)}{suffix}
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{
        transform: isAnimating ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform 150ms ease-out',
      }}
      suppressHydrationWarning
    >
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}

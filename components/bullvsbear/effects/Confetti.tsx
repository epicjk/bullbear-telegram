'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface ConfettiProps {
  trigger: boolean; // 승리 시 true로 전환
  enabled: boolean;
  isBigWin?: boolean; // $100 이상 승리
  onComplete?: () => void;
}

type ParticleShape = 'rect' | 'circle' | 'star' | 'ribbon';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  shape: ParticleShape;
  wobble: number;
  wobbleSpeed: number;
}

export function Confetti({ trigger, enabled, isBigWin = false, onComplete }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const prevTriggerRef = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const startTimeRef = useRef(0);

  // 더 다양한 색상
  const colors = [
    '#22c55e', '#16a34a', '#4ade80', // 녹색 계열
    '#fbbf24', '#f59e0b', '#eab308', // 금색/노랑 계열
    '#3b82f6', '#60a5fa', // 파랑 계열
    '#ec4899', '#f472b6', // 핑크 계열
    '#a855f7', '#c084fc', // 보라 계열
    '#ffffff', // 흰색
  ];

  const shapes: ParticleShape[] = ['rect', 'circle', 'star', 'ribbon'];

  // 별 그리기 함수
  const drawStar = (ctx: CanvasRenderingContext2D, size: number) => {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2;

    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / spikes) * i - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  };

  // 리본 그리기 함수
  const drawRibbon = (ctx: CanvasRenderingContext2D, size: number, wobble: number) => {
    ctx.beginPath();
    ctx.moveTo(-size / 2, -size * 1.5);
    ctx.quadraticCurveTo(
      Math.sin(wobble) * size / 2,
      -size / 2,
      size / 2,
      0
    );
    ctx.quadraticCurveTo(
      Math.sin(wobble + 1) * size / 2,
      size / 2,
      -size / 2,
      size * 1.5
    );
    ctx.lineWidth = size / 3;
    ctx.stroke();
  };

  const fireConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsAnimating(true);
    startTimeRef.current = Date.now();

    // 모바일 감지 - 파티클 수 조정
    const isMobile = window.innerWidth < 768;
    const baseCount = isBigWin
      ? (isMobile ? 120 : 200)
      : (isMobile ? 60 : 100);

    // 파티클 생성 - 여러 발사 지점에서
    const newParticles: Particle[] = [];

    // 발사 지점들: 하단 좌우, 중앙
    const launchPoints = [
      { x: canvas.width * 0.2, y: canvas.height * 0.9 }, // 좌하단
      { x: canvas.width * 0.8, y: canvas.height * 0.9 }, // 우하단
      { x: canvas.width * 0.5, y: canvas.height * 0.5 }, // 중앙
    ];

    launchPoints.forEach((point, pointIdx) => {
      const particleCount = pointIdx === 2 ? baseCount * 0.4 : baseCount * 0.3;

      for (let i = 0; i < particleCount; i++) {
        // 하단 발사는 위쪽으로, 중앙은 전방향
        let angle: number;
        let velocity: number;

        if (pointIdx < 2) {
          // 하단 발사 - 위쪽 방향 (부채꼴)
          angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
          velocity = 12 + Math.random() * 10;
        } else {
          // 중앙 폭발 - 전방향
          angle = Math.random() * Math.PI * 2;
          velocity = 6 + Math.random() * 8;
        }

        newParticles.push({
          x: point.x + (Math.random() - 0.5) * 40,
          y: point.y + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * velocity * (0.7 + Math.random() * 0.6),
          vy: Math.sin(angle) * velocity * (0.7 + Math.random() * 0.6),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 8,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 15,
          life: 1,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.1 + Math.random() * 0.2,
        });
      }
    });

    particlesRef.current = newParticles;

    const gravity = 0.25;
    const friction = 0.985;
    const duration = isBigWin ? 2500 : 1800; // Big win은 더 오래 지속

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (progress >= 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsAnimating(false);
        onComplete?.();
        return;
      }

      // 페이드 아웃 (마지막 30%)
      const fadeStart = 0.7;
      const globalOpacity = progress > fadeStart
        ? 1 - ((progress - fadeStart) / (1 - fadeStart))
        : 1;

      particlesRef.current.forEach(p => {
        // 물리 업데이트
        p.vy += gravity;
        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        // 화면 밖으로 나가면 스킵
        if (p.y > canvas.height + 50 || p.x < -50 || p.x > canvas.width + 50) {
          return;
        }

        // 그리기
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = globalOpacity * (0.7 + Math.random() * 0.3);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        switch (p.shape) {
          case 'rect':
            // 직사각형 (종이조각)
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.5);
            break;
          case 'circle':
            // 원형
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'star':
            // 별
            drawStar(ctx, p.size / 2);
            break;
          case 'ribbon':
            // 리본 (흔들리는 효과)
            drawRibbon(ctx, p.size, p.wobble);
            break;
        }

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isBigWin, onComplete]);

  useEffect(() => {
    // trigger가 false → true로 변할 때만 실행
    if (enabled && trigger && !prevTriggerRef.current) {
      fireConfetti();
    }
    // trigger가 false가 되면 즉시 애니메이션 중지 (오버레이 닫을 때)
    if (!trigger && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      setIsAnimating(false);
      // 캔버스 클리어
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
    prevTriggerRef.current = trigger;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, enabled, fireConfetti]);

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
      className="fixed inset-0 pointer-events-none z-[850]"
      style={{
        width: '100vw',
        height: '100vh',
        display: isAnimating ? 'block' : 'none'
      }}
    />
  );
}

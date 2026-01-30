'use client';

interface GlowPulseProps {
  isWinning: boolean;
  enabled: boolean;
}

export function GlowPulse({ isWinning, enabled }: GlowPulseProps) {
  if (!enabled || !isWinning) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(34,197,94,0.35), transparent 65%)',
        animation: 'glowPulse 7s ease-in-out infinite',
      }}
    />
  );
}

// CSS keyframes (globals.css에 추가 필요)
export const glowPulseKeyframes = `
@keyframes glowPulse {
  0%   { opacity: 0.06; }
  50%  { opacity: 0.12; }
  100% { opacity: 0.06; }
}
`;

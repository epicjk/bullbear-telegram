'use client';

interface WaveSweepProps {
  isWinning: boolean;
  enabled: boolean;
}

export function WaveSweep({ isWinning, enabled }: WaveSweepProps) {
  if (!enabled || !isWinning) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(to top, transparent, rgba(34,197,94,0.15), transparent)',
        animation: 'waveSweep 14s linear infinite',
      }}
    />
  );
}

// CSS keyframes (globals.css에 추가 필요)
export const waveSweepKeyframes = `
@keyframes waveSweep {
  0% { transform: translateY(120%); opacity: 0; }
  10% { opacity: 0.25; }
  100% { transform: translateY(-120%); opacity: 0; }
}
`;

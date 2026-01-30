'use client';

import { useEffect, useRef } from 'react';
import { GamePhase, PriceData } from './useBullBearGame';

interface PriceChartProps {
  currentPrice: number;
  basePrice: number;
  priceHistory: PriceData[];
  priceChange: number;
  priceChangePercent: number;
  gamePhase: GamePhase;
  timeRemaining: number;
  isSimulation: boolean;
}

export function PriceChart({
  currentPrice,
  basePrice,
  priceHistory,
  priceChange,
  priceChangePercent,
  gamePhase,
  timeRemaining,
  isSimulation,
}: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || priceHistory.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate price range
    const prices = priceHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const padding = priceRange * 0.1;

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.05)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw base price line (if in game phase)
    if (gamePhase === 'game' && basePrice > 0) {
      const baseY = height - ((basePrice - (minPrice - padding)) / (priceRange + padding * 2)) * height;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(width, baseY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Base price label
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10px Orbitron';
      ctx.fillText(`BASE: $${basePrice.toFixed(2)}`, 5, baseY - 5);
    }

    // Draw price line
    ctx.beginPath();
    const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
    lineGradient.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
    lineGradient.addColorStop(1, priceChange >= 0 ? '#22c55e' : '#ef4444');
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    priceHistory.forEach((point, index) => {
      const x = (index / (priceHistory.length - 1)) * width;
      const y = height - ((point.price - (minPrice - padding)) / (priceRange + padding * 2)) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw fill under line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
    fillGradient.addColorStop(0, priceChange >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)');
    fillGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = fillGradient;
    ctx.fill();

    // Draw current price dot
    if (priceHistory.length > 0) {
      const lastPoint = priceHistory[priceHistory.length - 1];
      const x = width - 10;
      const y = height - ((lastPoint.price - (minPrice - padding)) / (priceRange + padding * 2)) * height;

      // Glow effect
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = priceChange >= 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = priceChange >= 0 ? '#22c55e' : '#ef4444';
      ctx.fill();
    }

    // Draw X-axis time labels (24-hour format)
    if (priceHistory.length > 0) {
      const bottomPadding = 18;
      ctx.font = '9px Orbitron';
      ctx.fillStyle = 'rgba(156, 163, 175, 0.6)';
      ctx.textAlign = 'center';

      // Show 3-5 time labels
      const labelCount = width < 300 ? 3 : 5;
      for (let i = 0; i < labelCount; i++) {
        const index = Math.floor((i / (labelCount - 1)) * (priceHistory.length - 1));
        const point = priceHistory[index];
        if (point) {
          const x = (index / (priceHistory.length - 1)) * width;
          const date = new Date(point.timestamp);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const seconds = date.getSeconds().toString().padStart(2, '0');
          ctx.fillText(`${hours}:${minutes}:${seconds}`, x, height - 4);
        }
      }
    }
  }, [priceHistory, basePrice, priceChange, gamePhase]);

  return (
    <div className="flex flex-col h-full">
      {/* Chart Header */}
      <div className="flex justify-between items-center mb-2 px-1">
        {/* BTC Info */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-[#f7931a] to-[#ffab40] flex items-center justify-center shadow-[0_4px_12px_rgba(247,147,26,0.3)]">
            <span className="text-white font-black text-sm md:text-base">₿</span>
          </div>
          <div>
            <h3 className="font-['Orbitron'] text-xs md:text-sm font-bold text-white">BTC/USDT</h3>
            <p className="text-[10px] md:text-xs text-gray-500">Bitcoin</p>
          </div>
        </div>

        {/* Price Display */}
        <div className="text-right">
          <div className={`font-['Orbitron'] text-lg md:text-xl font-bold ${priceChange >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            ${currentPrice.toFixed(2)}
          </div>
          <div className={`text-xs ${priceChange >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(3)}%)
          </div>
        </div>

        {/* Binance Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-[#f3ba2f]/10 border border-[#f3ba2f]/30 rounded-md">
          <div className="w-4 h-4 rounded-full bg-[#f3ba2f] flex items-center justify-center text-[8px] font-bold text-black">B</div>
          <span className="font-['Orbitron'] text-[10px] font-semibold text-[#f3ba2f]">
            {isSimulation ? 'SIMULATION' : 'BINANCE'}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={containerRef} className="relative flex-1 min-h-[120px] md:min-h-[180px] rounded-xl bg-[#0a0a0f] overflow-hidden border border-white/5">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Game Timer Overlay */}
        {gamePhase === 'game' && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#12121a]/90 border-2 border-[#a855f7] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <span className={`font-['Orbitron'] text-lg md:text-xl font-bold ${timeRemaining <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {timeRemaining}
              </span>
            </div>
            <div className="mt-1 w-12 h-1 bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#a855f7] rounded-full transition-all duration-1000"
                style={{ width: `${(timeRemaining / 30) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Countdown Overlay */}
        {gamePhase === 'countdown' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
            <span className="font-['Orbitron'] text-6xl md:text-8xl font-black text-red-500 animate-pulse" style={{ textShadow: '0 0 60px rgba(239,68,68,0.8)' }}>
              {timeRemaining}
            </span>
            <span className="font-['Orbitron'] text-sm md:text-base text-gray-400 tracking-[4px] mt-2">LOCKING IN</span>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { RoundHistory } from './useBullBearGame';

interface RoadmapGridProps {
  history: RoundHistory[];
  bullWins: number;
  bearWins: number;
}

export function RoadmapGrid({ history, bullWins, bearWins }: RoadmapGridProps) {
  // Create 6-row baccarat-style grid
  const ROWS = 6;
  const createGrid = () => {
    const grid: (RoundHistory | null)[][] = [];
    let col = 0;
    let row = 0;
    let lastResult: 'bull' | 'bear' | 'tie' | null = null;

    history.forEach((item) => {
      // If result changed or column is full, move to next column
      if (lastResult !== null && (item.result !== lastResult || row >= ROWS)) {
        col++;
        row = 0;
      }

      // Ensure column exists
      while (grid.length <= col) {
        grid.push(new Array(ROWS).fill(null));
      }

      grid[col][row] = item;
      row++;
      lastResult = item.result;
    });

    return grid;
  };

  const grid = createGrid();
  const totalGames = bullWins + bearWins;
  const bullPercent = totalGames > 0 ? Math.round((bullWins / totalGames) * 100) : 50;
  const bearPercent = totalGames > 0 ? Math.round((bearWins / totalGames) * 100) : 50;

  return (
    <div className="bg-[#12121a] rounded-xl border border-white/5 p-2 md:p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm font-bold text-white/80">📊 HISTORY</span>
          <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
            {history.length}
          </span>
        </div>
        {/* Mobile Binance Badge */}
        <div className="md:hidden flex items-center gap-1 px-1.5 py-0.5 border border-[#f3ba2f]/40 rounded text-[8px]">
          <span className="text-[#f3ba2f]">⬡</span>
          <span className="text-[#f3ba2f] font-semibold">POWERED BY BINANCE</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div
          className="grid gap-[2px] md:gap-1"
          style={{
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
            gridAutoFlow: 'column',
            gridAutoColumns: 'minmax(12px, 1fr)',
          }}
        >
          {grid.map((column, colIdx) =>
            column.map((cell, rowIdx) => (
              <div
                key={`${colIdx}-${rowIdx}`}
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full border transition-all ${
                  cell
                    ? cell.result === 'bull'
                      ? 'border-[#ef4444] border-2 bg-transparent hover:scale-125 cursor-pointer'
                      : cell.result === 'bear'
                      ? 'border-[#22c55e] border-2 bg-transparent hover:scale-125 cursor-pointer'
                      : 'border-[#fbbf24] border-2 bg-[#fbbf24]/20'
                    : 'border-white/5 bg-white/[0.02]'
                }`}
                title={cell ? `Round #${cell.round}: ${cell.result.toUpperCase()}` : undefined}
              />
            ))
          )}
        </div>
      </div>

      {/* Win Rate Bar */}
      <div className="mt-2 pt-2 border-t border-white/5">
        <div className="flex justify-between text-[10px] md:text-xs text-gray-500 mb-1">
          <span>WIN RATE</span>
          <span>{bullPercent}% / {bearPercent}%</span>
        </div>
        <div className="h-1.5 md:h-2 rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-[#ef4444] to-[#f87171] transition-all duration-500"
            style={{ width: `${bullPercent}%` }}
          />
          <div
            className="bg-gradient-to-r from-[#22c55e] to-[#4ade80] transition-all duration-500"
            style={{ width: `${bearPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <div className="flex items-center gap-1 text-[10px] text-[#ef4444]">
            <span className="w-2 h-2 rounded-full border-2 border-[#ef4444]" />
            <span>BULL {bullWins}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#22c55e]">
            <span className="w-2 h-2 rounded-full border-2 border-[#22c55e]" />
            <span>BEAR {bearWins}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

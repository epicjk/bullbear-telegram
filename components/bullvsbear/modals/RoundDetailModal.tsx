'use client';

import { useState, useEffect } from 'react';
import { RoundHistory, RoadmapData, RoundResult } from '../useBullBearGame';

interface RoundDetailModalProps {
  isOpen: boolean;
  roundNum: number | null;
  roadmapHistory: RoundHistory[];
  roadmapData: RoadmapData;
  lang: 'ko' | 'en';
  onClose: () => void;
}

// 라운드 번호로부터 한국 시간 기준 시작/종료 타임스탬프 계산
function calculateRoundTimestamps(roundNum: number) {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const koreaTime = new Date(utcTime + (9 * 60 * 60 * 1000));

  const todayMidnight = new Date(koreaTime);
  todayMidnight.setHours(0, 0, 0, 0);
  const midnightTimestamp = todayMidnight.getTime() - (9 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60000);

  const roundStartSec = (roundNum - 1) * 60;
  const baseTimeSec = roundStartSec + 29;
  const endTimeSec = roundStartSec + 59;

  const baseTimestamp = midnightTimestamp + (baseTimeSec * 1000);
  const endTimestamp = midnightTimestamp + (endTimeSec * 1000);

  const baseHour = Math.floor(baseTimeSec / 3600);
  const baseMin = Math.floor((baseTimeSec % 3600) / 60);
  const baseSecond = baseTimeSec % 60;
  const endHour = Math.floor(endTimeSec / 3600);
  const endMin = Math.floor((endTimeSec % 3600) / 60);
  const endSecond = endTimeSec % 60;

  const formatTime = (h: number, m: number, s: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return {
    baseTimestamp,
    endTimestamp,
    startTime: formatTime(baseHour, baseMin, baseSecond),
    endTime: formatTime(endHour, endMin, endSecond),
  };
}

export function RoundDetailModal({
  isOpen,
  roundNum,
  roadmapHistory,
  roadmapData,
  lang,
  onClose,
}: RoundDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [priceData, setPriceData] = useState<{ startPrice: number; endPrice: number } | null>(null);
  const [fetchError, setFetchError] = useState(false);

  // roadmapHistory에서 해당 라운드 찾기
  const roundData = roadmapHistory.find(r => r.round === roundNum);

  // roadmapData에서 결과만 찾기 (과거 히스토리)
  let foundResult: RoundResult | null = null;
  if (!roundData) {
    for (const colData of roadmapData) {
      for (const cell of colData) {
        if (cell && cell.round === roundNum) {
          foundResult = cell.result;
          break;
        }
      }
      if (foundResult) break;
    }
  }

  // Binance API에서 과거 가격 데이터 조회
  useEffect(() => {
    if (!roundNum || !isOpen) return;

    if (roundData && roundData.startPrice > 0 && roundData.endPrice > 0) {
      setPriceData({ startPrice: roundData.startPrice, endPrice: roundData.endPrice });
      setLoading(false);
      return;
    }

    const fetchPriceData = async () => {
      setLoading(true);
      setFetchError(false);

      try {
        const { baseTimestamp, endTimestamp } = calculateRoundTimestamps(roundNum);
        const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1s&startTime=${baseTimestamp}&endTime=${endTimestamp + 999}&limit=31`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const startPrice = parseFloat(data[0][4]);
            const endPrice = parseFloat(data[data.length - 1][4]);
            setPriceData({ startPrice, endPrice });
          } else {
            setFetchError(true);
          }
        } else {
          setFetchError(true);
        }
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [roundNum, roundData, isOpen]);

  if (!isOpen || !roundNum) return null;

  const timestamps = calculateRoundTimestamps(roundNum);
  const hasPriceData = priceData && priceData.startPrice > 0 && priceData.endPrice > 0;

  const formatPriceDisplay = (price: number) => {
    return '$' + price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const calculateResult = (): RoundResult | null => {
    if (!hasPriceData) return roadmapHistory.find(r => r.round === roundNum)?.result || foundResult;
    const start2d = Math.round(priceData.startPrice * 100) / 100;
    const end2d = Math.round(priceData.endPrice * 100) / 100;
    if (start2d === end2d) return 'tie';
    return end2d > start2d ? 'bull' : 'bear';
  };

  const result = calculateResult();
  const priceChange = hasPriceData ? priceData.endPrice - priceData.startPrice : 0;

  return (
    <div className="fixed inset-0 z-[960] flex items-center justify-center bg-black/85" onClick={onClose}>
      <div
        className="bg-[#12121a] rounded-2xl border border-white/10 w-[95%] max-w-[400px] p-7 relative animate-[modalFadeIn_0.3s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className={`font-['Orbitron'] font-bold text-xl ${
            result === 'bull' ? 'text-[#22c55e]' : result === 'bear' ? 'text-[#ef4444]' : 'text-[#fbbf24]'
          }`}>
            Round #{roundNum}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-400 hover:bg-[#ef4444] hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Binance 검증 뱃지 */}
        <div className="mb-5 p-3 rounded-xl border border-[#f3ba2f]/30 bg-gradient-to-r from-[#f3ba2f]/10 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-[#f3ba2f] font-bold text-lg">Ⓑ</span>
            <div className="flex-1">
              <div className="text-[#f3ba2f] font-bold text-xs">Powered by BINANCE</div>
              <div className="text-gray-500 text-[10px]">Spot BTCUSDT · Real-time Price</div>
            </div>
            <span className="text-[#22c55e] text-lg">✓</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-gray-500 text-sm">{lang === 'ko' ? '시작 시간' : 'Start Time'}</span>
            <span className="font-['Orbitron'] text-white text-sm">{timestamps.startTime}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-gray-500 text-sm">{lang === 'ko' ? '시작 가격' : 'Start Price'}</span>
            <span className="font-['Orbitron'] text-white text-sm">
              {loading ? (
                <span className="text-gray-400 animate-pulse">Loading...</span>
              ) : hasPriceData ? (
                formatPriceDisplay(priceData.startPrice)
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-gray-500 text-sm">{lang === 'ko' ? '종료 시간' : 'End Time'}</span>
            <span className="font-['Orbitron'] text-white text-sm">{timestamps.endTime}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-gray-500 text-sm">{lang === 'ko' ? '종료 가격' : 'End Price'}</span>
            <span className="font-['Orbitron'] text-white text-sm">
              {loading ? (
                <span className="text-gray-400 animate-pulse">Loading...</span>
              ) : hasPriceData ? (
                formatPriceDisplay(priceData.endPrice)
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-gray-500 text-sm">{lang === 'ko' ? '가격 변동' : 'Price Change'}</span>
            <span className={`font-['Orbitron'] text-sm ${priceChange >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {loading ? (
                <span className="text-gray-400 animate-pulse">Loading...</span>
              ) : hasPriceData ? (
                `${priceChange >= 0 ? '+' : ''}${formatPriceDisplay(priceChange)}`
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </span>
          </div>
        </div>

        {/* Result */}
        <div className={`mt-5 p-4 rounded-xl flex items-center justify-center gap-3 ${
          result === 'bull' ? 'bg-[#22c55e]/20 border border-[#22c55e]/30' :
          result === 'bear' ? 'bg-[#ef4444]/20 border border-[#ef4444]/30' :
          result === 'tie' ? 'bg-[#fbbf24]/20 border border-[#fbbf24]/30' :
          'bg-white/5 border border-white/10'
        }`}>
          <span className="text-4xl">
            {result === 'bull' ? '🐂' : result === 'bear' ? '🐻' : result === 'tie' ? '🔄' : '❓'}
          </span>
          <span className={`font-['Orbitron'] font-bold text-xl ${
            result === 'bull' ? 'text-[#22c55e]' :
            result === 'bear' ? 'text-[#ef4444]' :
            result === 'tie' ? 'text-[#fbbf24]' :
            'text-gray-400'
          }`}>
            {result === 'bull' ? 'BULL WIN' : result === 'bear' ? 'BEAR WIN' : result === 'tie' ? 'TIE (REFUND)' : 'NO DATA'}
          </span>
        </div>

        {/* Binance 차트 링크 */}
        <a
          href="https://www.binance.com/en/trade/BTC_USDT"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#f3ba2f] hover:border-[#f3ba2f]/50 transition-all"
        >
          <span>📊</span>
          <span className="text-sm">{lang === 'ko' ? 'Binance 차트에서 확인' : 'Verify on Binance Chart'}</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { BetRecord } from '../useBullBearGame';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  betHistory: BetRecord[];
  lang: 'ko' | 'en';
  walletAddress?: string;
}

// 날짜별로 그룹화된 기록 타입
interface GroupedHistory {
  date: string;
  dateLabel: string;
  records: BetRecord[];
  dailyPnl: number;
}

export function HistoryModal({ isOpen, onClose, betHistory, lang, walletAddress }: HistoryModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'ko' ? '게임 기록' : 'Game History'}
      icon="📊"
    >
      <HistoryContent betHistory={betHistory} lang={lang} walletAddress={walletAddress} />
    </Modal>
  );
}

interface HistoryContentProps {
  betHistory: BetRecord[];
  lang: 'ko' | 'en';
  walletAddress?: string;
}

const ITEMS_PER_PAGE = 10;

function HistoryContent({ betHistory, lang, walletAddress }: HistoryContentProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // localStorage에서 전체 기록 로드 (지갑 주소 기반)
  const allHistory = useMemo(() => {
    if (typeof window === 'undefined') return betHistory;

    try {
      const storageKey = walletAddress
        ? `bitbattle_history_${walletAddress}`
        : 'bitbattle_history';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as BetRecord[];
        // 현재 세션의 기록과 병합 (중복 제거)
        const existingRounds = new Set(parsed.map(r => `${r.round}-${r.timestamp}`));
        const newRecords = betHistory.filter(r => !existingRounds.has(`${r.round}-${r.timestamp}`));
        return [...parsed, ...newRecords];
      }
    } catch (e) {
      console.error('Failed to load history from localStorage:', e);
    }
    return betHistory;
  }, [betHistory, walletAddress]);

  // 날짜별로 그룹화
  const groupedHistory = useMemo(() => {
    const groups: Map<string, BetRecord[]> = new Map();

    // 최신순으로 정렬
    const sorted = [...allHistory].sort((a, b) => b.timestamp - a.timestamp);

    sorted.forEach(record => {
      const date = new Date(record.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(record);
    });

    // 그룹화된 결과를 배열로 변환
    const result: GroupedHistory[] = [];
    groups.forEach((records, dateKey) => {
      const date = new Date(dateKey);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateLabel: string;
      if (dateKey === today.toISOString().split('T')[0]) {
        dateLabel = lang === 'ko' ? '오늘' : 'Today';
      } else if (dateKey === yesterday.toISOString().split('T')[0]) {
        dateLabel = lang === 'ko' ? '어제' : 'Yesterday';
      } else {
        dateLabel = date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
          month: 'short',
          day: 'numeric',
          weekday: 'short'
        });
      }

      const dailyPnl = records.reduce((sum, r) => {
        if (r.result === 'win') return sum + (r.payout - r.amount);
        if (r.result === 'lose') return sum - r.amount;
        return sum;
      }, 0);

      result.push({
        date: dateKey,
        dateLabel,
        records,
        dailyPnl
      });
    });

    return result;
  }, [allHistory, lang]);

  // 표시할 기록들 (페이지네이션)
  const displayedRecords = useMemo(() => {
    const allRecords: { record: BetRecord; dateLabel: string; dailyPnl: number; isFirstOfDay: boolean }[] = [];
    let count = 0;

    for (const group of groupedHistory) {
      for (let i = 0; i < group.records.length && count < displayCount; i++) {
        allRecords.push({
          record: group.records[i],
          dateLabel: group.dateLabel,
          dailyPnl: group.dailyPnl,
          isFirstOfDay: i === 0
        });
        count++;
      }
      if (count >= displayCount) break;
    }

    return allRecords;
  }, [groupedHistory, displayCount]);

  // 전체 기록 수
  const totalRecords = allHistory.length;
  const hasMore = displayCount < totalRecords;

  // 무한 스크롤 처리
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, totalRecords));
    }
  }, [hasMore, totalRecords]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 모달 닫힐 때 displayCount 리셋
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, []);

  if (allHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <span className="text-5xl opacity-30 mb-4">📭</span>
        <p className="text-white mb-2">{lang === 'ko' ? '기록이 없습니다' : 'No history yet'}</p>
        <p className="text-sm">{lang === 'ko' ? '첫 베팅을 시작해보세요!' : 'Start your first bet!'}</p>
      </div>
    );
  }

  const totalPnl = allHistory.reduce((sum, b) => sum + (b.result === 'win' ? b.payout - b.amount : b.result === 'tie' ? 0 : -b.amount), 0);
  const wins = allHistory.filter(b => b.result === 'win').length;
  const winRate = (wins / allHistory.length) * 100;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-white/5 rounded-xl">
        <div className="text-center">
          <div className={`font-['Orbitron'] font-bold text-xl ${totalPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500">{lang === 'ko' ? '총 손익' : 'Total P&L'}</div>
        </div>
        <div className="text-center">
          <div className="font-['Orbitron'] font-bold text-xl text-[#fbbf24]">{winRate.toFixed(0)}%</div>
          <div className="text-xs text-gray-500">{lang === 'ko' ? '승률' : 'Win Rate'}</div>
        </div>
        <div className="text-center">
          <div className="font-['Orbitron'] font-bold text-xl text-[#a855f7]">{totalRecords}</div>
          <div className="text-xs text-gray-500">{lang === 'ko' ? '총 게임' : 'Total Games'}</div>
        </div>
      </div>

      {/* History List with Infinite Scroll */}
      <div
        ref={scrollContainerRef}
        className="space-y-2 max-h-80 overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}
      >
        {displayedRecords.map((item, i) => (
          <div key={`${item.record.round}-${item.record.timestamp}-${i}`}>
            {/* 날짜 구분선 */}
            {item.isFirstOfDay && (
              <div className="flex items-center gap-2 py-2 mt-2 first:mt-0">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs font-medium text-[#fbbf24] px-2">
                  {item.dateLabel}
                  <span className={`ml-2 ${item.dailyPnl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    ({item.dailyPnl >= 0 ? '+' : ''}${item.dailyPnl.toFixed(0)})
                  </span>
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            )}

            {/* 기록 아이템 */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#fbbf24]/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${
                  item.record.side === 'bull' ? 'bg-[#22c55e]/20' : 'bg-[#ef4444]/20'
                }`}>
                  {item.record.side === 'bull' ? '🐂' : '🐻'}
                </div>
                <div>
                  <div className="font-['Orbitron'] text-sm text-white">Round #{item.record.round}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.record.timestamp).toLocaleTimeString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-['Orbitron'] font-bold ${
                  item.record.result === 'win' ? 'text-[#22c55e]' : item.record.result === 'lose' ? 'text-[#ef4444]' : 'text-[#fbbf24]'
                }`}>
                  {item.record.result === 'win' ? `+$${(item.record.payout - item.record.amount).toFixed(0)}` :
                   item.record.result === 'lose' ? `-$${item.record.amount}` : '$0'}
                </div>
                <div className="text-xs text-gray-500">${item.record.amount} bet</div>
              </div>
            </div>
          </div>
        ))}

        {/* 더 불러오기 표시 */}
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-3">
            <div className="text-xs text-gray-500 animate-pulse">
              {lang === 'ko' ? '스크롤하여 더 보기...' : 'Scroll for more...'}
            </div>
          </div>
        )}

        {!hasMore && totalRecords > ITEMS_PER_PAGE && (
          <div className="flex justify-center py-3">
            <div className="text-xs text-gray-500">
              {lang === 'ko' ? `총 ${totalRecords}개의 기록` : `${totalRecords} records total`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

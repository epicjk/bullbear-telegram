'use client';

import { Modal } from '../ui/Modal';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ko' | 'en';
}

export function HowToPlayModal({ isOpen, onClose, lang }: HowToPlayModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'ko' ? '플레이 방법' : 'How to Play'}
      icon="❓"
    >
      <HowToContent lang={lang} />
    </Modal>
  );
}

function HowToContent({ lang }: { lang: 'ko' | 'en' }) {
  const content = lang === 'ko' ? {
    steps: [
      { title: '지갑 연결하기', desc: <>상단의 <span className="text-[#fbbf24] font-semibold">CONNECT</span> 버튼을 눌러 MetaMask, Phantom 등 지갑을 연결하세요.</> },
      { title: '방향 예측하기', desc: <>1분 후 BTC 가격이 오를지 내릴지 예측하세요. <span className="text-[#22c55e] font-semibold">🐂 BULL</span> = 상승, <span className="text-[#ef4444] font-semibold">🐻 BEAR</span> = 하락</> },
      { title: '베팅하기', desc: <>베팅 금액을 입력하고 <span className="text-[#22c55e] font-semibold">BULL</span> 또는 <span className="text-[#ef4444] font-semibold">BEAR</span> 버튼을 클릭하세요. 베팅은 <span className="text-[#fbbf24] font-semibold">25초</span> 내에만 가능합니다.</> },
      { title: '결과 확인', desc: <><span className="text-[#fbbf24] font-semibold">30초</span>의 게임 시간이 끝나면 결과가 발표됩니다. 맞추면 <span className="text-[#fbbf24] font-semibold">1.95배</span> 보상!</> },
      { title: '보상 수령', desc: <>승리하면 자동으로 보상이 지급됩니다!</> },
    ],
    timeline: { title: '⏱️ 라운드 구조 (1분)', betting: 'BETTING', nobet: 'NO BET', game: 'GAME' },
    payout: {
      title: '💰 보상 구조',
      win: '승리 시', winVal: '베팅 × 1.95',
      lose: '패배 시', loseVal: '베팅 금액 손실',
      tie: '무승부 (동일 가격)', tieVal: '베팅 금액 환불'
    },
    warning: {
      title: '⚠️ 주의사항',
      items: [
        <>베팅이 가능한 <strong className="text-white">25초 동안에만</strong> 베팅의 수정 및 취소가 가능합니다.</>,
        <>25초 이후에는 해당 라운드에 <strong className="text-white">베팅할 수 없습니다</strong>.</>,
        <>소수점 2자리까지 가격이 동일하면 <strong className="text-white">무승부</strong>로 처리됩니다.</>,
        <>네트워크 상태에 따라 <strong className="text-white">지연</strong>이 발생할 수 있습니다.</>
      ]
    },
    badge: <><strong className="text-[#F3BA2F]">Binance</strong> 공식 API 사용 · 실시간 BTC/USDT Spot 가격과 100% 동일</>
  } : {
    steps: [
      { title: 'Connect Wallet', desc: <>Click the <span className="text-[#fbbf24] font-semibold">CONNECT</span> button to connect your MetaMask, Phantom, or other wallet.</> },
      { title: 'Predict Direction', desc: <>Predict if BTC price will go up or down in 1 minute. <span className="text-[#22c55e] font-semibold">🐂 BULL</span> = Up, <span className="text-[#ef4444] font-semibold">🐻 BEAR</span> = Down</> },
      { title: 'Place Your Bet', desc: <>Enter your bet amount and click <span className="text-[#22c55e] font-semibold">BULL</span> or <span className="text-[#ef4444] font-semibold">BEAR</span>. Betting is only available for <span className="text-[#fbbf24] font-semibold">25 seconds</span>.</> },
      { title: 'See Results', desc: <>After <span className="text-[#fbbf24] font-semibold">30 seconds</span> of game time, results are announced. Win and get <span className="text-[#fbbf24] font-semibold">1.95x</span> payout!</> },
      { title: 'Claim Rewards', desc: <>If you win, rewards are automatically paid out!</> },
    ],
    timeline: { title: '⏱️ Round Structure (1 min)', betting: 'BETTING', nobet: 'NO BET', game: 'GAME' },
    payout: {
      title: '💰 Payout Structure',
      win: 'Win', winVal: 'Bet × 1.95',
      lose: 'Lose', loseVal: 'Lose bet amount',
      tie: 'Tie (Same price)', tieVal: 'Bet refunded'
    },
    warning: {
      title: '⚠️ Important Notes',
      items: [
        <>Bets can only be <strong className="text-white">modified or cancelled</strong> during the 25-second betting window.</>,
        <>You <strong className="text-white">cannot bet</strong> after 25 seconds.</>,
        <>If price is same to 2 decimal places, it&apos;s a <strong className="text-white">tie</strong>.</>,
        <><strong className="text-white">Delays</strong> may occur depending on network conditions.</>
      ]
    },
    badge: <>Powered by <strong className="text-[#F3BA2F]">Binance</strong> Official API · 100% Real-time BTC/USDT Spot Price</>
  };

  return (
    <div className="space-y-0">
      {/* 단계별 설명 */}
      {content.steps.map((step, i) => (
        <div key={i} className="flex gap-3 mb-3">
          {/* 번호 원 */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#22c55e] flex items-center justify-center font-['Orbitron'] text-[0.85rem] font-bold text-black flex-shrink-0">
            {i + 1}
          </div>
          {/* 내용 */}
          <div className="flex-1 pt-0.5">
            <div className="font-semibold text-white text-[1rem] mb-0.5">{step.title}</div>
            <div className="text-[0.8rem] text-gray-400 leading-relaxed">{step.desc}</div>
          </div>
        </div>
      ))}

      {/* 타임라인 그래픽 */}
      <div className="mt-6 p-5 bg-white/[0.03] rounded-xl">
        <div className="font-['Orbitron'] text-[0.85rem] font-semibold text-[#fbbf24] mb-4 flex items-center gap-2">
          {content.timeline.title}
        </div>
        <div className="flex h-10 rounded-lg overflow-hidden mb-2">
          <div className="w-[41.67%] bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] flex items-center justify-center font-['Orbitron'] text-[0.7rem] font-semibold text-black">
            {content.timeline.betting}
          </div>
          <div className="w-[8.33%] bg-gradient-to-r from-[#ef4444] to-[#dc2626] flex items-center justify-center font-['Orbitron'] text-[0.5rem] font-semibold text-white">
            {content.timeline.nobet}
          </div>
          <div className="w-[50%] bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] flex items-center justify-center font-['Orbitron'] text-[0.7rem] font-semibold text-black">
            {content.timeline.game}
          </div>
        </div>
        {/* 시간 라벨 */}
        <div className="relative h-5 text-[0.7rem] font-['Orbitron'] font-semibold text-white">
          <span className="absolute left-0">:00</span>
          <span className="absolute left-[41.67%] -translate-x-1/2">:25</span>
          <span className="absolute left-[50%] -translate-x-1/2">:30</span>
          <span className="absolute right-0">:59</span>
        </div>
      </div>

      {/* 보상 구조 */}
      <div className="mt-5 p-4 bg-white/5 rounded-xl">
        <div className="font-['Orbitron'] text-[0.85rem] font-semibold text-[#fbbf24] mb-3 flex items-center gap-2">
          {content.payout.title}
        </div>
        <div className="space-y-0">
          <div className="flex justify-between py-2 border-b border-white/5 text-[0.85rem]">
            <span className="text-gray-400">{content.payout.win}</span>
            <span className="font-['Orbitron'] font-semibold text-[#22c55e]">{content.payout.winVal}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5 text-[0.85rem]">
            <span className="text-gray-400">{content.payout.lose}</span>
            <span className="font-['Orbitron'] font-semibold text-[#ef4444]">{content.payout.loseVal}</span>
          </div>
          <div className="flex justify-between py-2 text-[0.85rem]">
            <span className="text-gray-400">{content.payout.tie}</span>
            <span className="font-['Orbitron'] font-semibold text-[#22c55e]">{content.payout.tieVal}</span>
          </div>
        </div>
      </div>

      {/* 주의사항 */}
      <div className="mt-5 p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl">
        <div className="font-['Orbitron'] text-[0.85rem] font-semibold text-[#ef4444] mb-3 flex items-center gap-2">
          {content.warning.title}
        </div>
        <div className="space-y-2">
          {content.warning.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-[0.8rem] text-white leading-relaxed">
              <span className="text-[#ef4444] font-bold flex-shrink-0">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Binance 뱃지 */}
      <div className="mt-5 p-3.5 flex items-center justify-center gap-2.5 rounded-xl border border-[#F3BA2F]/30" style={{ background: 'linear-gradient(135deg, rgba(243,186,47,0.1), rgba(243,186,47,0.05))' }}>
        <span className="text-2xl">₿</span>
        <span className="text-[0.8rem] text-white">{content.badge}</span>
      </div>
    </div>
  );
}

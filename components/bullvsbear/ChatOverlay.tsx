'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ChatMessage {
  id: string;
  user: {
    name: string;
    avatar: string;
    type: 'bull' | 'bear' | 'neutral';
  };
  text: string;
  time: string;
}

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ko' | 'en';
  isDarkMode: boolean;
}

// 샘플 유저 데이터
const sampleUsers = [
  { name: 'CryptoKing', avatar: '👑', type: 'bull' as const },
  { name: 'BearHunter', avatar: '🐻', type: 'bear' as const },
  { name: 'MoonBoy', avatar: '🚀', type: 'bull' as const },
  { name: 'Trader99', avatar: '📈', type: 'neutral' as const },
  { name: 'BitFan', avatar: '₿', type: 'bull' as const },
  { name: 'ShortKing', avatar: '📉', type: 'bear' as const },
  { name: 'Diamond', avatar: '💎', type: 'neutral' as const },
  { name: 'WhaleAlert', avatar: '🐋', type: 'bull' as const },
];

// 샘플 메시지
const sampleMessages = {
  ko: [
    { text: '이번 라운드 <span class="bull-text">BULL</span> 간다!' },
    { text: '<span class="bear-text">BEAR</span> 찍었어 ㅋㅋ' },
    { text: '와 방금 $500 땄다 🎉' },
    { text: '이번엔 <span class="bull-text">상승</span>할듯?' },
    { text: '차트 보니까 <span class="bear-text">하락</span>각인데' },
    { text: '올인 가즈아!' },
    { text: '조심해 변동성 크다' },
    { text: '연속 3연승 중 🔥' },
    { text: 'GG 졌다 ㅠㅠ' },
    { text: '다음 라운드가 기회다' },
  ],
  en: [
    { text: 'Going <span class="bull-text">BULL</span> this round!' },
    { text: 'I bet <span class="bear-text">BEAR</span> lol' },
    { text: 'Just won $500! 🎉' },
    { text: 'Looks like <span class="bull-text">UP</span> trend?' },
    { text: 'Chart says <span class="bear-text">DOWN</span> imo' },
    { text: 'All in! Let\'s go!' },
    { text: 'Be careful, high volatility' },
    { text: '3 wins in a row 🔥' },
    { text: 'GG I lost ㅠㅠ' },
    { text: 'Next round is the chance' },
  ],
};

export function ChatOverlay({ isOpen, onClose, lang, isDarkMode }: ChatOverlayProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateMessage = useCallback((): ChatMessage => {
    const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
    const msgList = sampleMessages[lang];
    const msg = msgList[Math.floor(Math.random() * msgList.length)];
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    return {
      id: `${Date.now()}-${Math.random()}`,
      user,
      text: msg.text,
      time,
    };
  }, [lang]);

  const addMessage = useCallback((scroll = true) => {
    const newMsg = generateMessage();
    setMessages(prev => {
      const updated = [...prev, newMsg];
      // 최대 50개 메시지 유지
      if (updated.length > 50) updated.shift();
      return updated;
    });

    if (scroll && messagesRef.current) {
      setTimeout(() => {
        messagesRef.current?.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [generateMessage]);

  // 초기 메시지 로드 및 시뮬레이션 시작
  useEffect(() => {
    if (isOpen) {
      // 초기 메시지 5개 생성
      const initialMessages: ChatMessage[] = [];
      for (let i = 0; i < 5; i++) {
        initialMessages.push(generateMessage());
      }
      setMessages(initialMessages);

      // 랜덤 간격으로 메시지 추가
      const addRandomMessage = () => {
        if (isOpen) {
          addMessage(true);
        }
        const delay = 3000 + Math.random() * 5000; // 3-8초 간격
        intervalRef.current = setTimeout(addRandomMessage, delay);
      };
      intervalRef.current = setTimeout(addRandomMessage, 2000);

      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    }
  }, [isOpen, generateMessage, addMessage]);

  // 메시지 영역 스크롤
  useEffect(() => {
    if (messagesRef.current && !isCollapsed) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isCollapsed]);

  if (!isOpen) return null;

  const t = {
    ko: { title: '실시간 채팅', login: '지갑 연결 필요' },
    en: { title: 'Live Chat', login: 'Connect wallet to chat' },
  }[lang];

  return (
    <div
      className={`absolute top-2.5 left-2.5 w-[260px] rounded-xl border z-50 flex flex-col transition-all duration-300 overflow-hidden ${
        isCollapsed ? 'max-h-[44px]' : 'max-h-[400px]'
      }`}
      style={{
        background: 'rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors flex-shrink-0"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className="font-['Orbitron'] text-xs font-semibold text-[#fbbf24] flex items-center gap-2">
          <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
          {t.title}
          <span className={`text-[0.7rem] text-white/50 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
            ▲
          </span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-6 h-6 rounded-full bg-white/10 border-none text-white/50 text-xs cursor-pointer flex items-center justify-center hover:bg-[#ef4444] hover:text-white transition-all"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isCollapsed && (
        <>
          <div
            ref={messagesRef}
            className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2.5 flex flex-col gap-1.5 min-h-[200px]"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.2) transparent',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-2 animate-[chatFadeIn_0.3s_ease]"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] flex-shrink-0 ${
                    msg.user.type === 'bull'
                      ? 'bg-[#22c55e]/20'
                      : msg.user.type === 'bear'
                      ? 'bg-[#ef4444]/20'
                      : 'bg-[#fbbf24]/20'
                  }`}
                >
                  {msg.user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.7rem] font-semibold text-gray-500 mb-0.5">
                    {msg.user.name}{' '}
                    <span className="text-[0.6rem] opacity-60">{msg.time}</span>
                  </div>
                  <div
                    className="text-xs text-white leading-relaxed break-words"
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Input (disabled) */}
          <div className="px-2.5 py-1.5 border-t border-white/10">
            <div className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs cursor-pointer hover:bg-white/10 transition-colors">
              🔒 <span>{t.login}</span>
            </div>
          </div>
        </>
      )}

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes chatFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

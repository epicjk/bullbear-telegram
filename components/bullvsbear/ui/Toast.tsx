'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

// Toast Types
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'win' | 'lose' | 'tie' | 'bull' | 'bear';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  amount?: number;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, amount?: number, duration?: number) => void;
  showWinToast: (amount: number) => void;
  showLoseToast: (amount: number) => void;
  showTieToast: () => void;
  showBullWinToast: (round: number, closePrice: number) => void;
  showBearWinToast: (round: number, closePrice: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, amount?: number, duration = 3000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message, amount, duration }]);

    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const showWinToast = useCallback((amount: number) => {
    showToast('win', 'YOU WIN!', amount, 4000);
  }, [showToast]);

  const showLoseToast = useCallback((amount: number) => {
    showToast('lose', 'You Lost', amount, 3000);
  }, [showToast]);

  const showTieToast = useCallback(() => {
    showToast('tie', 'TIE! Bet Refunded', undefined, 3000);
  }, [showToast]);

  const showBullWinToast = useCallback((round: number, closePrice: number) => {
    showToast('bull', `Round #${round} · BULL WIN!`, closePrice, 4000);
  }, [showToast]);

  const showBearWinToast = useCallback((round: number, closePrice: number) => {
    showToast('bear', `Round #${round} · BEAR WIN!`, closePrice, 4000);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showWinToast, showLoseToast, showTieToast, showBullWinToast, showBearWinToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Container
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Individual Toast Item
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTime = (toast.duration || 3000) - 300;
    const timer = setTimeout(() => setIsExiting(true), exitTime);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  const getToastStyle = () => {
    switch (toast.type) {
      case 'win':
        return {
          bg: 'bg-gradient-to-r from-[#22c55e] to-[#16a34a]',
          border: 'border-[#4ade80]',
          icon: '🎉',
          glow: 'shadow-[0_0_30px_rgba(34,197,94,0.5)]',
        };
      case 'lose':
        return {
          bg: 'bg-gradient-to-r from-[#ef4444] to-[#dc2626]',
          border: 'border-[#f87171]',
          icon: '😢',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
        };
      case 'tie':
        return {
          bg: 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]',
          border: 'border-[#fcd34d]',
          icon: '🔄',
          glow: 'shadow-[0_0_20px_rgba(251,191,36,0.4)]',
        };
      case 'bull':
        return {
          bg: 'bg-gradient-to-r from-[#22c55e]/90 to-[#16a34a]/90',
          border: 'border-[#22c55e]',
          icon: '🐂',
          glow: 'shadow-[0_0_30px_rgba(34,197,94,0.6)]',
        };
      case 'bear':
        return {
          bg: 'bg-gradient-to-r from-[#ef4444]/90 to-[#dc2626]/90',
          border: 'border-[#ef4444]',
          icon: '🐻',
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.6)]',
        };
      case 'success':
        return {
          bg: 'bg-[#22c55e]/90',
          border: 'border-[#22c55e]',
          icon: '✓',
          glow: '',
        };
      case 'error':
        return {
          bg: 'bg-[#ef4444]/90',
          border: 'border-[#ef4444]',
          icon: '✕',
          glow: '',
        };
      case 'warning':
        return {
          bg: 'bg-[#fbbf24]/90',
          border: 'border-[#fbbf24]',
          icon: '⚠',
          glow: '',
        };
      default:
        return {
          bg: 'bg-[#3b82f6]/90',
          border: 'border-[#3b82f6]',
          icon: 'ℹ',
          glow: '',
        };
    }
  };

  const style = getToastStyle();
  const isWinType = toast.type === 'win';
  const isBullBear = toast.type === 'bull' || toast.type === 'bear';

  return (
    <div
      className={`
        pointer-events-auto
        ${style.bg} ${style.glow}
        border-2 ${style.border}
        rounded-xl backdrop-blur-sm
        transform transition-all duration-300
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        ${isWinType ? 'animate-[winToastBounce_0.5s_ease-out]' : 'animate-[toastSlideIn_0.3s_ease-out]'}
        ${isBullBear ? 'min-w-[280px]' : 'min-w-[200px]'}
      `}
      onClick={() => onRemove(toast.id)}
    >
      {isWinType ? (
        // WIN Toast - 화려한 스타일
        <div className="p-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl animate-bounce">{style.icon}</span>
            <span className="text-2xl font-['Orbitron'] font-black text-white drop-shadow-lg">
              {toast.message}
            </span>
            <span className="text-4xl animate-bounce">{style.icon}</span>
          </div>
          {toast.amount && (
            <div
              className="text-3xl font-['Orbitron'] font-black text-white animate-[winAmountPulse_0.5s_ease-out]"
              style={{ textShadow: '0 0 20px rgba(255,255,255,0.8)' }}
            >
              +${toast.amount.toFixed(2)}
            </div>
          )}
          {/* Confetti effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-[confetti_1s_ease-out_forwards]"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '50%',
                  backgroundColor: ['#fbbf24', '#22c55e', '#3b82f6', '#ef4444', '#a855f7'][i % 5],
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </div>
      ) : isBullBear ? (
        // BULL/BEAR Round End Toast
        <div className="p-4 flex items-center gap-4">
          <span className="text-5xl">{style.icon}</span>
          <div className="flex flex-col">
            <span className="text-lg font-['Orbitron'] font-bold text-white">
              {toast.message}
            </span>
            {toast.amount && (
              <span className="text-sm text-white/80">
                Close: ${toast.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>
      ) : (
        // Default Toast
        <div className="p-3 flex items-center gap-3">
          <span className="text-2xl">{style.icon}</span>
          <div className="flex flex-col">
            <span className="font-semibold text-white">{toast.message}</span>
            {toast.amount !== undefined && (
              <span className="text-sm text-white/80">
                {toast.type === 'lose' ? '-' : ''}${Math.abs(toast.amount).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// CSS Animations (add to globals.css)
export const toastAnimations = `
@keyframes toastSlideIn {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes winToastBounce {
  0% { opacity: 0; transform: scale(0.5) translateX(100%); }
  50% { transform: scale(1.1) translateX(0); }
  70% { transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes winAmountPulse {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes confetti {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
}
`;

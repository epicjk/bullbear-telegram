'use client';

import { ReactNode, useEffect } from 'react';
import { COLORS } from '../constants/theme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}: ModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[960] flex items-center justify-center bg-black/85"
      onClick={onClose}
    >
      <div
        className={`bg-[#12121a] rounded-2xl border border-white/10 w-[95%] ${maxWidthClasses[maxWidth]} max-h-[85vh] flex flex-col shadow-2xl animate-[modalFadeIn_0.3s_ease-out]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#fbbf24] font-['Orbitron'] font-bold">
            <span>{icon}</span>
            <span>{title}</span>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#ef4444] hover:rotate-90 transition-all"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// 간단한 확인 모달
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'warning';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'danger',
}: ConfirmModalProps) {
  const variantColors = {
    danger: 'bg-[#ef4444] hover:bg-[#dc2626]',
    success: 'bg-[#22c55e] hover:bg-[#16a34a]',
    warning: 'bg-[#fbbf24] hover:bg-[#f59e0b] text-black',
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[970] flex items-center justify-center bg-black/85"
      onClick={onClose}
    >
      <div
        className="bg-[#12121a] rounded-2xl border border-white/10 w-[90%] max-w-sm p-6 shadow-2xl animate-[modalFadeIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 rounded-xl text-white font-semibold transition-colors ${variantColors[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

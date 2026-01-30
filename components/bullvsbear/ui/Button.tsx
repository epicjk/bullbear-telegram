'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'bull' | 'bear' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles = {
  bull: 'bg-gradient-to-br from-[#14532d] via-[#166534] to-[#22c55e] text-white border-[rgba(34,197,94,0.3)] hover:border-[#22c55e] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]',
  bear: 'bg-gradient-to-br from-[#7f1d1d] via-[#991b1b] to-[#ef4444] text-white border-[rgba(239,68,68,0.3)] hover:border-[#ef4444] hover:shadow-[0_0_40px_rgba(239,68,68,0.5)]',
  primary: 'bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white hover:shadow-[0_10px_30px_rgba(168,85,247,0.4)]',
  secondary: 'bg-white/10 text-white border-white/10 hover:bg-white/20',
  ghost: 'bg-transparent text-white hover:bg-white/10',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-base rounded-xl',
  lg: 'px-6 py-3.5 text-lg rounded-2xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        font-['Orbitron'] font-bold tracking-wider
        border-[3px] flex items-center justify-center gap-2
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:-translate-y-0.5 hover:scale-[1.02]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin">⟳</span>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}

// 아이콘 버튼
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'danger';
}

const iconSizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

const iconVariants = {
  default: 'bg-white/10 hover:bg-white/20 text-white',
  primary: 'bg-[#a855f7] hover:bg-[#9333ea] text-white',
  danger: 'bg-[#ef4444] hover:bg-[#dc2626] text-white',
};

export function IconButton({
  icon,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`
        rounded-xl border border-white/10
        flex items-center justify-center
        transition-all duration-200
        hover:-translate-y-0.5
        disabled:opacity-50 disabled:cursor-not-allowed
        ${iconSizes[size]}
        ${iconVariants[variant]}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
}

// 프리셋 금액 버튼
interface PresetButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isActive?: boolean;
}

export function PresetButton({
  children,
  isActive,
  className = '',
  ...props
}: PresetButtonProps) {
  return (
    <button
      className={`
        py-2 px-3 rounded-lg font-['Orbitron'] font-bold text-sm
        transition-all duration-200
        ${isActive
          ? 'bg-[#fbbf24] text-black'
          : 'bg-white/10 text-white hover:bg-white/20'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

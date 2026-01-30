'use client';

import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'bull' | 'bear' | 'highlighted';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  isDarkMode?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  isDarkMode = true,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = isDarkMode
    ? 'bg-[#12121a] border-white/10'
    : 'bg-white border-gray-200';

  const variantStyles = {
    default: baseStyles,
    bull: `${baseStyles} border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.2)]`,
    bear: `${baseStyles} border-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.2)]`,
    highlighted: `${baseStyles} border-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.2)]`,
  };

  return (
    <div
      className={`
        rounded-2xl border
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// 스탯 카드 (숫자 표시용)
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: 'bull' | 'bear' | 'warning' | 'default';
  isDarkMode?: boolean;
}

const colorStyles = {
  bull: 'text-[#22c55e]',
  bear: 'text-[#ef4444]',
  warning: 'text-[#fbbf24]',
  default: 'text-white',
};

export function StatCard({
  label,
  value,
  icon,
  color = 'default',
  isDarkMode = true,
}: StatCardProps) {
  return (
    <div
      className={`
        rounded-lg p-3 text-center
        border border-white/[0.03]
        hover:border-white/[0.08] hover:-translate-y-0.5
        transition-all
        ${isDarkMode ? 'bg-[#0a0a0f]' : 'bg-gray-100'}
      `}
    >
      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 tracking-wider flex items-center justify-center gap-1`}>
        {icon}
        {label}
      </div>
      <div className={`font-['Orbitron'] font-bold text-2xl ${colorStyles[color]}`}>
        {value}
      </div>
    </div>
  );
}

// 배지 컴포넌트
interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

const badgeVariants = {
  default: 'bg-white/10 text-white',
  success: 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30',
  danger: 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30',
  warning: 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30',
  info: 'bg-[#00ccff]/20 text-[#00ccff] border-[#00ccff]/30',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-semibold border
        ${badgeVariants[variant]}
        ${badgeSizes[size]}
      `}
    >
      {children}
    </span>
  );
}

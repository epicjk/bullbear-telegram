'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface BalanceContextType {
  balance: number;
  setBalance: (balance: number) => void;
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
}

const BalanceContext = createContext<BalanceContextType>({
  balance: 1000,
  setBalance: () => {},
  addBalance: () => {},
  deductBalance: () => false,
});

const INITIAL_BALANCE = 1000; // 데모용 시작 잔액

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [balance, setBalanceState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bullbear_balance');
      return saved ? parseFloat(saved) : INITIAL_BALANCE;
    }
    return INITIAL_BALANCE;
  });

  const setBalance = useCallback((newBalance: number) => {
    setBalanceState(newBalance);
    localStorage.setItem('bullbear_balance', newBalance.toString());
  }, []);

  const addBalance = useCallback((amount: number) => {
    setBalanceState(prev => {
      const newBalance = prev + amount;
      localStorage.setItem('bullbear_balance', newBalance.toString());
      return newBalance;
    });
  }, []);

  const deductBalance = useCallback((amount: number): boolean => {
    if (balance < amount) return false;
    setBalanceState(prev => {
      const newBalance = prev - amount;
      localStorage.setItem('bullbear_balance', newBalance.toString());
      return newBalance;
    });
    return true;
  }, [balance]);

  return (
    <BalanceContext.Provider value={{ balance, setBalance, addBalance, deductBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  return useContext(BalanceContext);
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { Address, TonClient, JettonMaster, JettonWallet, fromNano } from '@ton/ton';

// TON Mainnet RPC endpoint
const TON_RPC_ENDPOINT = 'https://toncenter.com/api/v2/jsonRPC';

// jUSDT (Tether USD on TON) Jetton Master Address
const JUSDT_MASTER_ADDRESS = 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA';

interface WalletBalance {
  ton: string;
  jUsdt: string;
  isLoading: boolean;
  error: string | null;
}

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();
  const rawAddress = useTonAddress(false);
  
  const [balance, setBalance] = useState<WalletBalance>({
    ton: '0',
    jUsdt: '0',
    isLoading: false,
    error: null,
  });

  const isConnected = !!wallet;

  // 지갑 연결
  const connect = useCallback(async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Failed to open connect modal:', error);
    }
  }, [tonConnectUI]);

  // 지갑 연결 해제
  const disconnect = useCallback(async () => {
    try {
      await tonConnectUI.disconnect();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }, [tonConnectUI]);

  // TON 잔액 조회
  const fetchTonBalance = useCallback(async (address: string): Promise<string> => {
    try {
      const response = await fetch(TON_RPC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'getAddressBalance',
          params: { address },
        }),
      });
      
      const data = await response.json();
      if (data.result) {
        // nanoTON to TON
        return fromNano(data.result);
      }
      return '0';
    } catch (error) {
      console.error('Failed to fetch TON balance:', error);
      return '0';
    }
  }, []);

  // jUSDT 잔액 조회
  const fetchJusdtBalance = useCallback(async (ownerAddress: string): Promise<string> => {
    try {
      // 먼저 Jetton Wallet 주소를 가져옴
      const response = await fetch(TON_RPC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'runGetMethod',
          params: {
            address: JUSDT_MASTER_ADDRESS,
            method: 'get_wallet_address',
            stack: [
              ['tvm.Slice', ownerAddress],
            ],
          },
        }),
      });

      const data = await response.json();
      
      if (data.result && data.result.stack && data.result.stack[0]) {
        const jettonWalletAddress = data.result.stack[0][1]?.bytes;
        
        if (jettonWalletAddress) {
          // Jetton Wallet에서 잔액 조회
          const balanceResponse = await fetch(TON_RPC_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: 2,
              jsonrpc: '2.0',
              method: 'runGetMethod',
              params: {
                address: jettonWalletAddress,
                method: 'get_wallet_data',
                stack: [],
              },
            }),
          });

          const balanceData = await balanceResponse.json();
          
          if (balanceData.result && balanceData.result.stack && balanceData.result.stack[0]) {
            const balance = balanceData.result.stack[0][1];
            // jUSDT는 6 decimals
            return (parseInt(balance, 16) / 1e6).toFixed(2);
          }
        }
      }
      
      return '0';
    } catch (error) {
      console.error('Failed to fetch jUSDT balance:', error);
      return '0';
    }
  }, []);

  // 잔액 새로고침
  const refreshBalance = useCallback(async () => {
    if (!rawAddress) return;
    
    setBalance(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const [tonBalance, jusdtBalance] = await Promise.all([
        fetchTonBalance(rawAddress),
        fetchJusdtBalance(rawAddress),
      ]);
      
      setBalance({
        ton: tonBalance,
        jUsdt: jusdtBalance,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setBalance(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch balance',
      }));
    }
  }, [rawAddress, fetchTonBalance, fetchJusdtBalance]);

  // 트랜잭션 전송 (TON)
  const sendTonTransaction = useCallback(async (
    toAddress: string,
    amount: string, // TON 단위
    comment?: string
  ) => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10분 유효
      messages: [
        {
          address: toAddress,
          amount: (parseFloat(amount) * 1e9).toString(), // TON to nanoTON
          payload: comment ? btoa(comment) : undefined,
        },
      ],
    };

    try {
      const result = await tonConnectUI.sendTransaction(transaction);
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }, [wallet, tonConnectUI]);

  // jUSDT 전송 준비 (Jetton Transfer)
  const prepareJusdtTransfer = useCallback((
    toAddress: string,
    amount: string // USDT 단위
  ) => {
    // jUSDT는 6 decimals
    const jettonAmount = BigInt(Math.floor(parseFloat(amount) * 1e6));
    
    return {
      jettonMaster: JUSDT_MASTER_ADDRESS,
      toAddress,
      jettonAmount: jettonAmount.toString(),
      forwardAmount: '50000000', // 0.05 TON for forward
    };
  }, []);

  // 지갑 연결 시 자동으로 잔액 조회
  useEffect(() => {
    if (isConnected && rawAddress) {
      refreshBalance();
    } else {
      setBalance({
        ton: '0',
        jUsdt: '0',
        isLoading: false,
        error: null,
      });
    }
  }, [isConnected, rawAddress, refreshBalance]);

  return {
    // 연결 상태
    isConnected,
    wallet,
    address: userFriendlyAddress,
    rawAddress,
    
    // 잔액
    balance,
    refreshBalance,
    
    // 액션
    connect,
    disconnect,
    sendTonTransaction,
    prepareJusdtTransfer,
    
    // UI
    tonConnectUI,
  };
}

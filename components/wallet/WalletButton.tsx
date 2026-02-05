'use client';

import { useState } from 'react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { Wallet, LogOut, RefreshCw, Copy, Check, ChevronDown } from 'lucide-react';

export function WalletButton() {
  const { 
    isConnected, 
    address, 
    balance, 
    connect, 
    disconnect, 
    refreshBalance 
  } = useTonConnect();
  
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-blue-500/25"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 bg-[#1a1625]/80 border border-[#2d2640] rounded-xl text-white hover:bg-[#1a1625] transition-all"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <Wallet className="w-3 h-3" />
        </div>
        <span className="font-mono text-sm">{shortenAddress(address!)}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1625] border border-[#2d2640] rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Balance Section */}
            <div className="p-4 border-b border-[#2d2640]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs">Balance</span>
                <button
                  onClick={refreshBalance}
                  disabled={balance.isLoading}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${balance.isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                      T
                    </div>
                    <span className="text-white text-sm">TON</span>
                  </div>
                  <span className="text-white font-mono text-sm">
                    {parseFloat(balance.ton).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold">
                      $
                    </div>
                    <span className="text-white text-sm">jUSDT</span>
                  </div>
                  <span className="text-white font-mono text-sm">
                    {balance.jUsdt}
                  </span>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="p-3">
              <button
                onClick={handleCopyAddress}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#2d2640] transition-colors"
              >
                <span className="text-gray-300 text-sm font-mono">
                  {shortenAddress(address!)}
                </span>
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* Disconnect Button */}
            <div className="p-3 border-t border-[#2d2640]">
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Disconnect</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

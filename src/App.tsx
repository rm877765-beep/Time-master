import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StopwatchArena } from './components/StopwatchArena';
import { PassbookLedger } from './components/PassbookLedger';
import { StatsView } from './components/StatsView';
import { RulesView } from './components/RulesView';
import { WalletModal } from './components/WalletModal';
import { AttemptRecord, UserStats, WalletTransaction } from './types/game';
import {
  getStoredBalance,
  saveBalance,
  getTransactions,
  addTransaction,
  getStats,
  updateStats,
  saveAttempt,
} from './utils/storage';
import { sound } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<'ARENA' | 'RULES' | 'LEDGER' | 'STATS'>('ARENA');
  const [balance, setBalance] = useState<number>(100);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [stats, setStats] = useState<UserStats>({
    gamesPlayed: 0,
    jackpotsWon: 0,
    consolationsWon: 0,
    totalWagered: 0,
    totalWon: 0,
    bestDeltaSeconds: null,
    recentAttempts: [],
  });
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Initialize on load
  useEffect(() => {
    const initialBal = getStoredBalance();
    setBalance(initialBal);
    setTransactions(getTransactions());
    setStats(getStats());
    setIsMuted(sound.getMuted());
  }, []);

  // Deduct game entry fee
  const handleDeductFee = (fee: number, title: string): boolean => {
    if (balance < fee) return false;
    const newBal = balance - fee;
    setBalance(newBal);
    const tx = addTransaction('ENTRY_FEE', fee, title, newBal);
    setTransactions((prev) => [tx, ...prev]);
    return true;
  };

  // Credit win payout
  const handleCreditPayout = (payout: number, title: string, isJackpot: boolean) => {
    const newBal = balance + payout;
    setBalance(newBal);
    const txType = isJackpot ? 'JACKPOT_WIN' : 'CONSOLATION_WIN';
    const tx = addTransaction(txType, payout, title, newBal);
    setTransactions((prev) => [tx, ...prev]);
  };

  // Record completed attempt
  const handleRecordAttempt = (attempt: AttemptRecord) => {
    saveAttempt(attempt);
    const updatedStats = updateStats(attempt);
    setStats(updatedStats);
  };

  // Deposit cash via simulated UPI
  const handleDeposit = (amount: number, method: string) => {
    const newBal = balance + amount;
    setBalance(newBal);
    saveBalance(newBal);
    const upiRef = 'UPI' + Math.floor(1000000000 + Math.random() * 9000000000);
    const tx = addTransaction('DEPOSIT', amount, `UPI Deposit via ${method}`, newBal, upiRef);
    setTransactions((prev) => [tx, ...prev]);
  };

  // Withdraw cash via simulated UPI
  const handleWithdraw = (amount: number, upiId: string): boolean => {
    if (amount > balance) return false;
    const newBal = balance - amount;
    setBalance(newBal);
    saveBalance(newBal);
    const upiRef = 'IMPS' + Math.floor(1000000000 + Math.random() * 9000000000);
    const tx = addTransaction('WITHDRAWAL', amount, `Payout to ${upiId}`, newBal, upiRef);
    setTransactions((prev) => [tx, ...prev]);
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 3-Zone Top Navigation Contract */}
      <Header
        balance={balance}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDeposit={() => setIsWalletOpen(true)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Mobile Navigation Sub-bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 bg-slate-900 border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('ARENA');
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'ARENA' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Game Arena
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('RULES');
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'RULES' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Rules
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('LEDGER');
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'LEDGER' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Passbook
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('STATS');
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'STATS' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Stats
        </button>
      </div>

      {/* Main View Area */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto w-full">
        {activeTab === 'ARENA' && (
          <StopwatchArena
            balance={balance}
            onDeductFee={handleDeductFee}
            onCreditPayout={handleCreditPayout}
            onRecordAttempt={handleRecordAttempt}
            onOpenDeposit={() => setIsWalletOpen(true)}
          />
        )}

        {activeTab === 'RULES' && (
          <RulesView onPlayNow={() => setActiveTab('ARENA')} />
        )}

        {activeTab === 'LEDGER' && (
          <PassbookLedger
            transactions={transactions}
            balance={balance}
            onOpenDeposit={() => setIsWalletOpen(true)}
          />
        )}

        {activeTab === 'STATS' && (
          <StatsView stats={stats} onPlayNow={() => setActiveTab('ARENA')} />
        )}
      </main>

      {/* Simulated UPI & Bank Wallet Modal */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balance={balance}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
      />

      {/* Quiet Footer per Constitution */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 sm:px-8 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ChronoPay Arcade · Precision Chronometer Skill Gaming</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>₹10 Entry → ₹100 Jackpot</span>
            <span>·</span>
            <span>Provably Fair Millisecond Engine</span>
            <span>·</span>
            <button
              onClick={() => setIsWalletOpen(true)}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Simulated UPI Wallet
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

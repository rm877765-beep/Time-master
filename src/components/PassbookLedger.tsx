import React, { useState } from 'react';
import { WalletTransaction } from '../types/game';
import { ArrowDownLeft, ArrowUpRight, Trophy, Sparkles, Gift } from 'lucide-react';

interface PassbookLedgerProps {
  transactions: WalletTransaction[];
  balance: number;
  onOpenDeposit: () => void;
}

export const PassbookLedger: React.FC<PassbookLedgerProps> = ({
  transactions,
  balance,
  onOpenDeposit,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'WINS' | 'ENTRIES' | 'BANKING'>('ALL');

  const filtered = transactions.filter((tx) => {
    if (filter === 'WINS') return tx.type === 'JACKPOT_WIN' || tx.type === 'CONSOLATION_WIN';
    if (filter === 'ENTRIES') return tx.type === 'ENTRY_FEE';
    if (filter === 'BANKING') return tx.type === 'DEPOSIT' || tx.type === 'WITHDRAWAL' || tx.type === 'WELCOME_BONUS';
    return true;
  });

  const getTxIcon = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'JACKPOT_WIN':
        return <Trophy className="w-4 h-4 text-emerald-400" />;
      case 'CONSOLATION_WIN':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'WELCOME_BONUS':
        return <Gift className="w-4 h-4 text-blue-400" />;
      case 'DEPOSIT':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="w-4 h-4 text-rose-400" />;
      case 'ENTRY_FEE':
      default:
        return <ArrowUpRight className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Overview Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
            Current Passbook Balance
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold font-['JetBrains_Mono'] text-white mt-1">
            ₹{balance.toFixed(2)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log of all game entries, payouts, and UPI transfers.
          </p>
        </div>
        <button
          onClick={onOpenDeposit}
          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider font-['Chakra_Petch'] transition-all shadow-md cursor-pointer"
        >
          Add / Withdraw Cash
        </button>
      </div>

      {/* Filter Tabs (Interactive filter tab per constitution) */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            filter === 'ALL' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Activity ({transactions.length})
        </button>
        <button
          onClick={() => setFilter('WINS')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            filter === 'WINS' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Payouts & Wins
        </button>
        <button
          onClick={() => setFilter('ENTRIES')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            filter === 'ENTRIES' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Game Fees (₹10)
        </button>
        <button
          onClick={() => setFilter('BANKING')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            filter === 'BANKING' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Deposits & Payouts
        </button>
      </div>

      {/* Transactions Table / List */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No transactions found in this category.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filtered.map((tx) => {
              const isPositive = tx.type === 'JACKPOT_WIN' || tx.type === 'CONSOLATION_WIN' || tx.type === 'DEPOSIT' || tx.type === 'WELCOME_BONUS';
              const dateStr = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-850/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {getTxIcon(tx.type)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {tx.title}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {dateStr} {tx.upiRef ? `· Ref: ${tx.upiRef}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-bold text-sm ${isPositive ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {isPositive ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Bal: ₹{tx.balanceAfter.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

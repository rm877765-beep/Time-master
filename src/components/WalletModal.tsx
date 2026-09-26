import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { sound } from '../utils/audio';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onDeposit: (amount: number, method: string) => void;
  onWithdraw: (amount: number, upiId: string) => boolean;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  balance,
  onDeposit,
  onWithdraw,
}) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('50');
  const [upiId, setUpiId] = useState<string>('rm877765@upi');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('Google Pay');

  if (!isOpen) return null;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;
    sound.playCoin();
    onDeposit(depositAmount, selectedUpiApp);
    setSuccessMessage(`₹${depositAmount} added successfully via ${selectedUpiApp}!`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMessage('Please enter a valid withdrawal amount.');
      return;
    }
    if (amt > balance) {
      setErrorMessage(`Insufficient balance. Current balance is ₹${balance.toFixed(2)}.`);
      return;
    }
    if (!upiId.includes('@')) {
      setErrorMessage('Please enter a valid VPA / UPI ID (e.g. yourname@okhdfcbank).');
      return;
    }

    const success = onWithdraw(amt, upiId);
    if (success) {
      sound.playCoin();
      setSuccessMessage(`₹${amt} payout initiated instantly to ${upiId}!`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Chakra_Petch']">
              CHRONOPAY WALLET
            </h3>
            <p className="text-xs text-slate-400">Simulated Instant UPI Banking & Rewards Ledger</p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Display */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
              Available Balance
            </span>
            <div className="text-3xl font-extrabold font-['JetBrains_Mono'] text-white mt-1">
              ₹{balance.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Instant UPI Ready</span>
          </div>
        </div>

        {/* Tabs: Deposit vs Withdraw */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('DEPOSIT');
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'DEPOSIT'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit (Add Cash)</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('WITHDRAW');
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'WITHDRAW'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw (Cash Out)</span>
          </button>
        </div>

        {/* Success / Error Feedback */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* DEPOSIT VIEW */}
        {activeTab === 'DEPOSIT' && (
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-2">
                Select Top-Up Amount (₹)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setDepositAmount(amt);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${
                      depositAmount === amt
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-2">
                Choose Simulated UPI Gateway
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedUpiApp(app);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                      selectedUpiApp === app
                        ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" /> Instant QR & VPA simulation
              </span>
              <span className="text-emerald-400 font-semibold">0% Surcharge</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm font-['Chakra_Petch'] cursor-pointer transition-all shadow-lg shadow-amber-950/40"
            >
              Add ₹{depositAmount} via {selectedUpiApp}
            </button>
          </form>
        )}

        {/* WITHDRAW VIEW */}
        {activeTab === 'WITHDRAW' && (
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Enter Amount to Cash Out (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="10"
                  max={balance}
                  step="1"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full pl-8 pr-16 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                  placeholder="50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(String(Math.floor(balance)))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Recipient UPI ID / VPA
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                placeholder="username@okhdfcbank"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Direct IMPS / UPI payout credited within 2 seconds.
              </p>
            </div>

            <button
              type="submit"
              disabled={balance < 10}
              className={`w-full py-3.5 px-4 rounded-xl text-slate-950 font-bold text-sm font-['Chakra_Petch'] transition-all shadow-lg ${
                balance < 10
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 cursor-pointer shadow-amber-950/40'
              }`}
            >
              Withdraw ₹{withdrawAmount || '0'} to UPI
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

import { AttemptRecord, UserStats, WalletTransaction } from '../types/game';

const WALLET_KEY = 'chronopay_wallet_balance';
const TRANSACTIONS_KEY = 'chronopay_transactions';
const ATTEMPTS_KEY = 'chronopay_attempts';
const STATS_KEY = 'chronopay_stats';

const DEFAULT_WELCOME_BALANCE = 100; // Free ₹100 sign-up bonus to immediately start playing

export function getStoredBalance(): number {
  const val = localStorage.getItem(WALLET_KEY);
  if (val === null) {
    // Initialize welcome bonus
    localStorage.setItem(WALLET_KEY, String(DEFAULT_WELCOME_BALANCE));
    const initialTx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      timestamp: Date.now(),
      type: 'WELCOME_BONUS',
      amount: DEFAULT_WELCOME_BALANCE,
      title: 'Welcome Bonus Claimed',
      balanceAfter: DEFAULT_WELCOME_BALANCE,
    };
    saveTransactions([initialTx]);
    return DEFAULT_WELCOME_BALANCE;
  }
  const parsed = parseFloat(val);
  return isNaN(parsed) ? DEFAULT_WELCOME_BALANCE : parsed;
}

export function saveBalance(balance: number): void {
  localStorage.setItem(WALLET_KEY, balance.toFixed(2));
}

export function getTransactions(): WalletTransaction[] {
  const val = localStorage.getItem(TRANSACTIONS_KEY);
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

export function saveTransactions(txs: WalletTransaction[]): void {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs.slice(0, 100)));
}

export function addTransaction(
  type: WalletTransaction['type'],
  amount: number,
  title: string,
  newBalance: number,
  upiRef?: string
): WalletTransaction {
  const tx: WalletTransaction = {
    id: 'tx_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
    timestamp: Date.now(),
    type,
    amount,
    title,
    balanceAfter: newBalance,
    upiRef,
  };
  const list = getTransactions();
  list.unshift(tx);
  saveTransactions(list);
  saveBalance(newBalance);
  return tx;
}

export function getAttempts(): AttemptRecord[] {
  const val = localStorage.getItem(ATTEMPTS_KEY);
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

export function saveAttempt(record: AttemptRecord): void {
  const list = getAttempts();
  list.unshift(record);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(list.slice(0, 150)));
}

export function getStats(): UserStats {
  const val = localStorage.getItem(STATS_KEY);
  if (!val) {
    return {
      gamesPlayed: 0,
      jackpotsWon: 0,
      consolationsWon: 0,
      totalWagered: 0,
      totalWon: 0,
      bestDeltaSeconds: null,
      recentAttempts: [],
    };
  }
  try {
    return JSON.parse(val);
  } catch {
    return {
      gamesPlayed: 0,
      jackpotsWon: 0,
      consolationsWon: 0,
      totalWagered: 0,
      totalWon: 0,
      bestDeltaSeconds: null,
      recentAttempts: [],
    };
  }
}

export function updateStats(attempt: AttemptRecord): UserStats {
  const current = getStats();
  const absDelta = Math.abs(attempt.deltaSeconds);
  const newBest =
    current.bestDeltaSeconds === null
      ? absDelta
      : Math.min(current.bestDeltaSeconds, absDelta);

  const updated: UserStats = {
    gamesPlayed: current.gamesPlayed + 1,
    jackpotsWon: current.jackpotsWon + (attempt.isJackpot ? 1 : 0),
    consolationsWon: current.consolationsWon + (attempt.isConsolation ? 1 : 0),
    totalWagered: current.totalWagered + attempt.entryFee,
    totalWon: current.totalWon + attempt.payout,
    bestDeltaSeconds: newBest,
    recentAttempts: [attempt, ...current.recentAttempts.slice(0, 19)],
  };

  localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  return updated;
}

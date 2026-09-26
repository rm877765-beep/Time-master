export type GameMode = 'CLASSIC_10S' | 'SYSTEM_ROULETTE' | 'BLIND_CLOCK' | 'PRACTICE';

export type Difficulty = 'ARCADE' | 'PRO' | 'CASUAL';

export interface StakeTier {
  id: string;
  name: string;
  entryFee: number;
  jackpotPayout: number;
  consolationPayout: number;
}

export interface DifficultyConfig {
  name: string;
  toleranceMs: number; // e.g. 40ms = 0.040s
  consolationToleranceMs: number; // e.g. 80ms = 0.080s
  description: string;
}

export interface AttemptRecord {
  id: string;
  timestamp: number;
  mode: GameMode;
  targetSeconds: number;
  stoppedSeconds: number;
  deltaSeconds: number; // stoppedSeconds - targetSeconds
  absDeltaMs: number;
  isJackpot: boolean;
  isConsolation: boolean;
  entryFee: number;
  payout: number;
  netGain: number;
}

export type TransactionType = 'WELCOME_BONUS' | 'ENTRY_FEE' | 'JACKPOT_WIN' | 'CONSOLATION_WIN' | 'DEPOSIT' | 'WITHDRAWAL';

export interface WalletTransaction {
  id: string;
  timestamp: number;
  type: TransactionType;
  amount: number;
  title: string;
  balanceAfter: number;
  upiRef?: string;
}

export interface UserStats {
  gamesPlayed: number;
  jackpotsWon: number;
  consolationsWon: number;
  totalWagered: number;
  totalWon: number;
  bestDeltaSeconds: number | null; // closest to 0
  recentAttempts: AttemptRecord[];
}

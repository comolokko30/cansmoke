export interface CigaretteLogItem {
  id: string;
  timestamp: number; // epoch ms
  timeStr: string;   // HH:mm
  note?: string;
}

export interface DayRecord {
  dateKey: string;     // YYYY-MM-DD
  smokedCount: number;
  limit: number;
  penaltyPerExcess: number;
  penaltyAmount: number; // calculated: Math.max(0, smokedCount - limit) * penaltyPerExcess
  isSuccessful: boolean; // smokedCount <= limit
  logs: CigaretteLogItem[];
}

export interface VaultTransaction {
  id: string;
  dateKey: string;
  timestamp: number;
  amount: number; // positive = added (penalty or deposit), negative = spent
  type: 'penalty' | 'manual_deposit' | 'manual_spend';
  description: string;
}

export interface AppSettings {
  userName: string;
  dailyLimit: number;
  penaltyPerExcess: number;
  weekStartDay: 1 | 0; // 1 = Monday, 0 = Sunday
  vaultTargetName: string;
  vaultTargetAmount: number;
  isEncrypted: boolean;
  encryptionKeyHint: string;
}

export interface AppState {
  settings: AppSettings;
  records: Record<string, DayRecord>; // keyed by "YYYY-MM-DD"
  vaultBalance: number;
  vaultTransactions: VaultTransaction[];
}

import { AppState, DayRecord, VaultTransaction } from '../types';
import { getTodayKey } from './dateUtils';

const STORAGE_KEY = 'breathe_and_save_v2';
const ENCRYPTION_SALT = 'BreatheAndSave2026';

export function getDefaultAppState(): AppState {
  const todayKey = getTodayKey();
  const startDate = '2026-09-01'; // 1 Eylül 2026, Salı

  const defaultRecord: DayRecord = {
    dateKey: todayKey,
    smokedCount: 0,
    limit: 7,
    penaltyPerExcess: 50,
    penaltyAmount: 0,
    isSuccessful: true,
    logs: [],
  };

  const records: Record<string, DayRecord> = {
    [todayKey]: defaultRecord,
  };

  // 1 Eylül 2026 Salı başlangıç günü ve başarılı (tikli)
  records['2026-09-01'] = {
    dateKey: '2026-09-01',
    smokedCount: 0,
    limit: 7,
    penaltyPerExcess: 50,
    penaltyAmount: 0,
    isSuccessful: true,
    logs: [],
  };

  return {
    settings: {
      userName: 'Murat',
      partnerName: 'Sevgilim',
      dailyLimit: 7,
      penaltyPerExcess: 50,
      weekStartDay: 1, // Pazartesi
      vaultTargetName: 'Birlikte Hafta Sonu Tatili 🏖️',
      vaultTargetAmount: 2500,
      startDate: startDate,
      roomId: 'couple-main',
      isEncrypted: false,
      encryptionKeyHint: '',
    },
    records,
    vaultBalance: 0,
    vaultTransactions: [],
    activeActor: 'Sevgilim',
    lastSyncedAt: Date.now(),
  };
}

// Obfuscation / Local storage helper
function encryptPayload(data: string, key = ENCRYPTION_SALT): string {
  try {
    const chars = [];
    for (let i = 0; i < data.length; i++) {
      const c = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      chars.push(String.fromCharCode(c));
    }
    return btoa(unescape(encodeURIComponent(chars.join(''))));
  } catch (e) {
    return btoa(unescape(encodeURIComponent(data)));
  }
}

function decryptPayload(data: string, key = ENCRYPTION_SALT): string {
  try {
    const raw = decodeURIComponent(escape(atob(data)));
    const chars = [];
    for (let i = 0; i < raw.length; i++) {
      const c = raw.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      chars.push(String.fromCharCode(c));
    }
    return chars.join('');
  } catch (e) {
    try {
      return decodeURIComponent(escape(atob(data)));
    } catch {
      return data;
    }
  }
}

export function loadAppState(): AppState {
  try {
    if (localStorage.getItem('breathe_and_save_v1')) {
      localStorage.removeItem('breathe_and_save_v1');
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const initial = getDefaultAppState();
      saveAppState(initial);
      return initial;
    }

    let parsed: any = null;
    if (saved.startsWith('{')) {
      parsed = JSON.parse(saved);
    } else {
      const decrypted = decryptPayload(saved);
      parsed = JSON.parse(decrypted);
    }

    if (!parsed.settings) {
      parsed.settings = getDefaultAppState().settings;
    } else {
      if (!parsed.settings.partnerName) parsed.settings.partnerName = 'Sevgilim';
      parsed.settings.startDate = '2026-09-01';
      if (!parsed.settings.roomId) parsed.settings.roomId = 'couple-main';
    }

    const todayKey = getTodayKey();
    if (!parsed.records) parsed.records = {};

    if (!parsed.records[todayKey]) {
      parsed.records[todayKey] = {
        dateKey: todayKey,
        smokedCount: 0,
        limit: parsed.settings.dailyLimit || 7,
        penaltyPerExcess: parsed.settings.penaltyPerExcess || 50,
        penaltyAmount: 0,
        isSuccessful: true,
        logs: [],
      };
    }

    // Ensure 1 Eylül 2026 is always initialized and successful (tikli)
    if (!parsed.records['2026-09-01']) {
      parsed.records['2026-09-01'] = {
        dateKey: '2026-09-01',
        smokedCount: 0,
        limit: parsed.settings.dailyLimit || 7,
        penaltyPerExcess: parsed.settings.penaltyPerExcess || 50,
        penaltyAmount: 0,
        isSuccessful: true,
        logs: [],
      };
    }

    if (!Array.isArray(parsed.vaultTransactions)) {
      parsed.vaultTransactions = [];
    }

    if (typeof parsed.vaultBalance !== 'number') {
      parsed.vaultBalance = 0;
    }

    return parsed;
  } catch (e) {
    console.error('Failed to load app state, falling back to default', e);
    const initial = getDefaultAppState();
    return initial;
  }
}

export function saveAppState(state: AppState): void {
  try {
    const raw = JSON.stringify(state);
    if (state.settings.isEncrypted) {
      const encrypted = encryptPayload(raw);
      localStorage.setItem(STORAGE_KEY, encrypted);
    } else {
      localStorage.setItem(STORAGE_KEY, raw);
    }
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function exportBackup(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importBackup(jsonString: string): AppState {
  const parsed = JSON.parse(jsonString);
  if (!parsed.settings || !parsed.records) {
    throw new Error('Geçersiz yedek dosyası formatı.');
  }
  saveAppState(parsed);
  return parsed;
}

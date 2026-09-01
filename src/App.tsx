import React, { useState, useEffect, useMemo } from 'react';
import { AppState, CigaretteLogItem, DayRecord, VaultTransaction } from './types';
import {
  getDefaultAppState,
  loadAppState,
  saveAppState,
  importBackup,
} from './utils/storage';
import { getTodayKey, formatTime } from './utils/dateUtils';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { VaultView } from './components/VaultView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { CigaretteLogModal } from './components/CigaretteLogModal';
import { AddTransactionModal } from './components/AddTransactionModal';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'manual_deposit' | 'manual_spend'>('manual_deposit');

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const todayKey = getTodayKey();

  // Get or initialize today's record (default limit: 7)
  const todayRecord: DayRecord = useMemo(() => {
    if (state.records[todayKey]) {
      return state.records[todayKey];
    }
    return {
      dateKey: todayKey,
      smokedCount: 0,
      limit: state.settings.dailyLimit || 7,
      penaltyPerExcess: state.settings.penaltyPerExcess || 50,
      penaltyAmount: 0,
      isSuccessful: true,
      logs: [],
    };
  }, [state.records, todayKey, state.settings.dailyLimit, state.settings.penaltyPerExcess]);

  // Handler: Add 1 Cigarette
  const handleAddCigarette = () => {
    const now = new Date();
    const timeStr = formatTime(now.getTime());
    const limit = state.settings.dailyLimit || 7;
    const penaltyPerExcess = state.settings.penaltyPerExcess || 50;

    const newLogs: CigaretteLogItem[] = [
      ...todayRecord.logs,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now.getTime(),
        timeStr,
      },
    ];

    const newSmokedCount = newLogs.length;
    const isExceeded = newSmokedCount > limit;
    const newPenalty = isExceeded ? (newSmokedCount - limit) * penaltyPerExcess : 0;
    const isSuccessful = !isExceeded;

    let updatedVaultBalance = state.vaultBalance;
    let updatedTransactions = [...state.vaultTransactions];

    if (newSmokedCount > limit) {
      updatedVaultBalance += penaltyPerExcess;
      updatedTransactions.unshift({
        id: `tx-penalty-${Date.now()}`,
        dateKey: todayKey,
        timestamp: Date.now(),
        amount: penaltyPerExcess,
        type: 'penalty',
        description: `Limit aşımı (${newSmokedCount}. sigara - ${timeStr})`,
      });
    }

    const updatedTodayRecord: DayRecord = {
      ...todayRecord,
      smokedCount: newSmokedCount,
      limit,
      penaltyPerExcess,
      penaltyAmount: newPenalty,
      isSuccessful,
      logs: newLogs,
    };

    setState((prev) => ({
      ...prev,
      records: {
        ...prev.records,
        [todayKey]: updatedTodayRecord,
      },
      vaultBalance: updatedVaultBalance,
      vaultTransactions: updatedTransactions,
    }));
  };

  // Handler: Undo Last Cigarette
  const handleUndoCigarette = () => {
    if (todayRecord.logs.length === 0) return;

    const limit = state.settings.dailyLimit || 7;
    const penaltyPerExcess = state.settings.penaltyPerExcess || 50;
    const previousSmokedCount = todayRecord.smokedCount;

    const newLogs = todayRecord.logs.slice(0, -1);
    const newSmokedCount = newLogs.length;
    const isExceeded = newSmokedCount > limit;
    const newPenalty = isExceeded ? (newSmokedCount - limit) * penaltyPerExcess : 0;
    const isSuccessful = !isExceeded;

    let updatedVaultBalance = state.vaultBalance;
    let updatedTransactions = [...state.vaultTransactions];

    if (previousSmokedCount > limit) {
      updatedVaultBalance = Math.max(0, updatedVaultBalance - penaltyPerExcess);
      const txIndex = updatedTransactions.findIndex(
        (tx) => tx.type === 'penalty' && tx.dateKey === todayKey
      );
      if (txIndex !== -1) {
        updatedTransactions.splice(txIndex, 1);
      }
    }

    const updatedTodayRecord: DayRecord = {
      ...todayRecord,
      smokedCount: newSmokedCount,
      limit,
      penaltyPerExcess,
      penaltyAmount: newPenalty,
      isSuccessful,
      logs: newLogs,
    };

    setState((prev) => ({
      ...prev,
      records: {
        ...prev.records,
        [todayKey]: updatedTodayRecord,
      },
      vaultBalance: updatedVaultBalance,
      vaultTransactions: updatedTransactions,
    }));
  };

  // Handler: Update Today's logs from modal
  const handleUpdateTodayLogs = (newLogs: CigaretteLogItem[]) => {
    const limit = state.settings.dailyLimit || 7;
    const penaltyPerExcess = state.settings.penaltyPerExcess || 50;
    const newSmokedCount = newLogs.length;
    const isExceeded = newSmokedCount > limit;
    const newPenalty = isExceeded ? (newSmokedCount - limit) * penaltyPerExcess : 0;

    const updatedTodayRecord: DayRecord = {
      ...todayRecord,
      smokedCount: newSmokedCount,
      limit,
      penaltyPerExcess,
      penaltyAmount: newPenalty,
      isSuccessful: !isExceeded,
      logs: newLogs,
    };

    setState((prev) => ({
      ...prev,
      records: {
        ...prev.records,
        [todayKey]: updatedTodayRecord,
      },
    }));
  };

  // Handler: Add transaction
  const handleAddVaultTransaction = (tx: VaultTransaction) => {
    setState((prev) => ({
      ...prev,
      vaultBalance: Math.max(0, prev.vaultBalance + tx.amount),
      vaultTransactions: [tx, ...prev.vaultTransactions],
    }));
  };

  // Handler: Update vault target
  const handleUpdateVaultTarget = (targetName: string, targetAmount: number) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        vaultTargetName: targetName,
        vaultTargetAmount: targetAmount,
      },
    }));
  };

  // Handler: Update settings
  const handleUpdateSettings = (newSettings: Partial<AppState['settings']>) => {
    setState((prev) => {
      const updated = {
        ...prev,
        settings: {
          ...prev.settings,
          ...newSettings,
        },
      };

      if (newSettings.dailyLimit !== undefined || newSettings.penaltyPerExcess !== undefined) {
        const todayRec = updated.records[todayKey];
        if (todayRec) {
          const newLimit = newSettings.dailyLimit ?? todayRec.limit;
          const newPenaltyPerExcess = newSettings.penaltyPerExcess ?? todayRec.penaltyPerExcess;
          const isExceeded = todayRec.smokedCount > newLimit;
          const penaltyAmount = isExceeded ? (todayRec.smokedCount - newLimit) * newPenaltyPerExcess : 0;

          updated.records[todayKey] = {
            ...todayRec,
            limit: newLimit,
            penaltyPerExcess: newPenaltyPerExcess,
            penaltyAmount,
            isSuccessful: !isExceeded,
          };
        }
      }

      return updated;
    });
  };

  // Handler: Reset Data
  const handleResetData = () => {
    const fresh = getDefaultAppState();
    setState(fresh);
    saveAppState(fresh);
  };

  // Handler: Import Backup
  const handleImportBackup = (jsonStr: string) => {
    const imported = importBackup(jsonStr);
    setState(imported);
  };

  return (
    <div className="min-h-screen bg-[#EBF7EE] text-[#1E3A2B] flex flex-col font-sans selection:bg-[#D7EADB] selection:text-[#1E3A2B]">
      {/* Top Header */}
      <Header
        userName={state.settings.userName}
        onOpenProfile={() => setCurrentTab('settings')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-2 sm:px-6">
        {currentTab === 'home' && (
          <HomeView
            state={state}
            todayRecord={todayRecord}
            onAddCigarette={handleAddCigarette}
            onUndoCigarette={handleUndoCigarette}
            onNavigateTab={setCurrentTab}
            onOpenLogModal={() => setIsLogModalOpen(true)}
          />
        )}

        {currentTab === 'history' && <HistoryView state={state} />}

        {currentTab === 'vault' && (
          <VaultView
            state={state}
            onOpenAddTransaction={(type) => {
              setTransactionType(type);
              setIsTransactionModalOpen(true);
            }}
            onUpdateTarget={handleUpdateVaultTarget}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            state={state}
            onUpdateSettings={handleUpdateSettings}
            onImportBackup={handleImportBackup}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Bottom 4-Tab Navigation */}
      <Navigation
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        vaultBadge={state.vaultBalance}
      />

      {/* Modals */}
      {isLogModalOpen && (
        <CigaretteLogModal
          todayRecord={todayRecord}
          onClose={() => setIsLogModalOpen(false)}
          onUpdateLogs={handleUpdateTodayLogs}
        />
      )}

      {isTransactionModalOpen && (
        <AddTransactionModal
          type={transactionType}
          onClose={() => setIsTransactionModalOpen(false)}
          onAddTransaction={handleAddVaultTransaction}
        />
      )}
    </div>
  );
}

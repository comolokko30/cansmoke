import React, { useState } from 'react';
import {
  PlusCircle,
  MinusCircle,
  Target,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
  Receipt,
  Check,
} from 'lucide-react';
import { AppState, VaultTransaction } from '../types';
import { formatTurkishDate } from '../utils/dateUtils';

interface VaultViewProps {
  state: AppState;
  onOpenAddTransaction: (type: 'manual_deposit' | 'manual_spend') => void;
  onUpdateTarget: (targetName: string, targetAmount: number) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  state,
  onOpenAddTransaction,
  onUpdateTarget,
}) => {
  const [filter, setFilter] = useState<'all' | 'penalty' | 'manual'>('all');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetNameInput, setTargetNameInput] = useState(state.settings.vaultTargetName);
  const [targetAmountInput, setTargetAmountInput] = useState(state.settings.vaultTargetAmount);

  const targetAmount = state.settings.vaultTargetAmount || 2500;
  const currentBalance = state.vaultBalance;
  const targetPercent = Math.min(100, Math.round((currentBalance / targetAmount) * 100));

  const filteredTransactions = state.vaultTransactions.filter((tx) => {
    if (filter === 'penalty') return tx.type === 'penalty';
    if (filter === 'manual') return tx.type === 'manual_deposit' || tx.type === 'manual_spend' || tx.type === 'reward_payout';
    return true;
  });

  const handleSaveTarget = () => {
    onUpdateTarget(targetNameInput, targetAmountInput);
    setIsEditingTarget(false);
  };

  return (
    <div className="space-y-5 pb-24 pt-1">
      {/* 1. Dark Sage Kasa Banner (matching screen.png theme) */}
      <div className="bg-[#556E5C] text-white rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#B6D6BE] font-bold">
                ORTAK KASA
              </div>
              <div className="text-xs text-white/80 font-medium">
                Cezalar ve Birikimler
              </div>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
            ₺ Birikim
          </span>
        </div>

        {/* Big Balance */}
        <div className="my-4">
          <div className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            ₺{currentBalance.toLocaleString('tr-TR')}
          </div>
          <div className="text-xs text-[#B6D6BE] font-medium mt-1">
            Hedef: {state.settings.vaultTargetName}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
          <button
            onClick={() => onOpenAddTransaction('manual_deposit')}
            className="py-2.5 px-4 rounded-full bg-white text-[#1E3A2B] hover:bg-[#EBF7EE] active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#76987E]" />
            <span>Para Ekle</span>
          </button>

          <button
            onClick={() => onOpenAddTransaction('manual_spend')}
            className="py-2.5 px-4 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <MinusCircle className="w-4 h-4 text-white" />
            <span>Kasadan Harca</span>
          </button>
        </div>
      </div>

      {/* 2. Target Progress Card */}
      <div className="rounded-3xl bg-white border border-[#DDEEE0] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#76987E]" />
            <h3 className="text-sm font-bold text-[#1E3A2B]">
              Tasarruf Hedefi
            </h3>
          </div>

          <button
            onClick={() => setIsEditingTarget(!isEditingTarget)}
            className="text-xs font-bold text-[#76987E] hover:underline cursor-pointer"
          >
            {isEditingTarget ? 'İptal' : 'Hedefi Düzenle'}
          </button>
        </div>

        {isEditingTarget ? (
          <div className="space-y-3 p-4 bg-[#EBF7EE] rounded-2xl border border-[#DDEEE0]">
            <div>
              <label className="block text-xs font-bold text-[#1E3A2B] mb-1">
                Hedefin Adı
              </label>
              <input
                type="text"
                value={targetNameInput}
                onChange={(e) => setTargetNameInput(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DDEEE0] bg-white text-[#1E3A2B] focus:ring-2 focus:ring-[#76987E] focus:outline-none"
                placeholder="Örn: Hafta Sonu Tatili"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E3A2B] mb-1">
                Hedef Tutar (TL)
              </label>
              <input
                type="number"
                value={targetAmountInput}
                onChange={(e) => setTargetAmountInput(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DDEEE0] bg-white text-[#1E3A2B] focus:ring-2 focus:ring-[#76987E] focus:outline-none"
                placeholder="2500"
              />
            </div>
            <button
              onClick={handleSaveTarget}
              className="w-full py-2.5 bg-[#76987E] hover:bg-[#65856C] text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Kaydet
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-[#1E3A2B]">
                {state.settings.vaultTargetName}
              </span>
              <span className="font-bold text-[#76987E]">
                %{targetPercent} Tamamlandı
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full bg-[#D7EADB] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#76987E] transition-all duration-500"
                style={{ width: `${Math.min(100, targetPercent)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-[#7A9682] font-medium">
              <span>Mevcut: ₺{currentBalance}</span>
              <span>Hedef: ₺{targetAmount}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Transaction History */}
      <div className="rounded-3xl bg-white border border-[#DDEEE0] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#76987E]" />
            <h3 className="text-sm font-bold text-[#1E3A2B]">
              Kasa Hareketleri
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#EBF7EE] p-1 rounded-full border border-[#DDEEE0]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-[#1E3A2B] shadow-2xs'
                  : 'text-[#7A9682] hover:text-[#1E3A2B]'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilter('penalty')}
              className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                filter === 'penalty'
                  ? 'bg-white text-[#E5484D] shadow-2xs'
                  : 'text-[#7A9682] hover:text-[#1E3A2B]'
              }`}
            >
              Cezalar
            </button>
            <button
              onClick={() => setFilter('manual')}
              className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                filter === 'manual'
                  ? 'bg-white text-[#76987E] shadow-2xs'
                  : 'text-[#7A9682] hover:text-[#1E3A2B]'
              }`}
            >
              Özel
            </button>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-[#7A9682] text-xs">
            Henüz kayıtlı bir kasa işlemi bulunmuyor.
          </div>
        ) : (
          <div className="divide-y divide-[#DDEEE0]">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.amount > 0;
              const isPenalty = tx.type === 'penalty';

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-[#EBF7EE]/40 px-2 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isPenalty
                          ? 'bg-red-50 text-[#E5484D]'
                          : isPositive
                          ? 'bg-[#EBF7EE] text-[#76987E]'
                          : 'bg-red-50 text-[#E5484D]'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1E3A2B] truncate">
                        {tx.description}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#7A9682] mt-0.5 font-medium">
                        <Calendar className="w-3 h-3 text-[#76987E]" />
                        <span>{formatTurkishDate(tx.dateKey, false)}</span>
                        {isPenalty && (
                          <span className="text-[10px] bg-red-50 text-[#E5484D] font-bold px-1.5 py-0.2 rounded-full">
                            Limit Aşımı
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-sm font-bold ${
                        isPositive ? 'text-[#76987E]' : 'text-[#E5484D]'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {tx.amount} TL
                    </span>
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

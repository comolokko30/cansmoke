import React, { useState } from 'react';
import { X, PlusCircle, MinusCircle } from 'lucide-react';
import { VaultTransaction } from '../types';
import { getTodayKey } from '../utils/dateUtils';

interface AddTransactionModalProps {
  type: 'manual_deposit' | 'manual_spend';
  onClose: () => void;
  onAddTransaction: (tx: VaultTransaction) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  type,
  onClose,
  onAddTransaction,
}) => {
  const isDeposit = type === 'manual_deposit';
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(isDeposit ? 'Tasarruf Ekleme' : 'Ödül / Kutlama Harcaması');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    const newTx: VaultTransaction = {
      id: `tx-${Date.now()}`,
      dateKey: getTodayKey(),
      timestamp: Date.now(),
      amount: isDeposit ? numAmount : -numAmount,
      type,
      description: description.trim() || (isDeposit ? 'Manuel Kasa Girişi' : 'Kasa Harcaması'),
    };

    onAddTransaction(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#DDEEE0] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DDEEE0]">
          <div className="flex items-center gap-2">
            {isDeposit ? (
              <PlusCircle className="w-5 h-5 text-[#76987E]" />
            ) : (
              <MinusCircle className="w-5 h-5 text-[#E5484D]" />
            )}
            <h3 className="text-sm font-bold text-[#1E3A2B]">
              {isDeposit ? 'Kasaya Para Ekle' : 'Kasadan Harcama Yap'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#7A9682] hover:text-[#1E3A2B] hover:bg-[#EBF7EE] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E3A2B] mb-1.5">
              Tutar (TL)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#7A9682]">
                ₺
              </span>
              <input
                type="number"
                min="1"
                step="1"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="100"
                className="w-full pl-8 pr-3.5 py-2.5 text-base font-bold rounded-2xl border border-[#DDEEE0] focus:outline-none focus:ring-2 focus:ring-[#76987E] bg-[#EBF7EE] text-[#1E3A2B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E3A2B] mb-1.5">
              Açıklama
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isDeposit ? 'Örn: Haftalık tasarruf' : 'Örn: Kahve & Tatlı'}
              className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#DDEEE0] focus:outline-none focus:ring-2 focus:ring-[#76987E] bg-[#EBF7EE] text-[#1E3A2B]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-[#DDEEE0] text-xs font-bold text-[#7A9682] hover:bg-[#EBF7EE] transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-[#76987E] hover:bg-[#65856C] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {isDeposit ? 'Ekle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

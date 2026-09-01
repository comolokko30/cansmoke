import React, { useState } from 'react';
import { X, Clock, Plus, Trash2, Check } from 'lucide-react';
import { DayRecord, CigaretteLogItem } from '../types';

interface CigaretteLogModalProps {
  todayRecord: DayRecord;
  onClose: () => void;
  onUpdateLogs: (newLogs: CigaretteLogItem[]) => void;
}

export const CigaretteLogModal: React.FC<CigaretteLogModalProps> = ({
  todayRecord,
  onClose,
  onUpdateLogs,
}) => {
  const [logs, setLogs] = useState<CigaretteLogItem[]>(todayRecord.logs || []);
  const [newTime, setNewTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;

    const newLogItem: CigaretteLogItem = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      timeStr: newTime,
    };

    const updated = [...logs, newLogItem].sort((a, b) => a.timeStr.localeCompare(b.timeStr));
    setLogs(updated);
    onUpdateLogs(updated);
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter((l) => l.id !== id);
    setLogs(updated);
    onUpdateLogs(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#DDEEE0] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DDEEE0]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#76987E]" />
            <h3 className="text-sm font-bold text-[#1E3A2B]">
              Sigara Saatleri & Kayıtlar
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#7A9682] hover:text-[#1E3A2B] hover:bg-[#EBF7EE] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Log Form */}
        <form onSubmit={handleAddLog} className="flex gap-2">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs font-bold rounded-2xl border border-[#DDEEE0] bg-[#EBF7EE] text-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-[#76987E]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#76987E] hover:bg-[#65856C] text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Saat Ekle</span>
          </button>
        </form>

        {/* Logs List */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {logs.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#7A9682]">
              Kayıtlı sigara saati bulunamadı.
            </div>
          ) : (
            logs.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#EBF7EE]/60 border border-[#DDEEE0]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D7EADB] text-[#556E5C] text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#1E3A2B]">
                    {item.timeStr}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteLog(item.id)}
                  className="p-1 text-[#7A9682] hover:text-[#E5484D] transition-colors cursor-pointer"
                  title="Kaydı Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-full bg-[#76987E] hover:bg-[#65856C] text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
        >
          Tamamla
        </button>
      </div>
    </div>
  );
};

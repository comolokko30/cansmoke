import React, { useState } from 'react';
import {
  PlusCircle,
  Clock,
  ArrowRight,
  Landmark,
  Ticket,
  TrendingUp,
  Check,
} from 'lucide-react';
import { AppState, DayRecord } from '../types';
import { getCurrentWeekDays, formatTurkishDate } from '../utils/dateUtils';

interface HomeViewProps {
  state: AppState;
  todayRecord: DayRecord;
  onAddCigarette: () => void;
  onUndoCigarette: () => void;
  onNavigateTab: (tab: 'vault' | 'history' | 'settings') => void;
  onOpenLogModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  todayRecord,
  onAddCigarette,
  onUndoCigarette,
  onNavigateTab,
  onOpenLogModal,
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const limit = todayRecord.limit || state.settings.dailyLimit || 7;
  const smoked = todayRecord.smokedCount;
  const excess = Math.max(0, smoked - limit);
  const penaltyPerExcess = todayRecord.penaltyPerExcess || state.settings.penaltyPerExcess || 50;
  const currentPenalty = excess * penaltyPerExcess;
  const remaining = Math.max(0, limit - smoked);

  const isLimitExceeded = smoked > limit;

  // Calculate current week successful days
  const weekDays = getCurrentWeekDays();
  let successfulDaysCount = 0;

  weekDays.forEach((day) => {
    const record = state.records[day.dateKey];
    if (day.isPast) {
      if (record && record.isSuccessful) {
        successfulDaysCount++;
      } else if (!record) {
        successfulDaysCount++;
      }
    } else if (day.isToday) {
      if (record && record.isSuccessful) {
        successfulDaysCount++;
      }
    }
  });

  const handleAddClick = () => {
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 500);
    onAddCigarette();
  };

  // SVG Gauge calculations
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1, Math.max(0, smoked / limit));
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="space-y-5 pb-24 pt-1">
      {/* 1. Subtitle & Page Title */}
      <div className="text-center">
        <div className="text-xs text-[#688A72] font-medium tracking-tight">
          {formatTurkishDate(new Date(), true)}
        </div>
        <h2 className="text-2xl font-bold text-[#1E3A2B] tracking-tight mt-0.5">
          Bugünkü Hedefin
        </h2>
      </div>

      {/* 2. Circular Gauge Display */}
      <div className="flex flex-col items-center justify-center my-2">
        <div className="w-56 h-56 sm:w-64 sm:h-64 relative flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="#D7EADB"
              strokeWidth="14"
              fill="transparent"
            />
            {/* Active Progress Stroke */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke={isLimitExceeded ? '#E5484D' : '#76987E'}
              strokeWidth="14"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Counter Content */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className="flex items-baseline justify-center">
              <span
                id="today-smoked-count"
                className={`text-4xl sm:text-5xl font-bold text-[#1E3A2B] transition-transform ${
                  justAdded ? 'scale-110 text-[#76987E]' : ''
                }`}
              >
                {smoked}
              </span>
              <span className="text-2xl sm:text-3xl text-[#7A9682] font-semibold ml-1.5">
                / {limit}
              </span>
            </div>

            <div className="text-xs text-[#688A72] font-medium mt-1">
              {isLimitExceeded
                ? `${excess} adet limit aşıldı`
                : `${remaining} sigara hakkın kaldı`}
            </div>
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="flex flex-col items-center gap-2 mt-4 w-full max-w-xs">
          <button
            id="add-cigarette-btn"
            onClick={handleAddClick}
            className="w-full bg-[#76987E] hover:bg-[#65856C] active:scale-[0.98] text-white py-3.5 px-6 rounded-full text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 fill-white/20 text-white" />
            <span>Sigara İçtim</span>
          </button>

          <button
            id="undo-cigarette-btn"
            onClick={onUndoCigarette}
            disabled={smoked === 0}
            className={`border border-[#76987E] text-[#1E3A2B] px-6 py-1.5 rounded-full text-xs font-semibold hover:bg-white/60 transition-all cursor-pointer ${
              smoked === 0 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            Geri Al
          </button>
        </div>
      </div>

      {/* 4. Three Horizontal Metric Cards */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {/* Card 1: Bugünkü Ceza */}
        <div className="bg-white p-4 rounded-2xl border border-[#DDEEE0] flex flex-col shadow-2xs">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#7A9682]">
            <Ticket className="w-3.5 h-3.5 text-[#E5484D]" />
            <span className="truncate">Bugünkü Ceza</span>
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold mt-2 ${
              currentPenalty > 0 ? 'text-[#E5484D]' : 'text-[#1E3A2B]'
            }`}
          >
            ₺{currentPenalty}
          </div>
        </div>

        {/* Card 2: Ortak Kasa */}
        <div
          onClick={() => onNavigateTab('vault')}
          className="bg-white p-4 rounded-2xl border border-[#DDEEE0] flex flex-col shadow-2xs cursor-pointer hover:border-[#76987E] transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#7A9682]">
            <Landmark className="w-3.5 h-3.5 text-[#76987E]" />
            <span className="truncate">Ortak Kasa</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1E3A2B] mt-2 truncate">
            ₺{state.vaultBalance}
          </div>
        </div>

        {/* Card 3: Haftalık Seri / Başarı */}
        <div
          onClick={() => onNavigateTab('history')}
          className="bg-white p-4 rounded-2xl border border-[#DDEEE0] flex flex-col shadow-2xs cursor-pointer hover:border-[#76987E] transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#7A9682]">
            <TrendingUp className="w-3.5 h-3.5 text-[#76987E]" />
            <span className="truncate">Haftalık</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#76987E] mt-2 truncate">
            {successfulDaysCount} / 7 Gün
          </div>
        </div>
      </div>

      {/* 5. Weekly Review Card ("Haftalık Gözden Geçirme") */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DDEEE0] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#1E3A2B]">
            Haftalık Gözden Geçirme
          </h3>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-semibold text-[#76987E] hover:underline cursor-pointer"
          >
            İstatistikler
          </button>
        </div>

        {/* 7 Days Row */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekDays.map((day) => {
            const rec = state.records[day.dateKey];
            const isExceeded = rec ? !rec.isSuccessful : false;

            let circleContent = null;
            let circleClass = 'bg-[#D7EADB] text-[#556E5C]';

            if (day.isPast || day.isToday) {
              if (isExceeded) {
                circleClass = 'bg-[#FF4D4D] text-white';
                circleContent = <span className="font-bold text-xs">!</span>;
              } else {
                circleClass = 'bg-[#D7EADB] text-[#556E5C]';
                circleContent = <Check className="w-3.5 h-3.5 stroke-[3px]" />;
              }
            } else {
              circleClass = 'bg-[#D7EADB]/60';
            }

            return (
              <div key={day.dateKey} className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-medium text-[#7A9682]">
                  {day.shortName}
                </span>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${circleClass} ${
                    day.isToday ? 'ring-2 ring-[#76987E]/60' : ''
                  }`}
                >
                  {circleContent}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Dark Sage "ORTAK KASA" Card Banner */}
      <div
        id="home-vault-banner"
        onClick={() => onNavigateTab('vault')}
        className="bg-[#556E5C] text-white rounded-3xl p-5 sm:p-6 shadow-xs flex items-center justify-between cursor-pointer hover:bg-[#4B6252] transition-all group"
      >
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[#B6D6BE] font-bold">
            ORTAK KASA
          </div>
          <div className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight">
            ₺{state.vaultBalance.toLocaleString('tr-TR')}
          </div>
        </div>

        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>

      {/* 7. Today's Cigarettes Timestamps Summary */}
      <div className="bg-white rounded-3xl p-5 border border-[#DDEEE0] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#76987E]" />
            <h4 className="text-xs font-bold text-[#1E3A2B]">
              Bugün İçilen Sigara Saatleri ({todayRecord.logs.length} Adet)
            </h4>
          </div>

          <button
            onClick={onOpenLogModal}
            className="text-xs font-bold text-[#76987E] hover:underline cursor-pointer"
          >
            Saatleri Düzenle
          </button>
        </div>

        {todayRecord.logs.length === 0 ? (
          <div className="py-4 text-center text-xs text-[#7A9682]">
            Bugün henüz hiç sigara içilmedi. Harika bir başlangıç! 🌿
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {todayRecord.logs.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EBF7EE] border border-[#DDEEE0] text-xs font-medium text-[#1E3A2B]"
              >
                <span className="w-4 h-4 rounded-full bg-[#D7EADB] text-[#556E5C] text-[10px] font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="font-mono font-bold">{item.timeStr}</span>
                {index >= limit && (
                  <span className="text-[10px] text-[#E5484D] font-bold bg-red-50 px-1.5 py-0.2 rounded-full">
                    Aşım
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Calendar,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  Landmark,
  Ticket,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { AppState, DayRecord } from '../types';
import { formatTurkishDate, parseDateKey } from '../utils/dateUtils';

interface HistoryViewProps {
  state: AppState;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ state }) => {
  const [filter, setFilter] = useState<'all' | 'success' | 'exceeded'>('all');
  const [activeChartTab, setActiveChartTab] = useState<'consumption' | 'vault' | 'hourly'>('consumption');

  // Convert records to sorted array (newest first for list)
  const allRecords: DayRecord[] = (Object.values(state.records) as DayRecord[]).sort(
    (a, b) => b.dateKey.localeCompare(a.dateKey)
  );

  const filteredRecords = allRecords.filter((rec) => {
    if (filter === 'success') return rec.isSuccessful;
    if (filter === 'exceeded') return !rec.isSuccessful;
    return true;
  });

  // Prepare data for consumption chart (last 14 days sorted chronologically)
  const chartData = (Object.values(state.records) as DayRecord[])
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .slice(-14)
    .map((rec) => {
      const d = parseDateKey(rec.dateKey);
      const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' });
      return {
        date: dayName,
        fullDate: rec.dateKey,
        içilen: rec.smokedCount,
        limit: rec.limit,
        aşım: Math.max(0, rec.smokedCount - rec.limit),
        ceza: rec.penaltyAmount,
      };
    });

  // Prepare data for vault accumulation
  let runningVault = 0;
  const vaultGrowthData = (Object.values(state.records) as DayRecord[])
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .slice(-14)
    .map((rec) => {
      runningVault += rec.penaltyAmount;
      const d = parseDateKey(rec.dateKey);
      return {
        date: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        kasa: runningVault,
        ceza: rec.penaltyAmount,
      };
    });

  // Prepare hourly distribution
  const hourCounts: Record<number, number> = {};
  for (let h = 7; h <= 23; h++) {
    hourCounts[h] = 0;
  }

  (Object.values(state.records) as DayRecord[]).forEach((rec) => {
    rec.logs?.forEach((log) => {
      if (log.timeStr) {
        const h = parseInt(log.timeStr.split(':')[0], 10);
        if (!isNaN(h) && h >= 0 && h <= 23) {
          hourCounts[h] = (hourCounts[h] || 0) + 1;
        }
      }
    });
  });

  const hourlyData = Object.entries(hourCounts)
    .filter(([h]) => Number(h) >= 7 && Number(h) <= 23)
    .map(([hour, count]) => ({
      hour: `${hour}:00`,
      adet: count,
    }));

  // Summary Metrics
  const totalDaysTracked = allRecords.length;
  const totalSuccessfulDays = allRecords.filter((r) => r.isSuccessful).length;
  const totalExceededDays = allRecords.filter((r) => !r.isSuccessful).length;
  const totalPenaltiesAll = allRecords.reduce((s, r) => s + r.penaltyAmount, 0);

  return (
    <div className="space-y-5 pb-24 pt-1">
      {/* Start Date Banner */}
      <div className="bg-white p-3 rounded-2xl border border-[#DDEEE0] flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#76987E]" />
          <span className="text-xs font-bold text-[#1E3A2B]">
            Takip Başlangıcı: {formatTurkishDate(state.settings.startDate || '2026-09-01', false)}
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#D7EADB] text-[#556E5C] text-[10px] font-bold">
          1 Eylül Başarılı ✓
        </span>
      </div>

      {/* 1. Overall Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#DDEEE0] shadow-2xs text-center">
          <div className="text-[10px] font-bold text-[#7A9682] uppercase tracking-wider">Toplam Gün</div>
          <div className="text-2xl font-bold text-[#1E3A2B] mt-1">{totalDaysTracked} Gün</div>
          <div className="text-[11px] text-[#7A9682] mt-0.5 font-medium">Takip Edilen</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#EBF7EE] border border-[#DDEEE0] shadow-2xs text-center">
          <div className="text-[10px] font-bold text-[#76987E] uppercase tracking-wider">Başarılı Gün</div>
          <div className="text-2xl font-bold text-[#76987E] mt-1">{totalSuccessfulDays} Gün</div>
          <div className="text-[11px] text-[#556E5C] font-bold mt-0.5">
            %{totalDaysTracked > 0 ? Math.round((totalSuccessfulDays / totalDaysTracked) * 100) : 0} Başarı
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 shadow-2xs text-center">
          <div className="text-[10px] font-bold text-[#E5484D] uppercase tracking-wider">Limit Aşımı</div>
          <div className="text-2xl font-bold text-[#E5484D] mt-1">{totalExceededDays} Gün</div>
          <div className="text-[11px] text-[#E5484D] font-bold mt-0.5">
            {totalPenaltiesAll} TL Ceza
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DDEEE0] shadow-2xs text-center">
          <div className="text-[10px] font-bold text-[#7A9682] uppercase tracking-wider">Ortak Kasa</div>
          <div className="text-2xl font-bold text-[#1E3A2B] mt-1">₺{state.vaultBalance}</div>
          <div className="text-[11px] text-[#76987E] font-bold mt-0.5">Toplam Birikim</div>
        </div>
      </div>

      {/* 2. Charts Container */}
      <div className="rounded-3xl bg-white border border-[#DDEEE0] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#76987E]" />
            <h3 className="text-sm font-bold text-[#1E3A2B]">
              İlerleme & Trend Grafikleri
            </h3>
          </div>

          {/* Chart selector tabs */}
          <div className="flex items-center gap-1 bg-[#EBF7EE] p-1 rounded-full border border-[#DDEEE0] text-xs">
            <button
              onClick={() => setActiveChartTab('consumption')}
              className={`px-3 py-1 font-bold rounded-full transition-all cursor-pointer ${
                activeChartTab === 'consumption'
                  ? 'bg-white text-[#1E3A2B] shadow-2xs'
                  : 'text-[#7A9682] hover:text-[#1E3A2B]'
              }`}
            >
              Sigara & Limit
            </button>
            <button
              onClick={() => setActiveChartTab('vault')}
              className={`px-3 py-1 font-bold rounded-full transition-all cursor-pointer ${
                activeChartTab === 'vault'
                  ? 'bg-white text-[#1E3A2B] shadow-2xs'
                  : 'text-[#7A9682] hover:text-[#1E3A2B]'
              }`}
            >
              Kasa Trendi
            </button>
            <button
              onClick={() => setActiveChartTab('hourly')}
              className={`px-3 py-1 font-bold rounded-full transition-all cursor-pointer ${
                activeChartTab === 'hourly'
                  ? 'bg-white text-[#1E3A2B] shadow-2xs'
                  : 'text-[#7A9682] hover:text-[#1E3A2B]'
              }`}
            >
              Saat Dağılımı
            </button>
          </div>
        </div>

        {/* Dynamic Chart Display */}
        <div className="h-64 w-full pt-2">
          {activeChartTab === 'consumption' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDEEE0" opacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7A9682' }} />
                <YAxis tick={{ fontSize: 11, fill: '#7A9682' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} adet`,
                    name === 'içilen' ? 'İçilen Sigara' : 'Günlük Limit (7)',
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #DDEEE0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                  formatter={(value) => (value === 'içilen' ? 'İçilen Sigara' : 'Günlük Limit')}
                />
                <Bar dataKey="içilen" fill="#76987E" radius={[8, 8, 0, 0]} maxBarSize={28} />
                <Line
                  type="monotone"
                  dataKey="limit"
                  stroke="#556E5C"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#556E5C' }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'vault' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vaultGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="vaultSageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#76987E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#76987E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDEEE0" opacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7A9682' }} />
                <YAxis tick={{ fontSize: 11, fill: '#7A9682' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} TL`, 'Kasa Bakiyesi']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #DDEEE0',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="kasa"
                  stroke="#76987E"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#vaultSageGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'hourly' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDEEE0" opacity={0.6} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#7A9682' }} />
                <YAxis tick={{ fontSize: 11, fill: '#7A9682' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} adet`, 'Bu Saatte İçilen']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #DDEEE0',
                  }}
                />
                <Bar dataKey="adet" fill="#76987E" radius={[8, 8, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Past Days Table */}
      <div className="rounded-3xl bg-white border border-[#DDEEE0] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#76987E]" />
            <h3 className="text-sm font-bold text-[#1E3A2B]">
              Günlük Geçmiş Kayıtları
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#EBF7EE] p-1 rounded-full border border-[#DDEEE0]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-[11px] font-bold rounded-full cursor-pointer transition-all ${
                filter === 'all' ? 'bg-white text-[#1E3A2B] shadow-2xs' : 'text-[#7A9682] hover:text-[#1E3A2B]'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-3 py-1 text-[11px] font-bold rounded-full cursor-pointer transition-all ${
                filter === 'success' ? 'bg-white text-[#76987E] shadow-2xs' : 'text-[#7A9682] hover:text-[#1E3A2B]'
              }`}
            >
              Başarılı
            </button>
            <button
              onClick={() => setFilter('exceeded')}
              className={`px-3 py-1 text-[11px] font-bold rounded-full cursor-pointer transition-all ${
                filter === 'exceeded' ? 'bg-white text-[#E5484D] shadow-2xs' : 'text-[#7A9682] hover:text-[#1E3A2B]'
              }`}
            >
              Limit Aşımı
            </button>
          </div>
        </div>

        {/* List of days */}
        {filteredRecords.length === 0 ? (
          <div className="py-8 text-center text-[#7A9682] text-xs">
            Seçilen filtreye uygun gün kaydı bulunamadı.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredRecords.map((rec) => {
              const excess = Math.max(0, rec.smokedCount - rec.limit);

              return (
                <div
                  key={rec.dateKey}
                  className={`p-4 rounded-2xl border transition-all ${
                    rec.isSuccessful
                      ? 'bg-[#EBF7EE]/60 border-[#DDEEE0] hover:bg-[#EBF7EE]'
                      : 'bg-red-50/50 border-red-100 hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                          rec.isSuccessful
                            ? 'bg-[#D7EADB] text-[#556E5C]'
                            : 'bg-[#FF4D4D] text-white'
                        }`}
                      >
                        {rec.isSuccessful ? <Check className="w-4 h-4 stroke-[3px]" /> : '!'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E3A2B]">
                          {formatTurkishDate(rec.dateKey, true)}
                        </div>
                        <div className="text-[11px] text-[#7A9682] flex items-center gap-2 mt-0.5 font-medium">
                          <span>
                            İçilen: <strong className="text-[#1E3A2B]">{rec.smokedCount}</strong> / Limit: {rec.limit}
                          </span>
                          {excess > 0 && (
                            <span className="text-[#E5484D] font-bold bg-white px-1.5 py-0.2 rounded-full border border-red-200">
                              +{excess} Aşım
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs font-bold ${
                          rec.isSuccessful ? 'text-[#76987E]' : 'text-[#E5484D]'
                        }`}
                      >
                        {rec.isSuccessful ? 'Başarılı ✓' : `Ceza: ${rec.penaltyAmount} TL`}
                      </div>
                      <div className="text-[10px] text-[#7A9682] font-medium">
                        {rec.logs?.length || 0} kayıtlı saat
                      </div>
                    </div>
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

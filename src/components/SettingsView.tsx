import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  Check,
  Calendar,
} from 'lucide-react';
import { AppSettings, AppState } from '../types';
import { exportBackup } from '../utils/storage';

interface SettingsViewProps {
  state: AppState;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onImportBackup: (jsonStr: string) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateSettings,
  onImportBackup,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');

  // Form states
  const [dailyLimit, setDailyLimit] = useState(state.settings.dailyLimit || 7);
  const [penaltyPerExcess, setPenaltyPerExcess] = useState(state.settings.penaltyPerExcess || 50);
  const [startDate, setStartDate] = useState(state.settings.startDate || '2026-09-01');
  const [saveToast, setSaveToast] = useState(false);

  const handleSaveGeneral = () => {
    onUpdateSettings({
      dailyLimit: Number(dailyLimit) || 7,
      penaltyPerExcess: Number(penaltyPerExcess) || 50,
      startDate: startDate || '2026-09-01',
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleExport = () => {
    const json = exportBackup(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breathe-and-save-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        onImportBackup(content);
        alert('Yedek başarıyla yüklendi! 🌿');
      } catch (err) {
        alert('Yedek dosyası yüklenirken hata oluştu.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 pb-24 pt-1">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-full border border-[#DDEEE0] shadow-2xs">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'general'
              ? 'bg-[#76987E] text-white shadow-xs'
              : 'text-[#7A9682] hover:text-[#1E3A2B]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Limit & Tarih Ayarları</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#76987E] text-white shadow-xs'
              : 'text-[#7A9682] hover:text-[#1E3A2B]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Yedekleme & Sıfırlama</span>
        </button>
      </div>

      {saveToast && (
        <div className="p-3.5 rounded-2xl bg-[#76987E] text-white text-xs font-bold flex items-center gap-2 shadow-md animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>Ayarlar başarıyla güncellendi! 🌿</span>
        </div>
      )}

      {/* 1. GENERAL & LIMIT SETTINGS */}
      {activeTab === 'general' && (
        <div className="rounded-3xl bg-white border border-[#DDEEE0] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#DDEEE0]">
            <Sliders className="w-5 h-5 text-[#76987E]" />
            <h3 className="text-sm font-bold text-[#1E3A2B]">
              Sigara ve Ceza Ayarları
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E3A2B] mb-1.5">
                Günlük Sigara Limiti
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#DDEEE0] focus:outline-none focus:ring-2 focus:ring-[#76987E] bg-[#EBF7EE] text-[#1E3A2B]"
              />
              <p className="text-[11px] text-[#7A9682] mt-1 font-medium">
                Günde içilebilecek hedef sigara sayısı (varsayılan: 7)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E3A2B] mb-1.5">
                Fazla Sigara Başına Ceza (TL)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={penaltyPerExcess}
                onChange={(e) => setPenaltyPerExcess(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#DDEEE0] focus:outline-none focus:ring-2 focus:ring-[#76987E] bg-[#EBF7EE] text-[#1E3A2B]"
              />
              <p className="text-[11px] text-[#7A9682] mt-1 font-medium">
                Limiti aşan her 1 sigara için kasaya eklenecek ceza
              </p>
            </div>
          </div>

          {/* Başlangıç Tarihi */}
          <div className="pt-3 border-t border-[#DDEEE0]">
            <div className="flex items-center gap-2 mb-1.5">
              <Calendar className="w-4 h-4 text-[#76987E]" />
              <label className="block text-xs font-bold text-[#1E3A2B]">
                Takip Başlangıç Tarihi
              </label>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#DDEEE0] focus:outline-none focus:ring-2 focus:ring-[#76987E] bg-[#EBF7EE] text-[#1E3A2B]"
            />
            <p className="text-[11px] text-[#7A9682] mt-1 font-medium">
              Başlangıç 1 Eylül 2026 Salı günüdür ve başarılı (tikli) sayılmaktadır.
            </p>
          </div>

          <button
            onClick={handleSaveGeneral}
            className="w-full py-3.5 rounded-full bg-[#76987E] hover:bg-[#65856C] text-white font-bold text-sm shadow-xs transition-all cursor-pointer active:scale-98 mt-2"
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      )}

      {/* 2. SECURITY & BACKUP */}
      {activeTab === 'security' && (
        <div className="rounded-3xl bg-white border border-[#DDEEE0] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#DDEEE0]">
            <ShieldCheck className="w-5 h-5 text-[#76987E]" />
            <h3 className="text-sm font-bold text-[#1E3A2B]">
              Yedekleme & Sıfırlama
            </h3>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#1E3A2B]">Yedek Dosyası</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleExport}
                className="py-2.5 px-3 rounded-full border border-[#DDEEE0] bg-white hover:bg-[#EBF7EE] text-xs font-bold text-[#1E3A2B] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#76987E]" />
                <span>Yedeği İndir (.JSON)</span>
              </button>

              <label className="py-2.5 px-3 rounded-full border border-[#DDEEE0] bg-white hover:bg-[#EBF7EE] text-xs font-bold text-[#1E3A2B] flex items-center justify-center gap-2 transition-colors cursor-pointer text-center shadow-2xs">
                <Upload className="w-4 h-4 text-[#76987E]" />
                <span>Yedek Dosyası Yükle</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset */}
          <div className="pt-4 border-t border-[#DDEEE0]">
            <button
              onClick={() => {
                if (confirm('Tüm kayıtları sıfırlamak istediğinize emin misiniz? (1 Eylül 2026 Salı başlangıçlı temiz duruma dönecektir)')) {
                  onResetData();
                }
              }}
              className="text-xs text-[#E5484D] hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Verileri Sıfırla (1 Eylül Salı Temiz Başlangıç)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

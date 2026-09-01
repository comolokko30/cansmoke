import React from 'react';
import { User, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onOpenProfile: () => void;
  syncStatus?: 'connected' | 'syncing' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProfile,
  syncStatus = 'connected',
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#EBF7EE]/90 backdrop-blur-md transition-all border-b border-[#DDEEE0]/50">
      <div className="max-w-xl mx-auto px-4 py-2.5 sm:px-6 flex items-center justify-between">
        {/* Left: App Title */}
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#1E3A2B] tracking-tight">
              Breathe & Save
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] text-[#688A72] font-medium">
              {syncStatus === 'connected' && (
                <>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#76987E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#556E5C]"></span>
                  </span>
                  <span>Canlı Senkronize</span>
                </>
              )}
              {syncStatus === 'syncing' && (
                <>
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#76987E]" />
                  <span>Güncelleniyor...</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                  <span className="text-amber-700">Yeniden bağlanıyor...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Settings / Profile Button */}
        <div className="flex items-center gap-2">
          <button
            id="header-profile-btn"
            onClick={onOpenProfile}
            className="w-9 h-9 rounded-full bg-white border border-[#DDEEE0] flex items-center justify-center text-[#1E3A2B] hover:bg-[#D7EADB]/60 transition-colors cursor-pointer shadow-2xs"
            title="Ayarlar"
          >
            <User className="w-4 h-4 text-[#556E5C]" />
          </button>
        </div>
      </div>
    </header>
  );
};

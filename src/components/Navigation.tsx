import React from 'react';
import { LayoutGrid, Calendar, User, CreditCard } from 'lucide-react';

export type TabType = 'home' | 'history' | 'vault' | 'settings';

interface NavigationProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  vaultBadge?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onChangeTab,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Ana Sayfa', icon: LayoutGrid },
    { id: 'history' as TabType, label: 'İstatistik', icon: Calendar },
    { id: 'vault' as TabType, label: 'Kasa', icon: CreditCard },
    { id: 'settings' as TabType, label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#EBF7EE]/95 backdrop-blur-md border-t border-[#DDEEE0] shadow-sm">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer select-none ${
                isActive
                  ? 'text-[#1E3A2B]'
                  : 'text-[#688A72] hover:text-[#1E3A2B]'
              }`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                  isActive ? 'text-[#1E3A2B]' : 'text-[#688A72]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span
                className={`text-[11px] tracking-tight mt-0.5 whitespace-nowrap ${
                  isActive ? 'font-bold text-[#1E3A2B]' : 'font-medium text-[#688A72]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

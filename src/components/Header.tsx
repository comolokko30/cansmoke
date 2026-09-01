import React from 'react';
import { Bell, User } from 'lucide-react';

interface HeaderProps {
  userName: string;
  onOpenProfile: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  onOpenProfile,
  onOpenNotifications,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#EBF7EE]/90 backdrop-blur-md transition-all">
      <div className="max-w-xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between">
        {/* Left: App Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#1E3A2B] tracking-tight">
            Breathe & Save
          </h1>
        </div>

        {/* Right: Notification & Profile Icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNotifications || onOpenProfile}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#1E3A2B] hover:bg-[#D7EADB]/60 transition-colors cursor-pointer"
            title="Bildirimler"
          >
            <Bell className="w-5 h-5" />
          </button>

          <button
            id="header-profile-btn"
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#1E3A2B] hover:bg-[#D7EADB]/60 transition-colors cursor-pointer"
            title="Profil ve Ayarlar"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

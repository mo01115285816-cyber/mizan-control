'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Smartphone, 
  SlidersHorizontal, 
  TrendingUp, 
  Bell, 
  Settings,
  Sparkles
} from 'lucide-react';
import { useMizan } from '@/context/MizanContext';
import { ScreenType } from '@/types/mizan';

export default function FloatingBottomNav() {
  const { 
    currentScreen, 
    setCurrentScreen, 
    unreadNotificationsCount, 
    devices 
  } = useMizan();

  const navItems: { id: ScreenType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { 
      id: 'overview', 
      label: 'نظرة عامة', 
      icon: LayoutDashboard 
    },
    { 
      id: 'devices', 
      label: 'الأجهزة', 
      icon: Smartphone,
      badge: devices.length 
    },
    { 
      id: 'quotas', 
      label: 'الحصص', 
      icon: SlidersHorizontal 
    },
    { 
      id: 'analytics', 
      label: 'التحليلات', 
      icon: TrendingUp 
    },
    { 
      id: 'notifications', 
      label: 'التنبيهات', 
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined 
    },
    { 
      id: 'settings', 
      label: 'الإعدادات', 
      icon: Settings 
    },
  ];

  return (
    <nav 
      aria-label="شريط التنقل العائم"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[96vw] sm:max-w-fit"
    >
      <div className="bg-[#151515]/95 backdrop-blur-xl border border-[#2D3028] text-[#FFFDF8] rounded-full p-1.5 sm:p-2 shadow-[0_16px_36px_rgba(0,0,0,0.32)] ring-1 ring-white/10 flex items-center gap-1 sm:gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id || (item.id === 'devices' && currentScreen === 'device-detail');

          return (
            <button
              key={item.id}
              id={`floating-nav-${item.id}`}
              onClick={() => setCurrentScreen(item.id)}
              className={`relative flex items-center gap-2 h-10 sm:h-11 px-3 sm:px-4 rounded-full text-xs font-bold transition-all duration-300 select-none ${
                isActive
                  ? 'bg-[#C8F24A] text-[#151515] shadow-md scale-100'
                  : 'text-[#A0A39B] hover:text-[#FFFDF8] hover:bg-white/10'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                {item.id === 'notifications' && unreadNotificationsCount > 0 && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E0564C] ring-2 ring-[#151515]" />
                )}
              </div>

              {/* Label: Always visible for active tab, and responsive for others */}
              <span className={`whitespace-nowrap transition-all text-xs ${
                isActive ? 'inline-block font-extrabold' : 'hidden md:inline-block'
              }`}>
                {item.label}
              </span>

              {/* Badge for Devices count or Notifications if present */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full leading-none hidden sm:inline-block ${
                  isActive
                    ? 'bg-[#151515] text-[#C8F24A]'
                    : item.id === 'notifications'
                    ? 'bg-[#E0564C] text-white'
                    : 'bg-white/15 text-[#FFFDF8]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

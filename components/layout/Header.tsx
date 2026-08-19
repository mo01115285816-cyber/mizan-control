'use client';

import React from 'react';
import { 
  Menu, 
  Search, 
  RefreshCw, 
  Wifi, 
  SlidersHorizontal,
  Bell
} from 'lucide-react';
import { useMizan } from '@/context/MizanContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export default function Header({ onOpenMobileMenu }: HeaderProps) {
  const { 
    adminName, 
    globalSearch, 
    setGlobalSearch, 
    refreshData, 
    openEditQuotaModal, 
    unreadNotificationsCount, 
    setCurrentScreen,
    currentScreen
  } = useMizan();

  return (
    <header className="sticky top-0 z-10 bg-[#FFFDF8] border-b border-[#E3E5DC] px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Right side (RTL start): Mobile toggle + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-[14px] text-[#151515] bg-[#F6F7F2] hover:bg-[#E3E5DC] transition-colors"
          aria-label="فتح القائمة الرئيسية"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#777A72] absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            placeholder="ابحث عن جهاز، اسم مستخدم، أو تطبيق..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              if (currentScreen !== 'devices' && currentScreen !== 'overview' && e.target.value.trim().length > 0) {
                setCurrentScreen('devices');
              }
            }}
            className="w-full bg-[#F6F7F2] border border-[#E3E5DC] focus:border-[#151515] focus:bg-[#FFFDF8] rounded-[16px] pr-10 pl-4 py-2 text-sm text-[#151515] placeholder:text-[#777A72] outline-none transition-all"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#777A72] hover:text-[#151515]"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Left side (RTL end): Status, Refresh, Notifications, User profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* System & Router status badge (Hidden on very small screens) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E7F5C8] border border-[#C8F24A] text-xs font-semibold text-[#151515]">
          <span className="w-2 h-2 rounded-full bg-[#83D96B] animate-pulse" />
          <Wifi className="w-3.5 h-3.5 text-[#151515]" />
          <span>الشبكة متصلة (Mizan_5G)</span>
        </div>

        {/* Quick Edit Quota CTA */}
        <button
          id="header-edit-quota-btn"
          onClick={() => openEditQuotaModal('household')}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-[16px] bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] text-xs font-bold transition-all shadow-xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>تعديل الحصة</span>
        </button>

        {/* Refresh button */}
        <button
          id="header-refresh-btn"
          onClick={refreshData}
          title="تحديث البيانات من الراوتر الآن"
          className="p-2 rounded-[14px] text-[#777A72] hover:text-[#151515] hover:bg-[#F6F7F2] transition-colors border border-transparent hover:border-[#E3E5DC]"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Notifications Icon Button */}
        <button
          id="header-notif-btn"
          onClick={() => setCurrentScreen('notifications')}
          className="relative p-2 rounded-[14px] text-[#777A72] hover:text-[#151515] hover:bg-[#F6F7F2] transition-colors border border-transparent hover:border-[#E3E5DC]"
          title="التنبيهات"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#E0564C] ring-2 ring-[#FFFDF8]" />
          )}
        </button>

        {/* User Profile Pill */}
        <div 
          onClick={() => setCurrentScreen('settings')}
          className="flex items-center gap-2.5 pr-2 pl-3 py-1.5 rounded-full bg-[#F6F7F2] border border-[#E3E5DC] hover:border-[#151515] cursor-pointer transition-colors"
          title="إعدادات الحساب"
        >
          <div className="w-7 h-7 rounded-full bg-[#151515] text-[#C8F24A] flex items-center justify-center font-bold text-xs">
            أ
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-[#151515] leading-tight">
              {adminName}
            </span>
            <span className="text-[10px] text-[#777A72] leading-none">
              المسؤول
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

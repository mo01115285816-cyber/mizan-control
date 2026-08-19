'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Search, 
  RefreshCw, 
  ArrowRight,
  X
} from 'lucide-react';
import { useMizan } from '@/context/MizanContext';

export default function FloatingHeader() {
  const { 
    globalSearch, 
    setGlobalSearch, 
    refreshData, 
    setCurrentScreen,
    currentScreen
  } = useMizan();

  const [isSpinning, setIsSpinning] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleRefresh = () => {
    setIsSpinning(true);
    refreshData();
    setTimeout(() => setIsSpinning(false), 800);
  };

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleCloseSearch = React.useCallback(() => {
    setIsSearchOpen(false);
    setGlobalSearch('');
  }, [setGlobalSearch]);

  // Close search on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        handleCloseSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, handleCloseSearch]);

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'overview': return 'لوحة التحكم';
      case 'devices': return 'الأجهزة المتصلة';
      case 'device-detail': return 'تفاصيل الجهاز';
      case 'quotas': return 'إدارة الحصص';
      case 'notifications': return 'التنبيهات';
      case 'analytics': return 'التحليلات';
      case 'settings': return 'الإعدادات';
      default: return 'لوحة التحكم';
    }
  };

  return (
    <header className="fixed top-3 sm:top-5 inset-x-0 z-40 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 relative">
        
        {/* EXPANDED FULL-WIDTH SEARCH CAPSULE */}
        {isSearchOpen ? (
          <div className="pointer-events-auto w-full flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex-1 relative flex items-center">
              <Search className="w-4 h-4 text-[#151515] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                id="global-floating-search-input-expanded"
                type="text"
                placeholder="ابحث عن أي جهاز أو مستخدم أو عنوان IP..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  if (currentScreen !== 'devices' && currentScreen !== 'overview' && e.target.value.trim().length > 0) {
                    setCurrentScreen('devices');
                  }
                }}
                className="w-full h-11 sm:h-12 bg-[#FFFDF8]/98 backdrop-blur-xl border-2 border-[#151515] rounded-full pr-11 pl-20 text-xs sm:text-sm font-semibold text-[#151515] placeholder:text-[#777A72] shadow-lg outline-none transition-all"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute left-12 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#777A72] hover:text-[#151515] bg-[#F6F7F2] px-2 py-0.5 rounded-full"
                >
                  مسح
                </button>
              )}
            </div>

            {/* Close search button pill */}
            <button
              onClick={handleCloseSearch}
              className="h-11 sm:h-12 px-4 rounded-full bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] text-xs font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-102 shrink-0 whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              <span>إغلاق</span>
            </button>
          </div>
        ) : (
          /* NORMAL DUAL-CAPSULE COMPACT LAYOUT */
          <>
            {/* Capsule 1: Transparent Brand Logo & Current View (Right side in RTL) */}
            <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
              {/* Back button pill if in device detail */}
              {currentScreen === 'device-detail' && (
                <button
                  onClick={() => setCurrentScreen('devices')}
                  className="h-10 sm:h-11 px-3.5 rounded-full bg-[#FFFDF8]/95 backdrop-blur-md border border-[#E3E5DC] hover:border-[#151515] text-[#151515] shadow-xs flex items-center gap-1.5 text-xs font-bold transition-all hover:scale-102 whitespace-nowrap"
                  title="العودة لقائمة الأجهزة"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span className="hidden sm:inline">رجوع</span>
                </button>
              )}

              {/* Main Brand Capsule - Transparent Logo + English Name */}
              <div 
                onClick={() => setCurrentScreen('overview')}
                className="h-10 sm:h-11 px-3 sm:px-4 rounded-full bg-[#FFFDF8]/95 backdrop-blur-md border border-[#E3E5DC] hover:border-[#151515] text-[#151515] shadow-xs flex items-center gap-2.5 cursor-pointer transition-all hover:scale-101 select-none"
                title="الانتقال للرئيسية"
              >
                {/* Clean Logo without any inner container, circle, or border */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 relative shrink-0 flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="MIZAN"
                    width={32}
                    height={32}
                    priority
                    className="object-contain w-full h-full"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black text-xs sm:text-sm tracking-tight text-[#151515] font-sans">
                    MIZAN
                  </span>
                  <span className="hidden sm:inline-block font-mono text-[9px] bg-[#C8F24A] text-[#151515] px-1.5 py-0.5 rounded-full font-black tracking-wider">
                    CONTROL
                  </span>
                  <span className="text-xs text-[#777A72] font-bold border-r border-[#E3E5DC] pr-2 mr-0.5 hidden md:inline-block">
                    {getScreenTitle()}
                  </span>
                </div>
              </div>
            </div>

            {/* Capsule 2: Combined Search & Router Sync Pill (Left side in RTL) */}
            <div className="pointer-events-auto flex items-center">
              <div className="h-10 sm:h-11 px-2 rounded-full bg-[#FFFDF8]/95 backdrop-blur-md border border-[#E3E5DC] hover:border-[#151515] shadow-xs flex items-center gap-1 transition-all">
                
                {/* Search Trigger Button */}
                <button
                  id="floating-open-search-btn"
                  onClick={handleOpenSearch}
                  title="البحث عن جهاز أو مستخدم"
                  className="px-2.5 sm:px-3 h-8 rounded-full flex items-center gap-1.5 text-[#151515] hover:bg-[#F6F7F2] text-xs font-bold transition-all whitespace-nowrap"
                >
                  <Search className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#151515]" />
                  <span className="hidden sm:inline">بحث</span>
                </button>

                {/* Subtle Divider */}
                <span className="h-4 w-px bg-[#E3E5DC]" />

                {/* Router Refresh Sync Button */}
                <button
                  id="floating-refresh-btn"
                  onClick={handleRefresh}
                  title="مزامنة فورية مع الراوتر"
                  className="px-2.5 sm:px-3 h-8 rounded-full flex items-center gap-1.5 text-[#151515] hover:bg-[#F6F7F2] text-xs font-bold transition-all whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#151515] ${isSpinning ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">
                    {isSpinning ? 'مزامنة...' : 'تحديث'}
                  </span>
                </button>

              </div>
            </div>
          </>
        )}

      </div>
    </header>
  );
}

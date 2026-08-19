'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Smartphone, 
  PieChart, 
  SlidersHorizontal, 
  Bell, 
  Settings, 
  LogOut,
  Wifi,
  ChevronLeft,
  X
} from 'lucide-react';
import { useMizan } from '@/context/MizanContext';
import { ScreenType } from '@/types/mizan';
import MizanLogo from '@/components/common/MizanLogo';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { 
    currentScreen, 
    setCurrentScreen, 
    unreadNotificationsCount, 
    householdQuota,
    logout,
    openEditQuotaModal
  } = useMizan();

  const navItems: { id: ScreenType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'overview',
      label: 'لوحة التحكم',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'devices',
      label: 'الأجهزة المتصلة',
      icon: <Smartphone className="w-5 h-5" />,
    },
    {
      id: 'analytics',
      label: 'تفاصيل الاستهلاك',
      icon: <PieChart className="w-5 h-5" />,
    },
    {
      id: 'quotas',
      label: 'إدارة الحصص',
      icon: <SlidersHorizontal className="w-5 h-5" />,
    },
    {
      id: 'notifications',
      label: 'التنبيهات والإشعارات',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadNotificationsCount,
    },
    {
      id: 'settings',
      label: 'إعدادات النظام والراوتر',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleNavClick = (screen: ScreenType) => {
    setCurrentScreen(screen);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FFFDF8] border-l border-[#E3E5DC] p-5 justify-between">
      {/* Top Brand & Close on mobile */}
      <div>
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#E3E5DC]">
          <MizanLogo size="md" />
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-xl text-[#777A72] hover:bg-[#F6F7F2] hover:text-[#151515] lg:hidden transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5" id="main-sidebar-nav">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id || (item.id === 'devices' && currentScreen === 'device-detail');
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-[16px] text-right font-semibold text-[15px] transition-all duration-150 ${
                  isActive
                    ? 'bg-[#C8F24A] text-[#151515] shadow-xs'
                    : 'text-[#151515] hover:bg-[#F6F7F2] hover:text-[#151515]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#151515]' : 'text-[#777A72]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive ? 'bg-[#151515] text-[#C8F24A]' : 'bg-[#151515] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Quota Snapshot Card & Logout */}
      <div className="space-y-4 pt-4 border-t border-[#E3E5DC]">
        {/* Household Quota Mini Widget */}
        <div 
          className="bg-[#F6F7F2] p-4 rounded-[20px] border border-[#E3E5DC] space-y-2 cursor-pointer hover:border-[#C8F24A] transition-colors"
          onClick={() => openEditQuotaModal('household')}
          title="اضغط لتعديل الحصة المنزلية"
          id="sidebar-quota-mini-card"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#777A72]">
            <span className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-[#83D96B]" />
              الحصة المنزلية
            </span>
            <span className="text-[#151515] font-bold">{householdQuota.percentage}%</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-[#151515]">
              {householdQuota.remainingGB}{' '}
              <span className="text-xs text-[#777A72] font-normal">جيجابايت متبقية</span>
            </span>
            <ChevronLeft className="w-4 h-4 text-[#777A72]" />
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#E3E5DC] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#151515] h-full rounded-full transition-all duration-500"
              style={{ width: `${householdQuota.percentage}%` }}
            />
          </div>

          <p className="text-[11px] text-[#777A72] text-right">
            تتجدد بعد {householdQuota.daysRemaining} يوم
          </p>
        </div>

        {/* Logout button */}
        <button
          id="sidebar-logout-button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[16px] text-sm font-semibold text-[#777A72] hover:text-[#151515] hover:bg-[#F7D9D2] hover:bg-opacity-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

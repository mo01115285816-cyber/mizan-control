'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  CheckCheck, 
  Trash2, 
  ChevronLeft
} from 'lucide-react';
import { useMizan } from '@/context/MizanContext';
import { AlertSeverity } from '@/types/mizan';

export default function NotificationsScreen() {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotifications,
    navigateToDevice
  } = useMizan();

  const [filterSeverity, setFilterSeverity] = useState<'all' | 'warning' | 'danger' | 'info' | 'success'>('all');

  const filteredNotifications = notifications.filter((notif) => {
    if (filterSeverity === 'all') return true;
    return notif.severity === filterSeverity;
  });

  const getSeverityIcon = (sev: AlertSeverity) => {
    switch (sev) {
      case 'danger':
        return (
          <div className="w-10 h-10 rounded-[14px] bg-[#F7D9D2] text-[#C0392B] flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-[14px] bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'success':
        return (
          <div className="w-10 h-10 rounded-[14px] bg-[#E7F5C8] text-[#151515] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#83D96B]" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-10 h-10 rounded-[14px] bg-[#F6F7F2] border border-[#E3E5DC] text-[#151515] flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  const getSeverityLabel = (sev: AlertSeverity) => {
    switch (sev) {
      case 'danger': return 'حالة حرجة / تجاوز';
      case 'warning': return 'تحذير استهلاك';
      case 'success': return 'مزامنة ناجحة';
      case 'info': return 'معلومات النظام';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#151515] tracking-tight">
            التنبيهات
          </h1>
          <p className="text-sm text-[#777A72]">
            سجل إشعارات الحصص، التحذيرات المبكرة، وأحداث شبكة Mizan المنزلية
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            id="mark-all-read-btn"
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2 rounded-full bg-[#FFFDF8] border border-[#E3E5DC] hover:border-[#151515] text-[#151515] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <CheckCheck className="w-4 h-4" />
            <span>تحديد الكل كمقروء</span>
          </button>
          <button
            id="clear-all-notifs-btn"
            onClick={clearNotifications}
            className="px-4 py-2 rounded-full bg-[#F6F7F2] border border-[#E3E5DC] hover:bg-[#F7D9D2] hover:text-[#C0392B] text-[#777A72] font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>مسح السجل</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[22px] p-3 shadow-2xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'all', label: 'كافة التنبيهات' },
          { id: 'danger', label: 'التجاوز والحظر' },
          { id: 'warning', label: 'الاقتراب من الحد' },
          { id: 'info', label: 'إشعارات الشبكة' },
          { id: 'success', label: 'المزامنة والنظام' },
        ].map((tab) => {
          const isActive = filterSeverity === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterSeverity(tab.id as any)}
              className={`px-4 py-2 rounded-full font-bold text-xs shrink-0 transition-all ${
                isActive
                  ? 'bg-[#151515] text-[#C8F24A]'
                  : 'bg-[#F6F7F2] text-[#777A72] hover:bg-[#E3E5DC] hover:text-[#151515]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-12 text-center space-y-3">
            <Bell className="w-12 h-12 text-[#777A72] mx-auto opacity-40" />
            <h3 className="text-lg font-bold text-[#151515]">لا توجد تنبيهات حالياً</h3>
            <p className="text-xs text-[#777A72]">
              جميع الأجهزة تعمل ضمن الحصص المقررة والشبكة مستقرة.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`bg-[#FFFDF8] border rounded-[24px] p-5 transition-all shadow-2xs space-y-3 ${
                notif.isRead ? 'border-[#E3E5DC] opacity-90' : 'border-[#151515] bg-[#FFFDF8]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  {getSeverityIcon(notif.severity)}
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#777A72]">
                        {getSeverityLabel(notif.severity)}
                      </span>
                      {!notif.isRead && (
                        <span className="px-2 py-0.2 rounded-full bg-[#151515] text-[#C8F24A] text-[10px] font-bold">
                          جديد
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-[#151515]">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-[#777A72] leading-relaxed max-w-2xl">
                      {notif.description}
                    </p>
                  </div>
                </div>

                <div className="text-left shrink-0 space-y-2">
                  <span className="text-[11px] text-[#777A72] block font-medium">
                    {notif.timestamp}
                  </span>

                  {notif.deviceId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToDevice(notif.deviceId!);
                      }}
                      className="px-3 py-1.5 rounded-[12px] bg-[#F6F7F2] hover:bg-[#151515] hover:text-[#FFFDF8] text-xs font-bold text-[#151515] transition-colors flex items-center gap-1"
                    >
                      <span>فحص الجهاز</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

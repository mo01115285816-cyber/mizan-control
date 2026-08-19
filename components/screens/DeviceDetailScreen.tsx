'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  Smartphone, 
  Laptop, 
  Tv, 
  Gamepad2, 
  Wifi, 
  Clock, 
  SlidersHorizontal, 
  Pause, 
  Play, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Activity, 
  TrendingUp,
  Video,
  PlayCircle,
  Share2,
  Gamepad,
  MessageCircle,
  AlertTriangle,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { useMizan } from '@/context/MizanContext';
import { Device, DeviceStatus } from '@/types/mizan';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

export default function DeviceDetailScreen() {
  const { 
    selectedDevice, 
    setCurrentScreen, 
    toggleDevicePause, 
    unblockDevice, 
    blockDevice, 
    removeDevice, 
    openEditQuotaModal 
  } = useMizan();

  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState<boolean>(false);

  if (!selectedDevice) {
    return (
      <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-12 text-center space-y-4">
        <h3 className="text-xl font-bold text-[#151515]">لم يتم العثور على الجهاز</h3>
        <button
          onClick={() => setCurrentScreen('devices')}
          className="px-6 py-3 rounded-[18px] bg-[#151515] text-[#FFFDF8] font-bold text-sm"
        >
          العودة لقائمة الأجهزة
        </button>
      </div>
    );
  }

  const device = selectedDevice;
  const usagePercent = Math.min(100, Math.round((device.usedGB / device.allowedQuotaGB) * 100));
  const remainingGB = Math.max(0, Number((device.allowedQuotaGB - device.usedGB).toFixed(1)));
  const isBlocked = device.status === 'blocked' || device.isPaused;

  const getDeviceIcon = (type: Device['deviceType']) => {
    switch (type) {
      case 'phone': return <Smartphone className="w-7 h-7" />;
      case 'laptop': return <Laptop className="w-7 h-7" />;
      case 'tv': return <Tv className="w-7 h-7" />;
      case 'gaming': return <Gamepad2 className="w-7 h-7" />;
      default: return <Smartphone className="w-7 h-7" />;
    }
  };

  const getAppIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'tiktok': return <Video className="w-4 h-4 text-[#151515]" />;
      case 'youtube': return <PlayCircle className="w-4 h-4 text-[#151515]" />;
      case 'facebook': return <Share2 className="w-4 h-4 text-[#151515]" />;
      case 'pubg mobile':
      case 'free fire': return <Gamepad className="w-4 h-4 text-[#151515]" />;
      case 'whatsapp':
      case 'discord': return <MessageCircle className="w-4 h-4 text-[#151515]" />;
      default: return <Smartphone className="w-4 h-4 text-[#151515]" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          id="back-to-devices-btn"
          onClick={() => setCurrentScreen('devices')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDF8] border border-[#E3E5DC] hover:border-[#151515] text-[#151515] font-bold text-xs transition-colors shadow-2xs"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى قائمة الأجهزة</span>
        </button>

        <div className="text-xs text-[#777A72]">
          معرّف الجهاز: <span className="font-mono text-[#151515] font-bold">{device.id}</span>
        </div>
      </div>

      {/* Hero Header Card: Identity & Status */}
      <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Device Profile Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[22px] bg-[#E7F5C8] border border-[#C8F24A] text-[#151515] flex items-center justify-center shadow-xs shrink-0">
              {getDeviceIcon(device.deviceType)}
            </div>

            <div className="space-y-1 text-right">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#151515] tracking-tight">
                  {device.ownerName}
                </h1>
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-[#F6F7F2] border border-[#E3E5DC] text-[#151515]">
                  {device.name}
                </span>
              </div>
              <p className="text-xs text-[#777A72] font-medium">
                {device.model} • عنوان IP: <span className="font-mono text-[#151515]">{device.ipAddress}</span> • MAC: <span className="font-mono">{device.macAddress}</span>
              </p>
            </div>
          </div>

          {/* Connection status badge & quick router pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F6F7F2] border border-[#E3E5DC] text-xs font-medium text-[#151515]">
              <Wifi className="w-3.5 h-3.5 text-[#83D96B]" />
              <span>الشبكة: <strong>{device.wifiSSID}</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F6F7F2] border border-[#E3E5DC] text-xs font-medium text-[#151515]">
              <Clock className="w-3.5 h-3.5 text-[#777A72]" />
              <span>آخر اتصال: <strong>{device.lastUpdatedDetail}</strong></span>
            </div>

            {device.isPaused ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F7D9D2] text-[#C0392B] text-xs font-bold border border-[#E0564C]">
                <Pause className="w-3.5 h-3.5" />
                الاتصال موقوف يدوياً
              </span>
            ) : device.status === 'connected' ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E7F5C8] text-[#151515] text-xs font-bold border border-[#C8F24A]">
                <span className="w-2 h-2 rounded-full bg-[#83D96B] animate-pulse" />
                متصل بالإنترنت
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-bold border border-[#F59E0B]">
                <AlertTriangle className="w-3.5 h-3.5" />
                قريب من الحد المسموح
              </span>
            )}
          </div>
        </div>

        {/* Regular Admin Actions Bar (Non-destructive) */}
        <div className="pt-4 border-t border-[#E3E5DC] flex flex-wrap items-center gap-2.5">
          <button
            id="detail-edit-quota-btn"
            onClick={() => openEditQuotaModal('device', device)}
            className="py-2.5 px-5 rounded-full bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs whitespace-nowrap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>تعديل حصة الجهاز</span>
          </button>

          <button
            id="detail-toggle-pause-btn"
            onClick={() => toggleDevicePause(device.id)}
            className={`py-2.5 px-5 rounded-full border font-bold text-xs flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              device.isPaused
                ? 'bg-[#E7F5C8] border-[#C8F24A] text-[#151515] hover:bg-[#C8F24A]'
                : 'bg-[#FFFDF8] border-[#E3E5DC] text-[#151515] hover:bg-[#F6F7F2]'
            }`}
          >
            {device.isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-[#151515]" />
                <span>استئناف تدفق الإنترنت</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-[#777A72]" />
                <span>إيقاف الاتصال مؤقتاً</span>
              </>
            )}
          </button>

          {device.status === 'blocked' && !device.isPaused && (
            <button
              id="detail-unblock-btn"
              onClick={() => unblockDevice(device.id)}
              className="py-2.5 px-5 rounded-full bg-[#C8F24A] text-[#151515] hover:bg-[#151515] hover:text-[#C8F24A] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>إلغاء الحظر وتمديد الحصة</span>
            </button>
          )}
        </div>
      </div>

      {/* Large Quota Consumption Card */}
      <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3E5DC]">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#151515]">
              مؤشر استهلاك الحصة الشهرية
            </h3>
            <p className="text-xs text-[#777A72]">
              تتبع نسبة الاستخدام مقارنة بالحد المسموح لهذا الجهاز
            </p>
          </div>
          <div className="text-xs font-bold text-[#777A72]">
            موعد إعادة الضبط: <strong className="text-[#151515]">1 سبتمبر 2026 (بعد 13 يوماً)</strong>
          </div>
        </div>

        {/* 3 Metric blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#F6F7F2] p-5 rounded-[22px] border border-[#E3E5DC] space-y-1">
            <span className="text-xs font-medium text-[#777A72]">المستخدم حتى الآن</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-[#151515]">{device.usedGB}</span>
              <span className="text-xs font-bold text-[#777A72]">جيجابايت</span>
            </div>
            <span className="text-[11px] text-[#777A72]">من أصل {device.allowedQuotaGB} GB المخصصة</span>
          </div>

          <div className="bg-[#F6F7F2] p-5 rounded-[22px] border border-[#E3E5DC] space-y-1">
            <span className="text-xs font-medium text-[#777A72]">المتبقي من الحصة</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-bold ${isBlocked ? 'text-[#C0392B]' : 'text-[#151515]'}`}>
                {isBlocked ? '0.0' : remainingGB}
              </span>
              <span className="text-xs font-bold text-[#777A72]">جيجابايت</span>
            </div>
            <span className="text-[11px] text-[#777A72]">
              {isBlocked ? 'تم استنفاد كامل الحصة' : 'متاح للاستهلاك حتى نهاية الشهر'}
            </span>
          </div>

          <div className="bg-[#F6F7F2] p-5 rounded-[22px] border border-[#E3E5DC] space-y-1">
            <span className="text-xs font-medium text-[#777A72]">نسبة الاستهلاك</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-bold ${usagePercent > 85 ? 'text-[#C0392B]' : 'text-[#151515]'}`}>
                {usagePercent}%
              </span>
            </div>
            <span className="text-[11px] text-[#777A72]">
              {usagePercent > 100 ? 'تم تجاوز الحد' : 'ضمن الاستهلاك المقبول'}
            </span>
          </div>
        </div>

        {/* Visual Progress Meter */}
        <div className="space-y-2 pt-2">
          <div className="w-full bg-[#F6F7F2] border border-[#E3E5DC] h-5 rounded-full p-1 flex items-center">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isBlocked ? 'bg-[#E0564C]' : usagePercent > 85 ? 'bg-[#F59E0B]' : 'bg-[#151515]'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#777A72]">
            <span>0 GB</span>
            <span className="font-bold text-[#151515]">{usagePercent}% مستخدم</span>
            <span>{device.allowedQuotaGB} GB (الحد الأقصى)</span>
          </div>
        </div>
      </div>

      {/* Grid: 7-Day Chart & Apps Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Apps Breakdown */}
        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 space-y-5 shadow-2xs">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#151515]">
              الاستهلاك حسب التطبيقات لهذا الجهاز
            </h3>
            <p className="text-xs text-[#777A72]">
              أين يذهب إنترنت {device.ownerName} هذا الشهر
            </p>
          </div>

          <div className="space-y-3">
            {device.topApps.map((app) => (
              <div
                key={app.id}
                className="bg-[#F6F7F2] p-3.5 rounded-[18px] border border-[#E3E5DC] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[12px] bg-[#FFFDF8] border border-[#E3E5DC] flex items-center justify-center">
                      {getAppIcon(app.name)}
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-bold text-[#151515]">
                        {app.nameAr} <span className="text-[10px] text-[#777A72]">({app.name})</span>
                      </span>
                      <span className="text-[10px] text-[#777A72]">{app.category}</span>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-sm font-bold text-[#151515] block">
                      {app.usedGB} <span className="text-[10px] font-normal text-[#777A72]">GB</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#777A72]">{app.percentage}%</span>
                  </div>
                </div>

                <div className="w-full bg-[#E3E5DC] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#151515] h-full rounded-full"
                    style={{ width: `${app.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Chart for this Device */}
        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 space-y-5 shadow-2xs flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#151515]">
              استهلاك آخر 7 أيام
            </h3>
            <p className="text-xs text-[#777A72]">
              معدل استهلاك الجيجابايت اليومي لجهاز {device.ownerName}
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={device.dailyUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="dayLabel" 
                  tick={{ fill: '#777A72', fontSize: 11, fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#777A72', fontSize: 11 }} 
                  axisLine={false}
                  tickLine={false}
                  unit=" GB"
                />
                <Tooltip
                  cursor={{ fill: '#F6F7F2' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#151515] text-[#FFFDF8] p-2.5 rounded-[14px] text-xs space-y-0.5 text-right">
                          <p className="font-bold text-[#C8F24A]">{payload[0].payload.dayLabel}</p>
                          <p>{payload[0].value} GB مستهلكة</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="usedGB" fill="#151515" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-[#777A72] pt-2 border-t border-[#E3E5DC]">
            <span>المتوسط اليومي للجهاز</span>
            <strong className="text-[#151515] font-bold">
              {(device.usedGB / 7).toFixed(1)} GB / يومياً
            </strong>
          </div>
        </div>
      </div>

      {/* Activity Log (Recent Syncs & Status Changes) */}
      <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3E5DC]">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-[#151515] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#151515]" />
              <span>سجل النشاط والأحداث للجهاز</span>
            </h3>
            <p className="text-xs text-[#777A72]">
              آخر عمليات المزامنة، التنبيهات، وتغيّرات حالة الاتصال
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {device.activities.map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between p-3 rounded-[16px] bg-[#F6F7F2] border border-[#E3E5DC] text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#151515]" />
                <span className="font-medium text-[#151515]">{act.title}</span>
              </div>
              <span className="text-[#777A72] font-semibold">{act.timeAgo}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone: Isolated & Visually Separated Admin Actions */}
      <div className="bg-[#FFFDF8] border border-[#F7D9D2] rounded-[28px] p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-2 text-sm font-bold text-[#C0392B]">
            <ShieldAlert className="w-4.5 h-4.5" />
            <span>منطقة العمليات المتقدمة والإجراءات الخطرة</span>
          </div>
          <p className="text-xs text-[#777A72]">
            تطبيق هذه الإجراءات يؤثر مباشرة على وصول الجهاز لشبكة المنزل
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Block / Unblock Toggle */}
          <button
            id="danger-block-btn"
            onClick={() => {
              if (device.status === 'blocked') {
                unblockDevice(device.id);
              } else {
                blockDevice(device.id);
              }
            }}
            className="py-2.5 px-5 rounded-full bg-[#F7D9D2] border border-[#E0564C] hover:bg-[#E0564C] hover:text-[#FFFDF8] text-[#C0392B] font-bold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{device.status === 'blocked' ? 'إلغاء حظر الجهاز' : 'حظر الجهاز من شبكة المنزل بالكامل'}</span>
          </button>

          {/* Remove Device */}
          {!confirmRemoveOpen ? (
            <button
              id="danger-remove-btn"
              onClick={() => setConfirmRemoveOpen(true)}
              className="py-2.5 px-5 rounded-full bg-[#F6F7F2] border border-[#E3E5DC] hover:border-[#E0564C] hover:text-[#C0392B] text-[#777A72] font-bold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>إزالة الجهاز من القائمة</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in">
              <span className="text-xs font-bold text-[#C0392B] whitespace-nowrap">تأكيد حذف الجهاز؟</span>
              <button
                onClick={() => removeDevice(device.id)}
                className="px-4 py-2 bg-[#E0564C] text-white rounded-full text-xs font-bold hover:bg-[#C0392B] transition-colors whitespace-nowrap"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setConfirmRemoveOpen(false)}
                className="px-3.5 py-2 bg-[#F6F7F2] text-[#151515] rounded-full text-xs font-bold border border-[#E3E5DC] whitespace-nowrap"
              >
                تراجع
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

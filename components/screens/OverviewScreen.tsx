'use client';

import React, { useState } from 'react';
import { 
  Wifi, 
  Smartphone, 
  ShieldAlert, 
  Database, 
  SlidersHorizontal, 
  ArrowUpRight, 
  TrendingUp,
  AlertTriangle,
  PlayCircle,
  Video,
  Share2,
  Tv,
  ChevronLeft,
  SmartphoneNfc,
  CheckCircle2,
  PauseCircle
} from 'lucide-react';
import { useMizan } from '@/context/MizanContext';
import { 
  TOP_GLOBAL_APPS, 
  HOUSEHOLD_7DAY_USAGE 
} from '@/lib/mock-data';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

export default function OverviewScreen() {
  const { 
    householdQuota, 
    devices, 
    navigateToDevice, 
    openEditQuotaModal, 
    setCurrentScreen 
  } = useMizan();

  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const connectedDevicesCount = devices.filter((d) => d.status === 'connected').length;
  const warningDevicesCount = devices.filter((d) => d.status === 'warning').length;
  const blockedDevicesCount = devices.filter((d) => d.status === 'blocked' || d.isPaused).length;

  // Chart data adaptation based on selected range
  const chartData = HOUSEHOLD_7DAY_USAGE.map((item, idx) => ({
    name: item.dayLabel,
    used: timeRange === 'monthly' ? item.usedGB * 4.2 : timeRange === 'weekly' ? item.usedGB * 1.5 : item.usedGB,
    highlight: idx === 5, // Thursday is peak
  }));

  const getAppIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'tiktok': return <Video className="w-4 h-4 text-[#151515]" />;
      case 'youtube': return <PlayCircle className="w-4 h-4 text-[#151515]" />;
      case 'facebook': return <Share2 className="w-4 h-4 text-[#151515]" />;
      case 'netflix': return <Tv className="w-4 h-4 text-[#151515]" />;
      default: return <SmartphoneNfc className="w-4 h-4 text-[#151515]" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#151515] tracking-tight">
            لوحة التحكم
          </h1>
          <p className="text-sm text-[#777A72]">
            ملخص استهلاك باقة الإنترنت المنزلي ونشاط الأجهزة المتصلة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="overview-manage-quotas-btn"
            onClick={() => setCurrentScreen('quotas')}
            className="px-4 py-2.5 rounded-[18px] bg-[#FFFDF8] border border-[#E3E5DC] hover:border-[#151515] text-[#151515] font-bold text-xs flex items-center gap-2 transition-all shadow-2xs"
          >
            <span>إدارة الحصص</span>
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            id="overview-all-devices-btn"
            onClick={() => setCurrentScreen('devices')}
            className="px-4 py-2.5 rounded-[18px] bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
          >
            <span>عرض كل الأجهزة ({devices.length})</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" id="overview-summary-cards">
        {/* Card 1: Connected Devices */}
        <div 
          onClick={() => setCurrentScreen('devices')}
          className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[24px] p-5 hover:border-[#151515] cursor-pointer transition-all shadow-2xs space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#777A72]">الأجهزة المتصلة</span>
            <div className="w-9 h-9 rounded-[14px] bg-[#E7F5C8] text-[#151515] flex items-center justify-center group-hover:bg-[#C8F24A] transition-colors">
              <Smartphone className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#151515]">{connectedDevicesCount}</span>
            <span className="text-xs text-[#777A72]">من أصل {devices.length} أجهزة</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#83D96B] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#83D96B]" />
            <span>{connectedDevicesCount} أجهزة تعمل بدون قيود</span>
          </div>
        </div>

        {/* Card 2: Total Usage */}
        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[24px] p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#777A72]">إجمالي الاستهلاك</span>
            <div className="w-9 h-9 rounded-[14px] bg-[#F6F7F2] border border-[#E3E5DC] text-[#151515] flex items-center justify-center">
              <Database className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[#151515]">{householdQuota.usedGB}</span>
            <span className="text-sm font-bold text-[#777A72]">جيجابايت</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#777A72]">
            <TrendingUp className="w-3.5 h-3.5 text-[#151515]" />
            <span>متوسط 11.8 جيجابايت يومياً</span>
          </div>
        </div>

        {/* Card 3: Blocked / Warning Devices */}
        <div 
          onClick={() => setCurrentScreen('devices')}
          className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[24px] p-5 hover:border-[#E0564C] cursor-pointer transition-all shadow-2xs space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#777A72]">الأجهزة المحظورة والمقيدة</span>
            <div className="w-9 h-9 rounded-[14px] bg-[#F7D9D2] text-[#C0392B] flex items-center justify-center">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#151515]">{blockedDevicesCount}</span>
            <span className="text-xs text-[#C0392B] font-bold">جهاز متجاوز الحصة</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#F59E0B] font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{warningDevicesCount} جهاز يقترب من الحد (90%+)</span>
          </div>
        </div>

        {/* Card 4: Household Quota Summary */}
        <div 
          onClick={() => openEditQuotaModal('household')}
          className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[24px] p-5 hover:border-[#C8F24A] cursor-pointer transition-all shadow-2xs space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#777A72]">الحصة المنزلية الكلية</span>
            <div className="w-9 h-9 rounded-[14px] bg-[#E7F5C8] text-[#151515] flex items-center justify-center group-hover:bg-[#C8F24A] transition-colors">
              <Wifi className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[#151515]">{householdQuota.remainingGB}</span>
            <span className="text-sm font-bold text-[#777A72]">جيجابايت متبقية</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#151515] font-bold">{householdQuota.percentage}% مستهلكة</span>
            <span className="text-[#777A72]">تتجدد بعد {householdQuota.daysRemaining} يوم</span>
          </div>
        </div>
      </div>

      {/* Main Quota Hero Card (Prominent Card) */}
      <div 
        className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 sm:p-8 shadow-xs relative overflow-hidden"
        id="household-quota-hero-card"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left / Info side */}
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7F5C8] border border-[#C8F24A] text-xs font-bold text-[#151515]">
              <span className="w-2 h-2 rounded-full bg-[#83D96B]" />
              <span>حصة باقة الإنترنت الرئيسية (Mizan Smart Quota)</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#151515] tracking-tight">
                استهلكت <span className="text-[#151515]">{householdQuota.usedGB}</span> جيجابايت{' '}
                <span className="text-xl sm:text-2xl text-[#777A72] font-normal">
                  من أصل {householdQuota.totalGB} جيجابايت
                </span>
              </h2>
              <p className="text-base text-[#777A72] flex items-center gap-2">
                <span>المتبقي</span>
                <span className="font-bold text-xl text-[#151515]">{householdQuota.remainingGB} جيجابايت</span>
                <span>•</span>
                <span className="font-bold text-[#151515]">{householdQuota.percentage}% من الحصة مستخدمة</span>
              </p>
            </div>

            {/* Progress Bar Multi-Segment */}
            <div className="space-y-2 pt-2">
              <div className="w-full bg-[#F6F7F2] border border-[#E3E5DC] h-5 rounded-full p-1 flex items-center">
                <div
                  className="bg-[#151515] h-full rounded-full transition-all duration-700 relative flex items-center justify-end pr-2"
                  style={{ width: `${Math.min(100, householdQuota.percentage)}%` }}
                >
                  <span className="text-[10px] font-bold text-[#C8F24A] pl-1 select-none">
                    {householdQuota.percentage}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#777A72]">
                <span>0 جيجابايت (بداية الشهر)</span>
                <span className="font-bold text-[#151515]">حد التنبيه: {householdQuota.firstAlertPercent}%</span>
                <span>{householdQuota.totalGB} جيجابايت (الحد الأقصى)</span>
              </div>
            </div>

            {/* CTA action */}
            <div className="pt-2 flex items-center gap-3">
              <button
                id="hero-edit-quota-btn"
                onClick={() => openEditQuotaModal('household')}
                className="py-2.5 px-6 rounded-full bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs whitespace-nowrap"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>تعديل الحصة المنزلية ومستويات التنبيه</span>
              </button>
            </div>
          </div>

          {/* Right Circular Gauge */}
          <div className="bg-[#F6F7F2] border border-[#E3E5DC] rounded-[24px] p-6 flex flex-col items-center justify-center min-w-[240px] text-center space-y-3 shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Circular SVG Ring */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#E3E5DC"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#151515"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - householdQuota.percentage / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#151515]">{householdQuota.percentage}%</span>
                <span className="text-[11px] text-[#777A72] font-semibold">مستهلك</span>
              </div>
            </div>

            <div className="text-xs text-[#777A72] space-y-0.5">
              <p className="font-bold text-[#151515]">حالة الاستهلاك: طبيعي</p>
              <p>تجديد تلقائي: {householdQuota.resetDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 7-Day Chart & Top Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Chart (2 columns) */}
        <div className="lg:col-span-2 bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#151515]">
                استهلاك الإنترنت خلال آخر سبعة أيام
              </h3>
              <p className="text-xs text-[#777A72]">
                توزيع استخدام الجيجابايت اليومي لشبكة المنزل
              </p>
            </div>

            {/* Time period filter */}
            <div className="flex bg-[#F6F7F2] border border-[#E3E5DC] rounded-[16px] p-1 self-start">
              {(['daily', 'weekly', 'monthly'] as const).map((period) => {
                const labels = {
                  daily: 'يومي',
                  weekly: 'أسبوعي',
                  monthly: 'شهري',
                };
                const isActive = timeRange === period;
                return (
                  <button
                    key={period}
                    id={`filter-${period}`}
                    onClick={() => setTimeRange(period)}
                    className={`px-3.5 py-1.5 rounded-[12px] text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#151515] text-[#FFFDF8]'
                        : 'text-[#777A72] hover:text-[#151515]'
                    }`}
                  >
                    {labels[period]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#777A72', fontSize: 12, fontWeight: 600 }} 
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
                        <div className="bg-[#151515] text-[#FFFDF8] p-3 rounded-[16px] text-xs space-y-1 shadow-lg text-right">
                          <p className="font-bold text-[#C8F24A]">{payload[0].payload.name}</p>
                          <p className="font-semibold">{Number(payload[0].value).toFixed(1)} جيجابايت مستهلكة</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="used" radius={[10, 10, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.highlight ? '#C8F24A' : '#151515'} 
                      stroke={entry.highlight ? '#151515' : 'none'}
                      strokeWidth={entry.highlight ? 1.5 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-[#777A72] pt-2 border-t border-[#E3E5DC]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#151515]" />
              <span>الاستهلاك اليومي</span>
              <span className="w-3 h-3 rounded-md bg-[#C8F24A] border border-[#151515] mr-2" />
              <span>ذروة الاستهلاك (الخميس)</span>
            </div>
            <span className="font-semibold text-[#151515]">المتوسط اليومي: 11.8 GB</span>
          </div>
        </div>

        {/* Top Apps (1 column) */}
        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 space-y-5 shadow-2xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#151515]">
                أكثر التطبيقات استهلاكاً
              </h3>
              <span className="text-xs font-bold text-[#777A72]">هذا الشهر</span>
            </div>
            <p className="text-xs text-[#777A72]">
              التطبيقات الأكثر استنزافاً لحصة الراوتر المنزلي
            </p>
          </div>

          {/* Top Apps List */}
          <div className="space-y-3.5">
            {TOP_GLOBAL_APPS.slice(0, 5).map((app, index) => (
              <div 
                key={app.id}
                className="bg-[#F6F7F2] p-3 rounded-[18px] border border-[#E3E5DC] space-y-2 hover:border-[#151515] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[12px] bg-[#FFFDF8] border border-[#E3E5DC] flex items-center justify-center">
                      {getAppIcon(app.name)}
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-bold text-[#151515] flex items-center gap-1.5">
                        <span>{app.nameAr}</span>
                        <span className="text-[11px] text-[#777A72] font-normal">({app.name})</span>
                      </span>
                      <span className="text-[10px] text-[#777A72]">{app.category}</span>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-sm font-bold text-[#151515] block">
                      {app.usedGB} <span className="text-[10px] font-normal text-[#777A72]">GB</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#777A72]">
                      {app.percentage}%
                    </span>
                  </div>
                </div>

                {/* mini progress */}
                <div className="w-full bg-[#E3E5DC] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${index === 0 ? 'bg-[#151515]' : index === 1 ? 'bg-[#C8F24A]' : 'bg-[#83D96B]'}`}
                    style={{ width: `${app.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setCurrentScreen('analytics')}
            className="w-full py-2.5 rounded-full bg-[#F6F7F2] hover:bg-[#E3E5DC] text-[#151515] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>عرض تفاصيل التطبيقات الكاملة</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Device Status Section (Active, Warning, Blocked) */}
      <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#151515]">
              حالة الأجهزة المتصلة بالمنزل
            </h3>
            <p className="text-xs text-[#777A72]">
              نظرة سريعة على أجهزة أفراد الأسرة (المتصلة، القريبة من الحد، والمحظورة)
            </p>
          </div>

          <button
            onClick={() => setCurrentScreen('devices')}
            className="text-xs font-bold text-[#151515] bg-[#E7F5C8] hover:bg-[#C8F24A] px-4 py-2 rounded-full border border-[#C8F24A] transition-colors self-start flex items-center gap-1"
          >
            <span>إدارة جميع الأجهزة</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Status Columns / Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Connected / Active */}
          <div className="bg-[#F6F7F2] p-4 rounded-[22px] border border-[#E3E5DC] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E5DC]">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#151515]">
                <CheckCircle2 className="w-4 h-4 text-[#83D96B]" />
                أجهزة نشطة ومتصلة
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#E7F5C8] text-[#151515] font-bold text-xs">
                {connectedDevicesCount}
              </span>
            </div>

            <div className="space-y-2.5">
              {devices
                .filter((d) => d.status === 'connected')
                .slice(0, 2)
                .map((device) => (
                  <div
                    key={device.id}
                    onClick={() => navigateToDevice(device.id)}
                    className="bg-[#FFFDF8] p-3 rounded-[16px] border border-[#E3E5DC] hover:border-[#151515] cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#151515] group-hover:text-[#151515]">
                        {device.ownerName} ({device.name})
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#777A72] group-hover:text-[#151515]" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#777A72]">
                      <span>{device.usedGB} GB من {device.allowedQuotaGB} GB</span>
                      <span className="text-[#83D96B] font-bold">متصل الآن</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 2: Near Limit / Warning */}
          <div className="bg-[#F6F7F2] p-4 rounded-[22px] border border-[#FEF3C7] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E5DC]">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#B45309]">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                قريبة من استهلاك الحد
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-bold text-xs">
                {warningDevicesCount}
              </span>
            </div>

            <div className="space-y-2.5">
              {devices
                .filter((d) => d.status === 'warning')
                .map((device) => (
                  <div
                    key={device.id}
                    onClick={() => navigateToDevice(device.id)}
                    className="bg-[#FFFDF8] p-3 rounded-[16px] border border-[#F59E0B] hover:border-[#151515] cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#151515]">
                        {device.ownerName} ({device.name})
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309] text-[10px] font-bold">
                        92% مستخدم
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#777A72]">
                      <span>{device.usedGB} GB من {device.allowedQuotaGB} GB</span>
                      <span className="text-[#B45309] font-semibold">متبقي 2.4 GB فقط</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 3: Blocked / Quota Exhausted */}
          <div className="bg-[#F6F7F2] p-4 rounded-[22px] border border-[#F7D9D2] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E5DC]">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#C0392B]">
                <PauseCircle className="w-4 h-4 text-[#E0564C]" />
                محظورة لتجاوز الحصة
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#F7D9D2] text-[#C0392B] font-bold text-xs">
                {blockedDevicesCount}
              </span>
            </div>

            <div className="space-y-2.5">
              {devices
                .filter((d) => d.status === 'blocked' || d.isPaused)
                .map((device) => (
                  <div
                    key={device.id}
                    onClick={() => navigateToDevice(device.id)}
                    className="bg-[#FFFDF8] p-3 rounded-[16px] border border-[#E0564C] hover:border-[#151515] cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#151515]">
                        {device.ownerName} ({device.name})
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-[#F7D9D2] text-[#C0392B] text-[10px] font-bold">
                        محظور مؤقتاً
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#777A72]">
                      <span className="text-[#C0392B] font-bold">{device.usedGB} GB (تجاوز {device.allowedQuotaGB} GB)</span>
                      <span className="underline text-[#151515] font-bold">تمديد الحصة</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

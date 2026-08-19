'use client';

import React from 'react';
import { 
  SlidersHorizontal, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  TrendingUp,
  PieChart as PieIcon,
  ChevronLeft,
  Settings2,
  Users
} from 'lucide-react';
import { useMizan } from '@/context/MizanContext';

export default function QuotasScreen() {
  const { 
    householdQuota, 
    devices, 
    openEditQuotaModal, 
    navigateToDevice 
  } = useMizan();

  // Calculate sum of custom device quotas
  const totalCustomAllocated = devices.reduce((sum, d) => sum + d.allowedQuotaGB, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#151515] tracking-tight">
            إدارة الحصص
          </h1>
          <p className="text-sm text-[#777A72]">
            تحديد ومراقبة الحصة المنزلية العامة وحصص الأجهزة الفردية لأفراد الأسرة
          </p>
        </div>

        <button
          id="quotas-main-edit-btn"
          onClick={() => openEditQuotaModal('household')}
          className="px-5 py-2.5 rounded-full bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs self-start whitespace-nowrap"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>تعديل الحصة العامة</span>
        </button>
      </div>

      {/* Household Quota Master Panel */}
      <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#E3E5DC]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E7F5C8] border border-[#C8F24A] text-xs font-bold text-[#151515]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#151515]" />
              <span>الحصة المنزلية العامة (الباقة الشاملة)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#151515]">
              {householdQuota.totalGB} <span className="text-xl text-[#777A72] font-normal">جيجابايت شهرياً</span>
            </h2>
            <p className="text-sm text-[#777A72]">
              المستخدم حالياً <strong className="text-[#151515]">{householdQuota.usedGB} GB</strong> • المتبقي <strong className="text-[#151515]">{householdQuota.remainingGB} GB</strong> ({householdQuota.percentage}%)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#F6F7F2] border border-[#E3E5DC] p-3.5 rounded-[18px] text-right space-y-0.5">
              <span className="text-[11px] text-[#777A72] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#151515]" />
                دورة الحصة
              </span>
              <span className="text-xs font-bold text-[#151515]">
                {householdQuota.period === 'monthly' ? 'شهرياً (1 إلى 30)' : 'أسبوعياً'}
              </span>
            </div>

            <div className="bg-[#F6F7F2] border border-[#E3E5DC] p-3.5 rounded-[18px] text-right space-y-0.5">
              <span className="text-[11px] text-[#777A72] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#151515]" />
                موعد إعادة الضبط
              </span>
              <span className="text-xs font-bold text-[#151515]">
                {householdQuota.resetDate} (بعد {householdQuota.daysRemaining} يوم)
              </span>
            </div>
          </div>
        </div>

        {/* Multi-tier Quota Allocation Meter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#151515]">توزيع الحصة الإجمالية</span>
            <span className="text-[#777A72]">
              تم تخصيص {totalCustomAllocated} GB من أصل {householdQuota.totalGB} GB للأجهزة
            </span>
          </div>

          <div className="w-full bg-[#F6F7F2] border border-[#E3E5DC] h-5 rounded-full p-1 flex items-center">
            <div
              className="bg-[#151515] h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (householdQuota.usedGB / householdQuota.totalGB) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#777A72]">
            <span>0 GB</span>
            <span className="font-semibold text-[#151515]">
              نسبة التنبيه الأول: {householdQuota.firstAlertPercent}% | نسبة التنبيه الثاني: {householdQuota.secondAlertPercent}%
            </span>
            <span>{householdQuota.totalGB} GB</span>
          </div>
        </div>
      </div>

      {/* Alert Policy & Automated Cutoff Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2.5 text-[#151515]">
            <div className="w-9 h-9 rounded-[14px] bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#151515]">سياسة التنبيهات الذكية</h3>
              <p className="text-xs text-[#777A72]">إرسال إشعارات للأجهزة قبل نفاد الحصة</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-[#777A72]">
            <div className="flex items-center justify-between p-3 rounded-[16px] bg-[#F6F7F2] border border-[#E3E5DC]">
              <span>تنبيه المستوى الأول (تحذير مبكر)</span>
              <strong className="text-[#151515] font-bold">عند استهلاك {householdQuota.firstAlertPercent}%</strong>
            </div>
            <div className="flex items-center justify-between p-3 rounded-[16px] bg-[#F6F7F2] border border-[#E3E5DC]">
              <span>تنبيه المستوى الثاني (اقتراب الإيقاف)</span>
              <strong className="text-[#C0392B] font-bold">عند استهلاك {householdQuota.secondAlertPercent}%</strong>
            </div>
          </div>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2.5 text-[#151515]">
            <div className="w-9 h-9 rounded-[14px] bg-[#E7F5C8] text-[#151515] flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#151515]">الحماية من التجاوز (Auto-Cutoff)</h3>
              <p className="text-xs text-[#777A72]">إيقاف تدفق الإنترنت فور الوصول إلى 100%</p>
            </div>
          </div>

          <div className="p-3.5 rounded-[18px] bg-[#F6F7F2] border border-[#E3E5DC] text-xs text-[#777A72] space-y-1">
            <div className="flex items-center justify-between font-bold text-[#151515]">
              <span>حالة الحماية التلقائية:</span>
              <span className="text-[#83D96B] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#83D96B]" />
                مفعلة ونشطة
              </span>
            </div>
            <p>يمنع النظام استهلاك أي ميجابايت إضافية تفرض رسوم تجديد غير مرغوبة على باقة المنزل.</p>
          </div>
        </div>
      </div>

      {/* Individual Device Quotas Section */}
      <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3E5DC]">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#151515] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#151515]" />
              <span>حصص الأجهزة الفردية</span>
            </h3>
            <p className="text-xs text-[#777A72]">
              تخصيص حصص مستقلة لكل فرد من أفراد الأسرة لضمان العدالة وتفادي استنزاف الباقة
            </p>
          </div>
        </div>

        {/* Devices List for Quotas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => {
            const usagePercent = Math.min(100, Math.round((device.usedGB / device.allowedQuotaGB) * 100));
            const remainingGB = Math.max(0, Number((device.allowedQuotaGB - device.usedGB).toFixed(1)));
            const isBlocked = device.status === 'blocked' || device.isPaused;

            return (
              <div
                key={device.id}
                className="bg-[#F6F7F2] p-5 rounded-[22px] border border-[#E3E5DC] hover:border-[#151515] transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col text-right">
                      <span className="font-bold text-sm text-[#151515]">
                        {device.ownerName}
                      </span>
                      <span className="text-[11px] text-[#777A72]">
                        {device.name}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isBlocked 
                        ? 'bg-[#F7D9D2] text-[#C0392B]' 
                        : usagePercent > 85 
                        ? 'bg-[#FEF3C7] text-[#B45309]' 
                        : 'bg-[#E7F5C8] text-[#151515]'
                    }`}>
                      {isBlocked ? 'متجاوز' : `${usagePercent}%`}
                    </span>
                  </div>

                  {/* Quota numbers */}
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-[#777A72]">
                      المستخدم: <strong className="text-[#151515] font-bold">{device.usedGB} GB</strong>
                    </span>
                    <span className="text-[#777A72]">
                      الحصة: <strong className="text-[#151515] font-bold">{device.allowedQuotaGB} GB</strong>
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="w-full bg-[#E3E5DC] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBlocked ? 'bg-[#E0564C]' : usagePercent > 85 ? 'bg-[#F59E0B]' : 'bg-[#151515]'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#E3E5DC]/80">
                  <button
                    onClick={() => openEditQuotaModal('device', device)}
                    className="flex-1 py-2 px-3.5 rounded-full bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>تعديل الحصة</span>
                  </button>

                  <button
                    onClick={() => navigateToDevice(device.id)}
                    className="p-2 rounded-full bg-[#FFFDF8] border border-[#E3E5DC] text-[#151515] hover:bg-[#E3E5DC] transition-colors shrink-0"
                    title="تفاصيل الجهاز"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

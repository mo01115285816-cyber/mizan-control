'use client';

import React, { useState } from 'react';
import { X, SlidersHorizontal, AlertTriangle, Check } from 'lucide-react';
import { useMizan } from '@/context/MizanContext';
import { Device, HouseholdQuota } from '@/types/mizan';

interface QuotaFormProps {
  isDevice: boolean;
  targetDevice?: Device;
  householdQuota: HouseholdQuota;
  onSave: (params: {
    type: 'household' | 'device';
    deviceId?: string;
    totalGB: number;
    period: 'monthly' | 'weekly';
    firstAlertPercent: number;
    secondAlertPercent: number;
  }) => void;
  onCancel: () => void;
}

function QuotaForm({ isDevice, targetDevice, householdQuota, onSave, onCancel }: QuotaFormProps) {
  const [quotaValue, setQuotaValue] = useState<number>(() => {
    if (isDevice && targetDevice) return targetDevice.allowedQuotaGB;
    return householdQuota.totalGB;
  });
  const [unit, setUnit] = useState<'GB' | 'MB'>('GB');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>(() => {
    if (isDevice) return 'monthly';
    return householdQuota.period;
  });
  const [firstAlert, setFirstAlert] = useState<number>(() => {
    if (isDevice) return 85;
    return householdQuota.firstAlertPercent;
  });
  const [secondAlert, setSecondAlert] = useState<number>(() => {
    if (isDevice) return 95;
    return householdQuota.secondAlertPercent;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveGB = unit === 'MB' ? quotaValue / 1024 : quotaValue;
    onSave({
      type: isDevice ? 'device' : 'household',
      deviceId: targetDevice?.id,
      totalGB: effectiveGB,
      period,
      firstAlertPercent: firstAlert,
      secondAlertPercent: secondAlert,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-right">
      {/* Quota Value & Unit */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#151515] block">
          قيمة الحصة المسموحة
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="number"
            step="0.1"
            min="1"
            max="2000"
            required
            value={quotaValue}
            onChange={(e) => setQuotaValue(parseFloat(e.target.value) || 0)}
            className="w-full sm:flex-1 bg-[#F6F7F2] border border-[#E3E5DC] focus:border-[#151515] focus:bg-[#FFFDF8] rounded-full px-4 py-2.5 text-base sm:text-lg font-bold text-[#151515] outline-none transition-all"
          />
          <div className="flex bg-[#F6F7F2] border border-[#E3E5DC] rounded-full p-1 shrink-0 self-stretch sm:self-auto justify-center">
            <button
              type="button"
              onClick={() => setUnit('GB')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                unit === 'GB' ? 'bg-[#151515] text-[#FFFDF8]' : 'text-[#777A72] hover:text-[#151515]'
              }`}
            >
              جيجابايت (GB)
            </button>
            <button
              type="button"
              onClick={() => setUnit('MB')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                unit === 'MB' ? 'bg-[#151515] text-[#FFFDF8]' : 'text-[#777A72] hover:text-[#151515]'
              }`}
            >
              ميجابايت (MB)
            </button>
          </div>
        </div>
      </div>

      {/* Quota Period */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#151515] block">
          دورة إعادة الضبط (فترة الحصة)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={`py-2.5 px-4 rounded-full border text-xs font-bold transition-all text-center flex items-center justify-center gap-2 whitespace-nowrap ${
              period === 'monthly'
                ? 'bg-[#E7F5C8] border-[#C8F24A] text-[#151515]'
                : 'bg-[#F6F7F2] border-[#E3E5DC] text-[#777A72] hover:text-[#151515]'
            }`}
          >
            {period === 'monthly' && <Check className="w-3.5 h-3.5 shrink-0" />}
            <span>شهرياً (أول كل شهر)</span>
          </button>
          <button
            type="button"
            onClick={() => setPeriod('weekly')}
            className={`py-2.5 px-4 rounded-full border text-xs font-bold transition-all text-center flex items-center justify-center gap-2 whitespace-nowrap ${
              period === 'weekly'
                ? 'bg-[#E7F5C8] border-[#C8F24A] text-[#151515]'
                : 'bg-[#F6F7F2] border-[#E3E5DC] text-[#777A72] hover:text-[#151515]'
            }`}
          >
            {period === 'weekly' && <Check className="w-3.5 h-3.5 shrink-0" />}
            <span>أسبوعياً (كل سبت)</span>
          </button>
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="p-3.5 sm:p-4 bg-[#F6F7F2] border border-[#E3E5DC] rounded-[22px] space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#151515]">
          <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>مستويات التنبيه التلقائي للمستخدم</span>
        </div>

        {/* Alert 1 */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-[#777A72]">
            <span>نسبة التنبيه الأولى (تحذير اقتراب)</span>
            <span className="font-bold text-[#151515]">{firstAlert}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="90"
            step="5"
            value={firstAlert}
            onChange={(e) => setFirstAlert(parseInt(e.target.value))}
            className="w-full accent-[#151515] bg-[#E3E5DC] h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Alert 2 */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-[#777A72]">
            <span>نسبة التنبيه الثانية (خطر الإيقاف)</span>
            <span className="font-bold text-[#C0392B]">{secondAlert}%</span>
          </div>
          <input
            type="range"
            min="90"
            max="100"
            step="1"
            value={secondAlert}
            onChange={(e) => setSecondAlert(parseInt(e.target.value))}
            className="w-full accent-[#C0392B] bg-[#E3E5DC] h-2 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Action Buttons - Pill Shaped & Horizontal */}
      <div className="flex items-center gap-2.5 pt-2">
        <button
          id="save-quota-modal-btn"
          type="submit"
          className="flex-1 py-3 px-5 rounded-full bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 whitespace-nowrap"
        >
          حفظ التعديل
        </button>
        <button
          id="cancel-quota-modal-btn"
          type="button"
          onClick={onCancel}
          className="py-3 px-5 rounded-full bg-[#F6F7F2] border border-[#E3E5DC] hover:bg-[#E3E5DC] text-[#151515] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

export default function EditQuotaModal() {
  const { 
    editQuotaModalOpen, 
    closeEditQuotaModal, 
    editQuotaTarget, 
    householdQuota, 
    updateQuota 
  } = useMizan();

  if (!editQuotaModalOpen) return null;

  const isDevice = editQuotaTarget?.type === 'device';
  const targetDevice = editQuotaTarget?.device;

  const handleSave = (params: {
    type: 'household' | 'device';
    deviceId?: string;
    totalGB: number;
    period: 'monthly' | 'weekly';
    firstAlertPercent: number;
    secondAlertPercent: number;
  }) => {
    updateQuota(params);
    closeEditQuotaModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="bg-[#FFFDF8] border border-[#E3E5DC] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[28px] shadow-2xl p-4 sm:p-6 md:p-7 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150"
        id="edit-quota-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E3E5DC]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#C8F24A] text-[#151515] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col text-right min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-[#151515] truncate">
                {isDevice ? `تعديل حصة (${targetDevice?.name})` : 'تعديل الحصة المنزلية'}
              </h3>
              <p className="text-[11px] text-[#777A72] truncate">
                {isDevice 
                  ? `الاستهلاك الحالي: ${targetDevice?.usedGB} GB من ${targetDevice?.allowedQuotaGB} GB` 
                  : `الاستهلاك الحالي للمنزل: ${householdQuota.usedGB} GB`}
              </p>
            </div>
          </div>

          <button
            onClick={closeEditQuotaModal}
            className="p-2 rounded-full text-[#777A72] hover:text-[#151515] hover:bg-[#F6F7F2] transition-colors shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal Form */}
        <QuotaForm
          key={isDevice ? `dev-${targetDevice?.id}` : 'household-form'}
          isDevice={isDevice}
          targetDevice={targetDevice}
          householdQuota={householdQuota}
          onSave={handleSave}
          onCancel={closeEditQuotaModal}
        />
      </div>
    </div>
  );
}


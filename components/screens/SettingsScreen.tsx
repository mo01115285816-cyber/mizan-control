'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Wifi, 
  ShieldCheck, 
  BellRing, 
  User, 
  Save, 
  RotateCcw, 
  Check, 
  Sliders, 
  Globe, 
  Database,
  Lock,
  Download
} from 'lucide-react';
import { useMizan } from '@/context/MizanContext';

export default function SettingsScreen() {
  const { adminName, showToast, refreshData } = useMizan();

  const [autoCutoff, setAutoCutoff] = useState<boolean>(true);
  const [notifyOnNearLimit, setNotifyOnNearLimit] = useState<boolean>(true);
  const [notifyOnBlock, setNotifyOnBlock] = useState<boolean>(true);
  const [dailyDigest, setDailyDigest] = useState<boolean>(false);
  const [arabicNumerals, setArabicNumerals] = useState<boolean>(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('تم حفظ الإعدادات', 'تم تطبيق التغييرات على راوتر ونظام Mizan بنجاح', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#151515] tracking-tight">
          إعدادات النظام والراوتر
        </h1>
        <p className="text-sm text-[#777A72]">
          ضبط معايير التحكم، بروتوكولات المزامنة، وتفضيلات الإشعارات لشبكة ميزان
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Router & Network Gateway Card */}
        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 sm:p-8 space-y-5 shadow-2xs">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E3E5DC]">
            <div className="w-10 h-10 rounded-[14px] bg-[#E7F5C8] text-[#151515] flex items-center justify-center">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#151515]">بيانات الراوتر وشبكة Wi-Fi</h2>
              <p className="text-xs text-[#777A72]">معلومات البوابة المتصلة بلوحة التحكم</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#F6F7F2] p-4 rounded-[18px] border border-[#E3E5DC] space-y-1">
              <span className="text-[#777A72]">اسم شبكة 5GHz (SSID)</span>
              <strong className="text-sm font-bold text-[#151515] block">Mizan_Home_5G</strong>
            </div>

            <div className="bg-[#F6F7F2] p-4 rounded-[18px] border border-[#E3E5DC] space-y-1">
              <span className="text-[#777A72]">اسم شبكة 2.4GHz</span>
              <strong className="text-sm font-bold text-[#151515] block">Mizan_Home_2.4G</strong>
            </div>

            <div className="bg-[#F6F7F2] p-4 rounded-[18px] border border-[#E3E5DC] space-y-1">
              <span className="text-[#777A72]">عنوان بوابة الراوتر (Gateway IP)</span>
              <strong className="text-sm font-mono font-bold text-[#151515] block">192.168.1.1</strong>
            </div>

            <div className="bg-[#F6F7F2] p-4 rounded-[18px] border border-[#E3E5DC] space-y-1">
              <span className="text-[#777A72]">بروتوكول التشفير</span>
              <strong className="text-sm font-bold text-[#83D96B] block">WPA3-SAE (محمي)</strong>
            </div>
          </div>
        </div>

        {/* Protection & Automation Rules */}
        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 sm:p-8 space-y-5 shadow-2xs">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E3E5DC]">
            <div className="w-10 h-10 rounded-[14px] bg-[#151515] text-[#C8F24A] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#151515]">الحماية الذكية والتحكم الآلي</h2>
              <p className="text-xs text-[#777A72]">الإجراءات التلقائية عند الوصول للحدود المحددة</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 rounded-[20px] bg-[#F6F7F2] border border-[#E3E5DC] cursor-pointer hover:border-[#151515] transition-colors">
              <div className="space-y-0.5 text-right">
                <span className="text-sm font-bold text-[#151515] block">
                  إيقاف الإنترنت التلقائي عند استنفاد الحصة (Auto-Cutoff)
                </span>
                <span className="text-xs text-[#777A72]">
                  يقوم بحظر الوصول فور تجاوز الجهاز لحصته الشهرية لمنع احتساب سرعات إضافية
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoCutoff}
                onChange={(e) => setAutoCutoff(e.target.checked)}
                className="w-5 h-5 rounded-md accent-[#151515] cursor-pointer shrink-0 mr-4"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-[20px] bg-[#F6F7F2] border border-[#E3E5DC] cursor-pointer hover:border-[#151515] transition-colors">
              <div className="space-y-0.5 text-right">
                <span className="text-sm font-bold text-[#151515] block">
                  إرسال إشعار تحذيري عند بلوغ 85% من الحصة
                </span>
                <span className="text-xs text-[#777A72]">
                  تنبيه صاحب الجهاز والمسؤول للاعتدال في الاستهلاك
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyOnNearLimit}
                onChange={(e) => setNotifyOnNearLimit(e.target.checked)}
                className="w-5 h-5 rounded-md accent-[#151515] cursor-pointer shrink-0 mr-4"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-[20px] bg-[#F6F7F2] border border-[#E3E5DC] cursor-pointer hover:border-[#151515] transition-colors">
              <div className="space-y-0.5 text-right">
                <span className="text-sm font-bold text-[#151515] block">
                  إرسال تنبيه فوري للمسؤول عند حظر أي جهاز
                </span>
                <span className="text-xs text-[#777A72]">
                  إشعار مباشر في لوحة التحكم وعلى الهاتف
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyOnBlock}
                onChange={(e) => setNotifyOnBlock(e.target.checked)}
                className="w-5 h-5 rounded-md accent-[#151515] cursor-pointer shrink-0 mr-4"
              />
            </label>
          </div>
        </div>

        {/* Admin Account Settings */}
        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 sm:p-8 space-y-5 shadow-2xs">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E3E5DC]">
            <div className="w-10 h-10 rounded-[14px] bg-[#F6F7F2] border border-[#E3E5DC] text-[#151515] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#151515]">بيانات حساب المسؤول</h2>
              <p className="text-xs text-[#777A72]">تعديل الاسم والبريد الإلكتروني للوحة التحكم</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#151515]">اسم المسؤول</label>
              <input
                type="text"
                defaultValue={adminName}
                className="w-full bg-[#F6F7F2] border border-[#E3E5DC] focus:border-[#151515] rounded-full px-4 py-2.5 text-sm font-bold text-[#151515] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#151515]">البريد الإلكتروني</label>
              <input
                type="email"
                defaultValue="admin@mizan.home"
                className="w-full bg-[#F6F7F2] border border-[#E3E5DC] focus:border-[#151515] rounded-full px-4 py-2.5 text-sm font-bold text-[#151515] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions - Pill-shaped capsules & horizontal text */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            id="save-all-settings-btn"
            type="submit"
            className="py-3 px-7 rounded-full bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs whitespace-nowrap"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>حفظ جميع التعديلات</span>
          </button>

          <button
            id="resync-router-settings-btn"
            type="button"
            onClick={refreshData}
            className="py-2.5 px-5 rounded-full bg-[#F6F7F2] border border-[#E3E5DC] text-[#777A72] hover:text-[#151515] hover:bg-[#E3E5DC] font-bold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>إعادة المزامنة مع الراوتر</span>
          </button>
        </div>
      </form>
    </div>
  );
}

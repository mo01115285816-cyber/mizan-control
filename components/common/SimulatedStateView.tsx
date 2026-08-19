'use client';

import React from 'react';
import { 
  WifiOff, 
  RefreshCw, 
  Smartphone, 
  ShieldAlert, 
  RotateCw, 
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useMizan } from '@/context/MizanContext';

interface SimulatedStateViewProps {
  onRetry?: () => void;
}

export default function SimulatedStateView({ onRetry }: SimulatedStateViewProps) {
  const { simulatedState, resetSimulatedState, showToast } = useMizan();

  if (simulatedState === 'normal') return null;

  const handleRetryAction = () => {
    resetSimulatedState();
    showToast('تمت إعادة المحاولة بنجاح', 'تمت استعادة الاتصال ومزامنة لوحة التحكم', 'success');
    if (onRetry) onRetry();
  };

  if (simulatedState === 'loading') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] my-6 space-y-5 animate-pulse">
        <div className="w-16 h-16 rounded-[22px] bg-[#E7F5C8] text-[#151515] flex items-center justify-center shadow-xs">
          <RotateCw className="w-8 h-8 animate-spin text-[#151515]" />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-bold text-[#151515]">
            جاري قراءة ومزامنة عدادات الاستهلاك...
          </h3>
          <p className="text-sm text-[#777A72] leading-relaxed">
            يتم الآن الاتصال بالراوتر المنزلي (Mizan Gateway) وتجميع إحصائيات الحصص اللحظية لكافة أفراد الأسرة.
          </p>
        </div>
        <div className="w-48 bg-[#E3E5DC] h-2 rounded-full overflow-hidden">
          <div className="bg-[#C8F24A] h-full rounded-full w-2/3 animate-[pulse_1s_infinite]" />
        </div>
      </div>
    );
  }

  if (simulatedState === 'empty') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] my-6 space-y-5">
        <div className="w-16 h-16 rounded-[22px] bg-[#F6F7F2] border border-[#E3E5DC] text-[#777A72] flex items-center justify-center">
          <Smartphone className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-bold text-[#151515]">
            لا توجد أجهزة متصلة حالياً
          </h3>
          <p className="text-sm text-[#777A72] leading-relaxed">
            لم يتم العثور على أجهزة نشطة على شبكة Mizan المنزلية. قم بتوصيل أجهزة أفراد المنزل للبدء في تتبع الحصص وإدارتها.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRetryAction}
            className="py-3 px-6 rounded-[18px] bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-sm transition-all"
          >
            تحديث قائمة الأجهزة
          </button>
        </div>
      </div>
    );
  }

  if (simulatedState === 'disconnected') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-[#FFFDF8] border border-[#F7D9D2] rounded-[28px] my-6 space-y-5">
        <div className="w-16 h-16 rounded-[22px] bg-[#F7D9D2] text-[#C0392B] flex items-center justify-center shadow-xs">
          <WifiOff className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <div className="inline-block px-3 py-1 bg-[#F7D9D2] text-[#C0392B] rounded-full text-xs font-bold mb-1">
            انقطاع الاتصال بالشبكة
          </div>
          <h3 className="text-xl font-bold text-[#151515]">
            تعذر الوصول إلى راوتر المنزل
          </h3>
          <p className="text-sm text-[#777A72] leading-relaxed">
            تأكد من تشغيل الراوتر أو اتصالك بنفس شبكة Wi-Fi المحلية (Mizan_Home_5G). لا يمكن جلب بيانات الاستهلاك الحية حالياً.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRetryAction}
            className="flex items-center gap-2 py-3 px-6 rounded-[18px] bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة فحص الاتصال</span>
          </button>
          <button
            onClick={resetSimulatedState}
            className="py-3 px-6 rounded-[18px] bg-[#F6F7F2] border border-[#E3E5DC] text-[#151515] font-bold text-sm hover:bg-[#E3E5DC] transition-all"
          >
            العودة للوضع الطبيعي
          </button>
        </div>
      </div>
    );
  }

  if (simulatedState === 'sync_error') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-[#FFFDF8] border border-[#FEF3C7] rounded-[28px] my-6 space-y-5">
        <div className="w-16 h-16 rounded-[22px] bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <div className="inline-block px-3 py-1 bg-[#FEF3C7] text-[#B45309] rounded-full text-xs font-bold mb-1">
            خطأ في المزامنة
          </div>
          <h3 className="text-xl font-bold text-[#151515]">
            تعذر تحديث إحصائيات الحصة
          </h3>
          <p className="text-sm text-[#777A72] leading-relaxed">
            حدث تفاوت في قراءة الحزم بين الراوتر وخادم الميزان المحلي. تم الاحتفاظ بآخر نسخة مؤقتة من بيانات الاستهلاك.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRetryAction}
            className="py-3 px-6 rounded-[18px] bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-sm transition-all"
          >
            مزامنة يدوية فورية
          </button>
          <button
            onClick={resetSimulatedState}
            className="py-3 px-6 rounded-[18px] bg-[#F6F7F2] border border-[#E3E5DC] text-[#151515] font-bold text-sm hover:bg-[#E3E5DC] transition-all"
          >
            تخطي
          </button>
        </div>
      </div>
    );
  }

  if (simulatedState === 'unauthorized') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] my-6 space-y-5">
        <div className="w-16 h-16 rounded-[22px] bg-[#151515] text-[#C8F24A] flex items-center justify-center shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <div className="inline-block px-3 py-1 bg-[#F6F7F2] border border-[#E3E5DC] text-[#151515] rounded-full text-xs font-bold mb-1">
            صلاحيات المسؤول مطلوبة
          </div>
          <h3 className="text-xl font-bold text-[#151515]">
            غير مصرح بالوصول إلى لوحة التحكم
          </h3>
          <p className="text-sm text-[#777A72] leading-relaxed">
            هذه الإعدادات مخصصة لمالك شبكة Mizan فقط. يرجى تسجيل الدخول بحساب المسؤول لتعديل الحصص أو التحكم في الأجهزة.
          </p>
        </div>
        <button
          onClick={handleRetryAction}
          className="py-3 px-6 rounded-[18px] bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-sm transition-all"
        >
          تسجيل الدخول كمسؤول
        </button>
      </div>
    );
  }

  return null;
}

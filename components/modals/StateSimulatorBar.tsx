'use client';

import React from 'react';
import { useMizan } from '@/context/MizanContext';
import { SimulatedSystemState } from '@/types/mizan';
import { Sparkles, CheckCircle2, RotateCw, Smartphone, WifiOff, AlertCircle, Lock } from 'lucide-react';

export default function StateSimulatorBar() {
  const { simulatedState, setSimulatedState, showToast } = useMizan();

  const states: { id: SimulatedSystemState; label: string; icon: React.ReactNode }[] = [
    { id: 'normal', label: 'الوضع الطبيعي', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: 'loading', label: 'تحميل البيانات', icon: <RotateCw className="w-3.5 h-3.5" /> },
    { id: 'empty', label: 'عدم وجود أجهزة', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'disconnected', label: 'انقطاع الاتصال', icon: <WifiOff className="w-3.5 h-3.5" /> },
    { id: 'sync_error', label: 'خطأ في المزامنة', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    { id: 'unauthorized', label: 'صلاحيات مرفوضة', icon: <Lock className="w-3.5 h-3.5" /> },
  ];

  const handleSelectState = (stateId: SimulatedSystemState) => {
    setSimulatedState(stateId);
    if (stateId !== 'normal') {
      showToast('معاينة حالة النظام', `تم تفعيل شاشة (${states.find(s => s.id === stateId)?.label}) للتجربة`, 'info');
    }
  };

  return (
    <div className="bg-[#FFFDF8] border-b border-[#E3E5DC] px-4 py-2 flex items-center justify-between gap-3 overflow-x-auto text-xs select-none">
      <div className="flex items-center gap-2 text-[#777A72] shrink-0 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-[#151515]" />
        <span>معاينة حالات النظام:</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {states.map((st) => {
          const isActive = simulatedState === st.id;
          return (
            <button
              key={st.id}
              onClick={() => handleSelectState(st.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                isActive
                  ? 'bg-[#151515] text-[#C8F24A]'
                  : 'bg-[#F6F7F2] text-[#777A72] hover:bg-[#E3E5DC] hover:text-[#151515]'
              }`}
            >
              {st.icon}
              <span>{st.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

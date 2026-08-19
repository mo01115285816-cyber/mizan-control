'use client';

import React from 'react';
import { useMizan } from '@/context/MizanContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useMizan();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-[#151515] shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0" />,
          danger: <AlertCircle className="w-5 h-5 text-[#C0392B] shrink-0" />,
          info: <Info className="w-5 h-5 text-[#151515] shrink-0" />,
        };

        const bgStyles = {
          success: 'bg-[#C8F24A] border-[#151515] text-[#151515]',
          warning: 'bg-[#FEF3C7] border-[#F59E0B] text-[#151515]',
          danger: 'bg-[#F7D9D2] border-[#E0564C] text-[#151515]',
          info: 'bg-[#FFFDF8] border-[#E3E5DC] text-[#151515]',
        };

        const currentType = toast.type || 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-[20px] border shadow-lg flex items-start gap-3 justify-between transition-all duration-200 animate-in slide-in-from-bottom-2 ${bgStyles[currentType]}`}
          >
            <div className="flex items-start gap-3">
              {icons[currentType]}
              <div className="flex flex-col text-right">
                <span className="font-bold text-sm leading-tight">
                  {toast.title}
                </span>
                {toast.description && (
                  <span className="text-xs text-[#151515]/80 mt-1 leading-snug">
                    {toast.description}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#151515]/60 hover:text-[#151515] p-1 rounded-lg transition-colors"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

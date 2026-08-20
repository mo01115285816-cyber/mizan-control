'use client';

import React, { useState } from 'react';
import { useMizan } from '@/context/MizanContext';
import MizanLogo from '@/components/common/MizanLogo';
import { Lock, Mail, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginScreen() {
  const { login } = useMizan();
  const [email, setEmail] = useState<string>('');
  const [actualPass, setActualPass] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const success = await login(email, actualPass);
    setIsLoading(false);
    if (!success) {
      setErrorMsg('البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مجدداً.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F2] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 selection:bg-[#C8F24A] select-none">
      {/* Background Subtle Ambience Element */}
      <div className="w-full max-w-md space-y-6">
        {/* Top Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-2">
          <MizanLogo size="xl" showSubtitle={false} />
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#151515] tracking-tight">
              مرحبًا بك مجددًا
            </h1>
            <p className="text-sm text-[#777A72]">
              سجّل الدخول للوصول إلى لوحة تحكم ميزان لإدارة استهلاك الإنترنت المنزلي
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
          {/* Error Message Box */}
          {errorMsg && (
            <div className="bg-[#F7D9D2] border border-[#E0564C] rounded-[18px] p-4 flex items-start gap-3 text-right animate-in fade-in duration-150">
              <AlertCircle className="w-5 h-5 text-[#C0392B] shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-bold text-xs text-[#151515]">خطأ في تسجيل الدخول</span>
                <span className="text-xs text-[#151515]/90 mt-0.5">{errorMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#151515] block">
                البريد الإلكتروني للمسؤول
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777A72] absolute right-4 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  placeholder="admin@mizan.home"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F6F7F2] border border-[#E3E5DC] focus:border-[#151515] focus:bg-[#FFFDF8] rounded-full pr-11 pl-4 py-3 text-sm font-medium text-[#151515] outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#151515]">
                  كلمة المرور
                </label>
                <span className="text-[11px] text-[#777A72] hover:text-[#151515] cursor-pointer">
                  نسيت كلمة المرور؟
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777A72] absolute right-4 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={actualPass}
                  onChange={(e) => setActualPass(e.target.value)}
                  className="w-full bg-[#F6F7F2] border border-[#E3E5DC] focus:border-[#151515] focus:bg-[#FFFDF8] rounded-full pr-11 pl-4 py-3 text-sm font-medium text-[#151515] outline-none transition-all"
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="login-remember-checkbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-[#151515] cursor-pointer"
                />
                <span className="text-xs font-medium text-[#777A72]">
                  تذكر بيانات هذا المتصفح
                </span>
              </label>

            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 px-6 rounded-full bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap"
            >
              {isLoading ? (
                <span>جاري تسجيل الدخول...</span>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee Banner */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#E3E5DC] text-[#777A72] text-xs">
            <ShieldCheck className="w-4 h-4 text-[#83D96B]" />
            <span>نظام محمي ببروتوكول التشفير المنزلي WPA3 و AES-256</span>
          </div>
        </div>

      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Wifi, ShieldCheck, User, Save, RotateCcw, Copy, Link2, Home, Plus } from 'lucide-react';
import { useMizan } from '@/context/MizanContext';

const inputClass = 'w-full bg-[#F6F7F2] border border-[#E3E5DC] focus:border-[#151515] rounded-2xl px-4 py-3 text-sm font-bold text-[#151515] outline-none transition-all';

export default function SettingsScreen() {
  const {
    adminName,
    adminEmail,
    householdId,
    householdName,
    gatewaySettings,
    activeInvite,
    createHousehold,
    createInvite,
    saveGatewaySettings,
    refreshData,
  } = useMizan();

  const [targetSsid, setTargetSsid] = useState('');
  const [gatewayIp, setGatewayIp] = useState('');
  const [wifiBand, setWifiBand] = useState('');
  const [securityType, setSecurityType] = useState('');
  const [autoCutoff, setAutoCutoff] = useState(true);
  const [notifyOnNearLimit, setNotifyOnNearLimit] = useState(true);
  const [notifyOnBlock, setNotifyOnBlock] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [houseName, setHouseName] = useState('');
  const [houseQuota, setHouseQuota] = useState('');
  const [newHouseSsid, setNewHouseSsid] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteMaxUses, setInviteMaxUses] = useState('5');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!gatewaySettings) return;
    setTargetSsid(gatewaySettings.targetSsid);
    setGatewayIp(gatewaySettings.gatewayIp);
    setWifiBand(gatewaySettings.wifiBand);
    setSecurityType(gatewaySettings.securityType);
    setAutoCutoff(gatewaySettings.autoCutoff);
    setNotifyOnNearLimit(gatewaySettings.notifyOnNearLimit);
    setNotifyOnBlock(gatewaySettings.notifyOnBlock);
    setDailyDigest(gatewaySettings.dailyDigest);
  }, [gatewaySettings]);

  const copyText = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    await saveGatewaySettings({ targetSsid, gatewayIp, wifiBand, securityType, autoCutoff, notifyOnNearLimit, notifyOnBlock, dailyDigest });
    setIsSaving(false);
  };

  const handleCreateHousehold = async (event: React.FormEvent) => {
    event.preventDefault();
    const quota = Number(houseQuota);
    if (!houseName.trim() || !Number.isFinite(quota) || quota < 0) return;
    await createHousehold(houseName, quota, newHouseSsid);
  };

  if (!householdId) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#151515]">إنشاء منزل Mizan</h1>
          <p className="text-sm text-[#777A72]">لا توجد لوحة منزلية مرتبطة بحساب المسؤول الحالي. أنشئ المنزل الحقيقي أولًا، ثم أرسل الدعوات للأجهزة.</p>
        </div>
        <form onSubmit={handleCreateHousehold} className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 sm:p-8 space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-[#E7F5C8] flex items-center justify-center"><Home className="w-6 h-6" /></div>
          <label className="block space-y-2"><span className="text-xs font-bold">اسم المنزل</span><input required value={houseName} onChange={(e) => setHouseName(e.target.value)} className={inputClass} placeholder="منزل العائلة" /></label>
          <label className="block space-y-2"><span className="text-xs font-bold">الحصة الشهرية بالجيجابايت</span><input required type="number" min="0" step="0.1" value={houseQuota} onChange={(e) => setHouseQuota(e.target.value)} className={inputClass} placeholder="مثال: 133.3" /></label>
          <label className="block space-y-2"><span className="text-xs font-bold">Target SSID — اختياري</span><input value={newHouseSsid} onChange={(e) => setNewHouseSsid(e.target.value)} className={inputClass} placeholder="اسم شبكة المنزل الحقيقي" /></label>
          <button className="w-full py-3 rounded-full bg-[#151515] text-[#FFFDF8] font-bold flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> إنشاء المنزل وربطه بـ Supabase</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#151515] tracking-tight">إعدادات النظام والراوتر</h1>
        <p className="text-sm text-[#777A72]">{householdName || 'منزل Mizan'} — كل قيمة هنا تقرأ أو تُحفظ في Supabase.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5">
        <section className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-5 sm:p-7 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E3E5DC]"><div className="w-10 h-10 rounded-[14px] bg-[#E7F5C8] flex items-center justify-center"><Wifi className="w-5 h-5" /></div><div><h2 className="text-base font-bold">إعدادات الشبكة المستهدفة</h2><p className="text-xs text-[#777A72]">لا يتم احتساب الحصة إلا عند تطابق SSID الحقيقي مع هذه القيمة.</p></div></div>
          <label className="block space-y-2"><span className="text-xs font-bold">اسم شبكة المنزل المستهدفة (Target SSID)</span><input value={targetSsid} onChange={(e) => setTargetSsid(e.target.value)} className={inputClass} placeholder="اكتب SSID الحقيقي كما يظهر في الهاتف" /></label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="space-y-2"><span className="text-xs font-bold">Gateway IP</span><input value={gatewayIp} onChange={(e) => setGatewayIp(e.target.value)} className={inputClass} placeholder="غير متاح" /></label>
            <label className="space-y-2"><span className="text-xs font-bold">النطاق</span><input value={wifiBand} onChange={(e) => setWifiBand(e.target.value)} className={inputClass} placeholder="غير متاح" /></label>
            <label className="space-y-2"><span className="text-xs font-bold">التشفير</span><input value={securityType} onChange={(e) => setSecurityType(e.target.value)} className={inputClass} placeholder="غير متاح" /></label>
          </div>
          <p className="text-[11px] text-[#777A72]">أي معلومة لا يرسلها الهاتف أو لم تُحفظ فعليًا ستظهر كـ «غير متاح» ولن يتم اختراع WPA2 أو WPA3 أو اسم شبكة افتراضي.</p>
        </section>

        <section className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-5 sm:p-7 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E3E5DC]"><div className="w-10 h-10 rounded-[14px] bg-[#151515] text-[#C8F24A] flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div><div><h2 className="text-base font-bold">الحماية والتنبيهات</h2><p className="text-xs text-[#777A72]">تُطبّق على الأجهزة المرتبطة وتُحفظ كإعدادات منزلية حقيقية.</p></div></div>
          {[
            ['إيقاف الإنترنت عند استنفاد الحصة', autoCutoff, setAutoCutoff],
            ['إشعار عند الاقتراب من الحد', notifyOnNearLimit, setNotifyOnNearLimit],
            ['تنبيه المسؤول عند حظر جهاز', notifyOnBlock, setNotifyOnBlock],
            ['ملخص يومي', dailyDigest, setDailyDigest],
          ].map(([label, checked, setter]) => (
            <label key={String(label)} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#F6F7F2] border border-[#E3E5DC] cursor-pointer"><span className="text-sm font-bold">{String(label)}</span><input type="checkbox" checked={Boolean(checked)} onChange={(e) => (setter as (value: boolean) => void)(e.target.checked)} className="w-5 h-5 accent-[#151515] shrink-0" /></label>
          ))}
        </section>

        <section className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-5 sm:p-7 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E3E5DC]"><div className="w-10 h-10 rounded-[14px] bg-[#F6F7F2] border border-[#E3E5DC] flex items-center justify-center"><Link2 className="w-5 h-5" /></div><div><h2 className="text-base font-bold">دعوة جهاز جديد</h2><p className="text-xs text-[#777A72]">الدعوة تُنشأ في household_members وتُقبل من التطبيق عبر deep link.</p></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3"><input value={inviteName} onChange={(e) => setInviteName(e.target.value)} className={inputClass} placeholder="اسم العضو اختياري" /><select value={inviteMaxUses} onChange={(e) => setInviteMaxUses(e.target.value)} className={inputClass}><option value="5">5 أجهزة</option><option value="10">10 أجهزة</option><option value="0">غير محدود</option></select><button type="button" onClick={() => void createInvite(inviteName, Number(inviteMaxUses))} className="px-5 py-3 rounded-full bg-[#151515] text-[#FFFDF8] font-bold text-sm whitespace-nowrap">إنشاء رابط مشاركة</button></div>
          <p className="text-[11px] text-[#777A72]">الرابط الواحد يمكن أن يستخدمه العدد المحدد من الأجهزة. عند اختيار «غير محدود» يصبح 0 استخدامات قصوى. بطاقة الرابط الحالية مؤقتة وتختفي بعد إعادة قراءة البيانات.</p>
          {activeInvite && <div className="space-y-3 bg-[#E7F5C8] border border-[#C8F24A] rounded-2xl p-4"><p className="text-xs font-bold">رابط المشاركة — {activeInvite.maxUses === 0 ? 'غير محدود' : `${activeInvite.maxUses} أجهزة`}</p><div className="flex items-center gap-2"><code className="flex-1 text-[11px] break-all dir-ltr">{activeInvite.deepLink}</code><button type="button" onClick={() => void copyText(activeInvite.deepLink)} className="p-2 rounded-full bg-[#FFFDF8]" title="نسخ"><Copy className="w-4 h-4" /></button></div><p className="text-[11px] text-[#777A72]">يمكن أيضًا استخدام الرابط العام: {activeInvite.webLink}</p></div>}
        </section>

        <section className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-5 sm:p-7 space-y-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[14px] bg-[#F6F7F2] border border-[#E3E5DC] flex items-center justify-center"><User className="w-5 h-5" /></div><div><h2 className="text-base font-bold">حساب المسؤول</h2><p className="text-xs text-[#777A72]">الهوية مأخوذة من جلسة Supabase الحالية.</p></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div className="bg-[#F6F7F2] rounded-2xl p-4"><span className="text-xs text-[#777A72] block">الاسم</span><strong>{adminName}</strong></div><div className="bg-[#F6F7F2] rounded-2xl p-4"><span className="text-xs text-[#777A72] block">البريد</span><strong className="break-all">{adminEmail || 'غير متاح'}</strong></div></div></section>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"><button disabled={isSaving} type="submit" className="py-3 px-7 rounded-full bg-[#151515] text-[#FFFDF8] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"><Save className="w-4 h-4" />{isSaving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات الحقيقية'}</button><button type="button" onClick={refreshData} className="py-3 px-5 rounded-full bg-[#F6F7F2] border border-[#E3E5DC] text-[#777A72] font-bold text-sm flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" />إعادة قراءة Supabase</button></div>
      </form>
    </div>
  );
}

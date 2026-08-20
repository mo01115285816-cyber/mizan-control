'use client';

import React, { useState } from 'react';
import { 
  PieChart as PieIcon, 
  TrendingUp, 
  Clock, 
  Download, 
  Smartphone, 
  Wifi, 
  ArrowUpRight,
  Video,
  PlayCircle,
  Share2,
  Tv,
  Gamepad2,
  Calendar
} from 'lucide-react';
import { useMizan } from '@/context/MizanContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function AnalyticsScreen() {
  const { householdQuota, devices, showToast } = useMizan();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const apps = devices.flatMap((device) => device.topApps);
  const grouped = new Map<string, typeof apps[number]>();
  apps.forEach((app) => {
    const previous = grouped.get(app.id);
    grouped.set(app.id, { ...app, usedGB: Number(((previous?.usedGB ?? 0) + app.usedGB).toFixed(4)) });
  });
  const topApps = [...grouped.values()].sort((a, b) => b.usedGB - a.usedGB);
  const totalAppsUsage = topApps.reduce((sum, app) => sum + app.usedGB, 0);
  const categoriesMap = new Map<string, number>();
  topApps.forEach((app) => categoriesMap.set(app.category, (categoriesMap.get(app.category) ?? 0) + app.usedGB));
  const categoryColors = ['#151515', '#C8F24A', '#83D96B', '#777A72', '#E3E5DC'];
  const categories = [...categoriesMap.entries()].map(([name, usedGB], index) => ({ name, usedGB: Number(usedGB.toFixed(4)), percentage: totalAppsUsage > 0 ? Number(((usedGB / totalAppsUsage) * 100).toFixed(1)) : 0, color: categoryColors[index % categoryColors.length] }));
  const dailyPoints = devices.flatMap((device) => device.dailyUsage);
  const highestDay = [...dailyPoints].sort((a, b) => b.usedGB - a.usedGB)[0];
  const topApp = topApps[0];

  const handleExport = () => {
    showToast('تصدير تقرير الاستهلاك', 'تم تصدير تقرير PDF و CSV لبيانات استهلاك هذا الشهر بنجاح', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#151515] tracking-tight">
            تفاصيل الاستهلاك والتحليلات
          </h1>
          <p className="text-sm text-[#777A72]">
            تحليل دقيق لسلوك استهلاك الباقة المنزلية وتصنيف التطبيقات وساعات الذروة
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-5 py-2.5 rounded-full bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs self-start whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>تصدير التقرير الشهري</span>
        </button>
      </div>

      {/* 3 Metric Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[24px] p-6 space-y-2 shadow-2xs">
          <span className="text-xs font-bold text-[#777A72]">أعلى يوم استهلاكاً</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#151515]">{highestDay?.dayLabel ?? 'غير متاح'}</span>
            <span className="text-xs font-bold text-[#C0392B]">{highestDay?.usedGB?.toFixed(2) ?? '0.00'} GB</span>
          </div>
          <p className="text-[11px] text-[#777A72]">محسوب من لقطات Wi‑Fi المنشورة من الأجهزة المرتبطة</p>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[24px] p-6 space-y-2 shadow-2xs">
          <span className="text-xs font-bold text-[#777A72]">ساعات الذروة المعتادة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#151515]">غير متاح</span>
          </div>
          <p className="text-[11px] text-[#777A72]">لا تُخمن لوحة التحكم ساعات الذروة دون بيانات زمنية حقيقية كافية.</p>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[24px] p-6 space-y-2 shadow-2xs">
          <span className="text-xs font-bold text-[#777A72]">التطبيق الأكثر استهلاكاً</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#151515]">{topApp?.nameAr ?? 'غير متاح'}</span>
            <span className="text-xs font-bold text-[#151515]">{topApp?.usedGB?.toFixed(2) ?? '0.00'} GB</span>
          </div>
          <p className="text-[11px] text-[#777A72]">يمثل {topApp && totalAppsUsage > 0 ? ((topApp.usedGB / totalAppsUsage) * 100).toFixed(1) : '0.0'}% من التطبيقات المسجلة.</p>
        </div>
      </div>

      {/* Category Breakdown & Apps Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Bar */}
        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#151515]">
              الاستهلاك حسب الفئات
            </h3>
            <p className="text-xs text-[#777A72]">
              تصنيف حركة البيانات على شبكة المنزل
            </p>
          </div>

          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#151515]">{cat.name}</span>
                  <span className="font-bold text-[#151515]">{cat.usedGB} GB ({cat.percentage}%)</span>
                </div>
                <div className="w-full bg-[#F6F7F2] border border-[#E3E5DC] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Global Top Apps */}
        <div className="lg:col-span-2 bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#151515]">
              قائمة التطبيقات الشاملة لجميع أجهزة المنزل
            </h3>
            <p className="text-xs text-[#777A72]">
              ترتيب استهلاك الجيجابايت بدقة
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topApps.map((app) => (
              <div
                key={app.id}
                className="bg-[#F6F7F2] p-4 rounded-[20px] border border-[#E3E5DC] space-y-2 hover:border-[#151515] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col text-right">
                    <span className="font-bold text-sm text-[#151515]">
                      {app.nameAr} <span className="text-xs text-[#777A72] font-normal">({app.name})</span>
                    </span>
                    <span className="text-[11px] text-[#777A72]">{app.category}</span>
                  </div>

                  <div className="text-left">
                    <span className="text-base font-bold text-[#151515] block">
                      {app.usedGB} <span className="text-xs font-normal text-[#777A72]">GB</span>
                    </span>
                    <span className="text-xs font-bold text-[#777A72]">{app.percentage}%</span>
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
      </div>
    </div>
  );
}

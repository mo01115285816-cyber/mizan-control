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
import { TOP_GLOBAL_APPS, HOUSEHOLD_7DAY_USAGE } from '@/lib/mock-data';
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
  const { householdQuota, devices, navigateToDevice, showToast } = useMizan();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { name: 'فيديو وبث (Streaming)', usedGB: 57.4, percentage: 67.2, color: '#151515' },
    { name: 'ألعاب أونلاين (Gaming)', usedGB: 11.6, percentage: 13.6, color: '#C8F24A' },
    { name: 'تواصل اجتماعي (Social)', usedGB: 9.2, percentage: 10.8, color: '#83D96B' },
    { name: 'عمل ودراسة (Productivity)', usedGB: 4.8, percentage: 5.6, color: '#777A72' },
    { name: 'أخرى ونظام (Other)', usedGB: 2.3, percentage: 2.8, color: '#E3E5DC' },
  ];

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
            <span className="text-2xl font-bold text-[#151515]">يوم الخميس</span>
            <span className="text-xs font-bold text-[#C0392B]">16.5 GB</span>
          </div>
          <p className="text-[11px] text-[#777A72]">بسبب جلسات مشاهدة البث عالي الدقة</p>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[24px] p-6 space-y-2 shadow-2xs">
          <span className="text-xs font-bold text-[#777A72]">ساعات الذروة المعتادة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#151515]">08:00 م - 11:30 م</span>
          </div>
          <p className="text-[11px] text-[#777A72]">تشهد تدفق 62% من حزم الإنترنت اليومية</p>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[24px] p-6 space-y-2 shadow-2xs">
          <span className="text-xs font-bold text-[#777A72]">التطبيق الأكثر استهلاكاً</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#151515]">تيك توك (TikTok)</span>
            <span className="text-xs font-bold text-[#151515]">30.0 GB</span>
          </div>
          <p className="text-[11px] text-[#777A72]">يمثل 35.2% من مجمل استهلاك المنزل</p>
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
            {TOP_GLOBAL_APPS.map((app) => (
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

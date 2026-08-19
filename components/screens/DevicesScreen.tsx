'use client';

import React, { useState, useMemo } from 'react';
import { 
  Smartphone, 
  Laptop, 
  Tv, 
  Gamepad2, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Pause, 
  Play, 
  ChevronLeft, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Wifi,
  LayoutGrid,
  List
} from 'lucide-react';
import { useMizan } from '@/context/MizanContext';
import { Device, DeviceStatus } from '@/types/mizan';

export default function DevicesScreen() {
  const { 
    devices, 
    navigateToDevice, 
    toggleDevicePause, 
    unblockDevice, 
    openEditQuotaModal,
    globalSearch,
    setGlobalSearch
  } = useMizan();

  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'warning' | 'blocked'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      // Status filter
      if (statusFilter === 'connected' && device.status !== 'connected') return false;
      if (statusFilter === 'warning' && device.status !== 'warning') return false;
      if (statusFilter === 'blocked' && (device.status !== 'blocked' && !device.isPaused)) return false;

      // Search query
      if (globalSearch.trim() !== '') {
        const query = globalSearch.toLowerCase();
        const matchesName = device.name.toLowerCase().includes(query);
        const matchesOwner = device.ownerName.toLowerCase().includes(query);
        const matchesModel = device.model.toLowerCase().includes(query);
        const matchesIp = device.ipAddress.toLowerCase().includes(query);
        return matchesName || matchesOwner || matchesModel || matchesIp;
      }
      return true;
    });
  }, [devices, statusFilter, globalSearch]);

  const getDeviceIcon = (type: Device['deviceType']) => {
    switch (type) {
      case 'phone': return <Smartphone className="w-5 h-5" />;
      case 'laptop': return <Laptop className="w-5 h-5" />;
      case 'tv': return <Tv className="w-5 h-5" />;
      case 'gaming': return <Gamepad2 className="w-5 h-5" />;
      default: return <Smartphone className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: DeviceStatus, isPaused: boolean) => {
    if (isPaused) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7D9D2] text-[#C0392B] text-xs font-bold border border-[#E0564C]">
          <span className="w-2 h-2 rounded-full bg-[#E0564C]" />
          متوقف مؤقتاً
        </span>
      );
    }
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F5C8] text-[#151515] text-xs font-bold border border-[#C8F24A]">
            <span className="w-2 h-2 rounded-full bg-[#83D96B] animate-pulse" />
            متصل ونشط
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-bold border border-[#F59E0B]">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            قريب من الحد (92%)
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7D9D2] text-[#C0392B] text-xs font-bold border border-[#E0564C]">
            <span className="w-2 h-2 rounded-full bg-[#E0564C]" />
            محظور (تجاوز الحصة)
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#151515] tracking-tight">
            الأجهزة
          </h1>
          <p className="text-sm text-[#777A72]">
            إدارة أجهزة أفراد المنزل وتحديد حصص الاستهلاك والتحكم في الاتصال
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#FFFDF8] border border-[#E3E5DC] rounded-[16px] p-1 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-[12px] transition-colors ${
                viewMode === 'grid' ? 'bg-[#151515] text-[#FFFDF8]' : 'text-[#777A72] hover:text-[#151515]'
              }`}
              title="عرض البطاقات"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-[12px] transition-colors ${
                viewMode === 'table' ? 'bg-[#151515] text-[#FFFDF8]' : 'text-[#777A72] hover:text-[#151515]'
              }`}
              title="عرض الجدول"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[24px] p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'الكل', count: devices.length },
            { id: 'connected', label: 'متصل', count: devices.filter(d => d.status === 'connected').length },
            { id: 'warning', label: 'قريب من الحد', count: devices.filter(d => d.status === 'warning').length },
            { id: 'blocked', label: 'محظور', count: devices.filter(d => d.status === 'blocked' || d.isPaused).length },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                id={`device-filter-${tab.id}`}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#151515] text-[#C8F24A] shadow-xs'
                    : 'bg-[#F6F7F2] text-[#777A72] hover:bg-[#E3E5DC] hover:text-[#151515]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                  isActive ? 'bg-[#C8F24A] text-[#151515]' : 'bg-[#E3E5DC] text-[#151515]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input in filter card */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#777A72] absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="تصفية حسب الاسم أو الموديل..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-[#F6F7F2] border border-[#E3E5DC] focus:border-[#151515] focus:bg-[#FFFDF8] rounded-[16px] pr-10 pl-3 py-2 text-xs font-medium text-[#151515] placeholder:text-[#777A72] outline-none transition-all"
          />
        </div>
      </div>

      {/* Empty Filter Result State */}
      {filteredDevices.length === 0 && (
        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-12 text-center space-y-3">
          <Smartphone className="w-12 h-12 text-[#777A72] mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-[#151515]">لا توجد أجهزة مطابقة للبحث</h3>
          <p className="text-xs text-[#777A72]">جرب تغيير عبارة البحث أو اختيار مرشح آخر</p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setGlobalSearch('');
            }}
            className="mt-2 px-4 py-2 rounded-[16px] bg-[#151515] text-[#FFFDF8] text-xs font-bold"
          >
            إعادة تعيين المرشحات
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredDevices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="devices-grid-container">
          {filteredDevices.map((device) => {
            const usagePercent = Math.min(100, Math.round((device.usedGB / device.allowedQuotaGB) * 100));
            const remainingGB = Math.max(0, Number((device.allowedQuotaGB - device.usedGB).toFixed(1)));
            const isBlocked = device.status === 'blocked' || device.isPaused;

            return (
              <div
                key={device.id}
                id={`device-card-${device.id}`}
                className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] p-6 shadow-2xs hover:border-[#151515] transition-all space-y-5 flex flex-col justify-between group"
              >
                {/* Card Top: Owner, Type & Status */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[18px] bg-[#F6F7F2] border border-[#E3E5DC] text-[#151515] flex items-center justify-center group-hover:bg-[#C8F24A] transition-colors">
                        {getDeviceIcon(device.deviceType)}
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-base font-bold text-[#151515]">
                          {device.ownerName}
                        </span>
                        <span className="text-xs text-[#777A72] font-medium">
                          {device.name} • {device.model}
                        </span>
                      </div>
                    </div>

                    {getStatusBadge(device.status, device.isPaused)}
                  </div>

                  {/* Quota & Usage Counter */}
                  <div className="bg-[#F6F7F2] p-4 rounded-[20px] border border-[#E3E5DC] space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs text-[#777A72] block">الاستهلاك الحالي</span>
                        <span className="text-xl font-bold text-[#151515]">
                          {device.usedGB} <span className="text-xs font-normal text-[#777A72]">GB</span>
                        </span>
                      </div>

                      <div className="text-left space-y-0.5">
                        <span className="text-xs text-[#777A72] block">الحصة المسموحة</span>
                        <span className="text-sm font-bold text-[#151515]">
                          {device.allowedQuotaGB} <span className="text-xs font-normal text-[#777A72]">GB</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-[#E3E5DC] h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isBlocked
                              ? 'bg-[#E0564C]'
                              : usagePercent > 85
                              ? 'bg-[#F59E0B]'
                              : 'bg-[#151515]'
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#777A72]">
                        <span>
                          {isBlocked
                            ? `تجاوز بمقدار ${(device.usedGB - device.allowedQuotaGB).toFixed(1)} GB`
                            : `متبقي ${remainingGB} GB`}
                        </span>
                        <span className="font-bold text-[#151515]">{usagePercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata: IP & Last Sync */}
                  <div className="flex items-center justify-between text-xs text-[#777A72] px-1">
                    <span>IP: <strong className="text-[#151515] font-mono">{device.ipAddress}</strong></span>
                    <span>آخر تحديث: <strong className="text-[#151515]">{device.lastUpdated}</strong></span>
                  </div>
                </div>

                {/* Card Action Buttons (Pill Shaped & Clear) */}
                <div className="pt-2.5 border-t border-[#E3E5DC] flex items-center gap-2">
                  <button
                    id={`open-details-btn-${device.id}`}
                    onClick={() => navigateToDevice(device.id)}
                    className="flex-1 py-2.5 px-4 rounded-full bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap"
                  >
                    <span>عرض التفاصيل</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`quick-quota-btn-${device.id}`}
                    onClick={() => openEditQuotaModal('device', device)}
                    className="p-2.5 rounded-full bg-[#F6F7F2] border border-[#E3E5DC] hover:bg-[#E3E5DC] text-[#151515] transition-colors shrink-0"
                    title="تعديل الحصة"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`quick-pause-btn-${device.id}`}
                    onClick={() => {
                      if (device.status === 'blocked' && !device.isPaused) {
                        unblockDevice(device.id);
                      } else {
                        toggleDevicePause(device.id);
                      }
                    }}
                    className={`p-2.5 rounded-full border transition-colors shrink-0 ${
                      device.isPaused
                        ? 'bg-[#E7F5C8] border-[#C8F24A] text-[#151515]'
                        : 'bg-[#F7D9D2] border-[#E0564C] text-[#C0392B]'
                    }`}
                    title={device.isPaused ? 'استئناف الاتصال' : 'إيقاف مؤقت'}
                  >
                    {device.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredDevices.length > 0 && (
        <div className="bg-[#FFFDF8] border border-[#E3E5DC] rounded-[28px] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs" id="devices-table">
              <thead className="bg-[#F6F7F2] border-b border-[#E3E5DC] text-[#777A72] font-bold">
                <tr>
                  <th className="p-4 pr-6">اسم المستخدم والجهاز</th>
                  <th className="p-4">نوع الجهاز</th>
                  <th className="p-4">الاستهلاك الحالي</th>
                  <th className="p-4">الحصة المسموحة</th>
                  <th className="p-4">المتبقي</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">آخر تحديث</th>
                  <th className="p-4 pl-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E5DC]">
                {filteredDevices.map((device) => {
                  const remainingGB = Math.max(0, Number((device.allowedQuotaGB - device.usedGB).toFixed(1)));
                  const usagePercent = Math.min(100, Math.round((device.usedGB / device.allowedQuotaGB) * 100));

                  return (
                    <tr key={device.id} className="hover:bg-[#F6F7F2]/60 transition-colors">
                      <td className="p-4 pr-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[14px] bg-[#F6F7F2] border border-[#E3E5DC] flex items-center justify-center text-[#151515]">
                            {getDeviceIcon(device.deviceType)}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#151515] block">
                              {device.ownerName}
                            </span>
                            <span className="text-[#777A72] text-[11px]">
                              {device.name} • {device.model}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-[#777A72] font-medium">
                        {device.deviceType === 'phone' ? 'هاتف ذكي' : device.deviceType === 'laptop' ? 'حاسوب محمول' : device.deviceType === 'tv' ? 'شاشة ذكية' : 'منصة ألعاب'}
                      </td>

                      <td className="p-4 font-bold text-sm text-[#151515]">
                        {device.usedGB} GB
                        <span className="text-[10px] text-[#777A72] font-normal mr-1">({usagePercent}%)</span>
                      </td>

                      <td className="p-4 text-[#151515] font-semibold">
                        {device.allowedQuotaGB} GB
                      </td>

                      <td className="p-4">
                        <span className={`font-bold ${device.status === 'blocked' ? 'text-[#C0392B]' : 'text-[#151515]'}`}>
                          {device.status === 'blocked' ? '0 GB (متجاوز)' : `${remainingGB} GB`}
                        </span>
                      </td>

                      <td className="p-4">
                        {getStatusBadge(device.status, device.isPaused)}
                      </td>

                      <td className="p-4 text-[#777A72]">
                        {device.lastUpdated}
                      </td>

                      <td className="p-4 pl-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`table-details-btn-${device.id}`}
                            onClick={() => navigateToDevice(device.id)}
                            className="px-4 py-1.5 rounded-full bg-[#151515] text-[#FFFDF8] hover:bg-[#C8F24A] hover:text-[#151515] font-bold text-xs transition-colors whitespace-nowrap"
                          >
                            عرض التفاصيل
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback, ReactNode } from 'react';
import { 
  ScreenType, 
  Device, 
  HouseholdQuota, 
  NotificationItem, 
  SimulatedSystemState,
  ToastMessage,
  DeviceStatus
} from '@/types/mizan';
import { 
  INITIAL_DEVICES, 
  INITIAL_HOUSEHOLD_QUOTA, 
  INITIAL_NOTIFICATIONS 
} from '@/lib/mock-data';

interface EditQuotaParams {
  type: 'household' | 'device';
  deviceId?: string;
  totalGB: number;
  period?: 'monthly' | 'weekly';
  firstAlertPercent?: number;
  secondAlertPercent?: number;
}

interface MizanContextType {
  // Navigation & Screen
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  navigateToDevice: (deviceId: string) => void;
  selectedDeviceId: string | null;
  selectedDevice: Device | null;
  setSelectedDeviceId: (id: string | null) => void;

  // Auth
  isLoggedIn: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  adminName: string;

  // Data & Mutators
  devices: Device[];
  householdQuota: HouseholdQuota;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  
  // Actions
  toggleDevicePause: (deviceId: string) => void;
  unblockDevice: (deviceId: string) => void;
  blockDevice: (deviceId: string) => void;
  removeDevice: (deviceId: string) => void;
  updateQuota: (params: EditQuotaParams) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  refreshData: () => void;

  // Modals & UI States
  editQuotaModalOpen: boolean;
  editQuotaTarget: { type: 'household' | 'device'; device?: Device } | null;
  openEditQuotaModal: (type: 'household' | 'device', device?: Device) => void;
  closeEditQuotaModal: () => void;

  // System State Simulator
  simulatedState: SimulatedSystemState;
  setSimulatedState: (state: SimulatedSystemState) => void;
  resetSimulatedState: () => void;

  // Search & Global Filter
  globalSearch: string;
  setGlobalSearch: (term: string) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const MizanContext = createContext<MizanContextType | undefined>(undefined);

export function MizanProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('overview');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [adminName] = useState<string>('أبو مؤمن');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>('dev-momen');

  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [householdQuota, setHouseholdQuota] = useState<HouseholdQuota>(INITIAL_HOUSEHOLD_QUOTA);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [simulatedState, setSimulatedState] = useState<SimulatedSystemState>('normal');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [editQuotaModalOpen, setEditQuotaModalOpen] = useState<boolean>(false);
  const [editQuotaTarget, setEditQuotaTarget] = useState<{ type: 'household' | 'device'; device?: Device } | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toastCounterRef = useRef(0);

  const showToast = useCallback((title: string, description?: string, type: ToastMessage['type'] = 'success') => {
    toastCounterRef.current += 1;
    const currentId = `toast-msg-${toastCounterRef.current}`;
    setToasts((prev) => [...prev, { id: currentId, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== currentId));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const selectedDevice = useMemo(() => {
    return devices.find((d) => d.id === selectedDeviceId) || devices[0] || null;
  }, [devices, selectedDeviceId]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const navigateToDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setCurrentScreen('device-detail');
  };

  const login = (email: string, pass: string): boolean => {
    // Simple demo validation: any email with @ and password > 3 chars
    if (email && email.includes('@') && pass.length >= 4) {
      setIsLoggedIn(true);
      setCurrentScreen('overview');
      showToast('مرحباً بك مجدداً', 'تم تسجيل الدخول إلى لوحة تحكم ميزان بنجاح', 'success');
      return true;
    }
    showToast('بيانات الدخول غير صحيحة', 'يرجى التحقق من البريد الإلكتروني وكلمة المرور', 'danger');
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('login');
    showToast('تم تسجيل الخروج', 'إلى اللقاء', 'info');
  };

  const toggleDevicePause = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === deviceId) {
          const nextPaused = !dev.isPaused;
          const nextStatus: DeviceStatus = nextPaused ? 'blocked' : (dev.usedGB >= dev.allowedQuotaGB ? 'blocked' : 'connected');
          
          showToast(
            nextPaused ? `تم إيقاف اتصال ${dev.name}` : `تم استئناف اتصال ${dev.name}`,
            nextPaused ? 'تم حظر تدفق الإنترنت لهذا الجهاز مؤقتاً' : 'عادت سرعة الإنترنت والاتصال للجهاز',
            nextPaused ? 'warning' : 'success'
          );

          return {
            ...dev,
            isPaused: nextPaused,
            status: nextStatus,
            activities: [
              {
                id: `act-${Date.now()}`,
                title: nextPaused ? 'إيقاف الإنترنت يدوياً بواسطة المسؤول' : 'استئناف الإنترنت بواسطة المسؤول',
                timeAgo: 'الآن',
                type: nextPaused ? 'pause' : 'resume',
              },
              ...dev.activities,
            ],
          };
        }
        return dev;
      })
    );
  };

  const unblockDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === deviceId) {
          showToast(`تم إلغاء حظر ${dev.name}`, 'تم استئناف الاتصال وتمديد الحصة مؤقتاً', 'success');
          return {
            ...dev,
            status: 'connected',
            isPaused: false,
            allowedQuotaGB: Math.max(dev.allowedQuotaGB, dev.usedGB + 5),
            activities: [
              {
                id: `act-${Date.now()}`,
                title: 'إلغاء الحظر وتمديد الحصة +5 جيجابايت',
                timeAgo: 'الآن',
                type: 'resume',
              },
              ...dev.activities,
            ],
          };
        }
        return dev;
      })
    );
  };

  const blockDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === deviceId) {
          showToast(`تم حظر ${dev.name}`, 'تم إيقاف الإنترنت بالكامل لهذا الجهاز', 'danger');
          return {
            ...dev,
            status: 'blocked',
            isPaused: true,
            activities: [
              {
                id: `act-${Date.now()}`,
                title: 'حظر الجهاز من شبكة المنزل',
                timeAgo: 'الآن',
                type: 'pause',
              },
              ...dev.activities,
            ],
          };
        }
        return dev;
      })
    );
  };

  const removeDevice = (deviceId: string) => {
    const target = devices.find((d) => d.id === deviceId);
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    showToast('تمت إزالة الجهاز', `تم حذف ${target?.name || 'الجهاز'} من قائمة أجهزة المنزل`, 'info');
    if (selectedDeviceId === deviceId) {
      setCurrentScreen('devices');
      setSelectedDeviceId(null);
    }
  };

  const updateQuota = ({ type, deviceId, totalGB, period, firstAlertPercent, secondAlertPercent }: EditQuotaParams) => {
    if (type === 'household') {
      setHouseholdQuota((prev) => {
        const used = prev.usedGB;
        const remaining = Math.max(0, totalGB - used);
        const percentage = Math.min(100, Math.round((used / totalGB) * 100));
        return {
          ...prev,
          totalGB: Number(totalGB.toFixed(1)),
          remainingGB: Number(remaining.toFixed(1)),
          percentage,
          period: period || prev.period,
          firstAlertPercent: firstAlertPercent ?? prev.firstAlertPercent,
          secondAlertPercent: secondAlertPercent ?? prev.secondAlertPercent,
        };
      });
      showToast('تم تحديث الحصة المنزلية', `تم تعديل إجمالي الحصة إلى ${totalGB} جيجابايت`, 'success');
    } else if (type === 'device' && deviceId) {
      setDevices((prev) =>
        prev.map((dev) => {
          if (dev.id === deviceId) {
            const nextStatus: DeviceStatus = dev.usedGB >= totalGB ? 'blocked' : (dev.usedGB >= totalGB * 0.85 ? 'warning' : 'connected');
            return {
              ...dev,
              allowedQuotaGB: Number(totalGB.toFixed(1)),
              status: dev.isPaused ? 'blocked' : nextStatus,
              customQuota: true,
              activities: [
                {
                  id: `act-${Date.now()}`,
                  title: `تعديل الحصة الشهرية للجهاز إلى ${totalGB} جيجابايت`,
                  timeAgo: 'الآن',
                  type: 'quota_change',
                },
                ...dev.activities,
              ],
            };
          }
          return dev;
        })
      );
      showToast('تم تحديث حصة الجهاز', `تم تعديل حصة الجهاز إلى ${totalGB} جيجابايت`, 'success');
    }
  };

  const openEditQuotaModal = (type: 'household' | 'device', device?: Device) => {
    setEditQuotaTarget({ type, device });
    setEditQuotaModalOpen(true);
  };

  const closeEditQuotaModal = () => {
    setEditQuotaModalOpen(false);
    setEditQuotaTarget(null);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('تم تحديد الكل كمقروء', 'تم تحديث قائمة الإشعارات', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('تم مسح التنبيهات', 'قائمة الإشعارات فارغة الآن', 'info');
  };

  const refreshData = () => {
    showToast('جاري تحديث البيانات...', 'تم الاتصال بالراوتر ومزامنة الحصص بنجاح', 'info');
  };

  const resetSimulatedState = () => {
    setSimulatedState('normal');
  };

  return (
    <MizanContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        navigateToDevice,
        selectedDeviceId,
        selectedDevice,
        setSelectedDeviceId,
        isLoggedIn,
        login,
        logout,
        adminName,
        devices,
        householdQuota,
        notifications,
        unreadNotificationsCount,
        toggleDevicePause,
        unblockDevice,
        blockDevice,
        removeDevice,
        updateQuota,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        refreshData,
        editQuotaModalOpen,
        editQuotaTarget,
        openEditQuotaModal,
        closeEditQuotaModal,
        simulatedState,
        setSimulatedState,
        resetSimulatedState,
        globalSearch,
        setGlobalSearch,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </MizanContext.Provider>
  );
}

export function useMizan() {
  const context = useContext(MizanContext);
  if (!context) {
    throw new Error('useMizan must be used within a MizanProvider');
  }
  return context;
}

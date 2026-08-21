'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, requireSupabaseConfig } from '@/lib/supabase';
import {
  ScreenType,
  Device,
  HouseholdQuota,
  NotificationItem,
  SimulatedSystemState,
  ToastMessage,
  DeviceStatus,
  GatewaySettings,
  HouseholdInvite,
  AppUsageItem,
  DailyUsagePoint,
  DeviceActivity,
  MonitoredNetwork,
} from '@/types/mizan';

interface EditQuotaParams {
  type: 'household' | 'device';
  deviceId?: string;
  totalGB: number;
  period?: 'monthly' | 'weekly';
  firstAlertPercent?: number;
  secondAlertPercent?: number;
}

interface MizanContextType {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  navigateToDevice: (deviceId: string) => void;
  selectedDeviceId: string | null;
  selectedDevice: Device | null;
  setSelectedDeviceId: (id: string | null) => void;
  isLoggedIn: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  adminName: string;
  adminEmail: string;
  householdId: string | null;
  householdName: string;
  devices: Device[];
  monitoredNetworks: MonitoredNetwork[];
  householdQuota: HouseholdQuota;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  gatewaySettings: GatewaySettings | null;
  activeInvite: HouseholdInvite | null;
  createHousehold: (name: string, monthlyQuotaGb: number, targetSsid: string) => Promise<boolean>;
  createInvite: (displayName?: string, maxUses?: number) => Promise<HouseholdInvite | null>;
  saveGatewaySettings: (settings: Omit<GatewaySettings, 'householdId' | 'updatedAt'>) => Promise<boolean>;
  createMonitoredNetwork: (input: { networkName: string; ssid: string; bssid?: string }) => Promise<MonitoredNetwork | null>;
  updateMonitoredNetwork: (networkId: string, input: { networkName: string; ssid: string; bssid?: string }) => Promise<boolean>;
  deleteMonitoredNetwork: (networkId: string) => Promise<boolean>;
  assignDeviceNetwork: (deviceId: string, networkId: string | null) => Promise<boolean>;
  toggleDevicePause: (deviceId: string) => Promise<void>;
  unblockDevice: (deviceId: string) => Promise<void>;
  blockDevice: (deviceId: string) => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
  updateQuota: (params: EditQuotaParams) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  refreshData: () => void;
  editQuotaModalOpen: boolean;
  editQuotaTarget: { type: 'household' | 'device'; device?: Device } | null;
  openEditQuotaModal: (type: 'household' | 'device', device?: Device) => void;
  closeEditQuotaModal: () => void;
  simulatedState: SimulatedSystemState;
  setSimulatedState: (state: SimulatedSystemState) => void;
  resetSimulatedState: () => void;
  globalSearch: string;
  setGlobalSearch: (term: string) => void;
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const MizanContext = createContext<MizanContextType | undefined>(undefined);

const emptyQuota: HouseholdQuota = {
  totalGB: 0,
  usedGB: 0,
  remainingGB: 0,
  percentage: 0,
  period: 'monthly',
  resetDate: '',
  daysRemaining: 0,
  firstAlertPercent: 85,
  secondAlertPercent: 95,
};

function describeSupabaseError(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') return fallback;
  const value = error as { message?: string; code?: string; details?: string; hint?: string };
  return [value.message, value.code ? `code=${value.code}` : '', value.details, value.hint].filter(Boolean).join(' | ') || fallback;
}

function formatRelativeTime(value?: string | null) {
  if (!value) return 'غير متاح';
  const delta = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${Math.floor(hours / 24)} يوم`;
}

function toAppUsage(rows: Array<Record<string, unknown>>): AppUsageItem[] {
  const grouped = new Map<string, AppUsageItem>();
  for (const row of rows) {
    const packageName = String(row.package_name ?? 'unknown');
    const usedGB = Number(row.usage_gb ?? 0);
    const previous = grouped.get(packageName);
    grouped.set(packageName, {
      id: packageName,
      name: String(row.app_name ?? packageName),
      nameAr: String(row.app_name ?? packageName),
      category: 'غير مصنف',
      usedGB: Number(((previous?.usedGB ?? 0) + usedGB).toFixed(4)),
      percentage: 0,
      iconName: 'smartphone',
    });
  }
  const apps = [...grouped.values()].sort((a, b) => b.usedGB - a.usedGB);
  const total = apps.reduce((sum, app) => sum + app.usedGB, 0);
  return apps.map((app) => ({
    ...app,
    percentage: total > 0 ? Number(((app.usedGB / total) * 100).toFixed(1)) : 0,
  }));
}

function toDailyUsage(rows: Array<Record<string, unknown>>): DailyUsagePoint[] {
  const grouped = new Map<string, number>();
  for (const row of rows) {
    const date = new Date(String(row.timestamp)).toISOString().slice(0, 10);
    grouped.set(date, (grouped.get(date) ?? 0) + Number(row.consumed_gb ?? 0));
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, usedGB]) => ({
      dayKey: date,
      dayLabel: new Intl.DateTimeFormat('ar', { weekday: 'short' }).format(new Date(`${date}T12:00:00Z`)),
      usedGB: Number(usedGB.toFixed(4)),
      averageGB: 0,
    }));
}

function rowToActivity(row: Record<string, unknown>): DeviceActivity {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    title: 'تحديث حالة الجهاز من الهاتف',
    timeAgo: formatRelativeTime(String(row.updated_at ?? row.last_seen_at ?? '')),
    type: 'sync',
  };
}

export function MizanProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('overview');
  const [session, setSession] = useState<Session | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [householdName, setHouseholdName] = useState('');
  const [devices, setDevices] = useState<Device[]>([]);
  const [monitoredNetworks, setMonitoredNetworks] = useState<MonitoredNetwork[]>([]);
  const [householdQuota, setHouseholdQuota] = useState<HouseholdQuota>(emptyQuota);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [gatewaySettings, setGatewaySettings] = useState<GatewaySettings | null>(null);
  const [activeInvite, setActiveInvite] = useState<HouseholdInvite | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [simulatedState, setSimulatedState] = useState<SimulatedSystemState>('normal');
  const [editQuotaModalOpen, setEditQuotaModalOpen] = useState(false);
  const [editQuotaTarget, setEditQuotaTarget] = useState<{ type: 'household' | 'device'; device?: Device } | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toastCounterRef = useRef(0);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const showToast = useCallback((title: string, description?: string, type: ToastMessage['type'] = 'success') => {
    toastCounterRef.current += 1;
    const id = `toast-${toastCounterRef.current}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 4500);
  }, []);

  const removeToast = useCallback((id: string) => setToasts((prev) => prev.filter((toast) => toast.id !== id)), []);
  const isLoggedIn = Boolean(session?.user);
  const adminName = String(session?.user.user_metadata?.full_name ?? session?.user.user_metadata?.name ?? session?.user.email ?? 'المسؤول');
  const adminEmail = session?.user.email ?? '';

  const resetData = useCallback(() => {
    setHouseholdId(null);
    setHouseholdName('');
    setDevices([]);
    setMonitoredNetworks([]);
    setHouseholdQuota(emptyQuota);
    setNotifications([]);
    setGatewaySettings(null);
    setSelectedDeviceId(null);
  }, []);

  const loadData = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      requireSupabaseConfig();
      const { data: householdRows, error: householdError } = await supabase
        .from('households')
        .select('id,name,monthly_quota_gb,created_at')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      if (householdError) throw householdError;
      const household = householdRows?.[0] as Record<string, unknown> | undefined;
      if (!household) {
        resetData();
        return;
      }

      const id = String(household.id);
      setHouseholdId(id);
      setHouseholdName(String(household.name ?? ''));
      setActiveInvite(null);
      const [deviceResult, policyResult, networkResult, settingsResult, snapshotResult, appResult] = await Promise.all([
        supabase.from('devices').select('*').eq('household_id', id).eq('is_active', true).order('last_seen_at', { ascending: false }),
        supabase.from('quota_policies').select('*').eq('household_id', id),
        supabase.from('monitored_networks').select('*').eq('household_id', id).order('created_at', { ascending: true }),
        supabase.from('gateway_system_settings').select('*').eq('household_id', id).maybeSingle(),
        supabase.from('usage_snapshots').select('*').order('timestamp', { ascending: false }).limit(1000),
        supabase.from('app_usage_records').select('*').eq('user_id', userId).order('recorded_date', { ascending: false }).limit(1000),
      ]);
      const firstError = [deviceResult.error, policyResult.error, settingsResult.error].find(Boolean);
      if (firstError) throw firstError;
      if (networkResult.error) {
        console.warn('تعذر تحميل monitored_networks، ستظهر البيانات الأساسية فقط', networkResult.error);
      }
      if (snapshotResult.error) {
        console.warn('تعذر تحميل usage_snapshots، ستستمر لوحة التحكم دون المخطط', snapshotResult.error);
      }
      if (appResult.error) {
        console.warn('تعذر تحميل app_usage_records، ستستمر لوحة التحكم دون قائمة التطبيقات', appResult.error);
      }

      const policyByDevice = new Map((policyResult.data ?? []).map((row) => [String(row.device_key), row as Record<string, unknown>]));
      const networkById = new Map((networkResult.data ?? []).map((row) => [String(row.id), row as Record<string, unknown>]));
      const mappedNetworks: MonitoredNetwork[] = ((networkResult.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
        id: String(row.id),
        householdId: String(row.household_id ?? id),
        networkName: String(row.network_name ?? 'شبكة مراقبة'),
        ssid: String(row.ssid ?? ''),
        bssid: String(row.bssid ?? ''),
        isActive: Boolean(row.is_active ?? true),
        createdAt: String(row.created_at ?? ''),
        updatedAt: String(row.updated_at ?? ''),
      }));
      setMonitoredNetworks(mappedNetworks);
      const snapshots = (snapshotResult.data ?? []) as Array<Record<string, unknown>>;
      const appRows = (appResult.data ?? []) as Array<Record<string, unknown>>;
      const mapped = ((deviceResult.data ?? []) as Array<Record<string, unknown>>).map((row) => {
        const key = String(row.device_key);
        const policy = policyByDevice.get(key);
        const deviceSnapshots = snapshots.filter((snapshot) => String(snapshot.device_key) === key);
        const deviceApps = toAppUsage(appRows.filter((app) => String(app.device_key) === key));
        const targetNetworkId = String(policy?.target_network_id ?? row.target_network_id ?? '');
        const targetNetwork = networkById.get(targetNetworkId);
        const usedGB = Number(row.current_usage_gb ?? deviceSnapshots[0]?.consumed_gb ?? 0);
        const allowedQuotaGB = Number(policy?.monthly_limit_gb ?? row.quota_limit_gb ?? 0);
        const isBlocked = Boolean(policy?.is_blocked ?? row.is_blocked);
        const autoCutoffEnabled = Boolean(policy?.enforce_vpn_block ?? false);
        const quotaReached = autoCutoffEnabled && allowedQuotaGB > 0 && usedGB >= allowedQuotaGB;
        const status: DeviceStatus = isBlocked || quotaReached ? 'blocked' : (allowedQuotaGB > 0 && usedGB >= allowedQuotaGB * 0.85 ? 'warning' : 'connected');
        return {
          id: key,
          name: String(row.model ?? 'جهاز Mizan'),
          ownerName: key === String(session?.user.id) ? adminName : 'عضو العائلة',
          deviceType: 'phone' as const,
          model: String(row.model ?? 'غير متاح'),
          ipAddress: String(row.latest_gateway_ip ?? 'غير متاح'),
          macAddress: 'غير متاح',
          usedGB: Number(usedGB.toFixed(4)),
          allowedQuotaGB: Number(allowedQuotaGB.toFixed(4)),
          status,
          isPaused: isBlocked,
          lastUpdated: formatRelativeTime(String(row.last_seen_at ?? '')),
          lastUpdatedDetail: String(row.last_seen_at ?? 'غير متاح'),
          wifiSSID: String(row.latest_ssid ?? row.home_ssid ?? ''),
          wifiBssid: String(row.latest_bssid ?? ''),
          targetNetworkId,
          targetNetworkName: targetNetwork ? String(targetNetwork.network_name ?? '') : '',
          gatewayIp: String(row.latest_gateway_ip ?? ''),
          wifiBand: String(row.latest_wifi_band ?? ''),
          securityType: String(row.latest_security_type ?? ''),
          signalPercent: row.latest_signal_percent == null ? null : Number(row.latest_signal_percent),
          networkUpdatedAt: String(row.network_updated_at ?? ''),
          serviceHeartbeatAt: String(row.service_heartbeat_at ?? ''),
          lastPolicySyncAt: String(row.last_policy_sync_at ?? ''),
          lastTelemetryUploadAt: String(row.last_telemetry_upload_at ?? ''),
          vpnState: String(row.vpn_state ?? 'UNKNOWN'),
          networkState: String(row.network_state ?? 'UNKNOWN'),
          permissionHealth: String(row.permission_health ?? 'UNKNOWN'),
          blockedScope: (String(policy?.blocked_scope ?? 'TARGET_WIFI_ONLY') === 'TARGET_WIFI_ONLY' ? 'TARGET_WIFI_ONLY' : 'TARGET_WIFI_ONLY'),
          policyVersion: Number(policy?.policy_version ?? 1),
          topApps: deviceApps,
          dailyUsage: toDailyUsage(deviceSnapshots),
          activities: [rowToActivity(row)],
          customQuota: Boolean(policy),
        } satisfies Device;
      });
      setDevices(mapped);
      if (!selectedDeviceId && mapped[0]) setSelectedDeviceId(mapped[0].id);

      const used = mapped.reduce((sum, device) => sum + device.usedGB, 0);
      const total = Number(household.monthly_quota_gb ?? 0);
      const remaining = Math.max(0, total - used);
      const percentage = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
      const now = new Date();
      const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
      setHouseholdQuota({
        totalGB: Number(total.toFixed(4)),
        usedGB: Number(used.toFixed(4)),
        remainingGB: Number(remaining.toFixed(4)),
        percentage,
        period: 'monthly',
        resetDate: nextMonth.toISOString().slice(0, 10),
        daysRemaining: Math.max(0, Math.ceil((nextMonth.getTime() - now.getTime()) / 86400000)),
        firstAlertPercent: 85,
        secondAlertPercent: 95,
      });

      const settings = settingsResult.data as Record<string, unknown> | null;
      setGatewaySettings(settings ? {
        householdId: id,
        targetSsid: String(settings.target_ssid ?? ''),
        targetBssid: String(settings.target_bssid ?? ''),
        gatewayIp: String(settings.gateway_ip ?? ''),
        wifiBand: String(settings.wifi_band ?? ''),
        securityType: String(settings.security_type ?? ''),
        autoCutoff: Boolean(settings.auto_cutoff),
        notifyOnNearLimit: Boolean(settings.notify_on_near_limit),
        notifyOnBlock: Boolean(settings.notify_on_block),
        dailyDigest: Boolean(settings.daily_digest),
        updatedAt: String(settings.updated_at ?? ''),
      } : null);
      setNotifications(mapped.filter((device) => device.status !== 'connected').map((device) => ({
        id: `device-status-${device.id}`,
        title: device.status === 'blocked' ? `تم حظر ${device.name}` : `اقترب ${device.name} من الحصة`,
        description: `${device.usedGB} جيجابايت من أصل ${device.allowedQuotaGB} جيجابايت`,
        timestamp: device.lastUpdated,
        severity: device.status === 'blocked' ? 'danger' : 'warning',
        deviceId: device.id,
        isRead: false,
      })));
    } catch (error) {
      showToast('تعذر تحميل بيانات Mizan', error instanceof Error ? error.message : 'تحقق من إعدادات الاتصال', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [adminName, resetData, selectedDeviceId, session?.user.id, showToast]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => { if (mounted) setSession(data.session); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session?.user.id) {
      resetData();
      setCurrentScreen('login');
      return;
    }
    setCurrentScreen((screen) => screen === 'login' ? 'overview' : screen);
    void loadData(session.user.id);
  }, [loadData, resetData, session?.user.id]);

  useEffect(() => {
    if (!session?.user.id || !householdId) return;
    realtimeChannelRef.current?.unsubscribe();
    const channel = supabase.channel(`mizan-household-${householdId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devices', filter: `household_id=eq.${householdId}` }, () => void loadData(session.user.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quota_policies', filter: `household_id=eq.${householdId}` }, () => void loadData(session.user.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monitored_networks', filter: `household_id=eq.${householdId}` }, () => void loadData(session.user.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gateway_system_settings', filter: `household_id=eq.${householdId}` }, () => void loadData(session.user.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'household_members', filter: `household_id=eq.${householdId}` }, () => void loadData(session.user.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usage_snapshots' }, () => void loadData(session.user.id))
      .subscribe();
    realtimeChannelRef.current = channel;
    return () => { channel.unsubscribe(); realtimeChannelRef.current = null; };
  }, [householdId, loadData, session?.user.id]);

  const login = async (email: string, pass: string) => {
    try {
      requireSupabaseConfig();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
      if (error) throw error;
      return true;
    } catch (error) {
      showToast('بيانات الدخول غير صحيحة', error instanceof Error ? error.message : 'تعذر تسجيل الدخول', 'danger');
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    resetData();
    setCurrentScreen('login');
  };

  const createHousehold = async (name: string, monthlyQuotaGb: number, targetSsid: string) => {
    try {
      const { error } = await supabase.rpc('create_household', { p_name: name, p_monthly_quota_gb: monthlyQuotaGb, p_target_ssid: targetSsid });
      if (error) throw error;
      if (session?.user.id) {
        const { data: createdHousehold, error: householdLookupError } = await supabase.from('households').select('id').eq('owner_id', session.user.id).eq('name', name).order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (householdLookupError) throw householdLookupError;
        if (createdHousehold?.id && targetSsid.trim()) {
          const { error: networkError } = await supabase.from('monitored_networks').insert({ household_id: String(createdHousehold.id), network_name: 'الشبكة الرئيسية', ssid: targetSsid.trim(), bssid: null, is_active: true });
          if (networkError && networkError.code !== '23505') throw networkError;
        }
        await loadData(session.user.id);
      }
      showToast('تم إنشاء المنزل', 'أصبح المنزل جاهزًا لإضافة الأجهزة والدعوات', 'success');
      return true;
    } catch (error) {
      showToast('تعذر إنشاء المنزل', describeSupabaseError(error, 'تحقق من إعدادات Supabase والصلاحيات'), 'danger');
      return false;
    }
  };

  const createInvite = async (displayName = '', maxUses = 5) => {
    if (!householdId) return null;
    try {
      const safeMaxUses = Number.isFinite(maxUses) && maxUses >= 0 ? Math.floor(maxUses) : 5;
      const { data, error } = await supabase.rpc('create_household_invite', { p_household_id: householdId, p_display_name: displayName, p_max_uses: safeMaxUses });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      const invite = { token: String(row.invite_token), deepLink: String(row.deep_link), webLink: String(row.web_link), maxUses: Number(row.max_uses ?? safeMaxUses), useCount: 0 };
      setActiveInvite(invite);
      showToast('تم إنشاء دعوة حقيقية', 'يمكن الآن إرسال الرابط إلى صاحب الجهاز', 'success');
      return invite;
    } catch (error) {
      showToast('تعذر إنشاء الدعوة', describeSupabaseError(error, 'تحقق من صلاحية المسؤول'), 'danger');
      return null;
    }
  };

  const saveGatewaySettings = async (settings: Omit<GatewaySettings, 'householdId' | 'updatedAt'>) => {
    if (!householdId) return false;
    const targetSsid = settings.targetSsid.trim();
    const targetBssid = settings.targetBssid.trim().toLowerCase();
    if (!targetSsid) {
      showToast('لا يمكن حفظ الشبكة', 'يجب اعتماد اسم شبكة Wi‑Fi حقيقي من الهاتف أولًا', 'danger');
      return false;
    }
    try {
      const { error } = await supabase.from('gateway_system_settings').upsert({
        household_id: householdId,
        target_ssid: targetSsid,
        target_bssid: targetBssid,
        gateway_ip: settings.gatewayIp.trim(),
        wifi_band: settings.wifiBand.trim(),
        security_type: settings.securityType.trim(),
        auto_cutoff: settings.autoCutoff,
        notify_on_near_limit: settings.notifyOnNearLimit,
        notify_on_block: settings.notifyOnBlock,
        daily_digest: settings.dailyDigest,
      }, { onConflict: 'household_id' });
      if (error) throw error;

      // Keep the legacy gateway card and the per-device network registry in sync.
      // If this household has one matching/only network, this is the same target
      // network the administrator is editing; propagate the new BSSID and version.
      const matchedNetwork = monitoredNetworks.find((network) => network.ssid === targetSsid) ?? (monitoredNetworks.length === 1 ? monitoredNetworks[0] : null);
      if (matchedNetwork) {
        const { error: networkError } = await supabase.from('monitored_networks').update({
          ssid: targetSsid,
          bssid: targetBssid || null,
          updated_at: new Date().toISOString(),
        }).eq('id', matchedNetwork.id).eq('household_id', householdId);
        if (networkError) throw networkError;

        const { data: policies, error: policiesError } = await supabase.from('quota_policies')
          .select('device_key,policy_version').eq('household_id', householdId).eq('target_network_id', matchedNetwork.id);
        if (policiesError) throw policiesError;
        await Promise.all((policies ?? []).map(async (policy) => {
          const { error: policyError } = await supabase.from('quota_policies').update({
            home_ssid: targetSsid,
            target_bssid: targetBssid,
            policy_version: Math.max(1, Number(policy.policy_version ?? 0) + 1),
            policy_updated_at: new Date().toISOString(),
          }).eq('device_key', String(policy.device_key)).eq('household_id', householdId);
          if (policyError) throw policyError;
        }));
      }

      if (session?.user.id) await loadData(session.user.id);
      showToast('تم حفظ إعدادات الشبكة', matchedNetwork ? 'تم تحديث سجل الشبكة وسياسات الأجهزة المرتبطة' : 'تم حفظ Target Wi‑Fi العام، ويمكن توجيه الأجهزة من سجل الشبكات', 'success');
      return true;
    } catch (error) {
      showToast('تعذر حفظ إعدادات الشبكة', error instanceof Error ? error.message : 'تحقق من الصلاحيات', 'danger');
      return false;
    }
  };

  const createMonitoredNetwork = async (input: { networkName: string; ssid: string; bssid?: string }) => {
    if (!householdId) return null;
    const networkName = input.networkName.trim();
    const ssid = input.ssid.trim();
    const bssid = (input.bssid ?? '').trim().toLowerCase();
    if (!networkName || !ssid) {
      showToast('لا يمكن إضافة الشبكة', 'أدخل اسمًا إداريًا وSSID حقيقيًا', 'danger');
      return null;
    }
    if (bssid && !/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i.test(bssid)) {
      showToast('BSSID غير صحيح', 'استخدم الصيغة 00:11:22:33:44:55', 'danger');
      return null;
    }
    try {
      const { data, error } = await supabase.from('monitored_networks').insert({
        household_id: householdId,
        network_name: networkName,
        ssid,
        bssid: bssid || null,
        is_active: true,
      }).select('*').single();
      if (error) throw error;
      if (session?.user.id) await loadData(session.user.id);
      const row = data as Record<string, unknown>;
      showToast('تمت إضافة الشبكة', 'يمكن الآن توجيه أي جهاز إليها', 'success');
      return {
        id: String(row.id), householdId, networkName: String(row.network_name), ssid: String(row.ssid),
        bssid: String(row.bssid ?? ''), isActive: Boolean(row.is_active), createdAt: String(row.created_at ?? ''), updatedAt: String(row.updated_at ?? ''),
      } satisfies MonitoredNetwork;
    } catch (error) {
      showToast('تعذر إضافة الشبكة', describeSupabaseError(error, 'قد تكون الشبكة مسجلة بالفعل'), 'danger');
      return null;
    }
  };

  const updateMonitoredNetwork = async (networkId: string, input: { networkName: string; ssid: string; bssid?: string }) => {
    if (!householdId) return false;
    const networkName = input.networkName.trim();
    const ssid = input.ssid.trim();
    const bssid = (input.bssid ?? '').trim().toLowerCase();
    if (!networkName || !ssid || (bssid && !/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i.test(bssid))) {
      showToast('بيانات الشبكة غير صحيحة', 'راجع الاسم وSSID وBSSID', 'danger');
      return false;
    }
    try {
      const { error } = await supabase.from('monitored_networks').update({
        network_name: networkName,
        ssid,
        bssid: bssid || null,
        updated_at: new Date().toISOString(),
      }).eq('id', networkId).eq('household_id', householdId);
      if (error) throw error;
      const { data: policies, error: policiesError } = await supabase.from('quota_policies')
        .select('device_key,policy_version').eq('household_id', householdId).eq('target_network_id', networkId);
      if (policiesError) throw policiesError;
      await Promise.all((policies ?? []).map(async (policy) => {
        const nextVersion = Number(policy.policy_version ?? 0) + 1;
        const { error: policyError } = await supabase.from('quota_policies').update({
          home_ssid: ssid,
          target_bssid: bssid,
          policy_version: Math.max(1, nextVersion),
          policy_updated_at: new Date().toISOString(),
        }).eq('device_key', String(policy.device_key)).eq('household_id', householdId);
        if (policyError) throw policyError;
      }));
      if (session?.user.id) await loadData(session.user.id);
      showToast('تم تحديث الشبكة', 'تم إرسال التغيير إلى الأجهزة المرتبطة بها', 'success');
      return true;
    } catch (error) {
      showToast('تعذر تحديث الشبكة', describeSupabaseError(error, 'تحقق من الصلاحيات والبيانات'), 'danger');
      return false;
    }
  };

  const deleteMonitoredNetwork = async (networkId: string) => {
    if (!householdId) return false;
    try {
      const { data: policies, error: policiesError } = await supabase.from('quota_policies')
        .select('device_key,policy_version').eq('household_id', householdId).eq('target_network_id', networkId);
      if (policiesError) throw policiesError;
      await Promise.all((policies ?? []).map(async (policy) => {
        const { error: policyError } = await supabase.from('quota_policies').update({
          target_network_id: null,
          home_ssid: '',
          target_bssid: '',
          policy_version: Math.max(1, Number(policy.policy_version ?? 0) + 1),
          policy_updated_at: new Date().toISOString(),
        }).eq('device_key', String(policy.device_key)).eq('household_id', householdId);
        if (policyError) throw policyError;
      }));
      const { error } = await supabase.from('monitored_networks').delete().eq('id', networkId).eq('household_id', householdId);
      if (error) throw error;
      if (session?.user.id) await loadData(session.user.id);
      showToast('تم حذف الشبكة', 'الأجهزة المرتبطة بها أصبحت بلا شبكة مستهدفة حتى تعيين شبكة جديدة', 'success');
      return true;
    } catch (error) {
      showToast('تعذر حذف الشبكة', describeSupabaseError(error, 'قد تكون الشبكة مستخدمة أو غير متاحة'), 'danger');
      return false;
    }
  };

  const assignDeviceNetwork = async (deviceId: string, networkId: string | null) => {
    if (!householdId) return false;
    try {
      const network = networkId ? monitoredNetworks.find((item) => item.id === networkId) : null;
      if (networkId && !network) throw new Error('الشبكة المحددة غير موجودة');
      const { data: currentPolicy, error: currentError } = await supabase.from('quota_policies')
        .select('policy_version,monthly_limit_gb,enforce_vpn_block,is_blocked').eq('device_key', deviceId).eq('household_id', householdId).maybeSingle();
      if (currentError) throw currentError;
      const nextVersion = Math.max(1, Number(currentPolicy?.policy_version ?? 0) + 1);
      const policyPatch = {
        device_key: deviceId,
        household_id: householdId,
        user_id: null,
        monthly_limit_gb: Number(currentPolicy?.monthly_limit_gb ?? devices.find((item) => item.id === deviceId)?.allowedQuotaGB ?? 0),
        warning_threshold_percent: 85,
        enforce_vpn_block: Boolean(currentPolicy?.enforce_vpn_block ?? true),
        is_blocked: Boolean(currentPolicy?.is_blocked ?? false),
        target_network_id: network?.id ?? null,
        home_ssid: network?.ssid ?? '',
        target_bssid: network?.bssid ?? '',
        blocked_scope: 'TARGET_WIFI_ONLY',
        policy_version: nextVersion,
        policy_updated_at: new Date().toISOString(),
        reason: null,
        reset_day_of_month: 1,
      };
      const policyQuery = currentPolicy
        ? supabase.from('quota_policies').update(policyPatch).eq('device_key', deviceId).eq('household_id', householdId)
        : supabase.from('quota_policies').insert(policyPatch);
      const { error: policyError } = await policyQuery;
      if (policyError) throw policyError;
      const { error: deviceError } = await supabase.from('devices').update({ target_network_id: network?.id ?? null })
        .eq('device_key', deviceId).eq('household_id', householdId);
      if (deviceError) throw deviceError;
      if (session?.user.id) await loadData(session.user.id);
      showToast('تم توجيه الجهاز', network ? `سيعمل على ${network.networkName}` : 'تم إلغاء الشبكة المستهدفة لهذا الجهاز', 'success');
      return true;
    } catch (error) {
      showToast('تعذر توجيه الجهاز', describeSupabaseError(error, 'تحقق من الشبكة والصلاحيات'), 'danger');
      return false;
    }
  };

  const writeDevicePolicy = async (device: Device, blocked: boolean, quotaGb = device.allowedQuotaGB) => {
    if (!householdId) return;
    const { data: currentPolicy, error: currentPolicyError } = await supabase
      .from('quota_policies')
      .select('policy_version')
      .eq('device_key', device.id)
      .eq('household_id', householdId)
      .maybeSingle();
    if (currentPolicyError) throw currentPolicyError;
    const nextPolicyVersion = Number(currentPolicy?.policy_version ?? device.policyVersion ?? 0) + 1;
    const assignedNetwork = device.targetNetworkId ? monitoredNetworks.find((network) => network.id === device.targetNetworkId) : undefined;
    const payload = {
      device_key: device.id,
      household_id: householdId,
      user_id: null,
      monthly_limit_gb: quotaGb,
      warning_threshold_percent: 85,
      target_network_id: assignedNetwork?.id ?? null,
      home_ssid: assignedNetwork?.ssid ?? '',
      target_bssid: assignedNetwork?.bssid ?? '',
      enforce_vpn_block: gatewaySettings?.autoCutoff ?? true,
      is_blocked: blocked,
      blocked_scope: 'TARGET_WIFI_ONLY',
      policy_version: Math.max(1, nextPolicyVersion),
      policy_updated_at: new Date().toISOString(),
      reason: blocked ? 'قرار المسؤول — شبكة Wi‑Fi المنزل المستهدفة فقط' : null,
      reset_day_of_month: 1,
    };
    const { error } = await supabase.from('quota_policies').upsert(payload, { onConflict: 'device_key' });
    if (error) throw error;
    const { error: deviceError } = await supabase.from('devices').update({ is_blocked: blocked, quota_limit_gb: quotaGb }).eq('device_key', device.id).eq('household_id', householdId);
    if (deviceError) throw deviceError;
  };

  const toggleDevicePause = async (deviceId: string) => {
    const device = devices.find((item) => item.id === deviceId);
    if (!device) return;
    try {
      await writeDevicePolicy(device, !device.isPaused);
      if (session?.user.id) await loadData(session.user.id);
    } catch (error) { showToast('تعذر تحديث حالة الجهاز', error instanceof Error ? error.message : 'فشل التحديث', 'danger'); }
  };

  const unblockDevice = async (deviceId: string) => {
    const device = devices.find((item) => item.id === deviceId);
    if (!device) return;
    try { await writeDevicePolicy(device, false, Math.max(device.allowedQuotaGB, device.usedGB + 5)); if (session?.user.id) await loadData(session.user.id); }
    catch (error) { showToast('تعذر إلغاء الحظر', error instanceof Error ? error.message : 'فشل التحديث', 'danger'); }
  };

  const blockDevice = async (deviceId: string) => {
    const device = devices.find((item) => item.id === deviceId);
    if (!device) return;
    try { await writeDevicePolicy(device, true); if (session?.user.id) await loadData(session.user.id); }
    catch (error) { showToast('تعذر حظر الجهاز', error instanceof Error ? error.message : 'فشل التحديث', 'danger'); }
  };

  const removeDevice = async (deviceId: string) => {
    if (!householdId) return;
    try {
      const { error } = await supabase.from('devices').update({ is_active: false }).eq('device_key', deviceId).eq('household_id', householdId);
      if (error) throw error;
      if (session?.user.id) await loadData(session.user.id);
      showToast('تم إلغاء ربط الجهاز', 'تم إخفاء الجهاز من لوحة التحكم مع حفظ سجل الاستهلاك', 'info');
    } catch (error) { showToast('تعذر إلغاء ربط الجهاز', error instanceof Error ? error.message : 'فشل التحديث', 'danger'); }
  };

  const updateQuota = async ({ type, deviceId, totalGB, period, firstAlertPercent, secondAlertPercent }: EditQuotaParams) => {
    if (!householdId) return;
    try {
      if (type === 'household') {
        const { error } = await supabase.from('households').update({ monthly_quota_gb: Math.max(0, totalGB) }).eq('id', householdId).eq('owner_id', session?.user.id);
        if (error) throw error;
        if (session?.user.id) await loadData(session.user.id);
        showToast('تم تحديث الحصة المنزلية', `تم تعديل الإجمالي إلى ${totalGB} جيجابايت`, 'success');
      } else if (deviceId) {
        const device = devices.find((item) => item.id === deviceId);
        if (!device) return;
        await writeDevicePolicy(device, device.isPaused, Math.max(0, totalGB));
        if (session?.user.id) await loadData(session.user.id);
        showToast('تم تحديث حصة الجهاز', `تم تعديل الحصة إلى ${totalGB} جيجابايت`, 'success');
      }
      void period; void firstAlertPercent; void secondAlertPercent;
    } catch (error) { showToast('تعذر تحديث الحصة', error instanceof Error ? error.message : 'فشل التحديث', 'danger'); }
  };

  const selectedDevice = useMemo(() => devices.find((device) => device.id === selectedDeviceId) ?? devices[0] ?? null, [devices, selectedDeviceId]);
  const unreadNotificationsCount = notifications.filter((notification) => !notification.isRead).length;
  const navigateToDevice = (deviceId: string) => { setSelectedDeviceId(deviceId); setCurrentScreen('device-detail'); };
  const refreshData = () => { if (session?.user.id) void loadData(session.user.id); };
  const markNotificationAsRead = (id: string) => setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, isRead: true } : item));
  const markAllNotificationsAsRead = () => setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  const clearNotifications = () => setNotifications([]);
  const openEditQuotaModal = (type: 'household' | 'device', device?: Device) => { setEditQuotaTarget({ type, device }); setEditQuotaModalOpen(true); };
  const closeEditQuotaModal = () => { setEditQuotaModalOpen(false); setEditQuotaTarget(null); };
  const resetSimulatedState = () => setSimulatedState('normal');

  return (
    <MizanContext.Provider value={{
      currentScreen, setCurrentScreen, navigateToDevice, selectedDeviceId, selectedDevice, setSelectedDeviceId,
      isLoggedIn, login, logout, adminName, adminEmail, householdId, householdName, devices, monitoredNetworks, householdQuota,
      notifications, unreadNotificationsCount, gatewaySettings, activeInvite, createHousehold, createInvite,
      saveGatewaySettings, createMonitoredNetwork, updateMonitoredNetwork, deleteMonitoredNetwork, assignDeviceNetwork,
      toggleDevicePause, unblockDevice, blockDevice, removeDevice, updateQuota,
      markNotificationAsRead, markAllNotificationsAsRead, clearNotifications, refreshData, editQuotaModalOpen,
      editQuotaTarget, openEditQuotaModal, closeEditQuotaModal, simulatedState, setSimulatedState,
      resetSimulatedState, globalSearch, setGlobalSearch, toasts, showToast, removeToast,
    }}>
      {children}
    </MizanContext.Provider>
  );
}

export function useMizan() {
  const context = useContext(MizanContext);
  if (!context) throw new Error('useMizan must be used within a MizanProvider');
  return context;
}

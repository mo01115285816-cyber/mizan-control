export type ScreenType = 
  | 'login' 
  | 'overview' 
  | 'devices' 
  | 'device-detail' 
  | 'quotas' 
  | 'analytics' 
  | 'notifications' 
  | 'settings';

export type DeviceStatus = 'connected' | 'warning' | 'blocked';

export type DeviceType = 'phone' | 'laptop' | 'tv' | 'tablet' | 'gaming';

export interface AppUsageItem {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  usedGB: number;
  percentage: number;
  iconName: string;
}

export interface DailyUsagePoint {
  dayKey: string;
  dayLabel: string;
  usedGB: number;
  averageGB: number;
}

export interface DeviceActivity {
  id: string;
  title: string;
  timeAgo: string;
  type: 'sync' | 'warning' | 'pause' | 'resume' | 'quota_change';
}

export interface MonitoredNetwork {
  id: string;
  householdId: string;
  networkName: string;
  ssid: string;
  bssid: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  name: string;
  ownerName: string;
  deviceType: DeviceType;
  model: string;
  ipAddress: string;
  macAddress: string;
  usedGB: number;
  allowedQuotaGB: number;
  status: DeviceStatus;
  isPaused: boolean;
  lastUpdated: string;
  lastUpdatedDetail: string;
  wifiSSID: string;
  wifiBssid?: string;
  targetNetworkId?: string;
  targetNetworkName?: string;
  gatewayIp?: string;
  wifiBand?: string;
  securityType?: string;
  signalPercent?: number | null;
  networkUpdatedAt?: string;
  serviceHeartbeatAt?: string;
  lastPolicySyncAt?: string;
  lastTelemetryUploadAt?: string;
  vpnState?: string;
  networkState?: string;
  permissionHealth?: string;
  blockedScope?: 'TARGET_WIFI_ONLY';
  policyVersion?: number;
  topApps: AppUsageItem[];
  dailyUsage: DailyUsagePoint[];
  activities: DeviceActivity[];
  customQuota: boolean;
}

export interface HouseholdQuota {
  totalGB: number;
  usedGB: number;
  remainingGB: number;
  percentage: number;
  period: 'monthly' | 'weekly';
  resetDate: string;
  daysRemaining: number;
  firstAlertPercent: number;
  secondAlertPercent: number;
}

export type AlertSeverity = 'warning' | 'danger' | 'info' | 'success';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: AlertSeverity;
  deviceId?: string;
  isRead: boolean;
}

export type SimulatedSystemState = 
  | 'normal' 
  | 'loading' 
  | 'empty' 
  | 'disconnected' 
  | 'sync_error' 
  | 'unauthorized';

export interface GatewaySettings {
  householdId: string;
  targetSsid: string;
  targetBssid: string;
  gatewayIp: string;
  wifiBand: string;
  securityType: string;
  autoCutoff: boolean;
  notifyOnNearLimit: boolean;
  notifyOnBlock: boolean;
  dailyDigest: boolean;
  updatedAt: string;
}

export interface HouseholdInvite {
  token: string;
  deepLink: string;
  webLink: string;
  maxUses: number;
  useCount?: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'danger';
}

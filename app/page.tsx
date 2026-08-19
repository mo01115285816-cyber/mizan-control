'use client';

import React from 'react';
import { MizanProvider, useMizan } from '@/context/MizanContext';
import FloatingHeader from '@/components/layout/FloatingHeader';
import FloatingBottomNav from '@/components/layout/FloatingBottomNav';
import ToastContainer from '@/components/layout/ToastContainer';
import EditQuotaModal from '@/components/modals/EditQuotaModal';
import SimulatedStateView from '@/components/common/SimulatedStateView';

// Screen components
import LoginScreen from '@/components/screens/LoginScreen';
import OverviewScreen from '@/components/screens/OverviewScreen';
import DevicesScreen from '@/components/screens/DevicesScreen';
import DeviceDetailScreen from '@/components/screens/DeviceDetailScreen';
import QuotasScreen from '@/components/screens/QuotasScreen';
import NotificationsScreen from '@/components/screens/NotificationsScreen';
import AnalyticsScreen from '@/components/screens/AnalyticsScreen';
import SettingsScreen from '@/components/screens/SettingsScreen';

function MainAppContent() {
  const { currentScreen, isLoggedIn, simulatedState } = useMizan();

  // If not logged in or on login screen, show luxury Login
  if (!isLoggedIn || currentScreen === 'login') {
    return <LoginScreen />;
  }

  const renderActiveScreen = () => {
    // If a simulated system state is active (e.g. Loading, Disconnected, Empty, etc.)
    if (simulatedState !== 'normal') {
      return <SimulatedStateView />;
    }

    switch (currentScreen) {
      case 'overview':
        return <OverviewScreen />;
      case 'devices':
        return <DevicesScreen />;
      case 'device-detail':
        return <DeviceDetailScreen />;
      case 'quotas':
        return <QuotasScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <OverviewScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F2] text-[#151515] flex flex-col font-['IBM_Plex_Sans_Arabic',sans-serif] selection:bg-[#C8F24A] selection:text-[#151515]">
      {/* Floating Pill Header Capsules */}
      <FloatingHeader />

      {/* Main Content Area (Spanning full width, smoothly scrolling underneath capsules and floating island) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-28 sm:pb-32">
        {renderActiveScreen()}
      </main>

      {/* Floating Island Bottom Navigation Bar */}
      <FloatingBottomNav />

      {/* Global Modals & Notifications */}
      <EditQuotaModal />
      <ToastContainer />
    </div>
  );
}

export default function Home() {
  return (
    <MizanProvider>
      <MainAppContent />
    </MizanProvider>
  );
}

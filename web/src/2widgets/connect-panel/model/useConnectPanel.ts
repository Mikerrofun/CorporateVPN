'use client';

import { useState } from 'react';
import { useOSDetection } from '@/5shared/lib/device';
import { getAppsForOS } from '@/5shared/config/vpnApps.config';
import type { AppId } from '@/5shared/config/vpnApps.config';
import type { OS } from '@/5shared/lib/device/types';

export function useConnectPanel() {
  const { os, setOS } = useOSDetection();

  const apps = getAppsForOS(os);
  const [selectedAppId, setSelectedAppId] = useState<AppId | null>(apps[0]?.id ?? null);

  // id мог остаться от предыдущей OS — фолбэк на первое приложение пары
  const selectedApp = apps.find((app) => app.id === selectedAppId) ?? apps[0] ?? null;

  const handleOSChange = (newOS: OS) => {
    setOS(newOS);
    setSelectedAppId(getAppsForOS(newOS)[0]?.id ?? null);
  };

  const handleAppChange = (appId: string) => {
    if (apps.some((app) => app.id === appId)) setSelectedAppId(appId as AppId);
  };

  return {
    os,
    apps,
    selectedApp,
    handleOSChange,
    handleAppChange,
  };
}

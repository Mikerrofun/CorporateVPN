'use client';

import { useState } from 'react';
import { useOSDetection } from '@/5shared/lib/device';
import { getAppsForOS, getAppConfig } from '@/5shared/config/vpnApps.config';
import type { AppId } from '@/5shared/config/vpnApps.config';
import type { OS } from '@/5shared/lib/device/types';

export function useConnectPanel() {
  const { os, setOS } = useOSDetection();

  const apps = getAppsForOS(os);
  const [selectedApp, setSelectedApp] = useState<AppId | null>(apps[0]?.id ?? null);

  const activeApp =
    selectedApp && apps.some((app) => app.id === selectedApp)
      ? selectedApp
      : apps[0]?.id ?? null;

  const handleOSChange = (newOS: OS) => {
    setOS(newOS);
    const newApps = getAppsForOS(newOS);
    if (newApps.length > 0) {
      setSelectedApp(newApps[0].id);
    }
  };

  const handleAppChange = (appId: string) => {
    setSelectedApp(appId as AppId);
  };

  const currentApp = activeApp ? getAppConfig(activeApp, os) : null;

  return {
    os,
    activeApp,
    apps,
    currentApp,
    handleOSChange,
    handleAppChange,
  };
}

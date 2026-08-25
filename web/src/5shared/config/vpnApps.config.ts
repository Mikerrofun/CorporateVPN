import type { OS } from '@/5shared/lib/device/types';

export type AppId = 'happ' | 'hiddify' | 'rbhole';

export interface AppConfig {
  label: string;
  deepLink: string;
  downloads: Partial<Record<OS, string>>;
  description?: string;
}

export interface AppWithDownload extends AppConfig {
  id: AppId;
  downloadLink: string | null;
}

// TODO: заменить ссылки и deep link-схемы на реальные после интеграции с backend
const APPS: Record<AppId, AppConfig> = {
  happ: {
    label: 'Happ',
    deepLink: 'happ://add/',
    description: 'Универсальный VPN клиент',
    downloads: {
      ios: 'https://apps.apple.com/ru/app/happ-proxy-utility/id6504287215',
      android: 'https://play.google.com/store/apps/details?id=com.happproxy',
      mac: 'https://apps.apple.com/pl/app/happ-proxy-utility/id6504287215',
      windows: 'https://www.happ.su/main/ru',
    },
  },
  hiddify: {
    label: 'Hiddify',
    deepLink: 'hiddify://install-sub?url=',
    description: 'Открытый код, быстрый',
    downloads: {
      android: 'https://play.google.com/store/apps/details?id=app.hiddify.com',
      windows: 'https://hiddify.com',
    },
  },
  rbhole: {
    label: 'RbHole',
    deepLink: 'rabbithole://add/',
    description: 'Простой и надёжный',
    downloads: {
      ios: 'https://apps.apple.com/ru/app/rabbithole-vpn-client/id6683309629',
      mac: 'https://apps.apple.com/ru/app/rabbithole-vpn-client/id6683309629',
    },
  },
};

const OS_APPS: Record<OS, AppId[]> = {
  ios: ['rbhole', 'happ'],
  android: ['happ', 'hiddify'],
  mac: ['rbhole', 'happ'],
  windows: ['happ', 'hiddify'],
};

export function getAppsForOS(os: OS): AppWithDownload[] {
  return OS_APPS[os].map((appId) => ({
    id: appId,
    ...APPS[appId],
    downloadLink: APPS[appId].downloads[os] || null,
  }));
}

export function generateDeepLink(appId: AppId, subscriptionUrl: string): string {
  const app = APPS[appId];
  if (!app) return subscriptionUrl;

  return `${app.deepLink}${subscriptionUrl}`;
}

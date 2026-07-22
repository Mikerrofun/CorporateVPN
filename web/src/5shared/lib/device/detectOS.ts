import type { OS } from './types';

/**
 * Определяет операционную систему по User-Agent строке
 * Работает как на сервере (SSR), так и на клиенте
 * 
 * @param userAgent - строка User-Agent из navigator или HTTP headers
 * @param maxTouchPoints - navigator.maxTouchPoints для точного определения iOS (опционально)
 * @returns определённая OS или 'windows' как fallback
 */


export function detectOS(userAgent?: string, maxTouchPoints?: number): OS {
  if (!userAgent && typeof window === 'undefined') {
    return 'windows';
  }

  const ua = (userAgent || navigator.userAgent).toLowerCase();
  const touchPoints = maxTouchPoints ?? (typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0);

  const rules: Array<{ test: () => boolean; os: OS }> = [
    { test: () => /iphone|ipod/.test(ua), os: 'ios' },
    { test: () => /ipad/.test(ua), os: 'ios' },
    { test: () => /macintosh/.test(ua) && touchPoints > 0, os: 'ios' },
    { test: () => /android/.test(ua), os: 'android' },
    { test: () => /macintosh|mac os x/.test(ua), os: 'mac' },
    { test: () => /windows|win32|win64/.test(ua), os: 'windows' },
  ];

  return rules.find(rule => rule.test())?.os ?? 'windows';
}

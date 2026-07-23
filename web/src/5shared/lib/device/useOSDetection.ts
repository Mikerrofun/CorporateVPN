'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { detectOS } from './detectOS';
import type { OS } from './types';

/**
 * Хук для определения и управления OS пользователя
 * 
 * Логика работы:
 * 1. При первом рендере берёт preferredOS из session (если есть)
 * 2. Если в session нет значения - определяет автоматически через navigator
 * 3. Автоматически сохраняет определённую OS в session при первом использовании
 * 4. Предоставляет setOS для ручного изменения (с сохранением в session)
 * 
 * @returns { os, setOS }
 */
export function useOSDetection() {
  const { data: session, update, status } = useSession();
  const [os, setOSState] = useState<OS>('windows');

  useEffect(() => {
    if (status === 'loading') return;

    const sessionOS = session?.user?.preferredOS;

    if (sessionOS) {
      setOSState(sessionOS);
    } else {
      const detectedOS = detectOS(navigator.userAgent, navigator.maxTouchPoints);
      setOSState(detectedOS);

      if (session) {
        update({ preferredOS: detectedOS });
      }
    }
  }, [session, status, update]);

  const setOS = async (newOS: OS) => {
    setOSState(newOS);
    if (session) {
      await update({ preferredOS: newOS });
    }
  };

  return { os, setOS };
}

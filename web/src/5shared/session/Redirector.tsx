"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Headless компонент для централизованных редиректов.
 * Отслеживает изменения сессии и автоматически перенаправляет пользователей.
 * Используется глобально в layout, не привязан только к аутентификации.
 */
export function Redirector() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const previousStatus = useRef<string>(status);

  useEffect(() => {
    if (previousStatus.current !== 'authenticated' && status === 'authenticated') {
      const isAdmin = session?.user?.isAdmin;
      
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      
      router.refresh();
    }
    
    previousStatus.current = status;
  }, [status, session, router]);

  return null; // Headless компонент
}

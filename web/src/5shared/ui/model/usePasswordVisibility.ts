"use client";

import { useCallback, useState } from "react";

export interface PasswordVisibility {
  isVisible: boolean;
  toggle: () => void;
}

export function usePasswordVisibility(): PasswordVisibility {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  return { isVisible, toggle };
}

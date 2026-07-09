"use client";

import { useCallback, useState } from "react";
import type { PasswordVisibility } from "./usePasswordVisibility.types";

export function usePasswordVisibility(): PasswordVisibility {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  return { isVisible, toggle };
}

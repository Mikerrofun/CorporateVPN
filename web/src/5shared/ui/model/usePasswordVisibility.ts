"use client";

import { useCallback, useState } from "react";

export function usePasswordVisibility() {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const inputType: "text" | "password" = isVisible ? "text" : "password";

  return { isVisible, toggle, inputType };
}

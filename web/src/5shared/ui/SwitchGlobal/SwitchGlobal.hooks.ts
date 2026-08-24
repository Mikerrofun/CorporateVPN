'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import type { SwitchOption } from './SwitchGlobal.types';

interface Indicator {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function useSwitchGlobal({
  options,
  value,
  equalWidth,
}: {
  options: SwitchOption[];
  value: string;
  equalWidth: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Map<string, { cell: HTMLDivElement | null; content: HTMLDivElement | null }>>(new Map());

  const [indicator, setIndicator] = useState<Indicator>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  const registerItem = (key: string, type: 'cell' | 'content', node: HTMLDivElement | null) => {
    if (!itemsRef.current.has(key)) {
      itemsRef.current.set(key, { cell: null, content: null });
    }
    const item = itemsRef.current.get(key)!;
    item[type] = node;
  };

  useLayoutEffect(() => {
    const activeItem = itemsRef.current.get(value);
    if (!activeItem?.cell || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const cellRect = activeItem.cell.getBoundingClientRect();

    setIndicator({
      left: cellRect.left - containerRect.left,
      top: cellRect.top - containerRect.top,
      width: cellRect.width,
      height: cellRect.height,
    });
  }, [value, options, equalWidth]);

  return { containerRef, indicator, registerItem };
}

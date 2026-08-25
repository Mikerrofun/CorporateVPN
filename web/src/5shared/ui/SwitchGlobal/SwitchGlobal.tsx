'use client';

import { useSwitchGlobal } from './SwitchGlobal.hooks';
import type { SwitchGlobalProps } from './SwitchGlobal.types';

export function SwitchGlobal({
  options,
  value,
  onChange,
  equalWidth = false,
  className,
  sliderClassName,
}: SwitchGlobalProps) {
  const { containerRef, indicator, registerItem } = useSwitchGlobal({
    options,
    value,
    equalWidth,
  });

  if (options.length === 0) return null;

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={`relative flex max-w-full items-center rounded-full ${
        equalWidth ? 'w-full' : 'inline-flex'
      } ${className || ''}`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute rounded-full shadow-md shadow-blue-500/20 transition-all duration-300 ease-out ${sliderClassName || ''}`}
        style={{
          left: indicator.left,
          top: indicator.top,
          width: indicator.width,
          height: indicator.height,
        }}
      />

      {options.map((option) => {
        const isActive = option.key === value;

        return (
          <div
            key={option.key}
            ref={(node) => registerItem(option.key, 'cell', node)}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => {
              if (!isActive) onChange?.(option.key);
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              if (!isActive) onChange?.(option.key);
            }}
            className={`relative z-10 flex min-w-0 cursor-pointer items-center justify-center rounded-full outline-none ${
              equalWidth ? 'flex-1 basis-0' : 'shrink-0'
            } focus-visible:ring-2 focus-visible:ring-blue-500/50`}
          >
            <div
              ref={(node) => registerItem(option.key, 'content', node)}
              className={equalWidth ? 'w-full flex justify-center' : ''}
            >
              {option.component}
            </div>
          </div>
        );
      })}
    </div>
  );
}

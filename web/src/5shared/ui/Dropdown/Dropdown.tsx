'use client';

import { useDropdown } from './Dropdown.hooks';
import type { DropdownProps } from './Dropdown.types';

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function Dropdown({ value, options, onSelect, className }: DropdownProps) {
  const { isOpen, ref, toggle, close } = useDropdown();
  const selectedOption = options.find((option) => option.key === value);

  const handleSelect = (key: string) => {
    close();
    onSelect(key);
  };

  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <button
        type="button"
        onClick={toggle}
        className="flex h-11 w-full cursor-pointer items-center justify-center gap-1 rounded-full border border-white/[0.08] bg-black/40 px-4 transition-colors duration-200 hover:bg-white/[0.05]"
      >
        <span className="text-sm font-normal text-slate-300">
          {selectedOption?.label}
        </span>
        <ChevronIcon
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full z-10 mt-2 w-full overflow-hidden rounded-2xl border border-white/[0.05] bg-panel shadow-xl shadow-black/40">
          {options.map(({ key, label, icon: Icon }) => {
            const isSelected = value === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelect(key)}
                className={`flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white'
                    : 'bg-panel text-slate-300 hover:bg-white/[0.06]'
                }`}
              >
                {Icon && (
                  <Icon className={isSelected ? 'h-5 w-5 text-white' : 'h-5 w-5 text-slate-400'} />
                )}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

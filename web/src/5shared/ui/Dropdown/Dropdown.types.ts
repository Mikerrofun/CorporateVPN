import type { ComponentType } from 'react';

export interface DropdownOption {
  key: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onSelect: (key: string) => void;
  className?: string;
}

import type { ReactNode } from 'react';

export interface SwitchOption {
  key: string;
  component: ReactNode;
}

export interface SwitchGlobalProps {
  options: SwitchOption[];
  value: string;
  onChange?: (key: string) => void;
  equalWidth?: boolean;
  className?: string;
  sliderClassName?: string;
}

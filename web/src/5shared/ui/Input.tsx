"use client";

import { forwardRef } from 'react';
import { PasswordToggle } from './PasswordToggle';
import type { PasswordVisibility } from '@/5shared/lib/hooks';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  passwordVisibility?: PasswordVisibility;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, type, passwordVisibility, ...props }, ref) => {
    return (
      <div>
        <label className="label" htmlFor={props.id}>{label}</label>
        <div className="relative">
          <input
            ref={ref}
            type={passwordVisibility?.isVisible ? 'text' : type}
            className={`input ${passwordVisibility ? 'pr-11' : ''} ${className || ''}`}
            {...props}
          />
          {passwordVisibility && (
            <PasswordToggle
              isVisible={passwordVisibility.isVisible}
              onToggle={passwordVisibility.toggle}
            />
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

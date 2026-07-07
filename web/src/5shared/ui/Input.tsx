"use client";

import { forwardRef } from 'react';
import { PasswordToggle } from './PasswordToggle';
import { usePasswordVisibility } from './model/usePasswordVisibility';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, type, ...props }, ref) => {
    const isPassword = type === 'password';
    const { isVisible, toggle } = usePasswordVisibility();

    return (
      <div>
        <label className="label" htmlFor={props.id}>{label}</label>
        <div className="relative">
          <input
            ref={ref}
            type={isPassword && isVisible ? 'text' : type}
            className={`input ${isPassword ? 'pr-11' : ''} ${className || ''}`}
            {...props}
          />
          {isPassword && <PasswordToggle isVisible={isVisible} onToggle={toggle} />}
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

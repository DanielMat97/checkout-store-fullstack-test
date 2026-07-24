import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './button.css';

type Variant = 'primary' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`nora-btn nora-btn--${variant}${fullWidth ? ' nora-btn--block' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

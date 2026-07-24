import type { InputHTMLAttributes, ReactNode } from 'react';
import './text-field.css';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function TextField({
  id,
  label,
  hint,
  error,
  leading,
  trailing,
  className = '',
  ...rest
}: TextFieldProps) {
  const fieldId = id ?? rest.name ?? label.replace(/\s+/g, '-').toLowerCase();
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <label className={`nora-field ${className}`.trim()} htmlFor={fieldId}>
      <span className="nora-field__label">{label}</span>
      <span className={`nora-field__control${error ? ' nora-field__control--error' : ''}`}>
        {leading ? <span className="nora-field__leading">{leading}</span> : null}
        <input
          id={fieldId}
          className="nora-field__input"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {trailing ? <span className="nora-field__trailing">{trailing}</span> : null}
      </span>
      {error ? (
        <span id={errorId} className="nora-field__error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="nora-field__hint">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

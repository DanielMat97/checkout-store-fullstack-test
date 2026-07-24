import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import './text-field.css';
import './suggest-field.css';

export interface SuggestFieldProps {
  label: string;
  value: string;
  options: string[];
  error?: string;
  hint?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  /** Applied on blur (e.g. title-case). */
  transformOnBlur?: (value: string) => string;
}

/**
 * In-app suggestions. Browser autocomplete is forced off so it cannot
 * cover the site dropdown.
 */
export function SuggestField({
  label,
  value,
  options,
  error,
  hint,
  placeholder,
  name,
  disabled,
  onChange,
  transformOnBlur,
}: SuggestFieldProps) {
  const reactId = useId();
  const fieldId = `nora-suggest-${reactId}`;
  const listId = `${fieldId}-list`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const filtered = (() => {
    const q = value.trim().toLocaleLowerCase('es-CO');
    if (!q) return options.slice(0, 8);
    const starts: string[] = [];
    const includes: string[] = [];
    for (const option of options) {
      const o = option.toLocaleLowerCase('es-CO');
      if (o === q) continue;
      if (o.startsWith(q)) starts.push(option);
      else if (o.includes(q)) includes.push(option);
    }
    return [...starts, ...includes].slice(0, 8);
  })();

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActive(-1);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = (option: string) => {
    onChange(option);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (!open || filtered.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (i + 1) % filtered.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i <= 0 ? filtered.length - 1 : i - 1));
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault();
      pick(filtered[active]);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div className="nora-field nora-suggest" ref={rootRef}>
      <label className="nora-field__label" htmlFor={fieldId}>
        {label}
      </label>
      <span
        className={`nora-field__control${error ? ' nora-field__control--error' : ''}`}
      >
        <input
          id={fieldId}
          className="nora-field__input"
          role="combobox"
          aria-expanded={open && filtered.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          name={name ?? `nora-${fieldId}`}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            if (transformOnBlur) onChange(transformOnBlur(value));
          }}
          onKeyDown={onKeyDown}
        />
      </span>
      {open && filtered.length > 0 ? (
        <ul id={listId} className="nora-suggest__list" role="listbox">
          {filtered.map((option, index) => (
            <li
              key={option}
              id={`${listId}-opt-${index}`}
              role="option"
              aria-selected={index === active}
              className={`nora-suggest__option${
                index === active ? ' nora-suggest__option--active' : ''
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(option);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <span id={errorId} className="nora-field__error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="nora-field__hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

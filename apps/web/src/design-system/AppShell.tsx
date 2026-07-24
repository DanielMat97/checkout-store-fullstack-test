import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BrandLockup } from './BrandLockup';
import './shell.css';

export function AppShell({
  children,
  mockBanner = false,
  layout = 'checkout',
}: {
  children: ReactNode;
  mockBanner?: boolean;
  /** `store` = wide editorial; `flow` = split checkout; `checkout` = narrow column */
  layout?: 'store' | 'checkout' | 'flow';
}) {
  return (
    <div className={`nora-shell nora-shell--${layout}`}>
      {mockBanner ? (
        <p className="nora-shell__mock" role="status">
          Preview mode
        </p>
      ) : null}
      <div className="nora-shell__frame">{children}</div>
    </div>
  );
}

export function ShellHeader({
  trailing,
  home = false,
}: {
  trailing?: ReactNode;
  /** When true, brand links to collection home */
  home?: boolean;
}) {
  return (
    <header className="nora-shell__header">
      {home ? (
        <Link to="/" className="nora-shell__brand-link" aria-label="NORA home">
          <BrandLockup size="md" />
        </Link>
      ) : (
        <BrandLockup size="md" />
      )}
      <div className="nora-shell__trailing">{trailing}</div>
    </header>
  );
}

import type { ReactNode } from 'react';
import { BrandLockup } from './BrandLockup';
import './shell.css';

export function AppShell({
  children,
  mockBanner = false,
}: {
  children: ReactNode;
  mockBanner?: boolean;
}) {
  return (
    <div className="nora-shell">
      {mockBanner ? (
        <p className="nora-shell__mock" role="status">
          Mock mode — navigable UI, no live payment API
        </p>
      ) : null}
      <div className="nora-shell__frame">{children}</div>
    </div>
  );
}

export function ShellHeader({ trailing }: { trailing?: ReactNode }) {
  return (
    <header className="nora-shell__header">
      <BrandLockup size="md" />
      {trailing}
    </header>
  );
}

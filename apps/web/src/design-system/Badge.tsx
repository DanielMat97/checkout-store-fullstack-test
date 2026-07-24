import type { ReactNode } from 'react';
import './badge.css';

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'success' | 'danger' | 'warning';
  children: ReactNode;
}) {
  return <span className={`nora-badge nora-badge--${tone}`}>{children}</span>;
}

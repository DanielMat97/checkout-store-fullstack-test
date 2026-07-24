import type { ReactNode } from 'react';
import './backdrop.css';

/** Material-inspired backdrop: scrim + foreground sheet for payment summary. */
export function Backdrop({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="nora-backdrop">
      <div className="nora-backdrop__back" aria-hidden="true" />
      <section className="nora-backdrop__front" aria-label={title}>
        <h1 className="nora-backdrop__title">{title}</h1>
        <div className="nora-backdrop__body">{children}</div>
        {footer ? <div className="nora-backdrop__footer">{footer}</div> : null}
      </section>
    </div>
  );
}

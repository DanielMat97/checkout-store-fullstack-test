import './brand.css';

export function BrandLockup({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <p className={`nora-brand nora-brand--${size}`} aria-label="NORA">
      NORA
    </p>
  );
}

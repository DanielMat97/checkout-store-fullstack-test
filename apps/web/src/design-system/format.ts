export const fees = {
  /** Minor units (cents of COP mock) */
  baseFee: 1500,
  deliveryFee: 5000,
} as const;

export const currency = {
  code: 'COP',
  locale: 'es-CO',
} as const;

export function formatMoney(minorUnits: number): string {
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    maximumFractionDigits: 0,
  }).format(minorUnits / 100);
}

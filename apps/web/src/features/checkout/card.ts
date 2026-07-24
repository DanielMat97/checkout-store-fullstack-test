export type CardBrand = 'visa' | 'mastercard' | 'unknown';

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function detectCardBrand(number: string): CardBrand {
  const n = digitsOnly(number);
  if (/^4\d{0,15}$/.test(n)) return 'visa';
  const two = Number(n.slice(0, 2));
  const four = Number(n.slice(0, 4));
  if ((two >= 51 && two <= 55) || (four >= 2221 && four <= 2720)) {
    return 'mastercard';
  }
  return 'unknown';
}

/** Luhn check — structurally valid fake cards. */
export function isValidLuhn(number: string): boolean {
  const n = digitsOnly(number);
  if (n.length < 13 || n.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = n.length - 1; i >= 0; i -= 1) {
    let d = Number(n[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function formatCardNumber(value: string): string {
  // Visa / Mastercard PAN up to 16 digits in this checkout
  const n = digitsOnly(value).slice(0, 16);
  return n.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatExpiry(value: string): string {
  const n = digitsOnly(value).slice(0, 4);
  if (n.length <= 2) return n;
  return `${n.slice(0, 2)}/${n.slice(2)}`;
}

export function isValidExpiry(mmYy: string): boolean {
  const m = mmYy.replace(/\s/g, '');
  const match = /^(\d{2})\/(\d{2})$/.exec(m);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const exp = new Date(year, month, 0, 23, 59, 59);
  return exp >= now;
}

/** Visa / Mastercard CVV is exactly 3 digits in this flow. */
export function isValidCvv(cvv: string, _brand?: CardBrand): boolean {
  return digitsOnly(cvv).length === 3;
}

export function sanitizeCvv(value: string): string {
  return digitsOnly(value).slice(0, 3);
}

export function isValidEmail(email: string): boolean {
  const v = email.trim();
  if (v.length < 5 || v.length > 254 || /\s/.test(v)) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
    v,
  );
}

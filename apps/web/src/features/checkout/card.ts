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
  const n = digitsOnly(value).slice(0, 19);
  return n.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
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

export function isValidCvv(cvv: string, brand: CardBrand): boolean {
  const n = digitsOnly(cvv);
  if (brand === 'mastercard' || brand === 'visa') return n.length === 3;
  return n.length === 3 || n.length === 4;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Title-case for names / cities (es-CO aware). */
export function toTitleCase(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => {
      if (!word) return '';
      return (
        word.charAt(0).toLocaleUpperCase('es-CO') +
        word.slice(1).toLocaleLowerCase('es-CO')
      );
    })
    .join(' ');
}

/** Letters, spaces, hyphen, apostrophe — person names. */
export function sanitizePersonName(value: string, max = 60): string {
  const cleaned = value.replace(/[^\p{L}\s'-]/gu, '').slice(0, max);
  return toTitleCase(cleaned);
}

/** City / department free text with length cap. */
export function sanitizePlaceName(value: string, max = 60): string {
  return value.replace(/[^\p{L}\d\s.'-]/gu, '').slice(0, max);
}

export function sanitizeAddress(value: string, max = 120): string {
  return value.replace(/[^\p{L}\d\s.,#°\-_/]/gu, '').slice(0, max);
}

export function sanitizeEmailInput(value: string, max = 120): string {
  return value.replace(/\s/g, '').slice(0, max);
}

/** Stricter email check than a single `@` sniff. */
export function isStrictEmail(email: string): boolean {
  const v = email.trim();
  if (v.length < 5 || v.length > 254) return false;
  if (/\s/.test(v)) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
    v,
  );
}

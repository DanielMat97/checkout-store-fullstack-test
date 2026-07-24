import { digitsOnly } from './card';

/** Colombian mobile: 10 digits starting with 3 → `300 123 4567` */
export function formatColombiaPhone(value: string): string {
  const n = digitsOnly(value).slice(0, 10);
  if (n.length <= 3) return n;
  if (n.length <= 6) return `${n.slice(0, 3)} ${n.slice(3)}`;
  return `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

export function isValidColombiaMobile(value: string): boolean {
  return /^3\d{9}$/.test(digitsOnly(value));
}

/** Localidades / zonas de Bogotá + municipios cercanos (escribible + sugerencias). */
export const BOGOTA_AREA_CITIES: string[] = [
  'Bogotá',
  'Usaquén',
  'Chapinero',
  'Santa Fe',
  'San Cristóbal',
  'Usme',
  'Tunjuelito',
  'Bosa',
  'Kennedy',
  'Fontibón',
  'Engativá',
  'Suba',
  'Barrios Unidos',
  'Teusaquillo',
  'Los Mártires',
  'Antonio Nariño',
  'Puente Aranda',
  'La Candelaria',
  'Rafael Uribe Uribe',
  'Ciudad Bolívar',
  'Sumapaz',
  'Soacha',
  'Chía',
  'Cajicá',
  'Zipaquirá',
  'Facatativá',
  'Madrid',
  'Mosquera',
  'Funza',
  'La Calera',
  'Sopó',
  'Tocancipá',
  'Cota',
  'Tenjo',
];

/** Departamentos de Colombia (+ Bogotá D.C.). */
export const COLOMBIA_DEPARTMENTS: string[] = [
  'Bogotá D.C.',
  'Amazonas',
  'Antioquia',
  'Arauca',
  'Atlántico',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Casanare',
  'Cauca',
  'Cesar',
  'Chocó',
  'Córdoba',
  'Cundinamarca',
  'Guainía',
  'Guaviare',
  'Huila',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Putumayo',
  'Quindío',
  'Risaralda',
  'San Andrés y Providencia',
  'Santander',
  'Sucre',
  'Tolima',
  'Valle del Cauca',
  'Vaupés',
  'Vichada',
];

export function filterSuggestions(
  options: string[],
  query: string,
  limit = 8,
): string[] {
  const q = query.trim().toLocaleLowerCase('es-CO');
  if (!q) return options.slice(0, limit);
  const starts: string[] = [];
  const includes: string[] = [];
  for (const option of options) {
    const o = option.toLocaleLowerCase('es-CO');
    if (o.startsWith(q)) starts.push(option);
    else if (o.includes(q)) includes.push(option);
  }
  return [...starts, ...includes].slice(0, limit);
}

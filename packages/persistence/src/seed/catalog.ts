import type { ProductRecord } from '../types';

/** NORA catalog — mirrors apps/web mock; used by seed (idempotent puts). */
export const SEED_PRODUCTS: ProductRecord[] = [
  {
    id: 'prod_aura_quiet',
    name: 'Aura Quiet',
    kicker: 'Listening',
    description:
      'Over-ear silence for rooms that never quite settle. Soft clamps, all-day charge, a matte shell that rests quietly on the desk.',
    priceMinor: 45990000,
    stock: 8,
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Black over-ear wireless headphones on a pale surface',
  },
  {
    id: 'prod_linen_lamp',
    name: 'Linen Desk Lamp',
    kicker: 'Light',
    description:
      'A warm pool of light for late work. Linen shade, brushed steel stem, dimmer that softens without flicker.',
    priceMinor: 18990000,
    stock: 12,
    imageUrl:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Minimal desk lamp casting warm light',
  },
  {
    id: 'prod_clay_mug',
    name: 'Stone Clay Mug',
    kicker: 'Table',
    description:
      'Hand-finished clay with a quiet rim. Holds heat for slow mornings; sits well beside a notebook.',
    priceMinor: 4990000,
    stock: 24,
    imageUrl:
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Ceramic mug on a wooden table',
  },
  {
    id: 'prod_wool_throw',
    name: 'Wool Throw',
    kicker: 'Rest',
    description:
      'Mid-weight wool that drapes without bulk. Soft fringe, charcoal weave — made for reading chairs.',
    priceMinor: 22990000,
    stock: 6,
    imageUrl:
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Folded wool throw blanket',
  },
];

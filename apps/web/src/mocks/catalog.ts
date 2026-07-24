export interface MockProduct {
  id: string;
  name: string;
  description: string;
  priceMinor: number;
  stock: number;
  imageUrl: string;
  imageAlt: string;
}

export const MOCK_PRODUCT: MockProduct = {
  id: 'prod_aura_quiet',
  name: 'Aura Quiet Headphones',
  description:
    'Over-ear silence for small apartments and long flights. Soft clamps, all-day battery, and a matte shell that disappears into your desk.',
  priceMinor: 45990000, // COP $459.900
  stock: 8,
  imageUrl:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  imageAlt: 'Black over-ear wireless headphones on a surface',
};

export const MOCK_FEES = {
  baseFee: 1500,
  deliveryFee: 5000,
} as const;

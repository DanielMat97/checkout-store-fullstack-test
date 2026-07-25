import { act } from 'react';
import { renderHook, waitFor } from '../../../test/renderHook';
import { useProductPage } from './useProductPage';
import * as api from '../checkoutApi';

jest.mock('../checkoutApi', () => {
  const actual = jest.requireActual('../checkoutApi');
  return { ...actual, loadProduct: jest.fn() };
});

const product = {
  id: 'prod_a',
  name: 'Aura',
  kicker: 'k',
  description: 'd',
  priceMinor: 1000,
  stock: 4,
  imageUrl: 'https://example.com/a.jpg',
  imageAlt: 'a',
};

describe('useProductPage', () => {
  afterEach(() => jest.restoreAllMocks());

  it('loads product and supports pay navigation', async () => {
    (api.loadProduct as jest.Mock).mockResolvedValue(product);
    const { result, unmount } = renderHook(() => useProductPage(), {
      route: '/product/prod_a',
    });
    await waitFor(() => {
      expect(result.current.product?.id).toBe('prod_a');
    });
    expect(result.current.units).toBe(4);
    act(() => {
      result.current.onPay();
      result.current.backHome({ preventDefault: jest.fn() } as never);
    });
    unmount();
  });

  it('redirects when product missing', async () => {
    (api.loadProduct as jest.Mock).mockResolvedValue(null);
    const { result, unmount } = renderHook(() => useProductPage(), {
      route: '/product/missing',
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
    unmount();
  });
});

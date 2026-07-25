import { act } from 'react';
import { renderHook, waitFor, createTestStore } from '../../../test/renderHook';
import { useCatalog } from './useCatalog';
import * as api from '../checkoutApi';

jest.mock('../checkoutApi', () => {
  const actual = jest.requireActual('../checkoutApi');
  return { ...actual, listCatalogProducts: jest.fn() };
});

const product = {
  id: 'prod_a',
  name: 'Aura',
  kicker: 'k',
  description: 'd',
  priceMinor: 1000,
  stock: 3,
  imageUrl: 'https://example.com/a.jpg',
  imageAlt: 'a',
};

describe('useCatalog', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads products and exposes featured/rest', async () => {
    (api.listCatalogProducts as jest.Mock).mockResolvedValue([
      product,
      { ...product, id: 'prod_b', name: 'B' },
    ]);
    const { result, unmount } = renderHook(() => useCatalog());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.featured?.id).toBe('prod_a');
    expect(result.current.rest).toHaveLength(1);
    act(() => {
      result.current.openProduct('prod_a');
    });
    unmount();
  });

  it('maps load errors', async () => {
    (api.listCatalogProducts as jest.Mock).mockRejectedValue(new Error('down'));
    const { result, unmount } = renderHook(() => useCatalog());
    await waitFor(() => {
      expect(result.current.error).toMatch(/down/);
    });
    unmount();
  });

  it('maps non-Error rejections', async () => {
    (api.listCatalogProducts as jest.Mock).mockRejectedValue('nope');
    const { result, unmount } = renderHook(() => useCatalog(), {
      store: createTestStore(),
    });
    await waitFor(() => {
      expect(result.current.error).toMatch(/Could not load catalog/);
    });
    unmount();
  });
});

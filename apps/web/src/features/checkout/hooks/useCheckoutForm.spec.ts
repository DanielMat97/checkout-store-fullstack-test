import { act } from 'react';
import { renderHook, waitFor } from '../../../test/renderHook';
import { useCheckoutForm } from './useCheckoutForm';
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
  stock: 3,
  imageUrl: 'https://example.com/a.jpg',
  imageAlt: 'a',
};

describe('useCheckoutForm', () => {
  afterEach(() => jest.restoreAllMocks());

  it('loads product and updates/sanitizes fields', async () => {
    (api.loadProduct as jest.Mock).mockResolvedValue(product);
    const { result, unmount } = renderHook(() => useCheckoutForm(), {
      route: '/product/prod_a/checkout',
    });
    await waitFor(() => expect(result.current.product?.id).toBe('prod_a'));

    act(() => {
      result.current.updateCardNumber('4111111111111111');
      result.current.updateCardHolder('ada lovelace');
      result.current.blurCardHolder();
      result.current.updateExpiry('1230');
      result.current.updateCvv('12a3');
      result.current.updateFullName('ada');
      result.current.blurFullName();
      result.current.updateEmail('ADA@EXAMPLE.COM');
      result.current.blurEmail();
      result.current.updatePhone('3001112233');
      result.current.updateAddress('Calle 1');
      result.current.updateCity('bogota');
      result.current.updateRegion('cundinamarca');
      result.current.setShowCvv(true);
    });

    expect(result.current.card.number).toMatch(/4111/);
    expect(result.current.brand).toBe('visa');

    act(() => {
      result.current.onSubmit({ preventDefault: jest.fn() } as never);
    });
    act(() => {
      result.current.close();
    });
    unmount();
  });

  it('blocks submit when validation fails', async () => {
    (api.loadProduct as jest.Mock).mockResolvedValue(product);
    const { result, unmount } = renderHook(() => useCheckoutForm(), {
      route: '/product/prod_a/checkout',
    });
    await waitFor(() => expect(result.current.product).toBeTruthy());
    act(() => {
      result.current.onSubmit({ preventDefault: jest.fn() } as never);
    });
    expect(Object.keys(result.current.cardErrors).length).toBeGreaterThan(0);
    unmount();
  });
});

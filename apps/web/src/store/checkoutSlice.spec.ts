import checkoutReducer, {
  selectProduct,
  setStep,
  setStocks,
} from './checkoutSlice';
import { MOCK_PRODUCTS } from '../mocks/catalog';

describe('checkoutSlice', () => {
  it('updates step', () => {
    const state = checkoutReducer(undefined, setStep('summary'));
    expect(state.step).toBe('summary');
  });

  it('seeds stock for every catalog product', () => {
    const state = checkoutReducer(undefined, { type: 'unknown' });
    for (const product of MOCK_PRODUCTS) {
      expect(state.stocks[product.id]).toBe(product.stock);
    }
  });

  it('selects a product for detail checkout', () => {
    const id = MOCK_PRODUCTS[1].id;
    const state = checkoutReducer(undefined, selectProduct(id));
    expect(state.productId).toBe(id);
    expect(state.step).toBe('product');
  });

  it('updates stocks map after payment', () => {
    const id = MOCK_PRODUCTS[0].id;
    const next = { [id]: 3 };
    const state = checkoutReducer(undefined, setStocks(next));
    expect(state.stocks[id]).toBe(3);
  });
});

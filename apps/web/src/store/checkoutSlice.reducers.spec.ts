import checkoutReducer, {
  resetCheckout,
  selectProduct,
  setCardMeta,
  setDelivery,
  setPaymentError,
  setPaymentStatus,
  setProductId,
  setProductStock,
  setSimulateDecline,
  setStep,
  setTransactionId,
} from './checkoutSlice';
import { MOCK_PRODUCTS } from '../mocks/catalog';

describe('checkoutSlice reducers', () => {
  it('covers remaining reducers', () => {
    let state = checkoutReducer(undefined, selectProduct(MOCK_PRODUCTS[0].id));
    state = checkoutReducer(state, setProductId(MOCK_PRODUCTS[1].id));
    state = checkoutReducer(
      state,
      setDelivery({
        fullName: 'Ada',
        email: 'a@b.co',
        phone: '3001234567',
        address: 'Calle 1',
        city: 'Bogotá',
        region: 'Cundinamarca',
      }),
    );
    state = checkoutReducer(
      state,
      setCardMeta({ brand: 'visa', last4: '4242', holderName: 'Ada' }),
    );
    state = checkoutReducer(state, setTransactionId('txn_1'));
    state = checkoutReducer(state, setPaymentStatus('ERROR'));
    state = checkoutReducer(state, setPaymentError('timeout'));
    state = checkoutReducer(state, setPaymentStatus('APPROVED'));
    expect(state.paymentError).toBeNull();
    state = checkoutReducer(
      state,
      setProductStock({ productId: MOCK_PRODUCTS[0].id, stock: 2 }),
    );
    state = checkoutReducer(state, setSimulateDecline(true));
    state = checkoutReducer(state, setStep('status'));
    state = checkoutReducer(state, resetCheckout());
    expect(state.delivery).toBeNull();
    expect(state.step).toBe('product');
  });
});

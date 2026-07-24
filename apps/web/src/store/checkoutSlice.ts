import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CardBrand } from '../features/checkout/card';
import { initialStockMap } from '../mocks/catalog';

export type CheckoutStep = 'catalog' | 'product' | 'card-delivery' | 'summary' | 'status';

export interface DeliveryInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
}

/** Safe card metadata only — never store PAN/CVV here. */
export interface CardMeta {
  brand: CardBrand;
  last4: string;
  holderName: string;
}

export interface CheckoutState {
  step: CheckoutStep;
  productId: string | null;
  delivery: DeliveryInfo | null;
  cardMeta: CardMeta | null;
  transactionId: string | null;
  paymentStatus: 'idle' | 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  /** Last pay/network error message (not persisted secrets). */
  paymentError: string | null;
  /** Per-product stock (mock service or API refresh). */
  stocks: Record<string, number>;
  simulateDecline: boolean;
}

const initialState: CheckoutState = {
  step: 'catalog',
  productId: null,
  delivery: null,
  cardMeta: null,
  transactionId: null,
  paymentStatus: 'idle',
  paymentError: null,
  stocks: initialStockMap(),
  simulateDecline: false,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload;
    },
    selectProduct(state, action: PayloadAction<string>) {
      state.productId = action.payload;
      state.step = 'product';
      state.paymentStatus = 'idle';
    },
    setProductId(state, action: PayloadAction<string>) {
      state.productId = action.payload;
    },
    setDelivery(state, action: PayloadAction<DeliveryInfo>) {
      state.delivery = action.payload;
    },
    setCardMeta(state, action: PayloadAction<CardMeta>) {
      state.cardMeta = action.payload;
    },
    setTransactionId(state, action: PayloadAction<string>) {
      state.transactionId = action.payload;
    },
    setPaymentStatus(state, action: PayloadAction<CheckoutState['paymentStatus']>) {
      state.paymentStatus = action.payload;
      if (action.payload !== 'ERROR') {
        state.paymentError = null;
      }
    },
    setPaymentError(state, action: PayloadAction<string | null>) {
      state.paymentError = action.payload;
    },
    setStocks(state, action: PayloadAction<Record<string, number>>) {
      state.stocks = action.payload;
    },
    setProductStock(state, action: PayloadAction<{ productId: string; stock: number }>) {
      state.stocks[action.payload.productId] = action.payload.stock;
    },
    setSimulateDecline(state, action: PayloadAction<boolean>) {
      state.simulateDecline = action.payload;
    },
    resetCheckout(state) {
      state.step = state.productId ? 'product' : 'catalog';
      state.delivery = null;
      state.cardMeta = null;
      state.transactionId = null;
      state.paymentStatus = 'idle';
      state.paymentError = null;
      state.simulateDecline = false;
    },
  },
});

export const {
  setStep,
  selectProduct,
  setProductId,
  setDelivery,
  setCardMeta,
  setTransactionId,
  setPaymentStatus,
  setPaymentError,
  setStocks,
  setProductStock,
  setSimulateDecline,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;

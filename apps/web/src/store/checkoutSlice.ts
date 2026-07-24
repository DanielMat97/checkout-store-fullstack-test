import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CardBrand } from '../features/checkout/card';
import { MOCK_PRODUCT } from '../mocks/catalog';

export type CheckoutStep =
  | 'product'
  | 'card-delivery'
  | 'summary'
  | 'status';

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
  mockStock: number;
  simulateDecline: boolean;
}

const initialState: CheckoutState = {
  step: 'product',
  productId: MOCK_PRODUCT.id,
  delivery: null,
  cardMeta: null,
  transactionId: null,
  paymentStatus: 'idle',
  mockStock: MOCK_PRODUCT.stock,
  simulateDecline: false,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload;
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
    setPaymentStatus(
      state,
      action: PayloadAction<CheckoutState['paymentStatus']>,
    ) {
      state.paymentStatus = action.payload;
    },
    setMockStock(state, action: PayloadAction<number>) {
      state.mockStock = action.payload;
    },
    setSimulateDecline(state, action: PayloadAction<boolean>) {
      state.simulateDecline = action.payload;
    },
    resetCheckout(state) {
      state.step = 'product';
      state.delivery = null;
      state.cardMeta = null;
      state.transactionId = null;
      state.paymentStatus = 'idle';
      state.simulateDecline = false;
    },
  },
});

export const {
  setStep,
  setProductId,
  setDelivery,
  setCardMeta,
  setTransactionId,
  setPaymentStatus,
  setMockStock,
  setSimulateDecline,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  brand: 'visa' | 'mastercard' | 'unknown';
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
}

const initialState: CheckoutState = {
  step: 'product',
  productId: null,
  delivery: null,
  cardMeta: null,
  transactionId: null,
  paymentStatus: 'idle',
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
    resetCheckout() {
      return initialState;
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
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;

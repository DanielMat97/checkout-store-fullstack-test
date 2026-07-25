import { formatCardNumber, formatExpiry } from './card';
import { peekPendingCard } from './cardSession';
import type { CardFormValues, DeliveryFormValues } from './validation';
import type { CardMeta, DeliveryInfo } from '../../store/checkoutSlice';

export type CheckoutFormSeed = {
  card: CardFormValues;
  delivery: DeliveryFormValues;
};

const emptyCard: CardFormValues = {
  number: '',
  holder: '',
  expiry: '',
  cvv: '',
};

const emptyDelivery: DeliveryFormValues = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  region: '',
};

/**
 * Rebuild checkout form values when returning from Summary ("Edit details").
 * Delivery comes from Redux; PAN/CVV from ephemeral session (never persisted).
 */
export function seedCheckoutForm(input: {
  delivery: DeliveryInfo | null;
  cardMeta: CardMeta | null;
}): CheckoutFormSeed {
  const pending = peekPendingCard();
  const delivery: DeliveryFormValues = input.delivery
    ? { ...input.delivery }
    : { ...emptyDelivery };

  if (pending) {
    return {
      delivery,
      card: {
        number: formatCardNumber(pending.number),
        holder: pending.cardHolder,
        expiry: formatExpiry(`${pending.expMonth}${pending.expYear}`),
        cvv: pending.cvc,
      },
    };
  }

  if (input.cardMeta) {
    return {
      delivery,
      card: {
        ...emptyCard,
        holder: input.cardMeta.holderName,
      },
    };
  }

  return { card: { ...emptyCard }, delivery };
}

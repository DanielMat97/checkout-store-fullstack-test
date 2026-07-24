import { isValidCvv, isValidExpiry, isValidLuhn } from './card';
import { isValidColombiaMobile } from './colombia';
import { isStrictEmail } from './textFormat';

export interface CardFormValues {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}

export interface DeliveryFormValues {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export function validateCard(values: CardFormValues): FormErrors<CardFormValues> {
  const errors: FormErrors<CardFormValues> = {};
  if (!isValidLuhn(values.number)) {
    errors.number = 'Enter a valid card number';
  }
  if (!values.holder.trim() || values.holder.trim().length < 2) {
    errors.holder = 'Cardholder name is required';
  }
  if (!isValidExpiry(values.expiry)) errors.expiry = 'Use a future MM/YY date';
  if (!isValidCvv(values.cvv)) errors.cvv = 'CVV must be 3 digits';
  return errors;
}

export function validateDelivery(
  values: DeliveryFormValues,
): FormErrors<DeliveryFormValues> {
  const errors: FormErrors<DeliveryFormValues> = {};
  if (!values.fullName.trim() || values.fullName.trim().length < 2) {
    errors.fullName = 'Full name is required';
  }
  if (!isStrictEmail(values.email)) {
    errors.email = 'Enter a valid email (name@domain.com)';
  }
  if (!isValidColombiaMobile(values.phone)) {
    errors.phone = 'Enter a valid Colombian mobile (10 digits, starts with 3)';
  }
  if (!values.address.trim() || values.address.trim().length < 5) {
    errors.address = 'Enter a complete street address';
  }
  if (!values.city.trim()) errors.city = 'City is required';
  if (!values.region.trim()) errors.region = 'Department is required';
  return errors;
}

/** Field-level email check for blur feedback. */
export function emailError(email: string): string | undefined {
  if (!email.trim()) return 'Email is required';
  if (!isStrictEmail(email)) return 'Enter a valid email (name@domain.com)';
  return undefined;
}

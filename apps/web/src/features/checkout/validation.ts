import {
  detectCardBrand,
  isValidCvv,
  isValidEmail,
  isValidExpiry,
  isValidLuhn,
} from './card';

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
  const brand = detectCardBrand(values.number);
  if (!isValidLuhn(values.number)) {
    errors.number = 'Enter a valid card number';
  }
  if (!values.holder.trim()) errors.holder = 'Cardholder name is required';
  if (!isValidExpiry(values.expiry)) errors.expiry = 'Use a future MM/YY date';
  if (!isValidCvv(values.cvv, brand)) errors.cvv = 'Invalid security code';
  return errors;
}

export function validateDelivery(
  values: DeliveryFormValues,
): FormErrors<DeliveryFormValues> {
  const errors: FormErrors<DeliveryFormValues> = {};
  if (!values.fullName.trim()) errors.fullName = 'Full name is required';
  if (!isValidEmail(values.email)) errors.email = 'Enter a valid email';
  if (values.phone.replace(/\D/g, '').length < 7) {
    errors.phone = 'Enter a valid phone';
  }
  if (!values.address.trim()) errors.address = 'Address is required';
  if (!values.city.trim()) errors.city = 'City is required';
  if (!values.region.trim()) errors.region = 'Region is required';
  return errors;
}

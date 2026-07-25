import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { withViewTransition } from '../../../design-system';
import { detectCardBrand, formatCardNumber, formatExpiry, sanitizeCvv } from '../card';
import {
  emailError,
  validateCard,
  validateDelivery,
  type CardFormValues,
  type DeliveryFormValues,
  type FormErrors,
} from '../validation';
import { formatColombiaPhone } from '../colombia';
import {
  sanitizeAddress,
  sanitizeEmailInput,
  sanitizePersonName,
  sanitizePlaceName,
  toTitleCase,
} from '../textFormat';
import { setPendingCard, splitExpiry } from '../cardSession';
import { seedCheckoutForm } from '../seedCheckoutForm';
import { loadProduct, type Product } from '../checkoutApi';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setCardMeta, setDelivery, setStep } from '../../../store/checkoutSlice';

export function useCheckoutForm() {
  const { productId = '' } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const stocks = useAppSelector((s) => s.checkout.stocks);
  const savedDelivery = useAppSelector((s) => s.checkout.delivery);
  const savedCardMeta = useAppSelector((s) => s.checkout.cardMeta);
  const seeded = seedCheckoutForm({
    delivery: savedDelivery,
    cardMeta: savedCardMeta,
  });
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<CardFormValues>(seeded.card);
  const [delivery, setDeliveryForm] = useState<DeliveryFormValues>(seeded.delivery);
  const [cardErrors, setCardErrors] = useState<FormErrors<CardFormValues>>({});
  const [deliveryErrors, setDeliveryErrors] = useState<FormErrors<DeliveryFormValues>>(
    {},
  );
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  const brand = useMemo(() => detectCardBrand(card.number), [card.number]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const loaded = await loadProduct(productId);
      if (cancelled) return;
      if (!loaded) {
        navigate('/', { replace: true });
        return;
      }
      setProduct(loaded);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, navigate]);

  const units = product ? (stocks[product.id] ?? product.stock) : 0;

  const close = () => {
    if (!product) return;
    dispatch(setStep('product'));
    withViewTransition(() => navigate(`/product/${product.id}`));
  };

  const clearDeliveryError = (key: keyof DeliveryFormValues) => {
    setDeliveryErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const clearCardError = (key: keyof CardFormValues) => {
    setCardErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateCardNumber = (value: string) => {
    clearCardError('number');
    setCard((c) => ({ ...c, number: formatCardNumber(value) }));
  };

  const updateCardHolder = (value: string) => {
    clearCardError('holder');
    setCard((c) => ({ ...c, holder: sanitizePersonName(value) }));
  };

  const blurCardHolder = () => {
    setCard((c) => ({ ...c, holder: sanitizePersonName(c.holder).trim() }));
  };

  const updateExpiry = (value: string) => {
    clearCardError('expiry');
    setCard((c) => ({ ...c, expiry: formatExpiry(value) }));
  };

  const updateCvv = (value: string) => {
    clearCardError('cvv');
    setCard((c) => ({ ...c, cvv: sanitizeCvv(value) }));
  };

  const updateFullName = (value: string) => {
    clearDeliveryError('fullName');
    setDeliveryForm((d) => ({ ...d, fullName: sanitizePersonName(value) }));
  };

  const blurFullName = () => {
    setDeliveryForm((d) => ({
      ...d,
      fullName: sanitizePersonName(d.fullName).trim(),
    }));
  };

  const updateEmail = (value: string) => {
    clearDeliveryError('email');
    setDeliveryForm((d) => ({ ...d, email: sanitizeEmailInput(value) }));
  };

  const blurEmail = () => {
    setTouchedEmail(true);
    const email = delivery.email.trim().toLowerCase();
    setDeliveryForm((d) => ({ ...d, email }));
    const err = emailError(email);
    if (err) {
      setDeliveryErrors((prev) => ({ ...prev, email: err }));
    } else {
      clearDeliveryError('email');
    }
  };

  const updatePhone = (value: string) => {
    clearDeliveryError('phone');
    setDeliveryForm((d) => ({ ...d, phone: formatColombiaPhone(value) }));
  };

  const updateAddress = (value: string) => {
    clearDeliveryError('address');
    setDeliveryForm((d) => ({ ...d, address: sanitizeAddress(value) }));
  };

  const updateCity = (value: string) => {
    clearDeliveryError('city');
    setDeliveryForm((d) => ({ ...d, city: sanitizePlaceName(value) }));
  };

  const updateRegion = (value: string) => {
    clearDeliveryError('region');
    setDeliveryForm((d) => ({ ...d, region: sanitizePlaceName(value, 80) }));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!product) return;
    const nextCardErrors = validateCard(card);
    const nextDeliveryErrors = validateDelivery(delivery);
    setCardErrors(nextCardErrors);
    setDeliveryErrors(nextDeliveryErrors);
    setTouchedEmail(true);
    if (
      Object.keys(nextCardErrors).length > 0 ||
      Object.keys(nextDeliveryErrors).length > 0
    ) {
      return;
    }

    dispatch(
      setCardMeta({
        brand,
        last4: card.number.replace(/\D/g, '').slice(-4),
        holderName: card.holder.trim(),
      }),
    );
    const { expMonth, expYear } = splitExpiry(card.expiry);
    setPendingCard({
      number: card.number.replace(/\D/g, ''),
      cvc: card.cvv,
      expMonth,
      expYear,
      cardHolder: card.holder.trim(),
    });
    dispatch(
      setDelivery({
        ...delivery,
        fullName: toTitleCase(delivery.fullName).trim(),
        city: toTitleCase(delivery.city).trim(),
        region: delivery.region.trim(),
        email: delivery.email.trim().toLowerCase(),
        phone: formatColombiaPhone(delivery.phone),
      }),
    );
    dispatch(setStep('summary'));
    withViewTransition(() => navigate('/summary'));
  };

  const emailFieldError =
    deliveryErrors.email ?? (touchedEmail ? emailError(delivery.email) : undefined);

  return {
    product,
    loading,
    units,
    card,
    delivery,
    cardErrors,
    deliveryErrors,
    brand,
    showCvv,
    setShowCvv,
    emailFieldError,
    close,
    onSubmit,
    updateCardNumber,
    updateCardHolder,
    blurCardHolder,
    updateExpiry,
    updateCvv,
    updateFullName,
    blurFullName,
    updateEmail,
    blurEmail,
    updatePhone,
    updateAddress,
    updateCity,
    updateRegion,
  };
}

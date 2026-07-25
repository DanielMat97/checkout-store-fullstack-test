import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AppShell,
  ShellHeader,
  Button,
  CardBrandMark,
  Price,
  TextField,
  SuggestField,
  withViewTransition,
} from '../../design-system';
import { detectCardBrand, formatCardNumber, formatExpiry, sanitizeCvv } from './card';
import {
  emailError,
  validateCard,
  validateDelivery,
  type CardFormValues,
  type DeliveryFormValues,
  type FormErrors,
} from './validation';
import {
  BOGOTA_AREA_CITIES,
  COLOMBIA_DEPARTMENTS,
  formatColombiaPhone,
} from './colombia';
import {
  sanitizeAddress,
  sanitizeEmailInput,
  sanitizePersonName,
  sanitizePlaceName,
  toTitleCase,
} from './textFormat';
import { ColombiaFlag } from './ColombiaFlag';
import { isMockMode } from '../../mocks/checkoutService';
import { setPendingCard, splitExpiry } from './cardSession';
import { seedCheckoutForm } from './seedCheckoutForm';
import { loadProduct, type Product } from './checkoutApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCardMeta, setDelivery, setStep } from '../../store/checkoutSlice';
import './checkout-flow.css';
import './checkout-form.css';

const offAutocomplete = {
  autoComplete: 'off' as const,
  autoCorrect: 'off' as const,
  spellCheck: false,
  'data-lpignore': 'true',
  'data-1p-ignore': 'true',
  'data-form-type': 'other',
};

export function CheckoutPage() {
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

  if (loading || !product) {
    return (
      <AppShell layout="flow" mockBanner={isMockMode()}>
        <ShellHeader home />
        <main className="nora-flow">
          <p className="nora-flow__panel-lede">Loading…</p>
        </main>
      </AppShell>
    );
  }

  const units = stocks[product.id] ?? product.stock;


  const close = () => {
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

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
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

  return (
    <AppShell layout="flow" mockBanner={isMockMode()}>
      <ShellHeader
        home
        trailing={
          <button type="button" className="nora-flow__back" onClick={close}>
            Back
          </button>
        }
      />

      <div className="nora-flow">
        <aside className="nora-flow__product" aria-label="Selected product">
          <div className="nora-flow__media">
            <img
              className={`nora-vt-product nora-vt-product--${product.id}`}
              src={product.imageUrl}
              alt={product.imageAlt}
              width={1200}
              height={1200}
              decoding="async"
            />
            <div className="nora-flow__media-glow" aria-hidden="true" />
          </div>
          <div className="nora-flow__product-copy">
            <p className="nora-flow__kicker">{product.kicker}</p>
            <h1 className="nora-flow__title">{product.name}</h1>
            <div className="nora-flow__price-row">
              <Price minorUnits={product.priceMinor} size="md" />
              <span className="nora-flow__stock">
                {units > 0 ? `${units} left` : 'Sold out'}
              </span>
            </div>
            <p className="nora-flow__blurb">{product.description}</p>
          </div>
        </aside>

        <section className="nora-flow__panel" aria-labelledby="checkout-heading">
          <header className="nora-flow__panel-head">
            <p className="nora-flow__step">Step 2 of 4</p>
            <h2 id="checkout-heading" className="nora-flow__panel-title">
              Checkout
            </h2>
            <p className="nora-flow__panel-lede">
              Card details and where we should send it.
            </p>
          </header>

          <form
            id="checkout-form"
            className="nora-checkout"
            onSubmit={onSubmit}
            autoComplete="off"
            noValidate
          >
            {isMockMode() ? (
              <p className="nora-checkout__tip">
                Test card <code>4111&nbsp;1111&nbsp;1111&nbsp;1111</code>
                <span className="nora-checkout__tip-meta">
                  Future expiry · CVV 123 · Phone e.g. 300 123 4567
                </span>
              </p>
            ) : null}

            <section className="nora-checkout__section">
              <h3 className="nora-checkout__heading">Payment</h3>
              <div className="nora-checkout__fields">
                <TextField
                  label="Card number"
                  name="cc-number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  maxLength={19}
                  value={card.number}
                  error={cardErrors.number}
                  trailing={<CardBrandMark brand={brand} />}
                  onChange={(e) => {
                    clearCardError('number');
                    setCard((c) => ({
                      ...c,
                      number: formatCardNumber(e.target.value),
                    }));
                  }}
                />
                <TextField
                  label="Name on card"
                  name="nora-card-holder"
                  value={card.holder}
                  error={cardErrors.holder}
                  maxLength={60}
                  {...offAutocomplete}
                  autoCapitalize="words"
                  onChange={(e) => {
                    clearCardError('holder');
                    setCard((c) => ({
                      ...c,
                      holder: sanitizePersonName(e.target.value),
                    }));
                  }}
                  onBlur={() =>
                    setCard((c) => ({
                      ...c,
                      holder: sanitizePersonName(c.holder).trim(),
                    }))
                  }
                />
                <div className="nora-checkout__pair">
                  <TextField
                    label="Expiry"
                    name="cc-exp"
                    placeholder="MM/YY"
                    autoComplete="cc-exp"
                    inputMode="numeric"
                    maxLength={5}
                    value={card.expiry}
                    error={cardErrors.expiry}
                    onChange={(e) => {
                      clearCardError('expiry');
                      setCard((c) => ({
                        ...c,
                        expiry: formatExpiry(e.target.value),
                      }));
                    }}
                  />
                  <TextField
                    label="CVV"
                    name="cc-csc"
                    type={showCvv ? 'text' : 'password'}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={3}
                    value={card.cvv}
                    error={cardErrors.cvv}
                    trailing={
                      <button
                        type="button"
                        className="nora-field__reveal"
                        aria-label={showCvv ? 'Hide CVV' : 'Show CVV'}
                        aria-pressed={showCvv}
                        onClick={() => setShowCvv((v) => !v)}
                      >
                        {showCvv ? (
                          <svg
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            aria-hidden="true"
                          >
                            <path
                              fill="currentColor"
                              d="M12 6c-5 0-9.3 3.1-11 7.5 1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5C21.3 9.1 17 6 12 6zm0 12.5A5 5 0 1 1 12 8.5a5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                            />
                            <path
                              fill="currentColor"
                              d="M3.3 3.3 20.7 20.7l-1.4 1.4L1.9 4.7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            aria-hidden="true"
                          >
                            <path
                              fill="currentColor"
                              d="M12 6c-5 0-9.3 3.1-11 7.5C2.7 17.9 7 21 12 21s9.3-3.1 11-7.5C21.3 9.1 17 6 12 6zm0 12.5A5 5 0 1 1 12 8.5a5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                            />
                          </svg>
                        )}
                      </button>
                    }
                    onChange={(e) => {
                      clearCardError('cvv');
                      setCard((c) => ({
                        ...c,
                        cvv: sanitizeCvv(e.target.value),
                      }));
                    }}
                  />
                </div>
              </div>
            </section>

            <section className="nora-checkout__section">
              <h3 className="nora-checkout__heading">Delivery</h3>
              <p className="nora-checkout__help">Where should we send this?</p>
              <div className="nora-checkout__fields">
                <TextField
                  label="Full name"
                  name="nora-full-name"
                  value={delivery.fullName}
                  error={deliveryErrors.fullName}
                  maxLength={60}
                  {...offAutocomplete}
                  autoCapitalize="words"
                  onChange={(e) => {
                    clearDeliveryError('fullName');
                    setDeliveryForm((d) => ({
                      ...d,
                      fullName: sanitizePersonName(e.target.value),
                    }));
                  }}
                  onBlur={() =>
                    setDeliveryForm((d) => ({
                      ...d,
                      fullName: sanitizePersonName(d.fullName).trim(),
                    }))
                  }
                />
                <TextField
                  label="Email"
                  name="nora-email"
                  type="email"
                  inputMode="email"
                  value={delivery.email}
                  error={emailFieldError}
                  maxLength={120}
                  hint={!emailFieldError ? 'We will send the receipt here' : undefined}
                  {...offAutocomplete}
                  onChange={(e) => {
                    clearDeliveryError('email');
                    setDeliveryForm((d) => ({
                      ...d,
                      email: sanitizeEmailInput(e.target.value),
                    }));
                  }}
                  onBlur={() => {
                    setTouchedEmail(true);
                    const email = delivery.email.trim().toLowerCase();
                    setDeliveryForm((d) => ({ ...d, email }));
                    const err = emailError(email);
                    if (err) {
                      setDeliveryErrors((prev) => ({ ...prev, email: err }));
                    } else {
                      clearDeliveryError('email');
                    }
                  }}
                />
                <TextField
                  label="Phone"
                  name="nora-phone-co"
                  inputMode="numeric"
                  placeholder="300 123 4567"
                  value={delivery.phone}
                  error={deliveryErrors.phone}
                  maxLength={12}
                  hint={!deliveryErrors.phone ? 'Colombian mobile' : undefined}
                  leading={<ColombiaFlag />}
                  {...offAutocomplete}
                  onChange={(e) => {
                    clearDeliveryError('phone');
                    setDeliveryForm((d) => ({
                      ...d,
                      phone: formatColombiaPhone(e.target.value),
                    }));
                  }}
                />
                <TextField
                  label="Street address"
                  name="nora-address"
                  value={delivery.address}
                  error={deliveryErrors.address}
                  maxLength={120}
                  {...offAutocomplete}
                  onChange={(e) => {
                    clearDeliveryError('address');
                    setDeliveryForm((d) => ({
                      ...d,
                      address: sanitizeAddress(e.target.value),
                    }));
                  }}
                />
                <SuggestField
                  label="City"
                  name="nora-city-co"
                  placeholder="Start typing — Bogotá area"
                  value={delivery.city}
                  options={BOGOTA_AREA_CITIES}
                  error={deliveryErrors.city}
                  hint={
                    !deliveryErrors.city ? 'Bogotá localities & nearby cities' : undefined
                  }
                  onChange={(value) => {
                    clearDeliveryError('city');
                    setDeliveryForm((d) => ({
                      ...d,
                      city: sanitizePlaceName(value),
                    }));
                  }}
                  transformOnBlur={(v) => toTitleCase(sanitizePlaceName(v)).trim()}
                />
                <SuggestField
                  label="Department"
                  name="nora-dept-co"
                  placeholder="Start typing — e.g. Cundinamarca"
                  value={delivery.region}
                  options={COLOMBIA_DEPARTMENTS}
                  error={deliveryErrors.region}
                  onChange={(value) => {
                    clearDeliveryError('region');
                    setDeliveryForm((d) => ({
                      ...d,
                      region: sanitizePlaceName(value, 80),
                    }));
                  }}
                  transformOnBlur={(v) => sanitizePlaceName(v, 80).trim()}
                />
              </div>
            </section>
          </form>

          <footer className="nora-flow__footer">
            <Button type="submit" form="checkout-form" fullWidth>
              Review order
            </Button>
          </footer>
        </section>
      </div>
    </AppShell>
  );
}

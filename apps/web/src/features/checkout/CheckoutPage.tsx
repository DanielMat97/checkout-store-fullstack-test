import {
  AppShell,
  ShellHeader,
  Button,
  CardBrandMark,
  Price,
  TextField,
  SuggestField,
} from '../../design-system';
import { BOGOTA_AREA_CITIES, COLOMBIA_DEPARTMENTS } from './colombia';
import { toTitleCase, sanitizePlaceName } from './textFormat';
import { ColombiaFlag } from './ColombiaFlag';
import { isMockMode } from '../../mocks/checkoutService';
import { useCheckoutForm } from './hooks/useCheckoutForm';
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
  const {
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
  } = useCheckoutForm();

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
                  onChange={(e) => updateCardNumber(e.target.value)}
                />
                <TextField
                  label="Name on card"
                  name="nora-card-holder"
                  value={card.holder}
                  error={cardErrors.holder}
                  maxLength={60}
                  {...offAutocomplete}
                  autoCapitalize="words"
                  onChange={(e) => updateCardHolder(e.target.value)}
                  onBlur={blurCardHolder}
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
                    onChange={(e) => updateExpiry(e.target.value)}
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
                        {showCvv ? 'Hide' : 'Show'}
                      </button>
                    }
                    onChange={(e) => updateCvv(e.target.value)}
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
                  onChange={(e) => updateFullName(e.target.value)}
                  onBlur={blurFullName}
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
                  onChange={(e) => updateEmail(e.target.value)}
                  onBlur={blurEmail}
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
                  onChange={(e) => updatePhone(e.target.value)}
                />
                <TextField
                  label="Street address"
                  name="nora-address"
                  value={delivery.address}
                  error={deliveryErrors.address}
                  maxLength={120}
                  {...offAutocomplete}
                  onChange={(e) => updateAddress(e.target.value)}
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
                  onChange={updateCity}
                  transformOnBlur={(v) => toTitleCase(sanitizePlaceName(v)).trim()}
                />
                <SuggestField
                  label="Department"
                  name="nora-dept-co"
                  placeholder="Start typing — e.g. Cundinamarca"
                  value={delivery.region}
                  options={COLOMBIA_DEPARTMENTS}
                  error={deliveryErrors.region}
                  onChange={updateRegion}
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

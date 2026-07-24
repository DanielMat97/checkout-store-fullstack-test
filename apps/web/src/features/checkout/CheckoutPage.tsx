import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  CardBrandMark,
  Modal,
  TextField,
} from '../../design-system';
import { detectCardBrand, digitsOnly, formatCardNumber } from './card';
import {
  validateCard,
  validateDelivery,
  type CardFormValues,
  type DeliveryFormValues,
  type FormErrors,
} from './validation';
import { isMockMode } from '../../mocks/checkoutService';
import { useAppDispatch } from '../../store/hooks';
import { setCardMeta, setDelivery, setStep } from '../../store/checkoutSlice';
import { ProductPage } from './ProductPage';
import './checkout-form.css';

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

export function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [card, setCard] = useState<CardFormValues>(emptyCard);
  const [delivery, setDeliveryForm] = useState<DeliveryFormValues>(emptyDelivery);
  const [cardErrors, setCardErrors] = useState<FormErrors<CardFormValues>>({});
  const [deliveryErrors, setDeliveryErrors] = useState<
    FormErrors<DeliveryFormValues>
  >({});

  const brand = useMemo(() => detectCardBrand(card.number), [card.number]);

  const close = () => {
    dispatch(setStep('product'));
    navigate('/');
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextCardErrors = validateCard(card);
    const nextDeliveryErrors = validateDelivery(delivery);
    setCardErrors(nextCardErrors);
    setDeliveryErrors(nextDeliveryErrors);
    if (
      Object.keys(nextCardErrors).length > 0 ||
      Object.keys(nextDeliveryErrors).length > 0
    ) {
      return;
    }

    dispatch(
      setCardMeta({
        brand,
        last4: digitsOnly(card.number).slice(-4),
        holderName: card.holder.trim(),
      }),
    );
    dispatch(setDelivery(delivery));
    dispatch(setStep('summary'));
    navigate('/summary');
  };

  return (
    <>
      <ProductPage />
      <Modal
        open
        title="Card & delivery"
        onClose={close}
        footer={
          <Button type="submit" form="checkout-form" fullWidth>
            Continue to summary
          </Button>
        }
      >
        <form id="checkout-form" className="nora-checkout" onSubmit={onSubmit}>
            {isMockMode() ? (
              <p className="nora-checkout__tip">
                Try Visa <code>4111 1111 1111 1111</code> · any future expiry · CVV
                123
              </p>
            ) : null}

            <fieldset className="nora-checkout__group">
              <legend>Payment card</legend>
              <TextField
                label="Card number"
                name="number"
                inputMode="numeric"
                autoComplete="cc-number"
                value={card.number}
                error={cardErrors.number}
                trailing={<CardBrandMark brand={brand} />}
                onChange={(e) =>
                  setCard((c) => ({
                    ...c,
                    number: formatCardNumber(e.target.value),
                  }))
                }
              />
              <TextField
                label="Name on card"
                name="holder"
                autoComplete="cc-name"
                value={card.holder}
                error={cardErrors.holder}
                onChange={(e) =>
                  setCard((c) => ({ ...c, holder: e.target.value }))
                }
              />
              <div className="nora-checkout__row">
                <TextField
                  label="Expiry (MM/YY)"
                  name="expiry"
                  placeholder="MM/YY"
                  autoComplete="cc-exp"
                  value={card.expiry}
                  error={cardErrors.expiry}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d/]/g, '').slice(0, 5);
                    if (v.length === 2 && !card.expiry.includes('/')) v += '/';
                    setCard((c) => ({ ...c, expiry: v }));
                  }}
                />
                <TextField
                  label="CVV"
                  name="cvv"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={card.cvv}
                  error={cardErrors.cvv}
                  onChange={(e) =>
                    setCard((c) => ({
                      ...c,
                      cvv: digitsOnly(e.target.value).slice(0, 4),
                    }))
                  }
                />
              </div>
            </fieldset>

            <fieldset className="nora-checkout__group">
              <legend>Delivery</legend>
              <TextField
                label="Full name"
                name="fullName"
                value={delivery.fullName}
                error={deliveryErrors.fullName}
                onChange={(e) =>
                  setDeliveryForm((d) => ({ ...d, fullName: e.target.value }))
                }
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={delivery.email}
                error={deliveryErrors.email}
                onChange={(e) =>
                  setDeliveryForm((d) => ({ ...d, email: e.target.value }))
                }
              />
              <TextField
                label="Phone"
                name="phone"
                inputMode="tel"
                value={delivery.phone}
                error={deliveryErrors.phone}
                onChange={(e) =>
                  setDeliveryForm((d) => ({ ...d, phone: e.target.value }))
                }
              />
              <TextField
                label="Address"
                name="address"
                value={delivery.address}
                error={deliveryErrors.address}
                onChange={(e) =>
                  setDeliveryForm((d) => ({ ...d, address: e.target.value }))
                }
              />
              <div className="nora-checkout__row">
                <TextField
                  label="City"
                  name="city"
                  value={delivery.city}
                  error={deliveryErrors.city}
                  onChange={(e) =>
                    setDeliveryForm((d) => ({ ...d, city: e.target.value }))
                  }
                />
                <TextField
                  label="Region"
                  name="region"
                  value={delivery.region}
                  error={deliveryErrors.region}
                  onChange={(e) =>
                    setDeliveryForm((d) => ({ ...d, region: e.target.value }))
                  }
                />
              </div>
            </fieldset>
          </form>      </Modal>
    </>
  );
}

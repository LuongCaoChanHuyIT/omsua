'use client';

import type { OrderRecord } from '@omsua/shared';
import {
  Checkout,
  type SubmitOrderHandler,
} from './checkout/CheckoutCompound';

export type { SubmitOrderHandler };

export interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl?: string;
  preferIllustration?: boolean;
  submitOrderFn?: SubmitOrderHandler;
  onOrderError?: (error: string) => void;
  onOrderCreated?: (order: OrderRecord) => void;
  onTrackOrder?: (order: OrderRecord) => void;
}

function CheckoutDrawerBody() {
  const { state, actions, meta } = Checkout.useCheckoutContext();

  if (state.confirmedOrder) {
    return <Checkout.ReceiptView />;
  }

  if (meta.lines.length === 0 && meta.unavailableItems.length === 0) {
    return <Checkout.EmptyState />;
  }

  return (
    <form
      onSubmit={(event) => void actions.submitForm(event)}
      noValidate
      className="space-y-4"
    >
      <Checkout.UnavailableBanner />
      <Checkout.ItemList />
      <Checkout.BranchCard />
      <Checkout.DeliveryFields />
      <Checkout.TotalsCard />
      <Checkout.PaymentPicker />
      <Checkout.SubmitSection />
    </form>
  );
}

export function CartCheckoutDrawer(props: CartCheckoutDrawerProps) {
  return (
    <Checkout.Provider {...props}>
      <Checkout.DialogShell>
        <CheckoutDrawerBody />
      </Checkout.DialogShell>
    </Checkout.Provider>
  );
}

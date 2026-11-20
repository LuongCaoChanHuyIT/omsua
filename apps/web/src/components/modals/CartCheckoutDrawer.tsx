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
  reorderNotice?: string | null;
  onDismissReorderNotice?: () => void;
  submitOrderFn?: SubmitOrderHandler;
  onOrderError?: (error: string) => void;
  onOrderCreated?: (order: OrderRecord) => void;
  onTrackOrder?: (order: OrderRecord) => void;
}

function CheckoutDrawerBody({
  reorderNotice,
  onDismissReorderNotice,
}: {
  reorderNotice?: string | null;
  onDismissReorderNotice?: () => void;
}) {
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
      {reorderNotice ? (
        <div
          role="status"
          data-testid="checkout-reorder-notice"
          className="flex items-start justify-between gap-3 rounded-2xl border border-olive-primary/25 bg-card-butter/75 px-4 py-3 text-xs font-medium text-espresso sm:text-sm"
        >
          <p>{reorderNotice}</p>
          {onDismissReorderNotice ? (
            <button
              type="button"
              onClick={onDismissReorderNotice}
              className="min-h-11 shrink-0 rounded-xl border border-olive-primary/20 bg-surface-light px-3 py-1.5 text-xs font-semibold text-espresso transition-colors hover:bg-canvas-cream"
            >
              Đã hiểu
            </button>
          ) : null}
        </div>
      ) : null}
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

export function CartCheckoutDrawer({
  reorderNotice,
  onDismissReorderNotice,
  ...props
}: CartCheckoutDrawerProps) {
  return (
    <Checkout.Provider {...props}>
      <Checkout.DialogShell>
        <CheckoutDrawerBody
          reorderNotice={reorderNotice}
          onDismissReorderNotice={onDismissReorderNotice}
        />
      </Checkout.DialogShell>
    </Checkout.Provider>
  );
}

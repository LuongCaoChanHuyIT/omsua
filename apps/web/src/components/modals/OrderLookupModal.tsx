'use client';

import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  SPICE_LEVEL_LABELS,
  type OrderRecord,
  type OrderStatus,
  formatShortPrice,
  formatVnd,
} from '@omsua/shared';
import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useModalAccessibility } from '@/hooks/use-modal-accessibility';
import { fetchOrderByCode } from '@/lib/api';
import {
  type RecentOrderSummary,
  readRecentOrders,
  saveRecentOrder,
} from '@/lib/recent-orders';
import { VietQrTransferCard } from './VietQrTransferCard';

export type FetchOrderByCodeHandler = (
  orderCode: string,
  baseUrl?: string,
) => Promise<{ ok: true; order: OrderRecord } | { ok: false; error: string }>;

export interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl?: string;
  initialOrder?: OrderRecord | null;
  fetchOrderByCodeFn?: FetchOrderByCodeHandler;
  onOrderLoaded?: (order: OrderRecord) => void;
}

const PROGRESS_STEPS: readonly OrderStatus[] = [
  'pending',
  'preparing',
  'delivering',
  'completed',
];

export function OrderLookupModal({
  isOpen,
  onClose,
  apiBaseUrl,
  initialOrder = null,
  fetchOrderByCodeFn,
  onOrderLoaded,
}: OrderLookupModalProps) {
  const headingId = useId();
  const codeInputId = useId();

  const [codeInput, setCodeInput] = useState<string>('');
  const [recentOrders, setRecentOrders] = useState<RecentOrderSummary[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const requestIdRef = useRef<number>(0);
  const onOrderLoadedRef = useRef(onOrderLoaded);
  const wasOpenRef = useRef<boolean>(false);
  const lastInitialOrderCodeRef = useRef<string | null>(null);

  useEffect(() => {
    onOrderLoadedRef.current = onOrderLoaded;
  }, [onOrderLoaded]);

  const handleClose = useCallback(() => {
    requestIdRef.current += 1;
    setIsLoading(false);
    setErrorMessage(null);
    onClose();
  }, [onClose]);

  const dialogRef = useModalAccessibility<HTMLDivElement>({
    isOpen,
    onClose: handleClose,
  });

  const executeLookup = useCallback(
    async (rawCode: string, silentIfOffline = false) => {
      const normalized = rawCode.trim().toUpperCase();
      if (!normalized) {
        if (!silentIfOffline) {
          setErrorMessage(
            'Vui lòng nhập mã đơn hàng (ví dụ: OM-20261119-AB12).',
          );
        }
        return;
      }

      const currentRequestId = requestIdRef.current + 1;
      requestIdRef.current = currentRequestId;

      setCodeInput(normalized);
      if (!silentIfOffline) {
        setErrorMessage(null);
      }
      setIsLoading(true);

      try {
        const handler = fetchOrderByCodeFn ?? fetchOrderByCode;
        const result = await handler(normalized, apiBaseUrl);

        if (requestIdRef.current !== currentRequestId) {
          return;
        }

        if (!result.ok) {
          if (!silentIfOffline) {
            setErrorMessage(result.error);
          }
          return;
        }

        setActiveOrder(result.order);
        setErrorMessage(null);
        const updatedRecents = saveRecentOrder(result.order);
        setRecentOrders(updatedRecents);
        onOrderLoadedRef.current?.(result.order);
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false);
        }
      }
    },
    [apiBaseUrl, fetchOrderByCodeFn],
  );

  useEffect(() => {
    if (!isOpen) {
      requestIdRef.current += 1;
      setIsLoading(false);
      wasOpenRef.current = false;
      lastInitialOrderCodeRef.current = null;
      return;
    }

    const justOpened = !wasOpenRef.current;
    const nextInitialCode = initialOrder?.orderCode ?? null;
    const initialCodeChanged =
      lastInitialOrderCodeRef.current !== nextInitialCode;

    wasOpenRef.current = true;
    lastInitialOrderCodeRef.current = nextInitialCode;

    if (!justOpened && !initialCodeChanged) {
      return;
    }

    setErrorMessage(null);
    setRecentOrders(readRecentOrders());

    if (initialOrder) {
      setActiveOrder(initialOrder);
      setCodeInput(initialOrder.orderCode);
      void executeLookup(initialOrder.orderCode, true);
    } else {
      setActiveOrder(null);
      setCodeInput('');
    }
  }, [executeLookup, initialOrder, isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void executeLookup(codeInput, false);
  }

  const activeStepIndex = activeOrder
    ? PROGRESS_STEPS.indexOf(activeOrder.status)
    : -1;

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-hero-espresso/55 p-4 backdrop-blur-xs"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-olive-primary/15 bg-surface-light text-espresso shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-olive-primary/12 bg-surface-light px-5 py-4 sm:px-6">
          <h2
            id={headingId}
            className="font-display text-xl font-bold tracking-tight text-espresso sm:text-2xl"
          >
            Tra cứu &amp; theo dõi đơn hàng
          </h2>
          <button
            type="button"
            aria-label="Đóng tra cứu đơn hàng"
            onClick={handleClose}
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-olive-primary/15 bg-canvas-cream text-sm font-bold text-espresso transition hover:bg-card-butter/70"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
          <form onSubmit={handleSubmit} className="space-y-2">
            <label
              htmlFor={codeInputId}
              className="block text-xs font-bold tracking-wider text-olive-primary uppercase"
            >
              Mã đơn hàng (OM-YYYYMMDD-XXXX)
            </label>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                id={codeInputId}
                name="orderCode"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={codeInput}
                onChange={(event) => setCodeInput(event.target.value)}
                placeholder="Ví dụ: OM-20261119-AB12…"
                className="min-h-11 flex-1 rounded-2xl border border-olive-primary/20 bg-canvas-cream/65 px-3.5 py-2.5 text-base font-semibold text-espresso uppercase placeholder:font-normal placeholder:normal-case placeholder:text-warm-muted/70 focus:border-olive-primary focus:outline-none sm:text-sm"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-terracotta-deep px-5 py-2.5 text-sm font-bold text-surface-light shadow-paper-rest transition-opacity hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isLoading ? 'Đang tra cứu…' : 'Tra cứu đơn'}
              </button>
            </div>
          </form>

          {recentOrders.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-wider text-warm-muted uppercase">
                Đơn đã đặt gần đây trên thiết bị này
              </p>
              <div className="flex flex-wrap gap-2">
                {recentOrders.map((recent) => {
                  const isCurrent = activeOrder?.orderCode === recent.orderCode;
                  return (
                    <button
                      key={recent.orderCode}
                      type="button"
                      onClick={() => void executeLookup(recent.orderCode, false)}
                      className={`inline-flex min-h-11 cursor-pointer items-center rounded-2xl border px-3.5 py-2 text-xs font-bold tabular-nums transition ${
                        isCurrent
                          ? 'border-hero-espresso bg-hero-espresso text-surface-light'
                          : 'border-olive-primary/20 bg-card-butter/65 text-espresso hover:bg-card-butter'
                      }`}
                    >
                      {`${recent.orderCode} • ${formatShortPrice(recent.grandTotal)} (${ORDER_STATUS_LABELS[recent.status]})`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="rounded-2xl border border-coral-sketch bg-coral-sketch/20 px-4 py-3 text-xs font-semibold text-espresso sm:text-sm"
            >
              {errorMessage}
            </div>
          )}

          {activeOrder && (
            <div className="space-y-4 rounded-3xl border border-olive-primary/15 bg-canvas-cream/65 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold tracking-wider text-warm-muted uppercase">
                    Mã đơn hàng
                  </span>
                  <p className="mt-0.5 font-display text-2xl font-bold text-espresso tabular-nums">
                    {activeOrder.orderCode}
                  </p>
                  <p className="mt-1 text-xs text-warm-muted">
                    Chi nhánh:{' '}
                    <strong className="text-espresso">
                      {activeOrder.branchName}
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    void executeLookup(activeOrder.orderCode, false)
                  }
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border border-olive-primary/20 bg-surface-light px-3.5 py-2 text-xs font-bold text-olive-primary transition hover:bg-card-butter/65 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Làm mới trạng thái
                </button>
              </div>

              {activeOrder.status === 'cancelled' ? (
                <div className="rounded-2xl border border-coral-sketch bg-coral-sketch/25 px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-coral-sketch px-3 py-1 text-xs font-bold text-espresso">
                    {ORDER_STATUS_LABELS.cancelled}
                  </span>
                  <p className="mt-1.5 text-xs text-warm-muted">
                    Đơn hàng này đã hủy. Nếu cần hỗ trợ thêm, vui lòng liên hệ
                    hotline chi nhánh.
                  </p>
                </div>
              ) : (
                <ol
                  aria-label="Tiến trình xử lý đơn hàng"
                  className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                >
                  {PROGRESS_STEPS.map((step, index) => {
                    const isCompletedStep = index <= activeStepIndex;
                    const isCurrentStep = activeOrder.status === step;
                    return (
                      <li
                        key={step}
                        aria-current={isCurrentStep ? 'step' : undefined}
                        className={`rounded-2xl border p-2.5 text-center transition ${
                          isCurrentStep
                            ? 'border-artichoke-deep bg-artichoke-deep text-surface-light shadow-2xs'
                            : isCompletedStep
                              ? 'border-olive-primary/25 bg-card-butter text-espresso'
                              : 'border-olive-primary/12 bg-surface-light/80 text-warm-muted'
                        }`}
                      >
                        <span className="block text-xs font-bold uppercase opacity-85">
                          Bước {index + 1}
                        </span>
                        <span className="mt-0.5 block text-xs font-bold">
                          {ORDER_STATUS_LABELS[step]}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}

              {activeOrder.items.length > 0 && (
                <div className="space-y-2 border-t border-olive-primary/12 pt-3">
                  <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
                    Chi tiết món đã đặt ({activeOrder.totalItems} món)
                  </p>
                  <ul className="space-y-2">
                    {activeOrder.items.map((item) => (
                      <li
                        key={item.canonicalKey}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-olive-primary/10 bg-surface-light p-3 text-xs"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-semibold text-espresso sm:text-sm">
                            {item.productName}{' '}
                            <span className="font-normal text-warm-muted">
                              × {item.quantity}
                            </span>
                          </p>
                          {item.kind === 'drink' ? (
                            <>
                              <p className="text-warm-muted">
                                Size {item.size} • {item.sugarLevel}% đường •{' '}
                                {item.iceLevel}% đá
                              </p>
                              {item.toppings.length > 0 && (
                                <p className="font-semibold text-artichoke-deep">
                                  +{' '}
                                  {item.toppings
                                    .map(
                                      (topping) =>
                                        `${topping.shortName} (+${formatShortPrice(topping.price)})`,
                                    )
                                    .join(', ')}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-warm-muted">
                              Độ cay:{' '}
                              {item.spiceLevel
                                ? SPICE_LEVEL_LABELS[item.spiceLevel]
                                : 'Cay vừa'}{' '}
                              • {item.sizeLabel}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 font-bold text-terracotta-deep tabular-nums sm:text-sm">
                          {formatVnd(item.lineTotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-1.5 border-t border-olive-primary/12 pt-3 text-xs sm:text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-warm-muted">Người nhận:</span>
                  <span className="font-semibold text-espresso">
                    {activeOrder.customerName} • {activeOrder.customerPhone}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-warm-muted">Giao đến:</span>
                  <span className="text-right font-semibold text-espresso">
                    {activeOrder.deliveryAddress}
                  </span>
                </div>
                {activeOrder.note && (
                  <div className="flex justify-between gap-2">
                    <span className="text-warm-muted">Ghi chú:</span>
                    <span className="text-right font-medium text-espresso">
                      {activeOrder.note}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <span className="text-warm-muted">Thanh toán:</span>
                  <span className="font-semibold text-espresso">
                    {PAYMENT_METHOD_LABELS[activeOrder.paymentMethod]}
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-t border-olive-primary/12 pt-2">
                  <span className="font-bold text-espresso">
                    Tổng thanh toán:
                  </span>
                  <span className="font-extrabold text-terracotta-deep tabular-nums">
                    {formatVnd(activeOrder.grandTotal)}
                  </span>
                </div>
              </div>

              {activeOrder.paymentMethod === 'qr' &&
                activeOrder.status !== 'cancelled' && (
                  <VietQrTransferCard
                    amount={activeOrder.grandTotal}
                    transferContent={`OMSUA ${activeOrder.orderCode} ${activeOrder.customerPhone}`}
                  />
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

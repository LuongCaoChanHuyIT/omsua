'use client';

import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  SPICE_LEVEL_LABELS,
  type BranchInfo,
  type CreateOrderPayload,
  type OrderLineResolved,
  type OrderRecord,
  type OrderTotals,
  type PaymentMethod,
  formatShortPrice,
  formatVnd,
} from '@omsua/shared';
import {
  createContext,
  use,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { ProductMedia } from '@/components/artwork/ProductMedia';
import { useModalAccessibility } from '@/hooks/use-modal-accessibility';
import { submitOrder } from '@/lib/api';
import { saveRecentOrder } from '@/lib/recent-orders';
import { type UnavailableCartItem, useCart } from '@/store/cart-store';
import { VietQrTransferCard } from '../VietQrTransferCard';

export type SubmitOrderHandler = (
  payload: CreateOrderPayload,
  baseUrl?: string,
) => Promise<{ ok: true; order: OrderRecord } | { ok: false; error: string }>;

export type CheckoutFieldKey = 'name' | 'phone' | 'address' | 'note';

const VN_PHONE_REGEX = /^0\d{9,10}$/;
const FORM_VALIDATION_SUMMARY =
  'Vui lòng kiểm tra lại thông tin giao hàng bên trên.';

export interface CheckoutState {
  isOpen: boolean;
  isBranchPickerOpen: boolean;
  customerName: string;
  customerPhone: string;
  normalizedPhone: string;
  deliveryAddress: string;
  note: string;
  paymentMethod: PaymentMethod;
  errorMessage: string | null;
  fieldErrors: Partial<Record<CheckoutFieldKey, string>>;
  isSubmitting: boolean;
  confirmedOrder: OrderRecord | null;
}

export interface CheckoutActions {
  close: () => void;
  toggleBranchPicker: () => void;
  selectBranch: (branchId: string) => void;
  setCustomerName: (value: string) => void;
  setCustomerPhone: (value: string) => void;
  setDeliveryAddress: (value: string) => void;
  setNote: (value: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  removeSingleUnavailableItem: (key: string) => void;
  removeAllUnavailableItems: () => void;
  submitForm: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  trackConfirmedOrder: () => void;
}

export interface CheckoutMeta {
  headingId: string;
  nameInputId: string;
  phoneInputId: string;
  addressInputId: string;
  noteInputId: string;
  nameRef: RefObject<HTMLInputElement | null>;
  phoneRef: RefObject<HTMLInputElement | null>;
  addressRef: RefObject<HTMLInputElement | null>;
  noteRef: RefObject<HTMLInputElement | null>;
  branches: BranchInfo[];
  selectedBranch: BranchInfo;
  lines: OrderLineResolved[];
  totals: OrderTotals;
  unavailableItems: UnavailableCartItem[];
  updateQuantity: (canonicalKey: string, quantity: number) => void;
  removeItem: (canonicalKey: string) => void;
  deliveryEta: string;
  shippingFeeLabel: string;
}

export interface CheckoutContextValue {
  state: CheckoutState;
  actions: CheckoutActions;
  meta: CheckoutMeta;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function useCheckoutContext(): CheckoutContextValue {
  const ctx = use(CheckoutContext);
  if (!ctx) {
    throw new Error(
      'Checkout subcomponents must be rendered within Checkout.Provider.',
    );
  }
  return ctx;
}

export interface CheckoutProviderProps {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl?: string;
  submitOrderFn?: SubmitOrderHandler;
  onOrderError?: (error: string) => void;
  onOrderCreated?: (order: OrderRecord) => void;
  onTrackOrder?: (order: OrderRecord) => void;
  children: ReactNode;
}

function CheckoutProvider({
  isOpen,
  onClose,
  apiBaseUrl,
  submitOrderFn,
  onOrderError,
  onOrderCreated,
  onTrackOrder,
  children,
}: CheckoutProviderProps) {
  const headingId = useId();
  const nameInputId = useId();
  const phoneInputId = useId();
  const addressInputId = useId();
  const noteInputId = useId();

  const nameRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLInputElement | null>(null);
  const noteRef = useRef<HTMLInputElement | null>(null);

  const {
    branches,
    selectedBranch,
    setSelectedBranchId,
    items,
    lines,
    totals,
    unavailableItems,
    updateQuantity,
    removeItem,
    removeUnavailableItems,
    clearCart,
  } = useCart();

  const [isBranchPickerOpen, setIsBranchPickerOpen] = useState<boolean>(false);
  const [customerName, setCustomerNameState] = useState<string>('');
  const [customerPhone, setCustomerPhoneState] = useState<string>('');
  const [deliveryAddress, setDeliveryAddressState] = useState<string>('');
  const [note, setNoteState] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<CheckoutFieldKey, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(
    null,
  );

  const close = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    setIsBranchPickerOpen(false);
    setErrorMessage(null);
    setFieldErrors({});
    setConfirmedOrder(null);
    onClose();
  }, [isSubmitting, onClose]);

  const clearFieldError = useCallback((key: CheckoutFieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      if (Object.keys(next).length === 0) {
        setErrorMessage((msg) =>
          msg === FORM_VALIDATION_SUMMARY ? null : msg,
        );
      }
      return next;
    });
  }, []);

  const setCustomerName = useCallback(
    (value: string) => {
      setCustomerNameState(value);
      clearFieldError('name');
    },
    [clearFieldError],
  );

  const setCustomerPhone = useCallback(
    (value: string) => {
      setCustomerPhoneState(value);
      clearFieldError('phone');
    },
    [clearFieldError],
  );

  const setDeliveryAddress = useCallback(
    (value: string) => {
      setDeliveryAddressState(value);
      clearFieldError('address');
    },
    [clearFieldError],
  );

  const setNote = useCallback(
    (value: string) => {
      setNoteState(value);
      clearFieldError('note');
    },
    [clearFieldError],
  );

  const toggleBranchPicker = useCallback(() => {
    setIsBranchPickerOpen((prev) => !prev);
  }, []);

  const selectBranch = useCallback(
    (branchId: string) => {
      setSelectedBranchId(branchId);
      setIsBranchPickerOpen(false);
    },
    [setSelectedBranchId],
  );

  const removeAllUnavailableItems = useCallback(() => {
    removeUnavailableItems();
    setErrorMessage(null);
  }, [removeUnavailableItems]);

  const removeSingleUnavailableItem = useCallback(
    (key: string) => {
      removeItem(key);
      if (unavailableItems.length <= 1) {
        setErrorMessage((prev) =>
          prev && /tạm hết/i.test(prev) ? null : prev,
        );
      }
    },
    [removeItem, unavailableItems.length],
  );

  const normalizedPhone = useMemo(
    () => customerPhone.replace(/[\s.-]/g, ''),
    [customerPhone],
  );

  const submitForm = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMessage(null);

      if (unavailableItems.length > 0) {
        setErrorMessage(
          'Vui lòng gỡ các món đang tạm hết khỏi giỏ hàng trước khi đặt đơn.',
        );
        return;
      }

      if (items.length === 0) {
        setErrorMessage('Giỏ hàng của bạn đang trống.');
        return;
      }

      const trimmedName = customerName.trim();
      const trimmedAddress = deliveryAddress.trim();
      const trimmedNote = note.trim();

      const nextFieldErrors: Partial<Record<CheckoutFieldKey, string>> = {};
      if (trimmedName.length < 2 || trimmedName.length > 80) {
        nextFieldErrors.name =
          'Vui lòng nhập họ và tên người nhận (từ 2 đến 80 ký tự).';
      }
      if (!VN_PHONE_REGEX.test(normalizedPhone)) {
        nextFieldErrors.phone =
          'Vui lòng nhập số điện thoại hợp lệ gồm 10–11 chữ số bắt đầu bằng số 0.';
      }
      if (trimmedAddress.length < 5 || trimmedAddress.length > 200) {
        nextFieldErrors.address =
          'Vui lòng nhập địa chỉ giao hàng chi tiết (tối thiểu 5 ký tự).';
      }
      if (trimmedNote.length > 300) {
        nextFieldErrors.note = 'Ghi chú không được vượt quá 300 ký tự.';
      }

      setFieldErrors(nextFieldErrors);

      if (nextFieldErrors.name) {
        setErrorMessage(FORM_VALIDATION_SUMMARY);
        nameRef.current?.focus();
        return;
      }
      if (nextFieldErrors.phone) {
        setErrorMessage(FORM_VALIDATION_SUMMARY);
        phoneRef.current?.focus();
        return;
      }
      if (nextFieldErrors.address) {
        setErrorMessage(FORM_VALIDATION_SUMMARY);
        addressRef.current?.focus();
        return;
      }
      if (nextFieldErrors.note) {
        setErrorMessage(FORM_VALIDATION_SUMMARY);
        noteRef.current?.focus();
        return;
      }

      const payload: CreateOrderPayload = {
        branchId: selectedBranch.id,
        customerName: trimmedName,
        customerPhone: normalizedPhone,
        deliveryAddress: trimmedAddress,
        ...(trimmedNote.length > 0 ? { note: trimmedNote } : {}),
        paymentMethod,
        items,
      };

      setIsSubmitting(true);
      try {
        const handler = submitOrderFn ?? submitOrder;
        const result = await handler(payload, apiBaseUrl);

        if (!result.ok) {
          setErrorMessage(result.error);
          onOrderError?.(result.error);
          return;
        }

        saveRecentOrder(result.order);
        onOrderCreated?.(result.order);
        clearCart();
        setNoteState('');
        setFieldErrors({});
        setConfirmedOrder(result.order);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      apiBaseUrl,
      clearCart,
      customerName,
      deliveryAddress,
      items,
      normalizedPhone,
      note,
      onOrderCreated,
      onOrderError,
      paymentMethod,
      selectedBranch.id,
      submitOrderFn,
      unavailableItems.length,
    ],
  );

  const trackConfirmedOrder = useCallback(() => {
    if (!confirmedOrder) {
      return;
    }
    const snapshot = confirmedOrder;
    close();
    onTrackOrder?.(snapshot);
  }, [close, confirmedOrder, onTrackOrder]);

  const isDucTrongBranch = selectedBranch.id === 'cs4-duc-trong';
  const deliveryEta = isDucTrongBranch
    ? 'Giao tận nơi khu vực Đức Trọng dự kiến 20–25 phút'
    : 'Giao tận nơi dự kiến 15–20 phút';
  const shippingFeeLabel = isDucTrongBranch
    ? 'Phí giao hàng khu vực Đức Trọng:'
    : 'Phí giao hàng nội thành Đà Lạt:';

  const state = useMemo<CheckoutState>(
    () => ({
      isOpen,
      isBranchPickerOpen,
      customerName,
      customerPhone,
      normalizedPhone,
      deliveryAddress,
      note,
      paymentMethod,
      errorMessage,
      fieldErrors,
      isSubmitting,
      confirmedOrder,
    }),
    [
      confirmedOrder,
      customerName,
      customerPhone,
      deliveryAddress,
      errorMessage,
      fieldErrors,
      isBranchPickerOpen,
      isOpen,
      isSubmitting,
      normalizedPhone,
      note,
      paymentMethod,
    ],
  );

  const actions = useMemo<CheckoutActions>(
    () => ({
      close,
      toggleBranchPicker,
      selectBranch,
      setCustomerName,
      setCustomerPhone,
      setDeliveryAddress,
      setNote,
      setPaymentMethod,
      removeSingleUnavailableItem,
      removeAllUnavailableItems,
      submitForm,
      trackConfirmedOrder,
    }),
    [
      close,
      removeAllUnavailableItems,
      removeSingleUnavailableItem,
      selectBranch,
      setCustomerName,
      setCustomerPhone,
      setDeliveryAddress,
      setNote,
      submitForm,
      toggleBranchPicker,
      trackConfirmedOrder,
    ],
  );

  const meta = useMemo<CheckoutMeta>(
    () => ({
      headingId,
      nameInputId,
      phoneInputId,
      addressInputId,
      noteInputId,
      nameRef,
      phoneRef,
      addressRef,
      noteRef,
      branches,
      selectedBranch,
      lines,
      totals,
      unavailableItems,
      updateQuantity,
      removeItem,
      deliveryEta,
      shippingFeeLabel,
    }),
    [
      addressInputId,
      branches,
      deliveryEta,
      headingId,
      lines,
      nameInputId,
      noteInputId,
      phoneInputId,
      removeItem,
      selectedBranch,
      shippingFeeLabel,
      totals,
      unavailableItems,
      updateQuantity,
    ],
  );

  const value = useMemo<CheckoutContextValue>(
    () => ({ state, actions, meta }),
    [actions, meta, state],
  );

  return <CheckoutContext value={value}>{children}</CheckoutContext>;
}

function CheckoutDialogShell({ children }: { children: ReactNode }) {
  const { state, actions, meta } = useCheckoutContext();
  const dialogRef = useModalAccessibility<HTMLDivElement>({
    isOpen: state.isOpen,
    onClose: actions.close,
    isCloseDisabled: state.isSubmitting,
  });

  if (!state.isOpen) {
    return null;
  }

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          actions.close();
        }
      }}
      className="fixed inset-0 z-50 flex justify-end bg-hero-espresso/55 backdrop-blur-xs"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={meta.headingId}
        tabIndex={-1}
        className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-olive-primary/15 bg-surface-light text-espresso shadow-paper-lift"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-olive-primary/12 bg-surface-light px-5 py-4 sm:px-6">
          <h2
            id={meta.headingId}
            className="font-display text-2xl font-bold tracking-tight text-espresso tabular-nums"
          >
            {state.confirmedOrder
              ? 'Đặt món thành công'
              : `Giỏ hàng của bạn (${meta.totals.totalItems} món)`}
          </h2>
          <button
            type="button"
            aria-label="Đóng giỏ hàng"
            disabled={state.isSubmitting}
            onClick={actions.close}
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-olive-primary/15 bg-canvas-cream text-sm font-bold text-espresso transition-colors hover:bg-card-butter/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function CheckoutReceiptView() {
  const { state, actions } = useCheckoutContext();
  const confirmedOrder = state.confirmedOrder;

  if (!confirmedOrder) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-3xl border border-olive-primary/15 bg-card-butter p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-artichoke-deep px-3 py-1 text-xs font-bold tracking-wide text-surface-light uppercase">
            ✓ ĐẶT MÓN THÀNH CÔNG
          </span>
          <span className="inline-flex items-center rounded-full border border-olive-primary/20 bg-surface-light px-3 py-1 text-xs font-bold text-olive-primary">
            {ORDER_STATUS_LABELS[confirmedOrder.status]}
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wider text-warm-muted uppercase">
            Mã đơn hàng của bạn
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-espresso tabular-nums sm:text-3xl">
            {confirmedOrder.orderCode}
          </p>
        </div>
        <p className="text-xs leading-relaxed text-warm-muted sm:text-sm">
          Chi nhánh phục vụ:{' '}
          <strong className="text-espresso">{confirmedOrder.branchName}</strong>
        </p>
      </div>

      {confirmedOrder.items.length > 0 ? (
        <div className="space-y-2.5 rounded-2xl border border-olive-primary/12 bg-canvas-cream/70 p-4">
          <p className="text-xs font-bold tracking-wider text-olive-primary tabular-nums uppercase">
            Chi tiết món đã đặt ({confirmedOrder.totalItems} món)
          </p>
          <ul className="space-y-2">
            {confirmedOrder.items.map((item) => (
              <li
                key={item.canonicalKey}
                className="flex items-start justify-between gap-3 rounded-xl border border-olive-primary/10 bg-surface-light p-3 text-xs"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="font-semibold text-espresso sm:text-sm">
                    {item.productName}
                  </p>
                  {item.kind === 'drink' ? (
                    <>
                      <p className="text-warm-muted tabular-nums">
                        Size {item.size} • {item.sugarLevel}% đường •{' '}
                        {item.iceLevel}% đá
                      </p>
                      {item.toppings.length > 0 ? (
                        <p className="font-semibold text-artichoke-deep tabular-nums">
                          +{' '}
                          {item.toppings
                            .map(
                              (topping) =>
                                `${topping.shortName} (+${formatShortPrice(topping.price)})`,
                            )
                            .join(', ')}
                        </p>
                      ) : null}
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
                  <p className="font-semibold text-warm-muted tabular-nums">
                    SL: {item.quantity}{' '}
                    {item.kind === 'snack' ? 'phần' : 'ly'}
                  </p>
                </div>
                <span className="shrink-0 font-bold text-terracotta-deep tabular-nums sm:text-sm">
                  {formatVnd(item.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-2 rounded-2xl border border-olive-primary/12 bg-canvas-cream/70 p-4 text-xs sm:text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-warm-muted">Người nhận:</span>
          <span className="font-semibold text-espresso tabular-nums">
            {confirmedOrder.customerName} • {confirmedOrder.customerPhone}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-warm-muted">Giao đến:</span>
          <span className="text-right font-semibold text-espresso">
            {confirmedOrder.deliveryAddress}
          </span>
        </div>
        {confirmedOrder.note ? (
          <div className="flex justify-between gap-2">
            <span className="text-warm-muted">Ghi chú:</span>
            <span className="text-right font-medium text-espresso">
              {confirmedOrder.note}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          <span className="text-warm-muted">Thanh toán:</span>
          <span className="font-semibold text-espresso">
            {PAYMENT_METHOD_LABELS[confirmedOrder.paymentMethod]}
          </span>
        </div>
        <div className="flex justify-between gap-2 border-t border-olive-primary/12 pt-2">
          <span className="font-bold text-espresso">Tổng thanh toán:</span>
          <span className="font-bold text-terracotta-deep tabular-nums">
            {formatVnd(confirmedOrder.grandTotal)}
          </span>
        </div>
      </div>

      {confirmedOrder.paymentMethod === 'qr' ? (
        <VietQrTransferCard
          amount={confirmedOrder.grandTotal}
          transferContent={`OMSUA ${confirmedOrder.orderCode} ${confirmedOrder.customerPhone}`}
        />
      ) : null}

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={actions.trackConfirmedOrder}
          className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-2xl border border-olive-primary/25 bg-card-butter px-5 py-3 text-sm font-bold text-olive-primary transition-opacity hover:opacity-92"
        >
          Theo dõi trạng thái đơn
        </button>
        <button
          type="button"
          onClick={actions.close}
          className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-2xl bg-terracotta-deep px-5 py-3 text-sm font-bold text-surface-light shadow-paper-rest transition-opacity hover:opacity-92 sm:text-base"
        >
          Tiếp tục đặt món
        </button>
      </div>
    </div>
  );
}

function CheckoutEmptyState() {
  const { actions } = useCheckoutContext();

  return (
    <div className="space-y-3 rounded-3xl border border-olive-primary/12 bg-canvas-cream/65 p-8 text-center">
      <p className="font-display text-lg font-bold text-espresso">
        Giỏ hàng của bạn đang trống
      </p>
      <p className="text-xs leading-relaxed text-warm-muted sm:text-sm">
        Chọn một ly Trà Sữa Atiso hoặc Bánh Tráng Đà Lạt để bắt đầu lên đơn nhé!
      </p>
      <button
        type="button"
        onClick={actions.close}
        className="mt-2 inline-flex min-h-11 cursor-pointer items-center rounded-full bg-terracotta-deep px-5 py-2.5 text-xs font-bold text-surface-light transition-opacity hover:opacity-92 sm:text-sm"
      >
        Khám phá thực đơn
      </button>
    </div>
  );
}

function CheckoutUnavailableBanner() {
  const { actions, meta } = useCheckoutContext();

  if (meta.unavailableItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-2xl border border-coral-sketch bg-coral-sketch/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-xs font-bold tracking-wider text-terracotta-deep uppercase">
            ⚠ CÓ MÓN TRONG GIỎ VỪA TẠM HẾT
          </p>
          <p className="text-xs text-espresso">
            Vui lòng gỡ món tạm hết để tiếp tục xác nhận đặt đơn.
          </p>
        </div>
        <button
          type="button"
          onClick={actions.removeAllUnavailableItems}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-terracotta-deep px-4 py-2 text-xs font-bold text-surface-light transition-opacity hover:opacity-92"
        >
          Gỡ món tạm hết
        </button>
      </div>

      <ul className="space-y-2 border-t border-coral-sketch/40 pt-2.5">
        {meta.unavailableItems.map((item) => (
          <li
            key={item.key}
            className="flex items-center justify-between gap-3 rounded-xl border border-olive-primary/12 bg-surface-light/85 px-3 py-2 text-xs"
          >
            <div className="min-w-0">
              <p className="font-semibold text-espresso">
                {item.productName}{' '}
                <span className="font-normal text-warm-muted tabular-nums">
                  (SL: {item.quantity})
                </span>
              </p>
              <p className="text-warm-muted">{item.reason}</p>
            </div>
            <button
              type="button"
              aria-label={`Xóa món tạm hết ${item.productName}`}
              onClick={() => actions.removeSingleUnavailableItem(item.key)}
              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center px-3 text-xs font-semibold text-terracotta-deep underline-offset-2 hover:underline"
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckoutItemList() {
  const { meta } = useCheckoutContext();

  if (meta.lines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {meta.lines.map((line) => (
        <article
          key={line.canonicalKey}
          className="flex gap-3.5 rounded-2xl border border-olive-primary/12 bg-canvas-cream/65 p-3.5"
        >
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
            <ProductMedia
              productId={line.productId}
              categoryId={line.kind === 'snack' ? 'snack' : undefined}
              variant={line.kind === 'snack' ? 'snack' : 'card'}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div className="space-y-0.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-editorial text-base leading-snug font-semibold text-espresso">
                  {line.productName}
                </h3>
                <span className="shrink-0 text-sm font-bold text-terracotta-deep tabular-nums">
                  {formatVnd(line.lineTotal)}
                </span>
              </div>

              {line.kind === 'drink' ? (
                <>
                  <p className="text-xs text-warm-muted tabular-nums">
                    Size {line.size} • {line.sugarLevel}% đường •{' '}
                    {line.iceLevel}% đá
                  </p>
                  {line.toppings.length > 0 ? (
                    <p className="text-xs font-semibold text-artichoke-deep tabular-nums">
                      +{' '}
                      {line.toppings
                        .map(
                          (topping) =>
                            `${topping.shortName} (+${formatShortPrice(topping.price)})`,
                        )
                        .join(', ')}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="text-xs text-warm-muted">
                    Độ cay:{' '}
                    {line.spiceLevel
                      ? SPICE_LEVEL_LABELS[line.spiceLevel]
                      : 'Cay vừa'}{' '}
                    • {line.sizeLabel}
                  </p>
                  <p className="text-xs font-semibold text-ochre-deep">
                    Ăn kèm sốt tắc hành phi nhà làm
                  </p>
                </>
              )}
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <div className="inline-flex min-h-11 items-center gap-1 rounded-full border border-olive-primary/15 bg-surface-light px-1.5 py-0.5">
                <button
                  type="button"
                  aria-label={`Giảm số lượng ${line.productName}`}
                  onClick={() =>
                    meta.updateQuantity(line.canonicalKey, line.quantity - 1)
                  }
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-xs font-bold text-warm-muted transition-colors hover:text-espresso"
                >
                  -
                </button>
                <span className="text-xs font-bold text-espresso tabular-nums">
                  SL: {line.quantity} {line.kind === 'snack' ? 'phần' : 'ly'}
                </span>
                <button
                  type="button"
                  aria-label={`Tăng số lượng ${line.productName}`}
                  disabled={line.quantity >= 99}
                  onClick={() =>
                    meta.updateQuantity(line.canonicalKey, line.quantity + 1)
                  }
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-xs font-bold text-terracotta-deep transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                aria-label={`Xóa ${line.productName}`}
                onClick={() => meta.removeItem(line.canonicalKey)}
                className="inline-flex min-h-11 cursor-pointer items-center px-3 text-xs font-semibold text-warm-muted underline-offset-2 transition-colors hover:text-terracotta-deep hover:underline"
              >
                Xóa
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function CheckoutBranchCard() {
  const { state, actions, meta } = useCheckoutContext();

  return (
    <div className="space-y-2 rounded-2xl border border-olive-primary/15 bg-card-butter p-4">
      <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
        📍 CHI NHÁNH PHỤC VỤ GẦN BẠN NHẤT
      </p>
      <p className="text-sm font-bold text-espresso">
        Ốm Sữa — {meta.selectedBranch.address}
      </p>
      <p className="text-xs text-warm-muted tabular-nums">
        {meta.deliveryEta} • Hotline: {meta.selectedBranch.hotline}
      </p>
      <div>
        <button
          type="button"
          onClick={actions.toggleBranchPicker}
          className="mt-1 inline-flex min-h-11 cursor-pointer items-center rounded-full border border-olive-primary/20 bg-surface-light px-3.5 py-1.5 text-xs font-semibold text-espresso transition-colors hover:bg-canvas-cream"
        >
          Đổi chi nhánh khác
        </button>
      </div>

      {state.isBranchPickerOpen ? (
        <div className="mt-2 space-y-1.5 border-t border-olive-primary/15 pt-2.5">
          {meta.branches.map((branch) => {
            const isActive = branch.id === meta.selectedBranch.id;
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => actions.selectBranch(branch.id)}
                className={`flex min-h-11 w-full cursor-pointer flex-col items-start justify-center rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                  isActive
                    ? 'border-hero-espresso bg-hero-espresso text-surface-light'
                    : 'border-olive-primary/15 bg-surface-light text-espresso hover:bg-canvas-cream'
                }`}
              >
                <span className="font-bold">{branch.name}</span>
                <span
                  className={isActive ? 'text-card-butter' : 'text-warm-muted'}
                >
                  {branch.address}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function CheckoutDeliveryFields() {
  const { state, actions, meta } = useCheckoutContext();

  return (
    <div className="space-y-3 rounded-2xl border border-olive-primary/12 bg-canvas-cream/65 p-4">
      <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
        THÔNG TIN GIAO HÀNG TẬN NƠI
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor={meta.nameInputId}
            className="block text-xs font-semibold text-espresso"
          >
            Họ và tên người nhận
          </label>
          <input
            ref={meta.nameRef}
            id={meta.nameInputId}
            name="customerName"
            type="text"
            autoComplete="name"
            aria-invalid={state.fieldErrors.name ? 'true' : undefined}
            aria-describedby={
              state.fieldErrors.name ? `${meta.nameInputId}-error` : undefined
            }
            value={state.customerName}
            onChange={(event) => actions.setCustomerName(event.target.value)}
            placeholder="Ví dụ: Nguyễn Lan…"
            className={`min-h-11 w-full rounded-xl border bg-surface-light px-3 py-2 text-base text-espresso placeholder:text-warm-muted/70 focus:outline-none sm:text-sm ${
              state.fieldErrors.name
                ? 'border-terracotta'
                : 'border-olive-primary/20 focus:border-olive-primary'
            }`}
          />
          {state.fieldErrors.name ? (
            <p
              id={`${meta.nameInputId}-error`}
              className="text-xs font-medium text-terracotta-deep"
            >
              {state.fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label
            htmlFor={meta.phoneInputId}
            className="block text-xs font-semibold text-espresso"
          >
            Số điện thoại
          </label>
          <input
            ref={meta.phoneRef}
            id={meta.phoneInputId}
            name="customerPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            spellCheck={false}
            aria-invalid={state.fieldErrors.phone ? 'true' : undefined}
            aria-describedby={
              state.fieldErrors.phone ? `${meta.phoneInputId}-error` : undefined
            }
            value={state.customerPhone}
            onChange={(event) => actions.setCustomerPhone(event.target.value)}
            placeholder="09xxxxxxxx…"
            className={`min-h-11 w-full rounded-xl border bg-surface-light px-3 py-2 text-base text-espresso tabular-nums placeholder:text-warm-muted/70 focus:outline-none sm:text-sm ${
              state.fieldErrors.phone
                ? 'border-terracotta'
                : 'border-olive-primary/20 focus:border-olive-primary'
            }`}
          />
          {state.fieldErrors.phone ? (
            <p
              id={`${meta.phoneInputId}-error`}
              className="text-xs font-medium text-terracotta-deep"
            >
              {state.fieldErrors.phone}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor={meta.addressInputId}
          className="block text-xs font-semibold text-espresso"
        >
          Địa chỉ giao hàng
        </label>
        <input
          ref={meta.addressRef}
          id={meta.addressInputId}
          name="deliveryAddress"
          type="text"
          autoComplete="street-address"
          aria-invalid={state.fieldErrors.address ? 'true' : undefined}
          aria-describedby={
            state.fieldErrors.address
              ? `${meta.addressInputId}-error`
              : undefined
          }
          value={state.deliveryAddress}
          onChange={(event) => actions.setDeliveryAddress(event.target.value)}
          placeholder="Số nhà, tên đường, phường/xã tại Đà Lạt hoặc Đức Trọng…"
          className={`min-h-11 w-full rounded-xl border bg-surface-light px-3 py-2 text-base text-espresso placeholder:text-warm-muted/70 focus:outline-none sm:text-sm ${
            state.fieldErrors.address
              ? 'border-terracotta'
              : 'border-olive-primary/20 focus:border-olive-primary'
          }`}
        />
        {state.fieldErrors.address ? (
          <p
            id={`${meta.addressInputId}-error`}
            className="text-xs font-medium text-terracotta-deep"
          >
            {state.fieldErrors.address}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label
          htmlFor={meta.noteInputId}
          className="block text-xs font-semibold text-espresso"
        >
          Ghi chú đơn hàng
        </label>
        <input
          ref={meta.noteRef}
          id={meta.noteInputId}
          name="note"
          type="text"
          autoComplete="off"
          maxLength={300}
          aria-invalid={state.fieldErrors.note ? 'true' : undefined}
          aria-describedby={
            state.fieldErrors.note ? `${meta.noteInputId}-error` : undefined
          }
          value={state.note}
          onChange={(event) => actions.setNote(event.target.value)}
          placeholder="Ví dụ: Ít ngọt hơn, gọi khi tới cổng (không bắt buộc)…"
          className={`min-h-11 w-full rounded-xl border bg-surface-light px-3 py-2 text-base text-espresso placeholder:text-warm-muted/70 focus:outline-none sm:text-sm ${
            state.fieldErrors.note
              ? 'border-terracotta'
              : 'border-olive-primary/20 focus:border-olive-primary'
          }`}
        />
        {state.fieldErrors.note ? (
          <p
            id={`${meta.noteInputId}-error`}
            className="text-xs font-medium text-terracotta-deep"
          >
            {state.fieldErrors.note}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function CheckoutTotalsCard() {
  const { meta } = useCheckoutContext();

  return (
    <div className="space-y-2 rounded-2xl border border-olive-primary/12 bg-canvas-cream/75 p-4 text-xs sm:text-sm">
      <div className="flex items-center justify-between">
        <span className="text-warm-muted tabular-nums">
          Tạm tính ({meta.totals.totalItems} món):
        </span>
        <span className="font-bold text-espresso tabular-nums">
          {formatVnd(meta.totals.subtotal)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-warm-muted">{meta.shippingFeeLabel}</span>
        <span className="font-bold text-artichoke-deep">Miễn phí</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-warm-muted">
          Dụng cụ ống hút &amp; ly giấy thân thiện:
        </span>
        <span className="font-bold text-espresso tabular-nums">0đ</span>
      </div>

      <div className="flex items-center justify-between border-t border-olive-primary/12 pt-2.5">
        <span className="font-display text-base font-bold text-espresso">
          Tổng thanh toán:
        </span>
        <span className="text-lg font-extrabold text-terracotta-deep tabular-nums">
          {formatVnd(meta.totals.grandTotal)}
        </span>
      </div>
    </div>
  );
}

function CheckoutPaymentPicker() {
  const { state, actions, meta } = useCheckoutContext();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        {PAYMENT_METHODS.map((method) => {
          const isActive = state.paymentMethod === method;
          return (
            <button
              key={method}
              type="button"
              aria-pressed={isActive}
              onClick={() => actions.setPaymentMethod(method)}
              className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-bold transition-colors sm:text-sm ${
                isActive
                  ? 'border-hero-espresso bg-hero-espresso text-surface-light'
                  : 'border-olive-primary/20 bg-canvas-cream/70 text-espresso hover:bg-card-butter/45'
              }`}
            >
              <span aria-hidden="true">{isActive ? '●' : '○'}</span>
              <span>{PAYMENT_METHOD_LABELS[method]}</span>
            </button>
          );
        })}
      </div>

      {state.paymentMethod === 'qr' && meta.totals.grandTotal > 0 ? (
        <VietQrTransferCard
          amount={meta.totals.grandTotal}
          transferContent={`OMSUA ${state.normalizedPhone || 'SDT'}`}
        />
      ) : null}
    </div>
  );
}

function CheckoutSubmitSection() {
  const { state, meta } = useCheckoutContext();

  return (
    <>
      {state.errorMessage ? (
        <div
          role="alert"
          className="rounded-2xl border border-coral-sketch bg-coral-sketch/20 px-4 py-2.5 text-xs font-semibold text-espresso"
        >
          {state.errorMessage}
        </div>
      ) : null}

      <div className="space-y-2 pt-1">
        <button
          type="submit"
          disabled={
            state.isSubmitting ||
            meta.unavailableItems.length > 0 ||
            meta.lines.length === 0
          }
          className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-terracotta-deep px-5 py-3.5 text-sm font-bold text-surface-light shadow-paper-rest tabular-nums transition-opacity hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-65 sm:text-base"
        >
          {state.isSubmitting
            ? 'Đang xử lý đơn hàng…'
            : `Xác nhận đặt món • ${formatVnd(meta.totals.grandTotal)} →`}
        </button>

        <p className="text-center text-xs text-warm-muted">
          Cam kết trà ủ mới &amp; bánh tráng trộn ngay khi lên đơn
        </p>
      </div>
    </>
  );
}

export const Checkout = {
  Provider: CheckoutProvider,
  DialogShell: CheckoutDialogShell,
  ReceiptView: CheckoutReceiptView,
  EmptyState: CheckoutEmptyState,
  UnavailableBanner: CheckoutUnavailableBanner,
  ItemList: CheckoutItemList,
  BranchCard: CheckoutBranchCard,
  DeliveryFields: CheckoutDeliveryFields,
  TotalsCard: CheckoutTotalsCard,
  PaymentPicker: CheckoutPaymentPicker,
  SubmitSection: CheckoutSubmitSection,
  useCheckoutContext,
};


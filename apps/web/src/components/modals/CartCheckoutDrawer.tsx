'use client';

import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  SPICE_LEVEL_LABELS,
  type CreateOrderPayload,
  type OrderRecord,
  type PaymentMethod,
  formatShortPrice,
  formatVnd,
} from '@omsua/shared';
import { type FormEvent, useCallback, useId, useState } from 'react';
import { ProductMedia } from '@/components/artwork/ProductMedia';
import { useModalAccessibility } from '@/hooks/use-modal-accessibility';
import { submitOrder } from '@/lib/api';
import { saveRecentOrder } from '@/lib/recent-orders';
import { useCart } from '@/store/cart-store';
import { VietQrTransferCard } from './VietQrTransferCard';

export type SubmitOrderHandler = (
  payload: CreateOrderPayload,
  baseUrl?: string,
) => Promise<{ ok: true; order: OrderRecord } | { ok: false; error: string }>;

export interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl?: string;
  submitOrderFn?: SubmitOrderHandler;
  onOrderError?: (error: string) => void;
  onOrderCreated?: (order: OrderRecord) => void;
  onTrackOrder?: (order: OrderRecord) => void;
}

const VN_PHONE_REGEX = /^0\d{9,10}$/;

export function CartCheckoutDrawer({
  isOpen,
  onClose,
  apiBaseUrl,
  submitOrderFn,
  onOrderError,
  onOrderCreated,
  onTrackOrder,
}: CartCheckoutDrawerProps) {
  const headingId = useId();
  const nameInputId = useId();
  const phoneInputId = useId();
  const addressInputId = useId();
  const noteInputId = useId();

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
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(
    null,
  );

  const handleClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    setIsBranchPickerOpen(false);
    setErrorMessage(null);
    setConfirmedOrder(null);
    onClose();
  }, [isSubmitting, onClose]);

  const dialogRef = useModalAccessibility<HTMLDivElement>({
    isOpen,
    onClose: handleClose,
    isCloseDisabled: isSubmitting,
  });

  if (!isOpen) {
    return null;
  }

  const normalizedPhone = customerPhone.replace(/[\s.-]/g, '');
  const isDucTrongBranch = selectedBranch.id === 'cs4-duc-trong';
  const deliveryEta = isDucTrongBranch
    ? 'Giao tận nơi khu vực Đức Trọng dự kiến 20–25 phút'
    : 'Giao tận nơi dự kiến 15–20 phút';
  const shippingFeeLabel = isDucTrongBranch
    ? 'Phí giao hàng khu vực Đức Trọng:'
    : 'Phí giao hàng nội thành Đà Lạt:';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setErrorMessage(
        'Vui lòng nhập họ và tên người nhận (từ 2 đến 80 ký tự).',
      );
      return;
    }

    if (!VN_PHONE_REGEX.test(normalizedPhone)) {
      setErrorMessage(
        'Vui lòng nhập số điện thoại hợp lệ gồm 10–11 chữ số bắt đầu bằng số 0.',
      );
      return;
    }

    const trimmedAddress = deliveryAddress.trim();
    if (trimmedAddress.length < 5 || trimmedAddress.length > 200) {
      setErrorMessage(
        'Vui lòng nhập địa chỉ giao hàng chi tiết (tối thiểu 5 ký tự).',
      );
      return;
    }

    const trimmedNote = note.trim();
    if (trimmedNote.length > 300) {
      setErrorMessage('Ghi chú không được vượt quá 300 ký tự.');
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
      setNote('');
      setConfirmedOrder(result.order);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex justify-end bg-hero-espresso/55 backdrop-blur-xs"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-olive-primary/15 bg-surface-light text-espresso shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-olive-primary/12 bg-surface-light px-5 py-4 sm:px-6">
          <h2
            id={headingId}
            className="font-display text-2xl font-bold tracking-tight text-espresso"
          >
            {confirmedOrder
              ? 'Đặt món thành công'
              : `Giỏ hàng của bạn (${totals.totalItems} món)`}
          </h2>
          <button
            type="button"
            aria-label="Đóng giỏ hàng"
            disabled={isSubmitting}
            onClick={handleClose}
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-olive-primary/15 bg-canvas-cream text-sm font-bold text-espresso transition hover:bg-card-butter/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {confirmedOrder ? (
            <div className="space-y-5">
              <div className="space-y-3 rounded-3xl border border-olive-primary/15 bg-card-butter p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-artichoke px-3 py-1 text-xs font-bold tracking-wide text-surface-light uppercase">
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
                  <p className="mt-1 font-display text-2xl font-bold text-espresso sm:text-3xl">
                    {confirmedOrder.orderCode}
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-warm-muted sm:text-sm">
                  Chi nhánh phục vụ:{' '}
                  <strong className="text-espresso">
                    {confirmedOrder.branchName}
                  </strong>
                </p>
              </div>

              {confirmedOrder.items.length > 0 && (
                <div className="space-y-2.5 rounded-2xl border border-olive-primary/12 bg-canvas-cream/70 p-4">
                  <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
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
                              <p className="text-warm-muted">
                                Size {item.size} • {item.sugarLevel}% đường •{' '}
                                {item.iceLevel}% đá
                              </p>
                              {item.toppings.length > 0 && (
                                <p className="font-semibold text-artichoke">
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
                          <p className="font-semibold text-warm-muted">
                            SL: {item.quantity}{' '}
                            {item.kind === 'snack' ? 'phần' : 'ly'}
                          </p>
                        </div>
                        <span className="shrink-0 font-bold text-terracotta sm:text-sm">
                          {formatVnd(item.lineTotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2 rounded-2xl border border-olive-primary/12 bg-canvas-cream/70 p-4 text-xs sm:text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-warm-muted">Người nhận:</span>
                  <span className="font-semibold text-espresso">
                    {confirmedOrder.customerName} •{' '}
                    {confirmedOrder.customerPhone}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-warm-muted">Giao đến:</span>
                  <span className="text-right font-semibold text-espresso">
                    {confirmedOrder.deliveryAddress}
                  </span>
                </div>
                {confirmedOrder.note && (
                  <div className="flex justify-between gap-2">
                    <span className="text-warm-muted">Ghi chú:</span>
                    <span className="text-right font-medium text-espresso">
                      {confirmedOrder.note}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <span className="text-warm-muted">Thanh toán:</span>
                  <span className="font-semibold text-espresso">
                    {PAYMENT_METHOD_LABELS[confirmedOrder.paymentMethod]}
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-t border-olive-primary/12 pt-2">
                  <span className="font-bold text-espresso">
                    Tổng thanh toán:
                  </span>
                  <span className="font-bold text-terracotta">
                    {formatVnd(confirmedOrder.grandTotal)}
                  </span>
                </div>
              </div>

              {confirmedOrder.paymentMethod === 'qr' && (
                <VietQrTransferCard
                  amount={confirmedOrder.grandTotal}
                  transferContent={`OMSUA ${confirmedOrder.orderCode} ${confirmedOrder.customerPhone}`}
                />
              )}

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    const orderSnapshot = confirmedOrder;
                    handleClose();
                    onTrackOrder?.(orderSnapshot);
                  }}
                  className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-2xl border border-olive-primary/25 bg-card-butter px-5 py-3 text-sm font-bold text-olive-primary transition hover:opacity-92"
                >
                  Theo dõi trạng thái đơn
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-2xl bg-terracotta px-5 py-3 text-sm font-bold text-surface-light shadow-xs transition hover:opacity-92 sm:text-base"
                >
                  Tiếp tục đặt món
                </button>
              </div>
            </div>
          ) : lines.length === 0 && unavailableItems.length === 0 ? (
            <div className="space-y-3 rounded-3xl border border-olive-primary/12 bg-canvas-cream/65 p-8 text-center">
              <p className="font-display text-lg font-bold text-espresso">
                Giỏ hàng của bạn đang trống
              </p>
              <p className="text-xs leading-relaxed text-warm-muted sm:text-sm">
                Chọn một ly Trà Sữa Atiso hoặc Bánh Tráng Đà Lạt để bắt đầu lên
                đơn nhé!
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 inline-flex min-h-11 cursor-pointer items-center rounded-full bg-terracotta px-5 py-2.5 text-xs font-bold text-surface-light transition hover:opacity-92 sm:text-sm"
              >
                Khám phá thực đơn
              </button>
            </div>
          ) : (
            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="space-y-4"
            >
              {unavailableItems.length > 0 && (
                <div className="space-y-3 rounded-2xl border border-coral-sketch bg-coral-sketch/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold tracking-wider text-terracotta uppercase">
                        ⚠ CÓ MÓN TRONG GIỎ VỪA TẠM HẾT
                      </p>
                      <p className="text-xs text-espresso">
                        Vui lòng gỡ món tạm hết để tiếp tục xác nhận đặt đơn.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeUnavailableItems();
                        setErrorMessage(null);
                      }}
                      className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-terracotta px-3.5 py-1.5 text-xs font-bold text-surface-light transition hover:opacity-92 sm:min-h-9"
                    >
                      Gỡ món tạm hết
                    </button>
                  </div>

                  <ul className="space-y-2 border-t border-coral-sketch/40 pt-2.5">
                    {unavailableItems.map((item) => (
                      <li
                        key={item.key}
                        className="flex items-center justify-between gap-3 rounded-xl border border-olive-primary/12 bg-surface-light/85 px-3 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-espresso">
                            {item.productName}{' '}
                            <span className="font-normal text-warm-muted">
                              (SL: {item.quantity})
                            </span>
                          </p>
                          <p className="text-warm-muted">{item.reason}</p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Xóa món tạm hết ${item.productName}`}
                          onClick={() => {
                            removeItem(item.key);
                            if (unavailableItems.length <= 1) {
                              setErrorMessage((prev) =>
                                prev && /tạm hết/i.test(prev) ? null : prev,
                              );
                            }
                          }}
                          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center px-3 text-xs font-semibold text-terracotta underline-offset-2 hover:underline"
                        >
                          Xóa
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {lines.length > 0 && (
                <div className="space-y-3">
                  {lines.map((line) => (
                    <article
                      key={line.canonicalKey}
                      className="flex gap-3.5 rounded-2xl border border-olive-primary/12 bg-canvas-cream/65 p-3.5"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                        <ProductMedia
                          productId={line.productId}
                          categoryId={
                            line.kind === 'snack' ? 'snack' : undefined
                          }
                          variant={line.kind === 'snack' ? 'snack' : 'card'}
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-editorial text-base leading-snug font-semibold text-espresso">
                              {line.productName}
                            </h3>
                            <span className="shrink-0 text-sm font-bold text-terracotta">
                              {formatVnd(line.lineTotal)}
                            </span>
                          </div>

                          {line.kind === 'drink' ? (
                            <>
                              <p className="text-xs text-warm-muted">
                                Size {line.size} • {line.sugarLevel}% đường •{' '}
                                {line.iceLevel}% đá
                              </p>
                              {line.toppings.length > 0 && (
                                <p className="text-xs font-semibold text-artichoke">
                                  +{' '}
                                  {line.toppings
                                    .map(
                                      (topping) =>
                                        `${topping.shortName} (+${formatShortPrice(topping.price)})`,
                                    )
                                    .join(', ')}
                                </p>
                              )}
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
                              <p className="text-xs font-semibold text-subhead-ochre">
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
                                updateQuantity(
                                  line.canonicalKey,
                                  line.quantity - 1,
                                )
                              }
                              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-xs font-bold text-warm-muted hover:text-espresso"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-espresso">
                              SL: {line.quantity}{' '}
                              {line.kind === 'snack' ? 'phần' : 'ly'}
                            </span>
                            <button
                              type="button"
                              aria-label={`Tăng số lượng ${line.productName}`}
                              disabled={line.quantity >= 99}
                              onClick={() =>
                                updateQuantity(
                                  line.canonicalKey,
                                  line.quantity + 1,
                                )
                              }
                              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-xs font-bold text-terracotta hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            aria-label={`Xóa ${line.productName}`}
                            onClick={() => removeItem(line.canonicalKey)}
                            className="inline-flex min-h-11 cursor-pointer items-center px-3 text-xs font-semibold text-warm-muted underline-offset-2 hover:text-terracotta hover:underline"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="space-y-2 rounded-2xl border border-olive-primary/15 bg-card-butter p-4">
                <p className="text-[11px] font-bold tracking-wider text-olive-primary uppercase">
                  📍 CHI NHÁNH PHỤC VỤ GẦN BẠN NHẤT
                </p>
                <p className="text-sm font-bold text-espresso">
                  Ốm Sữa — {selectedBranch.address}
                </p>
                <p className="text-xs text-warm-muted">
                  {deliveryEta} • Hotline: {selectedBranch.hotline}
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setIsBranchPickerOpen((prev) => !prev)}
                    className="mt-1 inline-flex min-h-11 cursor-pointer items-center rounded-full border border-olive-primary/20 bg-surface-light px-3.5 py-1.5 text-xs font-semibold text-espresso transition hover:bg-canvas-cream"
                  >
                    Đổi chi nhánh khác
                  </button>
                </div>

                {isBranchPickerOpen && (
                  <div className="mt-2 space-y-1.5 border-t border-olive-primary/15 pt-2.5">
                    {branches.map((branch) => {
                      const isActive = branch.id === selectedBranch.id;
                      return (
                        <button
                          key={branch.id}
                          type="button"
                          onClick={() => {
                            setSelectedBranchId(branch.id);
                            setIsBranchPickerOpen(false);
                          }}
                          className={`flex min-h-11 w-full cursor-pointer flex-col items-start justify-center rounded-xl border px-3 py-2 text-left text-xs transition ${
                            isActive
                              ? 'border-hero-espresso bg-hero-espresso text-surface-light'
                              : 'border-olive-primary/15 bg-surface-light text-espresso hover:bg-canvas-cream'
                          }`}
                        >
                          <span className="font-bold">{branch.name}</span>
                          <span
                            className={
                              isActive ? 'text-card-butter' : 'text-warm-muted'
                            }
                          >
                            {branch.address}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-2xl border border-olive-primary/12 bg-canvas-cream/65 p-4">
                <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
                  THÔNG TIN GIAO HÀNG TẬN NƠI
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label
                      htmlFor={nameInputId}
                      className="block text-xs font-semibold text-espresso"
                    >
                      Họ và tên người nhận
                    </label>
                    <input
                      id={nameInputId}
                      name="customerName"
                      type="text"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Ví dụ: Nguyễn Lan"
                      className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-surface-light px-3 py-2 text-base text-espresso placeholder:text-warm-muted/70 focus:border-olive-primary focus:outline-none sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={phoneInputId}
                      className="block text-xs font-semibold text-espresso"
                    >
                      Số điện thoại
                    </label>
                    <input
                      id={phoneInputId}
                      name="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder="09xxxxxxxx"
                      className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-surface-light px-3 py-2 text-base text-espresso placeholder:text-warm-muted/70 focus:border-olive-primary focus:outline-none sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor={addressInputId}
                    className="block text-xs font-semibold text-espresso"
                  >
                    Địa chỉ giao hàng
                  </label>
                  <input
                    id={addressInputId}
                    name="deliveryAddress"
                    type="text"
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã tại Đà Lạt hoặc Đức Trọng"
                    className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-surface-light px-3 py-2 text-base text-espresso placeholder:text-warm-muted/70 focus:border-olive-primary focus:outline-none sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor={noteInputId}
                    className="block text-xs font-semibold text-espresso"
                  >
                    Ghi chú đơn hàng
                  </label>
                  <input
                    id={noteInputId}
                    name="note"
                    type="text"
                    maxLength={300}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Ví dụ: Ít ngọt hơn, gọi khi tới cổng (không bắt buộc)"
                    className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-surface-light px-3 py-2 text-base text-espresso placeholder:text-warm-muted/70 focus:border-olive-primary focus:outline-none sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-olive-primary/12 bg-canvas-cream/75 p-4 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-warm-muted">
                    Tạm tính ({totals.totalItems} món):
                  </span>
                  <span className="font-bold text-espresso">
                    {formatVnd(totals.subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-warm-muted">{shippingFeeLabel}</span>
                  <span className="font-bold text-artichoke">Miễn phí</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-warm-muted">
                    Dụng cụ ống hút &amp; ly giấy thân thiện:
                  </span>
                  <span className="font-bold text-espresso">0đ</span>
                </div>

                <div className="flex items-center justify-between border-t border-olive-primary/12 pt-2.5">
                  <span className="font-display text-base font-bold text-espresso">
                    Tổng thanh toán:
                  </span>
                  <span className="text-lg font-extrabold text-terracotta">
                    {formatVnd(totals.grandTotal)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {PAYMENT_METHODS.map((method) => {
                    const isActive = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setPaymentMethod(method)}
                        className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-bold transition sm:text-sm ${
                          isActive
                            ? 'border-hero-espresso bg-hero-espresso text-surface-light shadow-2xs'
                            : 'border-olive-primary/20 bg-canvas-cream/70 text-espresso hover:bg-card-butter/45'
                        }`}
                      >
                        <span aria-hidden="true">{isActive ? '●' : '○'}</span>
                        <span>{PAYMENT_METHOD_LABELS[method]}</span>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'qr' && totals.grandTotal > 0 && (
                  <VietQrTransferCard
                    amount={totals.grandTotal}
                    transferContent={`OMSUA ${normalizedPhone || 'SDT'}`}
                  />
                )}
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-2xl border border-coral-sketch bg-coral-sketch/20 px-4 py-2.5 text-xs font-semibold text-espresso"
                >
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    unavailableItems.length > 0 ||
                    lines.length === 0
                  }
                  className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-terracotta px-5 py-3.5 text-sm font-bold text-surface-light shadow-xs transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-65 sm:text-base"
                >
                  {isSubmitting
                    ? 'Đang xử lý đơn hàng...'
                    : `Xác nhận đặt món • ${formatVnd(totals.grandTotal)} →`}
                </button>

                <p className="text-center text-xs text-warm-muted">
                  Cam kết trà ủ mới &amp; bánh tráng trộn ngay khi lên đơn
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

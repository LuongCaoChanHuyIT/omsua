'use client';

import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  SPICE_LEVEL_LABELS,
  type CreateOrderPayload,
  type OrderRecord,
  type PaymentMethod,
  formatShortPrice,
  formatVnd,
} from '@omsua/shared';
import { type FormEvent, useCallback, useEffect, useId, useState } from 'react';
import { ProductIllustration } from '@/components/artwork/OmSuaArtwork';
import { submitOrder } from '@/lib/api';
import { useCart } from '@/store/cart-store';

export type SubmitOrderHandler = (
  payload: CreateOrderPayload,
  baseUrl?: string,
) => Promise<{ ok: true; order: OrderRecord } | { ok: false; error: string }>;

export interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl?: string;
  submitOrderFn?: SubmitOrderHandler;
}

const VN_PHONE_REGEX = /^0\d{9,10}$/;

export function CartCheckoutDrawer({
  isOpen,
  onClose,
  apiBaseUrl,
  submitOrderFn,
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
    updateQuantity,
    removeItem,
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
    setIsBranchPickerOpen(false);
    setErrorMessage(null);
    setConfirmedOrder(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, isOpen]);

  if (!isOpen) {
    return null;
  }

  const normalizedPhone = customerPhone.replace(/[\s.-]/g, '');
  const deliveryEta = 'Giao tận nơi dự kiến 15–20 phút';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

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
        return;
      }

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
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="h-full w-full max-w-xl overflow-y-auto border-l border-olive-primary/15 bg-surface-light p-5 text-espresso shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
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
            onClick={handleClose}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-olive-primary/15 bg-canvas-cream text-sm font-bold text-espresso transition hover:bg-card-butter/70"
          >
            ✕
          </button>
        </div>

        {confirmedOrder ? (
          <div className="space-y-5">
            <div className="rounded-3xl border border-olive-primary/15 bg-card-butter p-5 space-y-3">
              <span className="inline-flex items-center rounded-full bg-artichoke px-3 py-1 text-xs font-bold tracking-wide text-surface-light uppercase">
                ✓ ĐẶT MÓN THÀNH CÔNG
              </span>
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

            <div className="rounded-2xl border border-olive-primary/12 bg-canvas-cream/70 p-4 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-warm-muted">Người nhận:</span>
                <span className="font-semibold text-espresso">
                  {confirmedOrder.customerName} • {confirmedOrder.customerPhone}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-warm-muted">Giao đến:</span>
                <span className="text-right font-semibold text-espresso">
                  {confirmedOrder.deliveryAddress}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-warm-muted">Thanh toán:</span>
                <span className="font-semibold text-espresso">
                  {PAYMENT_METHOD_LABELS[confirmedOrder.paymentMethod]}
                </span>
              </div>
              <div className="flex justify-between gap-2 border-t border-olive-primary/12 pt-2">
                <span className="font-bold text-espresso">Tổng thanh toán:</span>
                <span className="font-bold text-terracotta">
                  {formatVnd(confirmedOrder.grandTotal)}
                </span>
              </div>
              {confirmedOrder.paymentMethod === 'qr' && (
                <p className="mt-2 rounded-xl bg-card-butter/75 px-3 py-2 text-xs font-semibold text-olive-primary">
                  Nội dung chuyển khoản: OMSUA {confirmedOrder.orderCode}{' '}
                  {confirmedOrder.customerPhone}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full cursor-pointer rounded-2xl bg-terracotta px-5 py-3.5 text-sm font-bold text-surface-light shadow-xs transition hover:opacity-92 sm:text-base"
            >
              Tiếp tục đặt món
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="rounded-3xl border border-olive-primary/12 bg-canvas-cream/65 p-8 text-center space-y-3">
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
              className="mt-2 inline-flex cursor-pointer items-center rounded-full bg-terracotta px-5 py-2.5 text-xs font-bold text-surface-light transition hover:opacity-92 sm:text-sm"
            >
              Khám phá thực đơn
            </button>
          </div>
        ) : (
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <div className="space-y-3">
              {lines.map((line) => (
                <article
                  key={line.canonicalKey}
                  className="flex gap-3.5 rounded-2xl border border-olive-primary/12 bg-canvas-cream/65 p-3.5"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <ProductIllustration
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
                      <div className="inline-flex items-center gap-2 rounded-full border border-olive-primary/15 bg-surface-light px-2.5 py-1">
                        <button
                          type="button"
                          aria-label={`Giảm số lượng ${line.productName}`}
                          onClick={() =>
                            updateQuantity(line.canonicalKey, line.quantity - 1)
                          }
                          className="cursor-pointer px-1 text-xs font-bold text-warm-muted hover:text-espresso"
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
                          onClick={() =>
                            updateQuantity(line.canonicalKey, line.quantity + 1)
                          }
                          className="cursor-pointer px-1 text-xs font-bold text-terracotta hover:opacity-80"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        aria-label={`Xóa ${line.productName}`}
                        onClick={() => removeItem(line.canonicalKey)}
                        className="cursor-pointer text-xs font-semibold text-warm-muted underline-offset-2 hover:text-terracotta hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-2xl border border-olive-primary/15 bg-card-butter p-4 space-y-2">
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
                  className="mt-1 inline-flex cursor-pointer items-center rounded-full border border-olive-primary/20 bg-surface-light px-3.5 py-1 text-xs font-semibold text-espresso transition hover:bg-canvas-cream"
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
                        className={`flex w-full cursor-pointer flex-col items-start rounded-xl border px-3 py-2 text-left text-xs transition ${
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

            <div className="rounded-2xl border border-olive-primary/12 bg-canvas-cream/65 p-4 space-y-3">
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
                    type="text"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Ví dụ: Nguyễn Lan"
                    className="w-full rounded-xl border border-olive-primary/20 bg-surface-light px-3 py-2 text-xs text-espresso placeholder:text-warm-muted/70 focus:border-olive-primary focus:outline-none sm:text-sm"
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
                    type="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="09xxxxxxxx"
                    className="w-full rounded-xl border border-olive-primary/20 bg-surface-light px-3 py-2 text-xs text-espresso placeholder:text-warm-muted/70 focus:border-olive-primary focus:outline-none sm:text-sm"
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
                  type="text"
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã tại Đà Lạt hoặc Đức Trọng"
                  className="w-full rounded-xl border border-olive-primary/20 bg-surface-light px-3 py-2 text-xs text-espresso placeholder:text-warm-muted/70 focus:border-olive-primary focus:outline-none sm:text-sm"
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
                  type="text"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Ví dụ: Ít ngọt hơn, gọi khi tới cổng (không bắt buộc)"
                  className="w-full rounded-xl border border-olive-primary/20 bg-surface-light px-3 py-2 text-xs text-espresso placeholder:text-warm-muted/70 focus:border-olive-primary focus:outline-none sm:text-sm"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-olive-primary/12 bg-canvas-cream/75 p-4 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-warm-muted">
                  Tạm tính ({totals.totalItems} món):
                </span>
                <span className="font-bold text-espresso">
                  {formatVnd(totals.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-warm-muted">
                  Phí giao hàng nội thành Đà Lạt:
                </span>
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

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                {PAYMENT_METHODS.map((method) => {
                  const isActive = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setPaymentMethod(method)}
                      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-bold transition sm:text-sm ${
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

              {paymentMethod === 'qr' && (
                <div className="rounded-2xl border border-olive-primary/15 bg-card-butter/70 px-3.5 py-2.5 text-xs font-medium text-espresso">
                  Nội dung chuyển khoản dự kiến:{' '}
                  <strong className="font-bold text-olive-primary">
                    OMSUA {normalizedPhone || 'SDT'}
                  </strong>{' '}
                  • Hiển thị mã chuyển khoản sau khi xác nhận đơn
                </div>
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
                disabled={isSubmitting}
                className="w-full cursor-pointer rounded-2xl bg-terracotta px-5 py-3.5 text-sm font-bold text-surface-light shadow-xs transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-65 sm:text-base"
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
  );
}

'use client';

import {
  ICE_LEVEL_LABELS,
  ICE_LEVELS,
  SPICE_LEVEL_LABELS,
  SPICE_LEVELS,
  SUGAR_LEVEL_LABELS,
  SUGAR_LEVELS,
  type IceLevel,
  type OrderItemInput,
  type ProductItem,
  type ProductSizeCode,
  type SpiceLevel,
  type SugarLevel,
  type ToppingItem,
  formatCustomizerBreakdown,
  formatShortPrice,
  formatVnd,
  resolveOrderLine,
} from '@omsua/shared';
import { type KeyboardEvent, useId, useMemo, useRef, useState } from 'react';
import { ProductMedia } from '@/components/artwork/ProductMedia';
import { useModalAccessibility } from '@/hooks/use-modal-accessibility';
import { useOptionalCart } from '@/store/cart-store';

export interface ProductCustomizerModalProps {
  product: ProductItem | null;
  toppings: ToppingItem[];
  defaultSpice?: SpiceLevel;
  initialToppingIds?: string[];
  onClose: () => void;
  onAddToCart?: (item: OrderItemInput) => void;
}

interface CustomizerDialogBodyProps {
  product: ProductItem;
  toppings: ToppingItem[];
  defaultSpice: SpiceLevel;
  initialToppingIds?: string[];
  onClose: () => void;
  onAddToCart?: (item: OrderItemInput) => void;
}

function CustomizerDialogBody({
  product,
  toppings,
  defaultSpice,
  initialToppingIds,
  onClose,
  onAddToCart,
}: CustomizerDialogBodyProps) {
  const headingId = useId();
  const cart = useOptionalCart();
  const dialogRef = useModalAccessibility<HTMLDivElement>({
    isOpen: true,
    onClose,
  });

  const seededToppingIds = useMemo(() => {
    if (!initialToppingIds || initialToppingIds.length === 0) {
      return [];
    }
    const availableSet = new Set(
      toppings
        .filter((topping) => topping.isAvailable)
        .map((topping) => topping.id),
    );
    return Array.from(
      new Set(initialToppingIds.filter((id) => availableSet.has(id))),
    );
  }, [initialToppingIds, toppings]);

  const initialSize: ProductSizeCode = product.sizes[0]?.size ?? 'M';
  const [selectedSize, setSelectedSize] =
    useState<ProductSizeCode>(initialSize);
  const [sugarLevel, setSugarLevel] = useState<SugarLevel>('70');
  const [iceLevel, setIceLevel] = useState<IceLevel>('70');
  const [selectedToppingIds, setSelectedToppingIds] =
    useState<string[]>(seededToppingIds);
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>(defaultSpice);
  const [quantity, setQuantity] = useState<number>(1);
  const sizeButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedSizeOption = useMemo(() => {
    return (
      product.sizes.find((option) => option.size === selectedSize) ??
      product.sizes[0]!
    );
  }, [product.sizes, selectedSize]);

  const activeAvailableToppingIds = useMemo(() => {
    const availableSet = new Set(
      toppings
        .filter((topping) => topping.isAvailable)
        .map((topping) => topping.id),
    );
    return selectedToppingIds.filter((id) => availableSet.has(id));
  }, [selectedToppingIds, toppings]);

  const draftOrderItem = useMemo<OrderItemInput>(() => {
    if (product.kind === 'snack') {
      return {
        productId: product.id,
        quantity,
        size: selectedSizeOption.size,
        spiceLevel,
      };
    }

    return {
      productId: product.id,
      quantity,
      size: selectedSizeOption.size,
      sugarLevel,
      iceLevel,
      toppingIds: activeAvailableToppingIds,
    };
  }, [
    activeAvailableToppingIds,
    iceLevel,
    product.id,
    product.kind,
    quantity,
    selectedSizeOption.size,
    spiceLevel,
    sugarLevel,
  ]);

  const previewLine = useMemo(() => {
    const productsById = new Map([
      [product.id, { ...product, isAvailable: true }],
    ]);
    const toppingsById = new Map(
      toppings.map((topping) => [topping.id, topping]),
    );
    return resolveOrderLine(draftOrderItem, productsById, toppingsById);
  }, [draftOrderItem, product, toppings]);

  function toggleTopping(toppingId: string) {
    setSelectedToppingIds((prev) =>
      prev.includes(toppingId)
        ? prev.filter((id) => id !== toppingId)
        : [...prev, toppingId],
    );
  }

  function handleSizeKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let targetIndex = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      targetIndex = (currentIndex + 1) % product.sizes.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      targetIndex =
        (currentIndex - 1 + product.sizes.length) % product.sizes.length;
    }

    if (targetIndex < 0) {
      return;
    }

    event.preventDefault();
    const targetOption = product.sizes[targetIndex];
    if (targetOption) {
      setSelectedSize(targetOption.size);
      sizeButtonRefs.current[targetIndex]?.focus();
    }
  }

  function handleConfirm() {
    if (onAddToCart) {
      onAddToCart(draftOrderItem);
    } else {
      cart?.addItem(draftOrderItem);
    }
    onClose();
  }

  const dialogHeading =
    product.kind === 'drink'
      ? 'Tùy chỉnh ly của bạn'
      : 'Tùy chỉnh món ăn vặt';

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
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
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-olive-primary/15 bg-surface-light text-espresso shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-olive-primary/12 bg-surface-light px-5 py-4 sm:px-6">
          <h2
            id={headingId}
            className="font-display text-2xl font-bold tracking-tight text-espresso"
          >
            {dialogHeading}
          </h2>
          <button
            type="button"
            aria-label="Đóng tùy chỉnh"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-olive-primary/15 bg-canvas-cream text-sm font-bold text-espresso transition hover:bg-card-butter/70"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="flex items-center gap-4 rounded-2xl border border-olive-primary/15 bg-card-butter p-3.5 sm:p-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
              <ProductMedia
                productId={product.id}
                categoryId={product.categoryId}
                variant={product.kind === 'snack' ? 'snack' : 'card'}
              />
            </div>
            <div className="min-w-0 space-y-1">
              {product.isSignature && (
                <span className="inline-flex items-center rounded-full bg-artichoke px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-surface-light uppercase">
                  + SIGNATURE
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-espresso">
                {product.name}
              </h3>
              <p className="text-xs text-warm-muted sm:text-sm">
                {product.description}
              </p>
              <p className="pt-0.5 text-sm font-bold text-terracotta">
                Giá gốc: {formatVnd(selectedSizeOption.price)}
              </p>
            </div>
          </div>

          {product.kind === 'drink' ? (
            <div className="mt-5 space-y-5">
              <div className="space-y-2.5">
                <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
                  1. CHỌN SIZE LY (BẮT BUỘC)
                </p>
                <div
                  role="radiogroup"
                  aria-label="Chọn size ly"
                  className={`grid gap-2.5 ${
                    product.sizes.length === 1
                      ? 'grid-cols-1'
                      : 'grid-cols-1 sm:grid-cols-2'
                  }`}
                >
                  {product.sizes.map((option, index) => {
                    const isActive = selectedSizeOption.size === option.size;
                    return (
                      <button
                        key={option.size}
                        ref={(el) => {
                          sizeButtonRefs.current[index] = el;
                        }}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => setSelectedSize(option.size)}
                        onKeyDown={(event) => handleSizeKeyDown(event, index)}
                        className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition sm:text-sm ${
                          isActive
                            ? 'border-hero-espresso bg-hero-espresso text-surface-light shadow-2xs'
                            : 'border-olive-primary/20 bg-canvas-cream/70 text-espresso hover:bg-card-butter/45'
                        }`}
                      >
                        <span aria-hidden="true">{isActive ? '●' : '○'}</span>
                        <span>
                          {option.label} • {formatShortPrice(option.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
                  2. ĐỊNH LƯỢNG ĐƯỜNG (CHUẨN MENU ỐM)
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SUGAR_LEVELS.map((level) => {
                    const isActive = sugarLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setSugarLevel(level)}
                        className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border px-3 py-2.5 text-xs font-bold transition ${
                          isActive
                            ? 'border-terracotta bg-terracotta text-surface-light shadow-2xs'
                            : 'border-olive-primary/20 bg-canvas-cream/70 text-espresso hover:bg-card-butter/45'
                        }`}
                      >
                        {SUGAR_LEVEL_LABELS[level]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
                  3. ĐỊNH LƯỢNG ĐÁ
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ICE_LEVELS.map((level) => {
                    const isActive = iceLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setIceLevel(level)}
                        className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border px-3 py-2.5 text-xs font-bold transition ${
                          isActive
                            ? 'border-olive-primary bg-olive-primary text-surface-light shadow-2xs'
                            : 'border-olive-primary/20 bg-canvas-cream/70 text-espresso hover:bg-card-butter/45'
                        }`}
                      >
                        {ICE_LEVEL_LABELS[level]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
                  4. THÊM TOPPING NHÀ LÀM
                </p>
                <div className="space-y-2">
                  {toppings.map((topping) => {
                    const isChecked = activeAvailableToppingIds.includes(
                      topping.id,
                    );

                    return (
                      <label
                        key={topping.id}
                        className={`flex min-h-11 items-center justify-between gap-3 rounded-2xl border p-2.5 transition ${
                          !topping.isAvailable
                            ? 'cursor-not-allowed border-olive-primary/10 bg-canvas-cream/40 opacity-60'
                            : isChecked
                              ? 'cursor-pointer border-olive-primary/35 bg-card-butter'
                              : 'cursor-pointer border-olive-primary/12 bg-canvas-cream/65 hover:bg-card-butter/40'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl">
                            <ProductMedia
                              toppingId={topping.id}
                              categoryId="topping"
                              variant="topping"
                            />
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!topping.isAvailable}
                            onChange={() => toggleTopping(topping.id)}
                            className="peer sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition peer-focus-visible:ring-2 peer-focus-visible:ring-olive-primary peer-focus-visible:ring-offset-1 ${
                              isChecked
                                ? 'border-hero-espresso bg-hero-espresso text-surface-light'
                                : 'border-olive-primary/35 bg-surface-light text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                          <span className="truncate text-xs font-semibold text-espresso sm:text-sm">
                            {topping.name}
                          </span>
                        </div>

                        <span className="shrink-0 text-xs font-bold text-terracotta sm:text-sm">
                          {topping.isAvailable
                            ? `+${formatVnd(topping.price)}`
                            : 'Tạm hết'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="space-y-2.5">
                <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
                  1. CHỌN ĐỘ CAY CHUẨN ĐÀ LẠT
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {SPICE_LEVELS.map((level) => {
                    const isActive = spiceLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setSpiceLevel(level)}
                        className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border px-3 py-2.5 text-xs font-bold transition sm:text-sm ${
                          isActive
                            ? 'border-terracotta bg-terracotta text-surface-light shadow-2xs'
                            : 'border-olive-primary/20 bg-canvas-cream/70 text-espresso hover:bg-card-butter/45'
                        }`}
                      >
                        {SPICE_LEVEL_LABELS[level]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="rounded-2xl border border-olive-primary/12 bg-canvas-cream/65 px-4 py-3 text-xs font-medium text-warm-muted">
                Ăn kèm sốt tắc hành phi nhà làm • Trộn mới ngay khi lên đơn
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2.5 border-t border-olive-primary/12 bg-surface-light px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex min-h-11 items-center gap-1 rounded-2xl border border-olive-primary/20 bg-canvas-cream/80 px-1.5">
              <button
                type="button"
                aria-label="Giảm số lượng"
                disabled={quantity <= 1}
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-base font-bold text-warm-muted transition hover:text-espresso disabled:cursor-not-allowed disabled:opacity-40"
              >
                -
              </button>
              <span className="min-w-6 text-center text-sm font-bold text-espresso">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Tăng số lượng"
                disabled={quantity >= 99}
                onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-base font-bold text-terracotta transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-2xl bg-terracotta px-5 py-3 text-sm font-bold text-surface-light shadow-xs transition hover:opacity-92 sm:text-base"
            >
              Thêm vào giỏ • {formatVnd(previewLine.lineTotal)}
            </button>
          </div>

          <p
            aria-live="polite"
            className="text-center text-xs font-medium text-warm-muted"
          >
            {formatCustomizerBreakdown(previewLine)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProductCustomizerModal({
  product,
  toppings,
  defaultSpice = 'cay-vua',
  initialToppingIds,
  onClose,
  onAddToCart,
}: ProductCustomizerModalProps) {
  if (!product) {
    return null;
  }

  return (
    <CustomizerDialogBody
      key={`${product.id}:${defaultSpice}:${(initialToppingIds ?? []).join(',')}`}
      product={product}
      toppings={toppings}
      defaultSpice={defaultSpice}
      initialToppingIds={initialToppingIds}
      onClose={onClose}
      onAddToCart={onAddToCart}
    />
  );
}

'use client';

import {
  ICE_LEVEL_LABELS,
  ICE_LEVELS,
  SPICE_LEVEL_LABELS,
  SPICE_LEVELS,
  SUGAR_LEVEL_LABELS,
  SUGAR_LEVELS,
  type CustomizerDraftState,
  type IceLevel,
  type OrderItemInput,
  type OrderLineResolved,
  type ProductItem,
  type ProductSizeCode,
  type ProductSizeOption,
  type SpiceLevel,
  type SugarLevel,
  type ToppingItem,
  createCustomizerDraftState,
  draftStateToOrderItemInput,
  formatCustomizerBreakdown,
  formatShortPrice,
  formatVnd,
  reduceCustomizerDraftState,
  resolveOrderLine,
} from '@omsua/shared';
import {
  createContext,
  use,
  useCallback,
  useId,
  useMemo,
  useReducer,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { ProductMedia } from '@/components/artwork/ProductMedia';
import { useModalAccessibility } from '@/hooks/use-modal-accessibility';
import { useOptionalCart } from '@/store/cart-store';

export interface CustomizerActions {
  setSize: (size: ProductSizeCode) => void;
  setSugarLevel: (sugarLevel: SugarLevel) => void;
  setIceLevel: (iceLevel: IceLevel) => void;
  toggleTopping: (toppingId: string) => void;
  setSpiceLevel: (spiceLevel: SpiceLevel) => void;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  submit: () => void;
  close: () => void;
}

export interface CustomizerMeta {
  product: ProductItem;
  toppings: readonly ToppingItem[];
  preferIllustration: boolean;
  selectedSizeOption: ProductSizeOption;
  previewLine: OrderLineResolved;
  headingId: string;
}

export interface CustomizerContextValue {
  state: CustomizerDraftState;
  actions: CustomizerActions;
  meta: CustomizerMeta;
}

const CustomizerContext = createContext<CustomizerContextValue | null>(null);

export function useCustomizerContext(): CustomizerContextValue {
  const ctx = use(CustomizerContext);
  if (!ctx) {
    throw new Error(
      'Customizer subcomponents must be rendered within Customizer.Provider.',
    );
  }
  return ctx;
}

export interface CustomizerProviderProps {
  product: ProductItem;
  toppings?: readonly ToppingItem[];
  defaultSpice?: SpiceLevel;
  initialToppingIds?: readonly string[];
  preferIllustration?: boolean;
  onClose: () => void;
  onAddToCart?: (item: OrderItemInput) => void;
  children: ReactNode;
}

function CustomizerProviderInner({
  product,
  toppings = [],
  defaultSpice = 'cay-vua',
  initialToppingIds,
  preferIllustration = false,
  onClose,
  onAddToCart,
  children,
}: CustomizerProviderProps) {
  const headingId = useId();
  const cart = useOptionalCart();

  const [rawState, dispatch] = useReducer(
    reduceCustomizerDraftState,
    undefined,
    () =>
      createCustomizerDraftState(product, {
        initialSpiceLevel: defaultSpice,
        initialToppingIds,
        availableToppings: toppings,
      }),
  );

  const selectedSizeOption = useMemo<ProductSizeOption>(() => {
    return (
      product.sizes.find((option) => option.size === rawState.size) ??
      product.sizes[0]!
    );
  }, [product.sizes, rawState.size]);

  const normalizedState = useMemo<CustomizerDraftState>(() => {
    if (product.kind === 'snack') {
      return {
        ...rawState,
        size: selectedSizeOption.size,
        toppingIds: [],
      };
    }
    const availableSet = new Set(
      toppings
        .filter((topping) => topping.isAvailable)
        .map((topping) => topping.id),
    );
    return {
      ...rawState,
      size: selectedSizeOption.size,
      toppingIds: rawState.toppingIds.filter((id) => availableSet.has(id)),
    };
  }, [product.kind, rawState, selectedSizeOption.size, toppings]);

  const draftOrderItem = useMemo<OrderItemInput>(
    () => draftStateToOrderItemInput(normalizedState),
    [normalizedState],
  );

  const previewLine = useMemo<OrderLineResolved>(() => {
    const productsById = new Map([
      [product.id, { ...product, isAvailable: true }],
    ]);
    const toppingsById = new Map(
      toppings.map((topping) => [topping.id, topping]),
    );
    return resolveOrderLine(draftOrderItem, productsById, toppingsById);
  }, [draftOrderItem, product, toppings]);

  const setSize = useCallback(
    (size: ProductSizeCode) => dispatch({ type: 'SET_SIZE', size }),
    [],
  );
  const setSugarLevel = useCallback(
    (sugarLevel: SugarLevel) => dispatch({ type: 'SET_SUGAR', sugarLevel }),
    [],
  );
  const setIceLevel = useCallback(
    (iceLevel: IceLevel) => dispatch({ type: 'SET_ICE', iceLevel }),
    [],
  );
  const toggleTopping = useCallback(
    (toppingId: string) => dispatch({ type: 'TOGGLE_TOPPING', toppingId }),
    [],
  );
  const setSpiceLevel = useCallback(
    (spiceLevel: SpiceLevel) => dispatch({ type: 'SET_SPICE', spiceLevel }),
    [],
  );
  const incrementQuantity = useCallback(
    () => dispatch({ type: 'STEP_QUANTITY', delta: 1 }),
    [],
  );
  const decrementQuantity = useCallback(
    () => dispatch({ type: 'STEP_QUANTITY', delta: -1 }),
    [],
  );

  const submit = useCallback(() => {
    if (onAddToCart) {
      onAddToCart(draftOrderItem);
    } else {
      cart?.addItem(draftOrderItem);
    }
    onClose();
  }, [cart, draftOrderItem, onAddToCart, onClose]);

  const actions = useMemo<CustomizerActions>(
    () => ({
      setSize,
      setSugarLevel,
      setIceLevel,
      toggleTopping,
      setSpiceLevel,
      incrementQuantity,
      decrementQuantity,
      submit,
      close: onClose,
    }),
    [
      decrementQuantity,
      incrementQuantity,
      onClose,
      setIceLevel,
      setSize,
      setSpiceLevel,
      setSugarLevel,
      submit,
      toggleTopping,
    ],
  );

  const meta = useMemo<CustomizerMeta>(
    () => ({
      product,
      toppings,
      preferIllustration,
      selectedSizeOption,
      previewLine,
      headingId,
    }),
    [
      headingId,
      preferIllustration,
      previewLine,
      product,
      selectedSizeOption,
      toppings,
    ],
  );

  const contextValue = useMemo<CustomizerContextValue>(
    () => ({
      state: normalizedState,
      actions,
      meta,
    }),
    [actions, meta, normalizedState],
  );

  return (
    <CustomizerContext value={contextValue}>{children}</CustomizerContext>
  );
}

function CustomizerProvider(props: CustomizerProviderProps) {
  const resetKey = `${props.product.id}:${props.product.kind}:${props.defaultSpice ?? 'cay-vua'}:${(props.initialToppingIds ?? []).join(',')}`;
  return <CustomizerProviderInner key={resetKey} {...props} />;
}

function CustomizerDialog({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { actions, meta } = useCustomizerContext();
  const dialogRef = useModalAccessibility<HTMLDivElement>({
    isOpen: true,
    onClose: actions.close,
  });

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          actions.close();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-hero-espresso/55 p-4 backdrop-blur-xs"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={meta.headingId}
        tabIndex={-1}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-olive-primary/15 bg-surface-light text-espresso shadow-paper-lift"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-olive-primary/12 bg-surface-light px-5 py-4 sm:px-6">
          <h2
            id={meta.headingId}
            className="font-display text-2xl font-bold tracking-tight text-espresso"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Đóng tùy chỉnh"
            onClick={actions.close}
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-olive-primary/15 bg-canvas-cream text-sm font-bold text-espresso transition-colors hover:bg-card-butter/70"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          {children}
        </div>

        {footer}
      </div>
    </div>
  );
}

function CustomizerHeader() {
  const { meta } = useCustomizerContext();
  const { product, preferIllustration, selectedSizeOption } = meta;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-olive-primary/15 bg-card-butter p-3.5 sm:p-4">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
        <ProductMedia
          productId={product.id}
          categoryId={product.categoryId}
          variant={product.kind === 'snack' ? 'snack' : 'card'}
          preferIllustration={preferIllustration}
        />
      </div>
      <div className="min-w-0 space-y-1">
        {product.isSignature ? (
          <span className="inline-flex items-center rounded-full bg-artichoke-deep px-2.5 py-0.5 text-xs font-bold tracking-wide text-surface-light uppercase">
            + SIGNATURE
          </span>
        ) : null}
        <h3 className="font-display text-xl font-bold text-espresso">
          {product.name}
        </h3>
        <p className="text-xs text-warm-muted sm:text-sm">
          {product.description}
        </p>
        <p className="pt-0.5 text-sm font-bold text-terracotta-deep tabular-nums">
          Giá gốc: {formatVnd(selectedSizeOption.price)}
        </p>
      </div>
    </div>
  );
}

function CustomizerCupGauge() {
  const { state, meta } = useCustomizerContext();
  const sugarRatio = Math.max(0.06, Number(state.sugarLevel) / 100);
  const iceRatio = Math.max(0.06, Number(state.iceLevel) / 100);
  const iceSummaryText =
    state.iceLevel === '0' ? '0% đá riêng' : `${state.iceLevel}% đá`;

  return (
    <div
      data-testid="customizer-cup-gauge"
      className="space-y-2.5 rounded-2xl border border-olive-primary/14 bg-canvas-cream/80 p-3.5"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-warm-muted">Độ ngọt</span>
            <span className="font-bold text-terracotta-deep tabular-nums">
              {`${state.sugarLevel}% đường`}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-olive-primary/14">
            <div
              style={{ transform: `scaleX(${sugarRatio})` }}
              className="h-full w-full origin-left rounded-full bg-terracotta transition-transform duration-200"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-warm-muted">Mức đá</span>
            <span className="font-bold text-olive-primary tabular-nums">
              {iceSummaryText}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-olive-primary/14">
            <div
              style={{ transform: `scaleX(${iceRatio})` }}
              className="h-full w-full origin-left rounded-full bg-olive-primary transition-transform duration-200"
            />
          </div>
        </div>
      </div>

      {meta.previewLine.toppings.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-olive-primary/10 pt-2">
          <span className="text-xs font-semibold text-warm-muted">
            Topping:
          </span>
          {meta.previewLine.toppings.map((topping) => (
            <span
              key={topping.id}
              className="rounded-full bg-card-butter px-2.5 py-0.5 text-xs font-bold text-espresso"
            >
              {topping.shortName}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CustomizerSizeSelector() {
  const { actions, meta } = useCustomizerContext();
  const sizeButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { product, selectedSizeOption } = meta;

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
      actions.setSize(targetOption.size);
      sizeButtonRefs.current[targetIndex]?.focus();
    }
  }

  return (
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
              onClick={() => actions.setSize(option.size)}
              onKeyDown={(event) => handleSizeKeyDown(event, index)}
              className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold tabular-nums transition-colors sm:text-sm ${
                isActive
                  ? 'border-hero-espresso bg-hero-espresso text-surface-light'
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
  );
}

function CustomizerSugarSelector() {
  const { state, actions } = useCustomizerContext();

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
        2. ĐỊNH LƯỢNG ĐƯỜNG (CHUẨN MENU ỐM)
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SUGAR_LEVELS.map((level) => {
          const isActive = state.sugarLevel === level;
          return (
            <button
              key={level}
              type="button"
              aria-pressed={isActive}
              onClick={() => actions.setSugarLevel(level)}
              className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border px-3 py-2.5 text-xs font-bold tabular-nums transition-colors ${
                isActive
                  ? 'border-terracotta-deep bg-terracotta-deep text-surface-light'
                  : 'border-olive-primary/20 bg-canvas-cream/70 text-espresso hover:bg-card-butter/45'
              }`}
            >
              {SUGAR_LEVEL_LABELS[level]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CustomizerIceSelector() {
  const { state, actions } = useCustomizerContext();

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
        3. ĐỊNH LƯỢNG ĐÁ
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ICE_LEVELS.map((level) => {
          const isActive = state.iceLevel === level;
          return (
            <button
              key={level}
              type="button"
              aria-pressed={isActive}
              onClick={() => actions.setIceLevel(level)}
              className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border px-3 py-2.5 text-xs font-bold tabular-nums transition-colors ${
                isActive
                  ? 'border-olive-primary bg-olive-primary text-surface-light'
                  : 'border-olive-primary/20 bg-canvas-cream/70 text-espresso hover:bg-card-butter/45'
              }`}
            >
              {ICE_LEVEL_LABELS[level]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CustomizerToppingPicker() {
  const { state, actions, meta } = useCustomizerContext();

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
        4. THÊM TOPPING NHÀ LÀM
      </p>
      <div className="space-y-2">
        {meta.toppings.map((topping) => {
          const isChecked = state.toppingIds.includes(topping.id);

          return (
            <label
              key={topping.id}
              className={`flex min-h-11 items-center justify-between gap-3 rounded-2xl border p-2.5 transition-colors ${
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
                    preferIllustration={meta.preferIllustration}
                  />
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={!topping.isAvailable}
                  onChange={() => actions.toggleTopping(topping.id)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-olive-primary peer-focus-visible:ring-offset-1 ${
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

              <span className="shrink-0 text-xs font-bold text-terracotta-deep tabular-nums sm:text-sm">
                {topping.isAvailable
                  ? `+${formatVnd(topping.price)}`
                  : 'Tạm hết'}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function CustomizerSpiceSelector() {
  const { state, actions } = useCustomizerContext();

  return (
    <div className="mt-5 space-y-4">
      <div className="space-y-2.5">
        <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
          1. CHỌN ĐỘ CAY CHUẨN ĐÀ LẠT
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {SPICE_LEVELS.map((level) => {
            const isActive = state.spiceLevel === level;
            return (
              <button
                key={level}
                type="button"
                aria-pressed={isActive}
                onClick={() => actions.setSpiceLevel(level)}
                className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border px-3 py-2.5 text-xs font-bold transition-colors sm:text-sm ${
                  isActive
                    ? 'border-terracotta-deep bg-terracotta-deep text-surface-light'
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
  );
}

function CustomizerFooter() {
  const { state, actions, meta } = useCustomizerContext();

  return (
    <div className="shrink-0 space-y-2.5 border-t border-olive-primary/12 bg-surface-light px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex min-h-11 items-center gap-1 rounded-2xl border border-olive-primary/20 bg-canvas-cream/80 px-1.5">
          <button
            type="button"
            aria-label="Giảm số lượng"
            disabled={state.quantity <= 1}
            onClick={actions.decrementQuantity}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-base font-bold text-warm-muted transition-colors hover:text-espresso disabled:cursor-not-allowed disabled:opacity-40"
          >
            -
          </button>
          <span className="min-w-6 text-center text-sm font-bold text-espresso tabular-nums">
            {state.quantity}
          </span>
          <button
            type="button"
            aria-label="Tăng số lượng"
            disabled={state.quantity >= 99}
            onClick={actions.incrementQuantity}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-base font-bold text-terracotta-deep transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={actions.submit}
          className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-2xl bg-terracotta-deep px-5 py-3 text-sm font-bold text-surface-light shadow-paper-rest tabular-nums transition-opacity hover:opacity-92 sm:text-base"
        >
          Thêm vào giỏ • {formatVnd(meta.previewLine.lineTotal)}
        </button>
      </div>

      <p
        aria-live="polite"
        className="text-center text-xs font-medium text-warm-muted tabular-nums"
      >
        {formatCustomizerBreakdown(meta.previewLine)}
      </p>
    </div>
  );
}

export const Customizer = {
  Provider: CustomizerProvider,
  Dialog: CustomizerDialog,
  Header: CustomizerHeader,
  CupGauge: CustomizerCupGauge,
  SizeSelector: CustomizerSizeSelector,
  SugarSelector: CustomizerSugarSelector,
  IceSelector: CustomizerIceSelector,
  ToppingPicker: CustomizerToppingPicker,
  SpiceSelector: CustomizerSpiceSelector,
  Footer: CustomizerFooter,
  useCustomizerContext,
};


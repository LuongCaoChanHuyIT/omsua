'use client';

import type {
  OrderItemInput,
  ProductItem,
  SpiceLevel,
  ToppingItem,
} from '@omsua/shared';
import { Customizer } from './customizer/CustomizerCompound';

export interface DrinkCustomizerModalProps {
  product: ProductItem;
  toppings: readonly ToppingItem[];
  initialToppingIds?: readonly string[];
  preferIllustration?: boolean;
  onClose: () => void;
  onAddToCart?: (item: OrderItemInput) => void;
}

export function DrinkCustomizerModal({
  product,
  toppings,
  initialToppingIds,
  preferIllustration = false,
  onClose,
  onAddToCart,
}: DrinkCustomizerModalProps) {
  return (
    <Customizer.Provider
      product={product}
      toppings={toppings}
      initialToppingIds={initialToppingIds}
      preferIllustration={preferIllustration}
      onClose={onClose}
      onAddToCart={onAddToCart}
    >
      <Customizer.Dialog
        title="Tùy chỉnh ly của bạn"
        footer={<Customizer.Footer />}
      >
        <Customizer.Header />
        <div className="mt-5 space-y-5">
          <Customizer.CupGauge />
          <Customizer.SizeSelector />
          <Customizer.SugarSelector />
          <Customizer.IceSelector />
          <Customizer.ToppingPicker />
        </div>
      </Customizer.Dialog>
    </Customizer.Provider>
  );
}

export interface SnackCustomizerModalProps {
  product: ProductItem;
  defaultSpice?: SpiceLevel;
  preferIllustration?: boolean;
  onClose: () => void;
  onAddToCart?: (item: OrderItemInput) => void;
}

export function SnackCustomizerModal({
  product,
  defaultSpice = 'cay-vua',
  preferIllustration = false,
  onClose,
  onAddToCart,
}: SnackCustomizerModalProps) {
  return (
    <Customizer.Provider
      product={product}
      defaultSpice={defaultSpice}
      preferIllustration={preferIllustration}
      onClose={onClose}
      onAddToCart={onAddToCart}
    >
      <Customizer.Dialog
        title="Tùy chỉnh món ăn vặt"
        footer={<Customizer.Footer />}
      >
        <Customizer.Header />
        <Customizer.SpiceSelector />
      </Customizer.Dialog>
    </Customizer.Provider>
  );
}

export interface ProductCustomizerModalProps {
  product: ProductItem | null;
  toppings: ToppingItem[];
  defaultSpice?: SpiceLevel;
  initialToppingIds?: string[];
  preferIllustration?: boolean;
  onClose: () => void;
  onAddToCart?: (item: OrderItemInput) => void;
}

export function ProductCustomizerModal({
  product,
  toppings,
  defaultSpice = 'cay-vua',
  initialToppingIds,
  preferIllustration = false,
  onClose,
  onAddToCart,
}: ProductCustomizerModalProps) {
  if (!product) {
    return null;
  }

  const resetKey = `${product.id}:${defaultSpice}:${(initialToppingIds ?? []).join(',')}`;

  if (product.kind === 'snack') {
    return (
      <SnackCustomizerModal
        key={resetKey}
        product={product}
        defaultSpice={defaultSpice}
        preferIllustration={preferIllustration}
        onClose={onClose}
        onAddToCart={onAddToCart}
      />
    );
  }

  return (
    <DrinkCustomizerModal
      key={resetKey}
      product={product}
      toppings={toppings}
      initialToppingIds={initialToppingIds}
      preferIllustration={preferIllustration}
      onClose={onClose}
      onAddToCart={onAddToCart}
    />
  );
}

'use client';

import { type ToppingItem, formatShortPrice } from '@omsua/shared';
import { memo, useCallback, useMemo } from 'react';
import { ProductMedia } from '@/components/artwork/ProductMedia';

interface ToppingChipCardProps {
  topping: ToppingItem;
  preferIllustration: boolean;
  onSelectById?: (toppingId: string) => void;
}

const ToppingChipCard = memo(function ToppingChipCard({
  topping,
  preferIllustration,
  onSelectById,
}: ToppingChipCardProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-olive-primary/12 bg-canvas-cream/70 p-3 text-center shadow-paper-rest">
      <div className="h-16 w-16 overflow-hidden rounded-xl">
        <ProductMedia
          toppingId={topping.id}
          categoryId="topping"
          variant="topping"
          preferIllustration={preferIllustration}
        />
      </div>
      <p className="mt-2 text-xs font-semibold text-espresso">
        {topping.shortName}
      </p>
      <span className="mt-0.5 text-xs font-bold text-terracotta-deep tabular-nums">
        +{formatShortPrice(topping.price)}
      </span>

      {onSelectById ? (
        <div className="mt-2.5 w-full pt-0.5">
          {topping.isAvailable ? (
            <button
              type="button"
              aria-label={`Chọn topping ${topping.shortName}`}
              onClick={() => onSelectById(topping.id)}
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-artichoke-deep px-3 py-1.5 text-xs font-bold text-surface-light transition-opacity hover:opacity-92"
            >
              + Chọn
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-full bg-warm-muted/25 px-3 py-1.5 text-xs font-semibold text-warm-muted"
            >
              Tạm hết
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
});

export interface ToppingStripSectionProps {
  toppings: ToppingItem[];
  onSelectTopping?: (topping: ToppingItem) => void;
  preferIllustration?: boolean;
}

export function ToppingStripSection({
  toppings,
  onSelectTopping,
  preferIllustration = false,
}: ToppingStripSectionProps) {
  const toppingsById = useMemo(
    () => new Map(toppings.map((item) => [item.id, item])),
    [toppings],
  );

  const handleSelectById = useCallback(
    (toppingId: string) => {
      if (!onSelectTopping) {
        return;
      }
      const found = toppingsById.get(toppingId);
      if (found) {
        onSelectTopping(found);
      }
    },
    [onSelectTopping, toppingsById],
  );

  return (
    <section className="rounded-3xl border border-olive-primary/14 bg-surface-light p-5 shadow-paper-rest sm:p-7">
      <div className="mb-4 flex flex-col gap-1.5 lg:flex-row lg:items-baseline lg:justify-between">
        <h2 className="font-display text-xl font-bold tracking-tight text-olive-primary uppercase sm:text-2xl">
          TOPPING NHÀ LÀM MỖI NGÀY
        </h2>
        <p className="text-xs font-semibold text-ochre-deep tabular-nums sm:text-sm">
          Định lượng Đường / Đá tùy chọn miễn phí: 70% (Chuẩn quán) | 50% | 30%
          | 0%
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {toppings.map((topping) => (
          <ToppingChipCard
            key={topping.id}
            topping={topping}
            preferIllustration={preferIllustration}
            onSelectById={onSelectTopping ? handleSelectById : undefined}
          />
        ))}
      </div>
    </section>
  );
}

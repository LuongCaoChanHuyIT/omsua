'use client';

import { type ToppingItem, formatShortPrice } from '@omsua/shared';
import { ProductIllustration } from '@/components/artwork/OmSuaArtwork';

export interface ToppingStripSectionProps {
  toppings: ToppingItem[];
  onSelectTopping?: (topping: ToppingItem) => void;
}

export function ToppingStripSection({
  toppings,
  onSelectTopping,
}: ToppingStripSectionProps) {
  return (
    <section className="rounded-3xl border border-olive-primary/12 bg-surface-light p-5 shadow-2xs sm:p-7">
      <div className="mb-4 flex flex-col gap-1.5 lg:flex-row lg:items-baseline lg:justify-between">
        <h2 className="font-display text-xl font-bold tracking-tight text-olive-primary uppercase sm:text-2xl">
          TOPPING NHÀ LÀM MỖI NGÀY
        </h2>
        <p className="text-xs font-semibold text-subhead-ochre sm:text-sm">
          Định lượng Đường / Đá tùy chọn miễn phí: 70% (Chuẩn quán) | 50% | 30%
          | 0%
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {toppings.map((topping) => (
          <div
            key={topping.id}
            className="flex flex-col items-center rounded-2xl border border-olive-primary/10 bg-canvas-cream/65 p-3 text-center"
          >
            <div className="h-16 w-16 overflow-hidden rounded-xl">
              <ProductIllustration
                toppingId={topping.id}
                categoryId="topping"
                variant="topping"
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-espresso">
              {topping.shortName}
            </p>
            <span className="mt-0.5 text-xs font-bold text-terracotta">
              +{formatShortPrice(topping.price)}
            </span>

            {onSelectTopping && (
              <div className="mt-2.5 w-full pt-0.5">
                {topping.isAvailable ? (
                  <button
                    type="button"
                    aria-label={`Chọn topping ${topping.shortName}`}
                    onClick={() => onSelectTopping(topping)}
                    className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-artichoke px-3 py-1.5 text-xs font-bold text-surface-light shadow-2xs transition hover:opacity-92"
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
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

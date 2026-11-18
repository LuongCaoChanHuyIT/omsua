import { type ToppingItem, formatShortPrice } from '@omsua/shared';
import { ProductIllustration } from '@/components/artwork/OmSuaArtwork';

export interface ToppingStripSectionProps {
  toppings: ToppingItem[];
}

export function ToppingStripSection({ toppings }: ToppingStripSectionProps) {
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
          </div>
        ))}
      </div>
    </section>
  );
}

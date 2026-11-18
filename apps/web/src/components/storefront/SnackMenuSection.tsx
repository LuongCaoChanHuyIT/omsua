'use client';

import {
  SPICE_LEVEL_LABELS,
  type ProductItem,
  type SpiceLevel,
  formatShortPrice,
} from '@omsua/shared';
import { ProductIllustration } from '@/components/artwork/OmSuaArtwork';

export interface SnackMenuSectionProps {
  snacks: ProductItem[];
  activeSpice: SpiceLevel;
  onChangeSpice: (spice: SpiceLevel) => void;
  onSelectSnack: (snack: ProductItem, spice: SpiceLevel) => void;
}

const SPICE_OPTIONS: Array<{ value: SpiceLevel; baseLabel: string }> = [
  { value: 'cay-nhieu', baseLabel: '🌶 Cay nhiều' },
  { value: 'cay-vua', baseLabel: 'Cay vừa' },
  { value: 'it-cay', baseLabel: 'Ít cay' },
];

export function SnackMenuSection({
  snacks,
  activeSpice,
  onChangeSpice,
  onSelectSnack,
}: SnackMenuSectionProps) {
  return (
    <section
      id="banh-trang"
      className="scroll-mt-24 rounded-3xl border border-olive-primary/12 bg-surface-light p-5 shadow-2xs sm:p-7"
    >
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="font-snack text-xl font-extrabold tracking-tight text-terracotta uppercase sm:text-2xl">
          ✦ BÁNH TRÁNG SNACK ĐÀ LẠT
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-warm-muted sm:text-sm">
            Ăn vặt chuẩn vị Đà Lạt • Chọn độ cay:
          </span>

          {SPICE_OPTIONS.map((option) => {
            const isActive = activeSpice === option.value;
            const pillLabel = isActive
              ? `${option.baseLabel} ✓`
              : option.baseLabel;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onChangeSpice(option.value)}
                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  isActive
                    ? 'bg-terracotta text-surface-light shadow-2xs'
                    : 'border border-olive-primary/15 bg-canvas-cream text-espresso hover:bg-card-butter/60'
                }`}
              >
                {pillLabel}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {snacks.map((snack) => {
          const price = snack.sizes[0]?.price ?? 0;

          return (
            <article
              key={snack.id}
              className="flex flex-col rounded-2xl border border-olive-primary/10 bg-canvas-cream/65 p-3"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                <ProductIllustration
                  productId={snack.id}
                  categoryId="snack"
                  variant="snack"
                />
                <span className="absolute top-2 left-2 rounded-full bg-coral-sketch px-2 py-0.5 text-[10px] font-bold text-surface-light">
                  {SPICE_LEVEL_LABELS[activeSpice]}
                </span>
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <span className="rounded-full bg-terracotta px-2.5 py-0.5 text-[11px] font-bold text-surface-light">
                    {formatShortPrice(price)}
                  </span>
                  {snack.isBestSeller && (
                    <span className="rounded-full bg-artichoke px-2 py-0.5 text-[9px] font-bold text-surface-light">
                      BEST SELLER
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-1 flex-col">
                <h3 className="font-editorial text-sm font-semibold text-espresso sm:text-base">
                  {snack.name}
                </h3>
                <p className="font-editorial text-[11px] italic text-warm-muted">
                  {snack.englishName}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-warm-muted">
                  {snack.description}
                </p>

                <div className="mt-auto pt-3">
                  {snack.isAvailable ? (
                    <button
                      type="button"
                      onClick={() => onSelectSnack(snack, activeSpice)}
                      className="w-full cursor-pointer rounded-full bg-hero-espresso px-3 py-2 text-xs font-bold text-surface-light transition hover:opacity-90"
                    >
                      + Thêm món ăn vặt
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-full bg-warm-muted/25 px-3 py-2 text-xs font-semibold text-warm-muted"
                    >
                      Tạm hết
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

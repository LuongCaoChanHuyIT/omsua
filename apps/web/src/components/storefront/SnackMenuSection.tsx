'use client';

import {
  SPICE_LEVEL_LABELS,
  type ProductItem,
  type SpiceLevel,
  formatShortPrice,
} from '@omsua/shared';
import { memo, startTransition, useCallback, useMemo } from 'react';
import { ProductMedia } from '@/components/artwork/ProductMedia';
import { AppViewTransition } from '@/components/transitions/AppViewTransition';

export interface SnackMenuSectionProps {
  snacks: ProductItem[];
  activeSpice: SpiceLevel;
  onChangeSpice: (spice: SpiceLevel) => void;
  onSelectSnack: (snack: ProductItem, spice: SpiceLevel) => void;
  preferIllustration?: boolean;
}

const SPICE_OPTIONS: Array<{ value: SpiceLevel; baseLabel: string }> = [
  { value: 'cay-nhieu', baseLabel: '🌶 Cay nhiều' },
  { value: 'cay-vua', baseLabel: 'Cay vừa' },
  { value: 'it-cay', baseLabel: 'Ít cay' },
];

interface SnackMenuItemCardProps {
  snack: ProductItem;
  activeSpice: SpiceLevel;
  preferIllustration: boolean;
  onSelectById: (snackId: string) => void;
}

export const SnackMenuItemCard = memo(function SnackMenuItemCard({
  snack,
  activeSpice,
  preferIllustration,
  onSelectById,
}: SnackMenuItemCardProps) {
  const price = snack.sizes[0]?.price ?? 0;

  return (
    <article className="flex flex-col rounded-2xl border border-olive-primary/12 bg-canvas-cream/70 p-3 shadow-paper-rest transition-colors hover:border-olive-primary/28">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl">
        <ProductMedia
          productId={snack.id}
          categoryId="snack"
          variant="snack"
          preferIllustration={preferIllustration}
        />
        <span className="absolute top-2 left-2 rounded-full bg-coral-sketch px-2.5 py-0.5 text-xs font-bold text-espresso">
          {SPICE_LEVEL_LABELS[activeSpice]}
        </span>
        <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-1">
          <span className="rounded-full bg-terracotta-deep px-2.5 py-0.5 text-xs font-bold text-surface-light tabular-nums">
            {formatShortPrice(price)}
          </span>
          {snack.isBestSeller ? (
            <span className="rounded-full bg-artichoke-deep px-2 py-0.5 text-xs font-bold text-surface-light">
              BEST SELLER
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="font-editorial text-sm font-semibold text-espresso sm:text-base">
          {snack.name}
        </h3>
        <p className="font-editorial text-xs italic text-warm-muted">
          {snack.englishName}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-warm-muted">
          {snack.description}
        </p>

        <div className="mt-auto pt-3">
          {snack.isAvailable ? (
            <button
              type="button"
              onClick={() => onSelectById(snack.id)}
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-hero-espresso px-3 py-2 text-xs font-bold text-surface-light transition-opacity hover:opacity-90"
            >
              + Thêm món ăn vặt
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-full bg-warm-muted/25 px-3 py-2 text-xs font-semibold text-warm-muted"
            >
              Tạm hết
            </button>
          )}
        </div>
      </div>
    </article>
  );
});

export function SnackMenuSection({
  snacks,
  activeSpice,
  onChangeSpice,
  onSelectSnack,
  preferIllustration = false,
}: SnackMenuSectionProps) {
  const snacksById = useMemo(
    () => new Map(snacks.map((snack) => [snack.id, snack])),
    [snacks],
  );

  const handleSelectById = useCallback(
    (snackId: string) => {
      const found = snacksById.get(snackId);
      if (found) {
        onSelectSnack(found, activeSpice);
      }
    },
    [activeSpice, onSelectSnack, snacksById],
  );

  return (
    <section
      id="banh-trang"
      className="scroll-mt-32 rounded-3xl border border-olive-primary/14 bg-surface-light p-5 shadow-paper-rest sm:p-7"
    >
      <div className="mb-5 flex flex-col gap-3 border-b border-olive-primary/12 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="font-snack text-xl font-extrabold tracking-tight text-terracotta-deep uppercase sm:text-2xl">
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
                onClick={() => {
                  startTransition(() => {
                    onChangeSpice(option.value);
                  });
                }}
                className={`relative isolate inline-flex min-h-11 cursor-pointer items-center rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-terracotta-deep text-surface-light shadow-paper-rest'
                    : 'border border-olive-primary/15 bg-canvas-cream text-espresso hover:bg-card-butter/60'
                }`}
              >
                {isActive ? (
                  <AppViewTransition
                    name="snack-spice-pill"
                    share="tab-pill"
                    default="none"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-3 bottom-1 h-[2.5px] rounded-full bg-card-butter"
                    />
                  </AppViewTransition>
                ) : null}
                {pillLabel}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {snacks.map((snack) => (
          <SnackMenuItemCard
            key={snack.id}
            snack={snack}
            activeSpice={activeSpice}
            preferIllustration={preferIllustration}
            onSelectById={handleSelectById}
          />
        ))}
      </div>
    </section>
  );
}

'use client';

import {
  type CategoryInfo,
  type DrinkCategoryId,
  type ProductItem,
  formatShortPrice,
} from '@omsua/shared';
import { ProductIllustration } from '@/components/artwork/OmSuaArtwork';

export interface DrinkMenuSectionProps {
  categories: CategoryInfo[];
  drinks: ProductItem[];
  activeCategory: DrinkCategoryId | 'all';
  onChangeCategory: (cat: DrinkCategoryId | 'all') => void;
  onSelectDrink: (drink: ProductItem) => void;
}

const CATEGORY_CONTAINER_STYLES: Record<DrinkCategoryId, string> = {
  'milk-tea': 'bg-card-butter border border-olive-primary/10',
  'fruit-tea': 'bg-card-sage border border-olive-primary/10',
  'fresh-milk-blended': 'bg-surface-light border border-olive-primary/12',
  coffee: 'bg-card-taupe border border-olive-primary/12',
};

const CATEGORY_CHIP_IDLE_STYLES: Record<DrinkCategoryId, string> = {
  'milk-tea': 'bg-card-butter text-espresso hover:opacity-90',
  'fruit-tea': 'bg-card-sage text-espresso hover:opacity-90',
  'fresh-milk-blended':
    'bg-surface-light text-espresso border border-olive-primary/15 hover:bg-canvas-cream',
  coffee: 'bg-card-taupe text-espresso hover:opacity-90',
};

function formatDrinkSizes(drink: ProductItem): string {
  return drink.sizes
    .map((option) => `${option.size}: ${formatShortPrice(option.price)}`)
    .join(' • ');
}

export function DrinkMenuSection({
  categories,
  drinks,
  activeCategory,
  onChangeCategory,
  onSelectDrink,
}: DrinkMenuSectionProps) {
  const visibleCategories =
    activeCategory === 'all'
      ? categories
      : categories.filter((category) => category.id === activeCategory);

  return (
    <section id="thuc-don" className="scroll-mt-24 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="font-display text-2xl font-bold tracking-tight text-olive-primary uppercase sm:text-[28px]">
          THỰC ĐƠN NGUYÊN BẢN ỐM SỮA
        </h2>

        <div
          role="group"
          aria-label="Bộ lọc nhóm thức uống"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            aria-pressed={activeCategory === 'all'}
            onClick={() => onChangeCategory('all')}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition sm:text-[13px] ${
              activeCategory === 'all'
                ? 'bg-hero-espresso text-surface-light'
                : 'border border-olive-primary/20 bg-surface-light text-espresso hover:bg-canvas-cream'
            }`}
          >
            {`Tất cả (${drinks.length})`}
          </button>

          {categories.map((category) => {
            const count = drinks.filter(
              (drink) => drink.categoryId === category.id,
            ).length;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onChangeCategory(category.id)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition sm:text-[13px] ${
                  isActive
                    ? 'bg-hero-espresso text-surface-light'
                    : CATEGORY_CHIP_IDLE_STYLES[category.id]
                }`}
              >
                {`${category.shortLabel} (${count})`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {visibleCategories.map((category) => {
          const categoryDrinks = drinks.filter(
            (drink) => drink.categoryId === category.id,
          );
          const isCreamContainer = category.id === 'fresh-milk-blended';

          return (
            <div
              key={category.id}
              className={`rounded-3xl p-5 sm:p-7 ${CATEGORY_CONTAINER_STYLES[category.id]}`}
            >
              <div className="mb-5 space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  {isCreamContainer && (
                    <span className="rounded-full bg-card-olive-gold px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-surface-light uppercase">
                      CREAM &amp; BLENDED
                    </span>
                  )}
                  <h3 className="font-display text-xl font-bold text-olive-primary sm:text-2xl">
                    {category.title}
                  </h3>
                </div>
                <p className="text-xs text-warm-muted sm:text-sm">
                  {category.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categoryDrinks.map((drink) => (
                  <article
                    key={drink.id}
                    className={`flex gap-3.5 rounded-2xl p-3.5 shadow-2xs transition ${
                      isCreamContainer
                        ? 'border border-olive-primary/14 bg-canvas-cream/60'
                        : 'border border-olive-primary/10 bg-surface-light'
                    }`}
                  >
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl sm:w-28">
                      <ProductIllustration
                        productId={drink.id}
                        categoryId={drink.categoryId}
                        variant="card"
                      />
                      {drink.isSignature && (
                        <span className="absolute top-1.5 left-1.5 rounded-full bg-artichoke px-2 py-0.5 text-[9px] font-bold tracking-wide text-surface-light">
                          + SIGNATURE
                        </span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <h4 className="font-editorial text-base leading-snug font-semibold text-espresso">
                          {drink.name}
                        </h4>
                        <p className="font-editorial text-xs italic text-warm-muted">
                          {drink.englishName}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-warm-muted">
                          {drink.description}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-terracotta sm:text-sm">
                          {formatDrinkSizes(drink)}
                        </span>

                        {drink.isAvailable ? (
                          <button
                            type="button"
                            onClick={() => onSelectDrink(drink)}
                            className="cursor-pointer rounded-full bg-terracotta px-3.5 py-1.5 text-xs font-bold text-surface-light transition hover:opacity-90"
                          >
                            + Thêm
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="cursor-not-allowed rounded-full bg-warm-muted/25 px-3.5 py-1.5 text-xs font-semibold text-warm-muted"
                          >
                            Tạm hết
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

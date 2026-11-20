'use client';

import {
  type CategoryInfo,
  type DrinkCategoryId,
  type ProductItem,
  formatShortPrice,
  normalizeVietnameseText,
} from '@omsua/shared';
import {
  memo,
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ProductMedia } from '@/components/artwork/ProductMedia';
import { AppViewTransition } from '@/components/transitions/AppViewTransition';

export type FlavorMoodId = 'all' | 'thanh-mat' | 'dam-vi' | 'tinh-tao';

export const FLAVOR_MOOD_OPTIONS: ReadonlyArray<{
  id: FlavorMoodId;
  label: string;
}> = [
  { id: 'all', label: 'Tất cả vị' },
  { id: 'thanh-mat', label: 'Thanh mát ít ngọt' },
  { id: 'dam-vi', label: 'Đậm trà béo mịn' },
  { id: 'tinh-tao', label: 'Tỉnh táo Cầu Đất' },
];

const CREAMY_RICH_IDS = new Set<string>([
  'tra-sua-atiso-chuoi',
  'tra-sua-flan-chay-canh',
  'tra-sua-tiramisu',
  'tra-sua-gao-rang-khuc-bach',
  'sua-tuoi-kem-trung-nuong',
  'sua-tuoi-duong-den',
  'oreo-tra-da-xay',
  'ca-phe-kem-tiramisu',
  'ca-phe-muoi',
  'bac-xiu-da-lat',
]);

function matchesFlavorMood(drink: ProductItem, mood: FlavorMoodId): boolean {
  if (mood === 'all') return true;
  if (mood === 'thanh-mat') {
    return (
      drink.categoryId === 'fruit-tea' ||
      drink.id === 'tra-sua-atiso' ||
      drink.id === 'oolong-sen-gung' ||
      drink.id === 'cold-brew-me'
    );
  }
  if (mood === 'dam-vi') {
    return CREAMY_RICH_IDS.has(drink.id);
  }
  return (
    drink.categoryId === 'coffee' ||
    drink.id === 'matcha-latte' ||
    drink.id === 'matcha-oreo-da-xay'
  );
}

export interface DrinkMenuSectionProps {
  categories: CategoryInfo[];
  drinks: ProductItem[];
  activeCategory: DrinkCategoryId | 'all';
  onChangeCategory: (cat: DrinkCategoryId | 'all') => void;
  onSelectDrink: (drink: ProductItem) => void;
  preferIllustration?: boolean;
  onToggleMediaMode?: (preferIllustration: boolean) => void;
  searchQuery?: string;
  onChangeSearchQuery?: (query: string) => void;
  activeMood?: FlavorMoodId;
  onChangeMood?: (mood: FlavorMoodId) => void;
}

const CATEGORY_CONTAINER_STYLES: Record<DrinkCategoryId, string> = {
  'milk-tea': 'bg-card-butter border border-olive-primary/12 shadow-paper-rest',
  'fruit-tea': 'bg-card-sage border border-olive-primary/12 shadow-paper-rest',
  'fresh-milk-blended':
    'bg-surface-light border border-olive-primary/14 shadow-paper-rest',
  coffee: 'bg-card-taupe border border-olive-primary/14 shadow-paper-rest',
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

interface DrinkMenuItemCardProps {
  drink: ProductItem;
  isCreamContainer: boolean;
  preferIllustration: boolean;
  onSelectById: (drinkId: string) => void;
}

export const DrinkMenuItemCard = memo(function DrinkMenuItemCard({
  drink,
  isCreamContainer,
  preferIllustration,
  onSelectById,
}: DrinkMenuItemCardProps) {
  return (
    <article
      className={`flex gap-3.5 rounded-2xl p-3.5 shadow-paper-rest transition-colors ${
        isCreamContainer
          ? 'border border-olive-primary/14 bg-canvas-cream/65 hover:border-olive-primary/30'
          : 'border border-olive-primary/10 bg-surface-light hover:border-olive-primary/28'
      }`}
    >
      <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl sm:w-28">
        <ProductMedia
          productId={drink.id}
          categoryId={drink.categoryId}
          variant="card"
          preferIllustration={preferIllustration}
        />
        {drink.isSignature ? (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-artichoke-deep px-2 py-0.5 text-xs font-bold tracking-wide text-surface-light">
            + SIGNATURE
          </span>
        ) : null}
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
          <span className="text-xs font-bold text-terracotta-deep tabular-nums sm:text-sm">
            {formatDrinkSizes(drink)}
          </span>

          {drink.isAvailable ? (
            <button
              type="button"
              onClick={() => onSelectById(drink.id)}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-terracotta-deep px-4 py-2 text-xs font-bold text-surface-light transition-opacity hover:opacity-90"
            >
              + Thêm
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 cursor-not-allowed items-center rounded-full bg-warm-muted/25 px-4 py-2 text-xs font-semibold text-warm-muted"
            >
              Tạm hết
            </button>
          )}
        </div>
      </div>
    </article>
  );
});

export function DrinkMenuSection({
  categories,
  drinks,
  activeCategory,
  onChangeCategory,
  onSelectDrink,
  preferIllustration = false,
  onToggleMediaMode,
  searchQuery,
  onChangeSearchQuery,
  activeMood,
  onChangeMood,
}: DrinkMenuSectionProps) {
  const [uncontrolledQuery, setUncontrolledQuery] = useState<string>('');
  const [uncontrolledMood, setUncontrolledMood] = useState<FlavorMoodId>('all');
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const effectiveQuery = searchQuery ?? uncontrolledQuery;
  const effectiveMood = activeMood ?? uncontrolledMood;
  const deferredQuery = useDeferredValue(effectiveQuery);

  useEffect(() => {
    function handleSlashShortcut(event: KeyboardEvent) {
      if (
        event.key !== '/' ||
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) {
        return;
      }
      event.preventDefault();
      searchInputRef.current?.focus();
    }

    window.addEventListener('keydown', handleSlashShortcut);
    return () => window.removeEventListener('keydown', handleSlashShortcut);
  }, []);

  const drinksById = useMemo(
    () => new Map(drinks.map((drink) => [drink.id, drink])),
    [drinks],
  );

  const handleSelectById = useCallback(
    (drinkId: string) => {
      const found = drinksById.get(drinkId);
      if (found) {
        onSelectDrink(found);
      }
    },
    [drinksById, onSelectDrink],
  );

  function handleQueryChange(next: string) {
    if (onChangeSearchQuery) {
      onChangeSearchQuery(next);
    } else {
      setUncontrolledQuery(next);
    }
  }

  function handleMoodChange(nextMood: FlavorMoodId) {
    startTransition(() => {
      if (onChangeMood) {
        onChangeMood(nextMood);
      } else {
        setUncontrolledMood(nextMood);
      }
    });
  }

  function handleCategoryClick(nextCat: DrinkCategoryId | 'all') {
    startTransition(() => {
      onChangeCategory(nextCat);
    });
  }

  const normalizedQuery = useMemo(
    () => normalizeVietnameseText(deferredQuery),
    [deferredQuery],
  );

  const visibleCategoryGroups = useMemo(() => {
    const candidateCategories =
      activeCategory === 'all'
        ? categories
        : categories.filter((category) => category.id === activeCategory);

    return candidateCategories
      .map((category) => {
        const categoryDrinks = drinks.filter((drink) => {
          if (drink.categoryId !== category.id) return false;
          if (!matchesFlavorMood(drink, effectiveMood)) return false;
          if (!normalizedQuery) return true;
          const haystack = normalizeVietnameseText(
            `${drink.name} ${drink.englishName} ${drink.description}`,
          );
          return haystack.includes(normalizedQuery);
        });
        return { category, categoryDrinks };
      })
      .filter(
        (group) =>
          (!normalizedQuery && effectiveMood === 'all') ||
          group.categoryDrinks.length > 0,
      );
  }, [activeCategory, categories, drinks, effectiveMood, normalizedQuery]);

  const totalVisibleDrinks = useMemo(
    () =>
      visibleCategoryGroups.reduce(
        (sum, group) => sum + group.categoryDrinks.length,
        0,
      ),
    [visibleCategoryGroups],
  );

  return (
    <section id="thuc-don" className="scroll-mt-24 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold tracking-tight text-olive-primary uppercase sm:text-[28px]">
            THỰC ĐƠN NGUYÊN BẢN ỐM SỮA
          </h2>
          <p className="text-xs text-warm-muted sm:text-sm">
            Trà ủ mới mỗi sáng từ bông Atiso xanh, nông sản Đà Lạt &amp; hạt cà
            phê Cầu Đất
          </p>
        </div>

        {onToggleMediaMode ? (
          <div
            role="group"
            aria-label="Chế độ hiển thị hình món"
            className="inline-flex self-start rounded-full border border-olive-primary/20 bg-surface-light p-1 shadow-paper-rest sm:self-auto"
          >
            <button
              type="button"
              aria-pressed={!preferIllustration}
              onClick={() => onToggleMediaMode(false)}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                !preferIllustration
                  ? 'bg-terracotta-deep text-surface-light'
                  : 'text-espresso hover:bg-canvas-cream'
              }`}
            >
              Ảnh thực tế
            </button>
            <button
              type="button"
              aria-pressed={preferIllustration}
              onClick={() => onToggleMediaMode(true)}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                preferIllustration
                  ? 'bg-olive-primary text-surface-light'
                  : 'text-espresso hover:bg-canvas-cream'
              }`}
            >
              Minh họa Studio
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-olive-primary/15 bg-canvas-cream/95 p-3 shadow-paper-rest backdrop-blur-md lg:sticky lg:top-[69px] lg:z-30 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex flex-1 items-center gap-2">
          <input
            ref={searchInputRef}
            type="search"
            name="drinkSearch"
            aria-label="Tìm nhanh thức uống"
            autoComplete="off"
            value={effectiveQuery}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Tìm món: atiso, me, kem trứng, khúc bạch…"
            className="min-h-11 w-full rounded-full border border-olive-primary/20 bg-surface-light px-4 py-2 text-base text-espresso placeholder:text-warm-muted/75 focus:border-olive-primary focus:outline-none lg:max-w-xs lg:pr-9 lg:text-xs"
          />
          <kbd
            aria-hidden="true"
            className="pointer-events-none hidden rounded-md border border-olive-primary/20 bg-canvas-cream px-1.5 py-0.5 text-xs font-bold text-warm-muted lg:inline-block"
          >
            /
          </kbd>
          <span
            role="status"
            aria-live="polite"
            className={
              normalizedQuery || effectiveMood !== 'all'
                ? 'shrink-0 rounded-full bg-card-butter px-3 py-1.5 text-xs font-bold text-olive-primary tabular-nums'
                : 'sr-only'
            }
          >
            {`Hiển thị ${totalVisibleDrinks} món`}
          </span>
        </div>

        <div
          role="group"
          aria-label="Bộ lọc nhóm thức uống"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            aria-pressed={activeCategory === 'all'}
            onClick={() => handleCategoryClick('all')}
            className={`relative isolate inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 py-2 text-xs font-bold tabular-nums transition-colors sm:text-[13px] ${
              activeCategory === 'all'
                ? 'bg-hero-espresso text-surface-light'
                : 'border border-olive-primary/20 bg-surface-light text-espresso hover:bg-canvas-cream'
            }`}
          >
            {activeCategory === 'all' ? (
              <AppViewTransition
                name="drink-category-pill"
                share="tab-pill"
                default="none"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-3.5 bottom-1 h-[2.5px] rounded-full bg-card-butter"
                />
              </AppViewTransition>
            ) : null}
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
                onClick={() => handleCategoryClick(category.id)}
                className={`relative isolate inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 py-2 text-xs font-bold tabular-nums transition-colors sm:text-[13px] ${
                  isActive
                    ? 'bg-hero-espresso text-surface-light'
                    : CATEGORY_CHIP_IDLE_STYLES[category.id]
                }`}
              >
                {isActive ? (
                  <AppViewTransition
                    name="drink-category-pill"
                    share="tab-pill"
                    default="none"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-3.5 bottom-1 h-[2.5px] rounded-full bg-card-butter"
                    />
                  </AppViewTransition>
                ) : null}
                {`${category.shortLabel} (${count})`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold tracking-wider text-ochre-deep uppercase">
          Gợi ý hợp vị:
        </span>
        <div
          role="group"
          aria-label="Gợi ý hợp vị theo tâm trạng"
          className="flex flex-wrap items-center gap-2"
        >
          {FLAVOR_MOOD_OPTIONS.map((option) => {
            const isMoodActive = effectiveMood === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isMoodActive}
                onClick={() => handleMoodChange(option.id)}
                className={`relative isolate inline-flex min-h-11 cursor-pointer items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  isMoodActive
                    ? 'bg-olive-primary text-surface-light shadow-paper-rest'
                    : 'border border-olive-primary/18 bg-surface-light/85 text-espresso hover:bg-card-butter/55'
                }`}
              >
                {isMoodActive ? (
                  <AppViewTransition
                    name="drink-mood-pill"
                    share="tab-pill"
                    default="none"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-3 bottom-1 h-[2px] rounded-full bg-card-butter"
                    />
                  </AppViewTransition>
                ) : null}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {totalVisibleDrinks === 0 ? (
        <div className="rounded-3xl border border-olive-primary/14 bg-surface-light p-8 text-center shadow-paper-rest">
          <p className="font-display text-lg font-bold text-espresso">
            {effectiveQuery.trim()
              ? `Chưa tìm thấy thức uống khớp từ khóa “${effectiveQuery.trim()}”`
              : 'Chưa có thức uống phù hợp với bộ lọc nhóm và khẩu vị đang chọn'}
          </p>
          <p className="mt-1 text-xs text-warm-muted sm:text-sm">
            Thử tìm theo nguyên liệu Đà Lạt như Atiso, dâu tằm, me, kem trứng
            hoặc xem lại toàn bộ thực đơn.
          </p>
          <button
            type="button"
            onClick={() => {
              startTransition(() => {
                handleQueryChange('');
                onChangeCategory('all');
                if (onChangeMood) {
                  onChangeMood('all');
                } else {
                  setUncontrolledMood('all');
                }
              });
            }}
            className="mt-4 inline-flex min-h-11 cursor-pointer items-center rounded-full bg-terracotta-deep px-5 py-2.5 text-xs font-bold text-surface-light transition-opacity hover:opacity-92 sm:text-sm"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleCategoryGroups.map(({ category, categoryDrinks }) => {
            const isCreamContainer = category.id === 'fresh-milk-blended';

            return (
              <div
                key={category.id}
                className={`rounded-3xl p-5 sm:p-7 ${CATEGORY_CONTAINER_STYLES[category.id]}`}
              >
                <div className="mb-5 space-y-1 border-b border-olive-primary/12 pb-3.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {isCreamContainer ? (
                      <span className="rounded-full bg-card-olive-gold px-2.5 py-0.5 text-xs font-bold tracking-wider text-espresso uppercase">
                        CREAM &amp; BLENDED
                      </span>
                    ) : null}
                    <h3 className="font-display text-xl font-bold text-olive-primary sm:text-2xl">
                      {category.title}
                    </h3>
                  </div>
                  <p className="text-xs text-espresso/85 sm:text-sm">
                    {category.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {categoryDrinks.map((drink) => (
                    <AppViewTransition key={drink.id}>
                      <DrinkMenuItemCard
                        drink={drink}
                        isCreamContainer={isCreamContainer}
                        preferIllustration={preferIllustration}
                        onSelectById={handleSelectById}
                      />
                    </AppViewTransition>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

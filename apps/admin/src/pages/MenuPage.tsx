import {
  formatVnd,
  getProductPhoto,
  type CatalogPayload,
  type ProductCategoryId,
  type ProductItem,
} from '@omsua/shared';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DirectionalPageTransition } from '../components/transitions/AppViewTransition';
import { fetchAdminCatalog, toggleProductAvailability } from '../lib/api';
import { normalizeVietnameseSearch } from '../lib/text';

type AvailabilityFilter = 'all' | 'available' | 'sold-out';
type CategoryFilter = 'all' | ProductCategoryId;

function formatSizesSummary(product: ProductItem): string {
  return product.sizes
    .map((option) =>
      option.size === 'STD'
        ? `Phần chuẩn: ${formatVnd(option.price)}`
        : `Size ${option.size}: ${formatVnd(option.price)}`,
    )
    .join(' • ');
}

function matchesProductFilter(
  product: ProductItem,
  availabilityFilter: AvailabilityFilter,
  normalizedQuery: string,
): boolean {
  if (availabilityFilter === 'available' && !product.isAvailable) {
    return false;
  }
  if (availabilityFilter === 'sold-out' && product.isAvailable) {
    return false;
  }
  if (!normalizedQuery) {
    return true;
  }

  return (
    normalizeVietnameseSearch(product.name).includes(normalizedQuery) ||
    normalizeVietnameseSearch(product.englishName).includes(normalizedQuery) ||
    normalizeVietnameseSearch(product.description).includes(normalizedQuery)
  );
}

interface ProductCardProps {
  product: ProductItem;
  toggling: boolean;
  onToggle: (product: ProductItem) => void;
}

const AdminProductCard = memo(function AdminProductCard({
  product,
  toggling,
  onToggle,
}: ProductCardProps) {
  const photo = getProductPhoto(product.id);
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  return (
    <article
      data-testid={`menu-product-${product.id}`}
      className={`flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-colors sm:p-5 ${
        product.isAvailable
          ? 'border-[#DDD4C0] bg-surface-light'
          : 'border-[#E6ABA6] bg-[#F3ECE6] opacity-90'
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {product.isSignature ? (
              <span className="rounded-full bg-card-olive-gold px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-espresso">
                Signature
              </span>
            ) : null}
            {product.isBestSeller ? (
              <span className="rounded-full border border-[#DEC98A] bg-card-butter px-2.5 py-0.5 text-xs font-semibold text-olive-primary">
                Bán chạy
              </span>
            ) : null}
            {product.isNew ? (
              <span className="rounded-full border border-[#E6B38E] bg-[#F6DFCE] px-2.5 py-0.5 text-xs font-semibold text-[#9A460B]">
                Món mới
              </span>
            ) : null}
            {photo ? (
              <span className="rounded-full border border-[#B4C488] bg-card-sage/65 px-2.5 py-0.5 text-xs font-semibold text-espresso">
                Ảnh thực tế
              </span>
            ) : null}
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
              product.isAvailable
                ? 'border-[#B4C488] bg-[#E3EAD1] text-[#45531B]'
                : 'border-[#E6ABA6] bg-[#F7DFDC] text-[#8F3530]'
            }`}
          >
            {product.isAvailable ? 'Còn món' : 'Tạm hết'}
          </span>
        </div>

        <div className="mt-3 flex items-start gap-3.5">
          {photo && !imageFailed ? (
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#DDD4C0] bg-canvas-cream">
              <img
                src={photo.src}
                alt=""
                aria-hidden="true"
                width={128}
                height={128}
                loading="lazy"
                decoding="async"
                onError={() => setImageFailed(true)}
                style={
                  photo.objectPosition
                    ? { objectPosition: photo.objectPosition }
                    : undefined
                }
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <h3 className="font-editorial text-lg font-semibold text-espresso">
              {product.name}
            </h3>
            <p className="font-editorial text-xs italic text-warm-muted">
              {product.englishName}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-espresso/85">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5DEC9] pt-3.5">
        <span className="text-xs font-bold text-terracotta tabular-nums sm:text-sm">
          {formatSizesSummary(product)}
        </span>

        <button
          type="button"
          disabled={toggling}
          onClick={() => onToggle(product)}
          className={`min-h-11 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-60 sm:text-sm ${
            product.isAvailable
              ? 'border border-coral-sketch bg-[#F7DFDC] text-[#8F3530] hover:bg-[#F2CECA]'
              : 'bg-artichoke text-surface-light shadow-xs hover:bg-[#66762F]'
          }`}
        >
          {product.isAvailable ? 'Tạm hết' : 'Mở bán lại'}
        </button>
      </div>
    </article>
  );
});

export function MenuPage() {
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>('all');
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>('all');
  const [togglingIds, setTogglingIds] = useState<Set<string>>(() => new Set());
  const requestSeqRef = useRef<number>(0);
  const mutationEpochRef = useRef<number>(0);

  const loadCatalog = useCallback(async () => {
    const seq = ++requestSeqRef.current;
    const mutEpoch = mutationEpochRef.current;
    setLoading(true);
    setError(null);
    const result = await fetchAdminCatalog();
    if (seq !== requestSeqRef.current) {
      return;
    }
    if (result.ok) {
      if (mutEpoch === mutationEpochRef.current) {
        setCatalog(result.data);
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    const seq = ++requestSeqRef.current;
    const mutEpoch = mutationEpochRef.current;
    setLoading(true);
    setError(null);

    void fetchAdminCatalog().then((result) => {
      if (!active || seq !== requestSeqRef.current) return;
      if (result.ok) {
        if (mutEpoch === mutationEpochRef.current) {
          setCatalog(result.data);
        }
      } else {
        setError(result.error);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const handleToggleProduct = async (product: ProductItem) => {
    mutationEpochRef.current += 1;
    setTogglingIds((prev) => {
      const next = new Set(prev);
      next.add(product.id);
      return next;
    });
    setError(null);
    const nextAvailability = !product.isAvailable;
    try {
      const result = await toggleProductAvailability(
        product.id,
        nextAvailability,
      );

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setCatalog((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          products: prev.products.map((item) =>
            item.id === product.id ? result.data : item,
          ),
        };
      });
    } finally {
      mutationEpochRef.current += 1;
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setAvailabilityFilter('all');
    setSelectedCategory('all');
  };

  const totalProducts = catalog?.products.length ?? 0;
  const availableCount =
    catalog?.products.filter((item) => item.isAvailable).length ?? 0;
  const soldOutCount = totalProducts - availableCount;

  const normalizedQuery = useMemo(
    () => normalizeVietnameseSearch(searchQuery),
    [searchQuery],
  );

  const visibleDrinkSections = useMemo(() => {
    if (!catalog) return [];
    return catalog.categories
      .filter(
        (category) =>
          selectedCategory === 'all' || selectedCategory === category.id,
      )
      .map((category) => ({
        category,
        products: catalog.products.filter(
          (product) =>
            product.categoryId === category.id &&
            matchesProductFilter(product, availabilityFilter, normalizedQuery),
        ),
      }))
      .filter((section) => section.products.length > 0);
  }, [catalog, selectedCategory, availabilityFilter, normalizedQuery]);

  const visibleSnacks = useMemo(() => {
    if (!catalog) return [];
    if (selectedCategory !== 'all' && selectedCategory !== 'snack') {
      return [];
    }
    return catalog.products.filter(
      (item) =>
        item.kind === 'snack' &&
        matchesProductFilter(item, availabilityFilter, normalizedQuery),
    );
  }, [catalog, selectedCategory, availabilityFilter, normalizedQuery]);

  const totalVisibleCount =
    visibleDrinkSections.reduce(
      (sum, section) => sum + section.products.length,
      0,
    ) + visibleSnacks.length;

  return (
    <DirectionalPageTransition>
      <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-subhead-ochre">
            Thực đơn 30 món chuẩn Đà Lạt
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-olive-primary sm:text-3xl">
            Quản lý Thực đơn &amp; Tình trạng Món
          </h1>
          <p className="mt-1 text-sm text-warm-muted">
            Bật/tắt nhanh trạng thái Còn món hoặc Tạm hết ngay tại quầy pha chế.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadCatalog()}
          disabled={loading}
          className="min-h-11 rounded-xl border border-[#D4C9B0] bg-surface-light px-4 py-2.5 text-sm font-semibold text-espresso transition-colors hover:border-olive-primary hover:bg-card-butter/50 disabled:opacity-60"
        >
          {loading ? 'Đang tải…' : 'Làm mới'}
        </button>
      </div>

      {catalog ? (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <button
              type="button"
              aria-pressed={availabilityFilter === 'all'}
              onClick={() => setAvailabilityFilter('all')}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                availabilityFilter === 'all'
                  ? 'border-olive-primary bg-surface-light shadow-xs'
                  : 'border-[#DDD4C0] bg-surface-light hover:border-olive-primary/60'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-warm-muted">
                Tổng danh mục món
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-espresso tabular-nums">
                {totalProducts} món
              </p>
            </button>
            <button
              type="button"
              aria-pressed={availabilityFilter === 'available'}
              onClick={() => setAvailabilityFilter('available')}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                availabilityFilter === 'available'
                  ? 'border-[#45531B] bg-[#E3EAD1] shadow-xs'
                  : 'border-[#B4C488] bg-[#E3EAD1]/70 hover:bg-[#E3EAD1]'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[#45531B]">
                Đang mở bán (Còn món)
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-[#45531B] tabular-nums">
                {availableCount} món
              </p>
            </button>
            <button
              type="button"
              aria-pressed={availabilityFilter === 'sold-out'}
              onClick={() => setAvailabilityFilter('sold-out')}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                availabilityFilter === 'sold-out'
                  ? 'border-[#8F3530] bg-[#F7DFDC] shadow-xs'
                  : 'border-[#E6ABA6] bg-[#F7DFDC]/70 hover:bg-[#F7DFDC]'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8F3530]">
                Đang khóa tạm (Tạm hết)
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-[#8F3530] tabular-nums">
                {soldOutCount} món
              </p>
            </button>
          </section>

          <section className="space-y-4 rounded-2xl border border-[#DDD4C0] bg-surface-light p-4 shadow-xs sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <input
                  id="menu-search"
                  name="menuSearch"
                  type="search"
                  aria-label="Tìm món trong thực đơn"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm tên món tiếng Việt, tiếng Anh, nguyên liệu…"
                  className="min-h-11 w-full rounded-xl border border-[#D4C9B0] bg-canvas-cream px-3.5 py-2.5 text-base text-espresso placeholder:text-warm-muted focus:border-olive-primary focus:outline-none sm:text-sm"
                />
                {searchQuery.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="min-h-11 shrink-0 rounded-xl border border-[#D4C9B0] bg-canvas-cream px-3.5 py-2 text-xs font-semibold text-espresso transition hover:border-olive-primary hover:bg-card-butter/60 sm:text-sm"
                  >
                    Xóa tìm
                  </button>
                ) : null}
              </div>

              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Lọc theo trạng thái món"
              >
                {(
                  [
                    {
                      value: 'all',
                      label: `Tất cả trạng thái (${totalProducts})`,
                    },
                    {
                      value: 'available',
                      label: `Đang bán (${availableCount})`,
                    },
                    {
                      value: 'sold-out',
                      label: `Đang tạm hết (${soldOutCount})`,
                    },
                  ] as const
                ).map((pill) => {
                  const isSelected = availabilityFilter === pill.value;
                  return (
                    <button
                      key={pill.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setAvailabilityFilter(pill.value)}
                      className={`min-h-11 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                        isSelected
                          ? 'bg-hero-espresso text-surface-light shadow-xs'
                          : 'border border-[#D8CEB8] bg-canvas-cream text-espresso hover:bg-card-butter/60'
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Lọc theo nhóm thực đơn"
            >
              <button
                type="button"
                aria-pressed={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
                className={`min-h-11 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                  selectedCategory === 'all'
                    ? 'bg-olive-primary text-surface-light shadow-xs'
                    : 'border border-[#D8CEB8] bg-canvas-cream text-espresso hover:bg-card-butter/60'
                }`}
              >
                Tất cả nhóm
              </button>
              {catalog.categories.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`min-h-11 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                      isSelected
                        ? 'bg-olive-primary text-surface-light shadow-xs'
                        : 'border border-[#D8CEB8] bg-canvas-cream text-espresso hover:bg-card-butter/60'
                    }`}
                  >
                    {category.shortLabel}
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={selectedCategory === 'snack'}
                onClick={() => setSelectedCategory('snack')}
                className={`min-h-11 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                  selectedCategory === 'snack'
                    ? 'bg-olive-primary text-surface-light shadow-xs'
                    : 'border border-[#D8CEB8] bg-canvas-cream text-espresso hover:bg-card-butter/60'
                }`}
              >
                Bánh tráng Snack
              </button>
            </div>
          </section>
        </>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-[#E6ABA6] bg-[#F7DFDC] px-5 py-4 text-sm text-[#8F3530]"
        >
          <p className="font-semibold">Không thể cập nhật thực đơn</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : null}

      {loading && !catalog ? (
        <div className="rounded-2xl border border-[#DDD4C0] bg-surface-light p-10 text-center text-sm text-warm-muted">
          Đang tải thực đơn Ốm Sữa…
        </div>
      ) : catalog && totalVisibleCount === 0 ? (
        <div className="rounded-2xl border border-[#DDD4C0] bg-surface-light p-10 text-center">
          <p className="font-editorial text-lg font-semibold text-espresso">
            Không tìm thấy món phù hợp với bộ lọc hiện tại
          </p>
          <p className="mt-1 text-sm text-warm-muted">
            Hãy thử từ khóa khác hoặc đặt lại bộ lọc để xem toàn bộ 30 món chuẩn
            Ốm Sữa.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 min-h-11 rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-surface-light shadow-xs transition hover:bg-[#C05C16]"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : catalog ? (
        <div className="space-y-8">
          {visibleDrinkSections.map(({ category, products }) => (
            <section key={category.id} className="space-y-4">
              <div
                className="rounded-2xl border border-[#D8CEB8] px-5 py-4"
                style={{ backgroundColor: category.accentBg }}
              >
                <h2 className="font-display text-lg font-bold text-olive-primary sm:text-xl">
                  {category.title}
                </h2>
                <p className="mt-0.5 text-xs font-medium text-espresso/80 sm:text-sm">
                  {category.subtitle}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {products.map((drink) => (
                  <AdminProductCard
                    key={drink.id}
                    product={drink}
                    toggling={togglingIds.has(drink.id)}
                    onToggle={(item) => void handleToggleProduct(item)}
                  />
                ))}
              </div>
            </section>
          ))}

          {visibleSnacks.length > 0 ? (
            <section className="space-y-4">
              <div className="rounded-2xl border border-[#E6ABA6] bg-[#F7DFDC]/75 px-5 py-4">
                <h2 className="font-snack text-lg font-extrabold uppercase tracking-wide text-terracotta sm:text-xl">
                  5. Bánh Tráng Snack Đà Lạt
                </h2>
                <p className="mt-0.5 text-xs font-medium text-espresso/80 sm:text-sm">
                  Bánh tráng trộn tóp mỡ, cơm cháy chà bông, cuốn bơ &amp; chấm
                  lòng đào nhâm nhi cùng trà sữa
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleSnacks.map((snack) => (
                  <AdminProductCard
                    key={snack.id}
                    product={snack}
                    toggling={togglingIds.has(snack.id)}
                    onToggle={(item) => void handleToggleProduct(item)}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
      </div>
    </DirectionalPageTransition>
  );
}

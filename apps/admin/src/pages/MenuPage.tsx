import {
  formatVnd,
  type CatalogPayload,
  type ProductItem,
} from '@omsua/shared';
import { useCallback, useEffect, useState } from 'react';
import { fetchAdminCatalog, toggleProductAvailability } from '../lib/api';

function formatSizesSummary(product: ProductItem): string {
  return product.sizes
    .map((option) =>
      option.size === 'STD'
        ? `Phần chuẩn: ${formatVnd(option.price)}`
        : `Size ${option.size}: ${formatVnd(option.price)}`,
    )
    .join(' • ');
}

interface ProductCardProps {
  product: ProductItem;
  toggling: boolean;
  onToggle: (product: ProductItem) => void;
}

function AdminProductCard({ product, toggling, onToggle }: ProductCardProps) {
  return (
    <article
      data-testid={`menu-product-${product.id}`}
      className={`flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition sm:p-5 ${
        product.isAvailable
          ? 'border-[#DDD4C0] bg-surface-light'
          : 'border-[#E6ABA6] bg-[#F3ECE6] opacity-90'
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {product.isSignature ? (
              <span className="rounded-full bg-card-olive-gold px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-surface-light">
                Signature
              </span>
            ) : null}
            {product.isBestSeller ? (
              <span className="rounded-full border border-[#DEC98A] bg-card-butter px-2.5 py-0.5 text-[11px] font-semibold text-olive-primary">
                Bán chạy
              </span>
            ) : null}
            {product.isNew ? (
              <span className="rounded-full bg-terracotta/15 px-2.5 py-0.5 text-[11px] font-semibold text-terracotta">
                Món mới
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

        <h3 className="mt-3 font-editorial text-lg font-semibold text-espresso">
          {product.name}
        </h3>
        <p className="font-editorial text-xs italic text-warm-muted">
          {product.englishName}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-espresso/85">
          {product.description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5DEC9] pt-3.5">
        <span className="text-xs font-bold text-terracotta sm:text-sm">
          {formatSizesSummary(product)}
        </span>

        <button
          type="button"
          disabled={toggling}
          onClick={() => onToggle(product)}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 sm:text-sm ${
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
}

export function MenuPage() {
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAdminCatalog();
    if (result.ok) {
      setCatalog(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    void fetchAdminCatalog().then((result) => {
      if (!active) return;
      if (result.ok) {
        setCatalog(result.data);
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
    setTogglingId(product.id);
    setError(null);
    const nextAvailability = !product.isAvailable;
    const result = await toggleProductAvailability(
      product.id,
      nextAvailability,
    );
    setTogglingId(null);

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
  };

  const totalProducts = catalog?.products.length ?? 0;
  const availableCount =
    catalog?.products.filter((item) => item.isAvailable).length ?? 0;
  const soldOutCount = totalProducts - availableCount;
  const snacks =
    catalog?.products.filter((item) => item.kind === 'snack') ?? [];

  return (
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
          className="rounded-xl border border-[#D4C9B0] bg-surface-light px-4 py-2.5 text-sm font-semibold text-espresso transition hover:border-olive-primary hover:bg-card-butter/50 disabled:opacity-60"
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {catalog ? (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#DDD4C0] bg-surface-light p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-warm-muted">
              Tổng danh mục món
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-espresso">
              {totalProducts} món
            </p>
          </div>
          <div className="rounded-2xl border border-[#B4C488] bg-[#E3EAD1]/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#45531B]">
              Đang mở bán (Còn món)
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-[#45531B]">
              {availableCount} món
            </p>
          </div>
          <div className="rounded-2xl border border-[#E6ABA6] bg-[#F7DFDC]/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8F3530]">
              Đang khóa tạm (Tạm hết)
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-[#8F3530]">
              {soldOutCount} món
            </p>
          </div>
        </section>
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
          Đang tải thực đơn Ốm Sữa...
        </div>
      ) : catalog ? (
        <div className="space-y-8">
          {catalog.categories.map((category) => {
            const categoryDrinks = catalog.products.filter(
              (product) => product.categoryId === category.id,
            );
            return (
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
                  {categoryDrinks.map((drink) => (
                    <AdminProductCard
                      key={drink.id}
                      product={drink}
                      toggling={togglingId === drink.id}
                      onToggle={(item) => void handleToggleProduct(item)}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          <section className="space-y-4">
            <div className="rounded-2xl border border-[#E6ABA6] bg-[#F7DFDC]/75 px-5 py-4">
              <h2 className="font-snack text-lg font-extrabold uppercase tracking-wide text-terracotta sm:text-xl">
                5. Bánh Tráng Snack Đà Lạt
              </h2>
              <p className="mt-0.5 text-xs font-medium text-espresso/80 sm:text-sm">
                Bánh tráng trộn tóp mỡ, cơm cháy chà bông, cuốn bơ &amp; chấm lòng
                đào nhâm nhi cùng trà sữa
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {snacks.map((snack) => (
                <AdminProductCard
                  key={snack.id}
                  product={snack}
                  toggling={togglingId === snack.id}
                  onToggle={(item) => void handleToggleProduct(item)}
                />
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

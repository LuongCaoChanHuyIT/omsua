'use client';

import { type ProductItem, formatShortPrice } from '@omsua/shared';
import {
  AtisoMascot,
  ProductIllustration,
} from '@/components/artwork/OmSuaArtwork';

export interface HeroSpotlightProps {
  spotlightProducts: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
}

function formatSpotlightPriceLabel(product: ProductItem): string {
  if (product.sizes.length === 1) {
    const single = product.sizes[0]!;
    return `Size ${single.size}: ${formatShortPrice(single.price)}`;
  }
  return product.sizes
    .map((option) => `${option.size}: ${formatShortPrice(option.price)}`)
    .join(' • ');
}

export function HeroSpotlight({
  spotlightProducts,
  onSelectProduct,
}: HeroSpotlightProps) {
  return (
    <section
      id="hero"
      className="scroll-mt-24 rounded-3xl border border-olive-primary/12 bg-surface-light p-6 shadow-xs sm:p-8 lg:p-10"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-6">
          <span className="inline-flex items-center rounded-full bg-card-butter px-3.5 py-1 text-xs font-bold tracking-wide text-olive-primary">
            ✦ TRÀ SỮA CỦA NGƯỜI ĐÀ LẠT
          </span>

          <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-espresso sm:text-4xl lg:text-[40px]">
            <span className="block">Mộc mạc • Tinh tế</span>
            <span className="mt-1 block text-olive-primary">
              Đậm vị Atiso nguyên bản
            </span>
          </h1>

          <p className="max-w-xl font-editorial text-sm leading-relaxed text-warm-muted sm:text-base">
            Tiên phong nấu trà từ bông Atiso xanh tươi Đà Lạt, hòa quyện cùng lá
            trà nguyên bản, sữa tươi thanh trùng và trân châu nhà làm nấu mới
            mỗi ngày từ năm 2017.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#thuc-don"
              className="inline-flex min-h-11 items-center rounded-full bg-terracotta px-6 py-2.5 text-sm font-bold text-surface-light shadow-xs transition hover:opacity-92"
            >
              Đặt món ngay →
            </a>
            <a
              href="#chi-nhanh"
              className="inline-flex min-h-11 items-center rounded-full border border-olive-primary/25 bg-surface-light px-5 py-2.5 text-sm font-semibold text-espresso transition hover:bg-canvas-cream"
            >
              Xem 4 chi nhánh
            </a>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-olive-primary/10 bg-canvas-cream/75 p-3.5 sm:p-4">
            <AtisoMascot className="h-18 w-18 shrink-0 sm:h-20 sm:w-20" />
            <div className="min-w-0 space-y-1">
              <p className="font-quote text-xl leading-snug font-bold text-olive-primary sm:text-2xl">
                “Trà sữa của người Đà Lạt — Ngọt lành tự nhiên từ 2017”
              </p>
              <p className="text-xs font-medium text-warm-muted">
                ✓ 100% Atiso Đà Lạt • ✓ Trân châu nhà làm • ✓ Đường chuẩn 70%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-hero-espresso p-4 text-surface-light sm:p-5 lg:col-span-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {spotlightProducts.map((product) => {
              const badgeLabel = product.isBestSeller
                ? '★ BEST SELLER'
                : product.isNew
                  ? '★ MÓN MỚI'
                  : '✦ SIGNATURE';
              const badgeClass = product.isBestSeller
                ? 'bg-artichoke text-surface-light'
                : 'bg-terracotta text-surface-light';

              return (
                <article
                  key={product.id}
                  className="flex flex-col rounded-2xl border border-surface-light/12 bg-surface-light/6 p-3.5"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                    <ProductIllustration
                      productId={product.id}
                      categoryId={product.categoryId}
                      variant="spotlight"
                    />
                    <span
                      className={`absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${badgeClass}`}
                    >
                      {badgeLabel}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <h2 className="font-editorial text-lg font-semibold text-surface-light">
                      {product.name}
                    </h2>
                    <p className="text-xs text-card-taupe">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="text-xs font-bold text-card-butter">
                      {formatSpotlightPriceLabel(product)}
                    </span>

                    {product.isAvailable ? (
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-terracotta px-3.5 py-1.5 text-xs font-bold text-surface-light transition hover:opacity-92 sm:min-h-9"
                      >
                        + Đặt ngay
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex min-h-11 cursor-not-allowed items-center rounded-full bg-warm-muted/40 px-3.5 py-1.5 text-xs font-semibold text-surface-light/65 sm:min-h-9"
                      >
                        Tạm hết
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

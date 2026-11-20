'use client';

import { type ProductItem, formatShortPrice } from '@omsua/shared';
import { DalatMorningMistCanvas } from '@/components/artwork/DalatMorningMistCanvas';
import { AtisoMascot } from '@/components/artwork/OmSuaArtwork';
import { ProductMedia } from '@/components/artwork/ProductMedia';

export interface HeroSpotlightProps {
  spotlightProducts: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
  preferIllustration?: boolean;
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
  preferIllustration = false,
}: HeroSpotlightProps) {
  return (
    <section
      id="hero"
      className="scroll-mt-24 rounded-3xl border border-olive-primary/18 bg-surface-light p-6 shadow-paper-rest sm:p-8 lg:p-10"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-olive-primary/22 pb-3 text-xs font-semibold tracking-wider text-ochre-deep uppercase">
        <span>BẢN KHẮC THỰC ĐƠN CAO NGUYÊN • TỪ 2017</span>
        <span className="tabular-nums">CẦU ĐẤT — ĐÀ LẠT • 1.500M</span>
      </div>
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-card-butter px-3.5 py-1 text-xs font-bold tracking-wide text-olive-primary">
              ✦ TRÀ SỮA CỦA NGƯỜI ĐÀ LẠT
            </span>
            <span className="inline-flex items-center rounded-full border border-olive-primary/20 bg-canvas-cream px-3 py-1 text-xs font-semibold tracking-wider text-espresso">
              ĐÀ LẠT • 1.500M
            </span>
          </div>

          <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-espresso sm:text-4xl lg:text-[40px]">
            <span className="block">Mộc mạc • Tinh tế</span>
            <span className="mt-1 block text-olive-primary">
              Đậm vị Atiso nguyên bản
            </span>
          </h1>

          <p className="max-w-[60ch] font-editorial text-sm leading-relaxed text-pretty text-warm-muted sm:text-base">
            Tiên phong nấu trà từ bông Atiso xanh tươi Đà Lạt, hòa quyện cùng lá
            trà nguyên bản, sữa tươi thanh trùng và trân châu nhà làm nấu mới
            mỗi ngày từ năm 2017.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#thuc-don"
              className="inline-flex min-h-11 items-center rounded-full bg-terracotta-deep px-6 py-2.5 text-sm font-bold text-surface-light shadow-paper-rest transition-opacity hover:opacity-92"
            >
              Đặt món ngay →
            </a>
            <a
              href="#chi-nhanh"
              className="inline-flex min-h-11 items-center rounded-full border border-olive-primary/25 bg-surface-light px-5 py-2.5 text-sm font-semibold text-espresso transition-colors hover:bg-canvas-cream"
            >
              Xem 4 chi nhánh
            </a>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-olive-primary/12 bg-canvas-cream/80 p-3.5 sm:p-4">
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

        <div className="relative overflow-hidden rounded-3xl bg-hero-espresso p-4 text-surface-light shadow-paper-lift sm:p-5 lg:col-span-6">
          <DalatMorningMistCanvas seed={2017} />

          <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {spotlightProducts.map((product, index) => {
              const badgeLabel = product.isBestSeller
                ? '★ BEST SELLER'
                : product.isNew
                  ? '★ MÓN MỚI'
                  : '✦ SIGNATURE';
              const badgeClass = product.isBestSeller
                ? 'bg-artichoke-deep text-surface-light'
                : 'bg-terracotta-deep text-surface-light';

              return (
                <article
                  key={product.id}
                  className="flex flex-col rounded-2xl border border-surface-light/14 bg-hero-espresso/80 p-3.5 backdrop-blur-xs"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                    <ProductMedia
                      productId={product.id}
                      categoryId={product.categoryId}
                      variant="spotlight"
                      priority={index === 0}
                      preferIllustration={preferIllustration}
                    />
                    <span
                      className={`absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${badgeClass}`}
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
                    <span className="text-xs font-bold text-card-butter tabular-nums">
                      {formatSpotlightPriceLabel(product)}
                    </span>

                    {product.isAvailable ? (
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-terracotta-deep px-4 py-2 text-xs font-bold text-surface-light transition-opacity hover:opacity-92"
                      >
                        + Đặt ngay
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex min-h-11 cursor-not-allowed items-center rounded-full bg-warm-muted/40 px-4 py-2 text-xs font-semibold text-surface-light/65"
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

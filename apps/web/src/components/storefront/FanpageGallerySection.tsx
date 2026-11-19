'use client';
/* eslint-disable @next/next/no-img-element */

import {
  FANPAGE_GALLERY_ITEMS,
  OMSUA_SOCIAL_LINKS,
  type FanpageGalleryCategory,
} from '@omsua/shared';
import { useMemo, useState } from 'react';
import { PhotoLightboxModal } from '@/components/modals/PhotoLightboxModal';

const GALLERY_FILTERS: ReadonlyArray<{
  id: FanpageGalleryCategory;
  label: string;
}> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'khong-gian', label: 'Không gian Đà Lạt' },
  { id: 'thuc-uong', label: 'Trà sữa & Mùa hồng' },
  { id: 'banh-trang', label: 'Bánh tráng Nhà Ốm' },
];

export function FanpageGallerySection() {
  const [activeFilter, setActiveFilter] =
    useState<FanpageGalleryCategory>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedIds, setFailedIds] = useState<Set<string>>(() => new Set());

  const counts = useMemo(() => {
    const byCat: Record<FanpageGalleryCategory, number> = {
      all: FANPAGE_GALLERY_ITEMS.length,
      'khong-gian': 0,
      'thuc-uong': 0,
      'banh-trang': 0,
    };
    for (const item of FANPAGE_GALLERY_ITEMS) {
      byCat[item.category] += 1;
    }
    return byCat;
  }, []);

  const filteredItems = useMemo(
    () =>
      activeFilter === 'all'
        ? FANPAGE_GALLERY_ITEMS
        : FANPAGE_GALLERY_ITEMS.filter(
            (item) => item.category === activeFilter,
          ),
    [activeFilter],
  );

  return (
    <section
      id="khong-gian"
      className="scroll-mt-24 rounded-3xl border border-olive-primary/12 bg-surface-light p-6 shadow-2xs sm:p-8"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-card-butter px-3.5 py-1 text-xs font-bold tracking-wider text-olive-primary uppercase">
              ✦ ẢNH THỰC TẾ TỪ FANPAGE {OMSUA_SOCIAL_LINKS.handle}
            </span>
            <span className="inline-flex items-center rounded-full border border-olive-primary/18 bg-canvas-cream px-3 py-1 text-xs font-semibold text-espresso">
              ✓ {OMSUA_SOCIAL_LINKS.followersLabel} •{' '}
              {OMSUA_SOCIAL_LINKS.ratingLabel}
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold tracking-tight text-olive-primary sm:text-3xl">
            Góc tiệm nắng sớm &amp; Món ngon nhà Ốm tại Đà Lạt
          </h2>
          <p className="max-w-2xl text-xs leading-relaxed text-warm-muted sm:text-sm">
            Những khung hình chân thực được ghi lại mỗi ngày tại 4 cơ sở Đà Lạt
            &amp; Đức Trọng — nhấn vào từng ảnh để xem trọn vẹn chi tiết.
          </p>
        </div>

        <div
          role="group"
          aria-label="Lọc album ảnh thực tế"
          className="flex flex-wrap items-center gap-2"
        >
          {GALLERY_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setActiveFilter(filter.id);
                  setLightboxIndex(null);
                }}
                className={`inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 py-2 text-xs font-bold transition sm:min-h-10 ${
                  isActive
                    ? 'bg-hero-espresso text-surface-light shadow-2xs'
                    : 'border border-olive-primary/20 bg-canvas-cream text-espresso hover:bg-card-butter/65'
                }`}
              >
                {`${filter.label} (${counts[filter.id]})`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
        {filteredItems.map((item, index) => {
          const isFailed = failedIds.has(item.id);

          return (
            <button
              key={item.id}
              type="button"
              aria-label={`Xem ảnh lớn: ${item.title}`}
              onClick={() => setLightboxIndex(index)}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-olive-primary/12 bg-canvas-cream text-left shadow-2xs transition hover:border-olive-primary/35"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-hero-espresso/15">
                {isFailed ? (
                  <div className="flex h-full w-full items-center justify-center bg-card-butter/50 p-3 text-center text-xs font-semibold text-olive-primary">
                    {item.title}
                  </div>
                ) : (
                  <img
                    src={item.src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    onError={() =>
                      setFailedIds((prev) => {
                        const next = new Set(prev);
                        next.add(item.id);
                        return next;
                      })
                    }
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-3">
                <p className="line-clamp-1 font-editorial text-xs font-semibold text-espresso sm:text-sm">
                  {item.title}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-warm-muted">
                  {item.caption}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <PhotoLightboxModal
        items={filteredItems}
        activeIndex={lightboxIndex}
        onChangeIndex={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </section>
  );
}

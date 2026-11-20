'use client';
/* eslint-disable @next/next/no-img-element */

import {
  FANPAGE_GALLERY_ITEMS,
  OMSUA_SOCIAL_LINKS,
  type FanpageGalleryCategory,
} from '@omsua/shared';
import { startTransition, useMemo, useState } from 'react';
import { PhotoLightboxModal } from '@/components/modals/PhotoLightboxModal';
import { AppViewTransition } from '@/components/transitions/AppViewTransition';

const GALLERY_FILTERS: ReadonlyArray<{
  id: FanpageGalleryCategory;
  label: string;
}> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'khong-gian', label: 'Không gian Đà Lạt' },
  { id: 'thuc-uong', label: 'Trà sữa & Mùa hồng' },
  { id: 'banh-trang', label: 'Bánh tráng Nhà Ốm' },
];

const GALLERY_SHARE_TRANSITION = {
  'lightbox-next': 'none',
  'lightbox-prev': 'none',
  default: 'morph',
} as const;

export interface FanpageGallerySectionProps {
  onLightboxOpenChange?: (isOpen: boolean) => void;
}

export function FanpageGallerySection({
  onLightboxOpenChange,
}: FanpageGallerySectionProps = {}) {
  const [activeFilter, setActiveFilter] =
    useState<FanpageGalleryCategory>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedIds, setFailedIds] = useState<Set<string>>(() => new Set());

  function updateLightboxIndex(nextIndex: number | null) {
    setLightboxIndex(nextIndex);
    onLightboxOpenChange?.(nextIndex !== null);
  }

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
      className="scroll-mt-24 rounded-3xl border border-olive-primary/14 bg-surface-light p-6 shadow-paper-rest sm:p-8"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-card-butter px-3.5 py-1 text-xs font-bold tracking-wider text-olive-primary uppercase">
              ✦ ẢNH THỰC TẾ TỪ FANPAGE {OMSUA_SOCIAL_LINKS.handle}
            </span>
            <span className="inline-flex items-center rounded-full border border-olive-primary/18 bg-canvas-cream px-3 py-1 text-xs font-semibold text-espresso tabular-nums">
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
                  startTransition(() => {
                    setActiveFilter(filter.id);
                    updateLightboxIndex(null);
                  });
                }}
                className={`relative isolate inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 py-2 text-xs font-bold tabular-nums transition-colors ${
                  isActive
                    ? 'bg-hero-espresso text-surface-light'
                    : 'border border-olive-primary/20 bg-canvas-cream text-espresso hover:bg-card-butter/65'
                }`}
              >
                {isActive ? (
                  <AppViewTransition
                    name="gallery-filter-pill"
                    share="tab-pill"
                    default="none"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-3.5 bottom-1 h-[2.5px] rounded-full bg-card-butter"
                    />
                  </AppViewTransition>
                ) : null}
                {`${filter.label} (${counts[filter.id]})`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
        {filteredItems.map((item, index) => {
          const isFailed = failedIds.has(item.id);
          const isOpenInLightbox = lightboxIndex === index;
          const isLeadBento = activeFilter === 'all' && index === 0;
          const vtName = `gallery-photo-${item.id}`;
          const thumbnailNode = (
            <div
              data-vt-name={isOpenInLightbox ? undefined : vtName}
              className={`relative w-full overflow-hidden bg-hero-espresso/15 ${
                isLeadBento ? 'aspect-[4/5] sm:aspect-auto sm:flex-1' : 'aspect-[4/5]'
              }`}
            >
              {isFailed ? (
                <span
                  aria-hidden="true"
                  className="flex h-full w-full items-center justify-center bg-card-butter/50 p-3 text-center text-xs font-semibold text-olive-primary"
                >
                  {item.title}
                </span>
              ) : (
                <img
                  src={item.src}
                  width={800}
                  height={1000}
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
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
          );

          return (
            <AppViewTransition key={item.id} default="none">
              <article
                className={`group flex flex-col overflow-hidden rounded-2xl border border-olive-primary/12 bg-canvas-cream shadow-paper-rest transition-colors hover:border-olive-primary/35 ${
                  isLeadBento ? 'sm:col-span-2 sm:row-span-2' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      updateLightboxIndex(index);
                    });
                  }}
                  className={`flex cursor-pointer flex-col text-left focus-visible:outline-offset-[-2px] ${
                    isLeadBento ? 'sm:flex-1' : ''
                  }`}
                >
                  {isOpenInLightbox ? (
                    thumbnailNode
                  ) : (
                    <AppViewTransition
                      name={vtName}
                      share={GALLERY_SHARE_TRANSITION}
                      default="none"
                    >
                      {thumbnailNode}
                    </AppViewTransition>
                  )}

                  <span className="line-clamp-1 px-3 pt-3 font-editorial text-xs font-semibold text-espresso sm:text-sm">
                    {item.title}
                    <span className="sr-only"> — Xem ảnh lớn</span>
                  </span>
                </button>

                <p className="mt-1 line-clamp-2 px-3 pb-3 text-xs leading-snug text-warm-muted">
                  {item.caption}
                </p>
              </article>
            </AppViewTransition>
          );
        })}
      </div>

      <PhotoLightboxModal
        items={filteredItems}
        activeIndex={lightboxIndex}
        onChangeIndex={(nextIdx) => {
          startTransition(() => {
            updateLightboxIndex(nextIdx);
          });
        }}
        onClose={() => {
          startTransition(() => {
            updateLightboxIndex(null);
          });
        }}
      />
    </section>
  );
}

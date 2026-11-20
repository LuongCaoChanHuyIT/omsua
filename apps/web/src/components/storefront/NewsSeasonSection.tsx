'use client';

import Image from 'next/image';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AppViewTransition } from '@/components/transitions/AppViewTransition';
import { useModalAccessibility } from '@/hooks/use-modal-accessibility';
import {
  OMSUA_NEWS_ARTICLES,
  type NewsArticleItem,
  type NewsCategoryFilter,
} from './header-nav-config';

export interface NewsSeasonSectionProps {
  activeCategory?: NewsCategoryFilter;
  onChangeCategory?: (category: NewsCategoryFilter) => void;
  onModalOpenChange?: (isOpen: boolean) => void;
}

const NEWS_FILTER_PILLS: ReadonlyArray<{
  id: NewsCategoryFilter;
  label: string;
}> = [
  { id: 'all', label: 'Tất cả bản tin' },
  { id: 'mua-vu', label: 'Mùa vụ & Nông sản' },
  { id: 'uu-dai', label: 'Ưu đãi & Sự kiện' },
];

export function NewsSeasonSection({
  activeCategory,
  onChangeCategory,
  onModalOpenChange,
}: NewsSeasonSectionProps = {}) {
  const [uncontrolledCategory, setUncontrolledCategory] =
    useState<NewsCategoryFilter>('all');
  const [selectedArticle, setSelectedArticle] =
    useState<NewsArticleItem | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const restoreFocusRef = useRef<boolean>(true);

  const effectiveCategory = activeCategory ?? uncontrolledCategory;

  const handleCategorySelect = (next: NewsCategoryFilter) => {
    if (onChangeCategory) {
      onChangeCategory(next);
    } else {
      setUncontrolledCategory(next);
    }
  };

  const openArticle = (article: NewsArticleItem) => {
    restoreFocusRef.current = true;
    setSelectedArticle(article);
    onModalOpenChange?.(true);
  };

  const closeArticle = useCallback(() => {
    setSelectedArticle(null);
    onModalOpenChange?.(false);
  }, [onModalOpenChange]);

  const closeArticleForNavigation = useCallback(() => {
    restoreFocusRef.current = false;
    setSelectedArticle(null);
    onModalOpenChange?.(false);
  }, [onModalOpenChange]);

  const dialogRef = useModalAccessibility<HTMLDivElement>({
    isOpen: Boolean(selectedArticle),
    onClose: closeArticle,
    restoreFocusRef,
  });

  const filteredArticles = useMemo(
    () =>
      effectiveCategory === 'all'
        ? OMSUA_NEWS_ARTICLES
        : OMSUA_NEWS_ARTICLES.filter(
            (article) => article.category === effectiveCategory,
          ),
    [effectiveCategory],
  );

  return (
    <section
      id="tin-tuc"
      className="scroll-mt-32 rounded-3xl border border-olive-primary/14 bg-surface-light p-6 shadow-paper-rest sm:p-8"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1.5">
          <span className="inline-flex items-center rounded-full bg-card-butter px-3.5 py-1 text-xs font-bold tracking-wider text-olive-primary uppercase">
            ✦ BẢN TIN &amp; MÙA VỤ ĐÀ LẠT
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight text-olive-primary sm:text-3xl">
            Tin tức Nông sản &amp; Ưu đãi tại Quán
          </h2>
          <p className="max-w-2xl text-xs leading-relaxed text-warm-muted sm:text-sm">
            Cập nhật mùa thu hoạch búp Atiso xanh, trái cây chín mọng vùng Cầu
            Đất và các chương trình ưu đãi dành riêng cho khách Nhà Ốm.
          </p>
        </div>

        <div
          role="group"
          aria-label="Lọc chuyên mục bản tin"
          className="flex flex-wrap gap-2"
        >
          {NEWS_FILTER_PILLS.map((pill) => {
            const isSelected = effectiveCategory === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleCategorySelect(pill.id)}
                className={`relative inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 py-2 text-xs font-bold transition-colors sm:text-sm ${
                  isSelected
                    ? 'bg-hero-espresso text-surface-light shadow-paper-rest'
                    : 'border border-olive-primary/20 bg-canvas-cream text-espresso hover:bg-card-butter/60'
                }`}
              >
                {isSelected ? (
                  <AppViewTransition
                    name="news-category-pill"
                    share="tab-pill"
                    default="none"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-4 bottom-1.5 h-[2.5px] rounded-full bg-card-butter"
                    />
                  </AppViewTransition>
                ) : null}
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {filteredArticles.map((article) => {
          const showImage = !failedImageIds.has(article.id);
          return (
            <article
              key={article.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-olive-primary/14 bg-canvas-cream/75 shadow-paper-rest"
            >
              <div>
                {showImage ? (
                  <div className="aspect-[16/10] w-full overflow-hidden border-b border-olive-primary/12 bg-card-butter/40">
                    <Image
                      unoptimized
                      src={article.imageSrc}
                      alt={article.imageAlt}
                      width={720}
                      height={450}
                      loading="lazy"
                      decoding="async"
                      onError={() =>
                        setFailedImageIds((prev) => {
                          const next = new Set(prev);
                          next.add(article.id);
                          return next;
                        })
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="space-y-2.5 p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-artichoke-deep px-2.5 py-0.5 font-bold text-surface-light">
                      {article.categoryLabel}
                    </span>
                    <span className="text-ochre-deep">
                      {article.publishedLabel} • {article.readTimeLabel}
                    </span>
                  </div>

                  <h3 className="font-editorial text-lg leading-snug font-bold text-espresso sm:text-xl">
                    {article.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-warm-muted sm:text-sm">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-olive-primary/12 px-5 py-3.5">
                <a
                  href="#thuc-don"
                  className="inline-flex min-h-11 items-center text-xs font-bold text-olive-primary underline decoration-olive-primary/40 underline-offset-4 transition-colors hover:text-terracotta-deep"
                >
                  Thưởng thức thực đơn mùa này
                </a>
                <button
                  type="button"
                  onClick={() => openArticle(article)}
                  className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-terracotta-deep px-4 py-2 text-xs font-bold text-surface-light transition-opacity hover:opacity-92"
                >
                  <span>Đọc chi tiết</span>
                  <span className="sr-only"> — {article.title}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {selectedArticle ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-hero-espresso/75 p-4 backdrop-blur-xs"
          onClick={closeArticle}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="news-modal-title"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-olive-primary/20 bg-surface-light p-6 text-espresso shadow-paper-lift focus:outline-none sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-olive-primary/14 pb-4">
              <div className="space-y-1">
                <span className="inline-flex items-center rounded-full bg-card-butter px-3 py-0.5 text-xs font-bold text-olive-primary">
                  {selectedArticle.categoryLabel} •{' '}
                  {selectedArticle.publishedLabel}
                </span>
                <h3
                  id="news-modal-title"
                  className="font-display text-xl font-bold text-espresso sm:text-2xl"
                >
                  {selectedArticle.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeArticle}
                className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-olive-primary/20 bg-canvas-cream px-3.5 text-xs font-bold text-espresso transition-colors hover:bg-card-butter"
              >
                Đóng
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-espresso">
              <p className="font-editorial text-base font-medium text-espresso">
                {selectedArticle.summary}
              </p>

              {selectedArticle.bodyParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-warm-muted">
                  {paragraph}
                </p>
              ))}

              <div className="rounded-2xl border border-olive-primary/16 bg-card-butter/55 p-4">
                <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
                  Điểm nhấn mùa này tại Ốm Sữa
                </p>
                <ul className="mt-2 space-y-1.5 text-xs font-medium text-espresso sm:text-sm">
                  {selectedArticle.highlights.map((item) => (
                    <li key={item}>✓ {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2.5 border-t border-olive-primary/14 pt-4">
              <a
                href="#thuc-don"
                onClick={closeArticleForNavigation}
                className="inline-flex min-h-11 items-center rounded-full bg-terracotta-deep px-5 py-2.5 text-xs font-bold text-surface-light transition-opacity hover:opacity-92 sm:text-sm"
              >
                Đặt món ngay →
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

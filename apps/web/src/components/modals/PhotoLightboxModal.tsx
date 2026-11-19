'use client';
/* eslint-disable @next/next/no-img-element */

import type { FanpagePhotoItem } from '@omsua/shared';
import { useEffect, useId, useState } from 'react';
import { useModalAccessibility } from '@/hooks/use-modal-accessibility';

export interface PhotoLightboxModalProps {
  items: readonly FanpagePhotoItem[];
  activeIndex: number | null;
  onChangeIndex: (nextIndex: number) => void;
  onClose: () => void;
}

export function PhotoLightboxModal({
  items,
  activeIndex,
  onChangeIndex,
  onClose,
}: PhotoLightboxModalProps) {
  const headingId = useId();
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(() => new Set());
  const isOpen =
    activeIndex !== null && activeIndex >= 0 && activeIndex < items.length;

  const dialogRef = useModalAccessibility<HTMLDivElement>({
    isOpen,
    onClose,
  });

  useEffect(() => {
    if (!isOpen || activeIndex === null || items.length <= 1) {
      return;
    }

    function handleArrowKeys(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onChangeIndex(((activeIndex ?? 0) + 1) % items.length);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onChangeIndex(((activeIndex ?? 0) - 1 + items.length) % items.length);
      }
    }

    window.addEventListener('keydown', handleArrowKeys);
    return () => window.removeEventListener('keydown', handleArrowKeys);
  }, [activeIndex, isOpen, items.length, onChangeIndex]);

  if (!isOpen || activeIndex === null) {
    return null;
  }

  const currentItem = items[activeIndex]!;
  const total = items.length;
  const isImageBroken = failedSrcs.has(currentItem.src);

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-hero-espresso/85 p-4 backdrop-blur-xs"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-olive-primary/20 bg-surface-light text-espresso shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-olive-primary/12 px-5 py-3.5 sm:px-6">
          <div className="min-w-0">
            <span className="text-xs font-bold tracking-wider text-subhead-ochre tabular-nums uppercase">
              {`${activeIndex + 1} / ${total}`}
            </span>
            <h3
              id={headingId}
              className="truncate font-display text-lg font-bold text-espresso sm:text-xl"
            >
              {currentItem.title}
            </h3>
          </div>

          <button
            type="button"
            aria-label="Đóng xem ảnh"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-olive-primary/15 bg-canvas-cream text-sm font-bold text-espresso transition hover:bg-card-butter/70"
          >
            ✕
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-y-auto overscroll-contain bg-hero-espresso p-3 sm:p-5">
          {isImageBroken ? (
            <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-surface-light/15 bg-surface-light/8 p-6 text-center text-sm text-card-butter">
              Ảnh đang được đồng bộ từ Fanpage Ốm Sữa Đà Lạt
            </div>
          ) : (
            <img
              key={currentItem.src}
              src={currentItem.src}
              alt={currentItem.title}
              decoding="async"
              onError={() =>
                setFailedSrcs((prev) => {
                  if (prev.has(currentItem.src)) return prev;
                  const next = new Set(prev);
                  next.add(currentItem.src);
                  return next;
                })
              }
              className="max-h-[58vh] w-auto max-w-full rounded-2xl object-contain"
            />
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-olive-primary/12 bg-surface-light px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs leading-relaxed text-warm-muted sm:text-sm">
            {currentItem.caption}
          </p>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {total > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Ảnh trước"
                  onClick={() =>
                    onChangeIndex((activeIndex - 1 + total) % total)
                  }
                  className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border border-olive-primary/20 bg-canvas-cream px-3.5 text-xs font-bold text-espresso transition hover:bg-card-butter"
                >
                  ← Trước
                </button>
                <button
                  type="button"
                  aria-label="Ảnh tiếp theo"
                  onClick={() => onChangeIndex((activeIndex + 1) % total)}
                  className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border border-olive-primary/20 bg-canvas-cream px-3.5 text-xs font-bold text-espresso transition hover:bg-card-butter"
                >
                  Tiếp →
                </button>
              </>
            )}

            <a
              href={currentItem.postUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-terracotta px-4 py-2 text-xs font-bold text-surface-light transition hover:opacity-92"
            >
              Xem bài gốc trên Fanpage ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

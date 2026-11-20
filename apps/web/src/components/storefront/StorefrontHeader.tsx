'use client';

import {
  type BranchInfo,
  type DrinkCategoryId,
  formatShortPrice,
} from '@omsua/shared';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
} from 'react';
import { OmSuaLogo } from '@/components/artwork/OmSuaArtwork';
import {
  FLAGSHIP_HEADER_NAV,
  type HeaderDropdownKey,
  type HeaderSubItem,
  type NewsCategoryFilter,
} from './header-nav-config';

export interface StorefrontHeaderProps {
  branches: BranchInfo[];
  selectedBranch: BranchInfo;
  onSelectBranch: (branchId: string) => void;
  cartItemCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  recentOrderCount?: number;
  onOpenOrderLookup?: () => void;
  onSelectDrinkCategory?: (category: DrinkCategoryId | 'all') => void;
  onSelectNewsCategory?: (category: NewsCategoryFilter) => void;
  suppressViewTransition?: boolean;
}

function ChevronDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
        isOpen ? 'rotate-180 text-card-butter' : 'rotate-0 text-surface-light/85'
      }`}
    >
      <path
        d="M3.5 6L8 10.5L12.5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StorefrontHeader({
  branches,
  selectedBranch,
  onSelectBranch,
  cartItemCount,
  cartTotal,
  onOpenCart,
  recentOrderCount = 0,
  onOpenOrderLookup,
  onSelectDrinkCategory,
  onSelectNewsCategory,
  suppressViewTransition = false,
}: StorefrontHeaderProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  const triggerRefs = useRef<
    Partial<Record<HeaderDropdownKey, HTMLButtonElement | null>>
  >({});
  const prevCartCountRef = useRef<number>(cartItemCount);
  const [isCartPulsing, setIsCartPulsing] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<HeaderDropdownKey | null>(
    null,
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [openMobileGroup, setOpenMobileGroup] =
    useState<HeaderDropdownKey | null>('san-pham');

  useEffect(() => {
    const previous = prevCartCountRef.current;
    prevCartCountRef.current = cartItemCount;
    if (cartItemCount > previous) {
      setIsCartPulsing(true);
      const timerId = window.setTimeout(() => {
        setIsCartPulsing(false);
      }, 420);
      return () => window.clearTimeout(timerId);
    }
    return undefined;
  }, [cartItemCount]);

  useEffect(() => {
    if (!openDropdown && !isMobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (openDropdown) {
          const activeKey = openDropdown;
          setOpenDropdown(null);
          triggerRefs.current[activeKey]?.focus();
        }
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && headerRef.current && !headerRef.current.contains(target)) {
        setOpenDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isMobileMenuOpen, openDropdown]);

  const handleSubItemActivate = useCallback(
    (subItem: HeaderSubItem) => {
      if (subItem.drinkCategory !== undefined) {
        onSelectDrinkCategory?.(subItem.drinkCategory);
      }
      if (subItem.newsCategory !== undefined) {
        onSelectNewsCategory?.(subItem.newsCategory);
      }
      setOpenDropdown(null);
      setIsMobileMenuOpen(false);
    },
    [onSelectDrinkCategory, onSelectNewsCategory],
  );

  const handleDropdownBlur = useCallback(
    (event: FocusEvent<HTMLLIElement>, key: HeaderDropdownKey) => {
      const nextFocused = event.relatedTarget as Node | null;
      if (!event.currentTarget.contains(nextFocused)) {
        setOpenDropdown((current) => (current === key ? null : current));
      }
    },
    [],
  );

  const orderLookupLabel =
    recentOrderCount > 0 ? `Đơn đã đặt (${recentOrderCount})` : 'Đơn đã đặt';

  return (
    <header
      ref={headerRef}
      style={{
        viewTransitionName: suppressViewTransition
          ? undefined
          : 'omsua-site-header',
      }}
      className="sticky top-0 z-40 border-b border-[#3F3A2D] bg-hero-espresso/98 text-surface-light shadow-paper-rest backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tier 1: Brand Identity & Operational Commerce Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 py-2.5">
          <a
            href="#hero"
            className="flex min-h-11 items-center gap-3 rounded-2xl pr-2"
          >
            <OmSuaLogo className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" />
            <div className="leading-tight">
              <span
                translate="no"
                className="block font-display text-xl font-bold tracking-tight text-card-butter"
              >
                Ốm sữa
              </span>
              <span className="block text-xs font-semibold tracking-wider text-[#DDD6C5] uppercase">
                SINCE 2017 • ĐÀ LẠT
              </span>
            </div>
          </a>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex min-h-11 items-center rounded-full border border-[#4D4636] bg-[#363125] px-3 py-1.5 text-xs font-semibold text-surface-light">
              <span aria-hidden="true" className="mr-1.5">
                📍
              </span>
              <select
                id="storefront-branch-select"
                name="branchId"
                aria-label="Chọn chi nhánh"
                value={selectedBranch.id}
                onChange={(event) => onSelectBranch(event.target.value)}
                className="min-h-11 cursor-pointer appearance-none bg-transparent pr-5 text-base font-semibold text-surface-light focus:outline-none sm:text-xs"
              >
                {branches.map((branch) => (
                  <option
                    key={branch.id}
                    value={branch.id}
                    className="bg-surface-light text-espresso"
                  >
                    {branch.shortLabel}
                  </option>
                ))}
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-2.5 text-xs text-card-butter"
              >
                ▾
              </span>
            </div>

            {onOpenOrderLookup ? (
              <button
                type="button"
                onClick={onOpenOrderLookup}
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-card-butter/40 bg-card-butter px-3.5 py-2 text-xs font-bold text-olive-primary tabular-nums transition-opacity hover:opacity-92 sm:text-sm"
              >
                <span>{orderLookupLabel}</span>
              </button>
            ) : null}

            <button
              type="button"
              data-cart-pulse={isCartPulsing ? 'true' : undefined}
              onClick={onOpenCart}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-card-butter/35 bg-terracotta-deep px-4 py-2 text-xs font-bold text-surface-light tabular-nums transition-transform duration-200 hover:opacity-92 sm:text-sm ${
                isCartPulsing ? 'scale-105' : 'scale-100'
              }`}
            >
              <span>
                Giỏ hàng ({cartItemCount}) • {formatShortPrice(cartTotal)}
              </span>
            </button>

            <button
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-flagship-nav"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-[#4D4636] bg-[#363125] px-3.5 py-2 text-xs font-bold tracking-wider text-surface-light uppercase transition-colors hover:border-card-butter hover:text-card-butter lg:hidden"
            >
              <span aria-hidden="true">{isMobileMenuOpen ? '✕' : '☰'}</span>
              <span>Menu</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Flagship 7-Item Navigation Bar */}
        <nav
          aria-label="Điều hướng cửa hàng"
          className="border-t border-[#3F3A2D]"
        >
          <ul className="hidden items-center gap-6 py-1 lg:flex xl:gap-8">
            {FLAGSHIP_HEADER_NAV.map((entry) => {
              if (entry.kind === 'link') {
                return (
                  <li key={entry.id}>
                    <a
                      href={entry.href}
                      onClick={() => setOpenDropdown(null)}
                      className="inline-flex min-h-11 items-center text-xs font-bold tracking-[0.08em] text-surface-light uppercase transition-colors hover:text-card-butter xl:text-sm"
                    >
                      {entry.label}
                    </a>
                  </li>
                );
              }

              const isOpen = openDropdown === entry.id;
              const panelId = `header-dropdown-${entry.id}`;

              return (
                <li
                  key={entry.id}
                  className="relative"
                  onBlur={(event) => handleDropdownBlur(event, entry.id)}
                >
                  <button
                    ref={(node) => {
                      triggerRefs.current[entry.id] = node;
                    }}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() =>
                      setOpenDropdown((current) =>
                        current === entry.id ? null : entry.id,
                      )
                    }
                    className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-xs font-bold tracking-[0.08em] uppercase transition-colors xl:text-sm ${
                      isOpen
                        ? 'text-card-butter'
                        : 'text-surface-light hover:text-card-butter'
                    }`}
                  >
                    <span>{entry.label}</span>
                    <ChevronDownIcon isOpen={isOpen} />
                  </button>

                  {isOpen ? (
                    <ul
                      id={panelId}
                      className="absolute top-full left-0 z-50 mt-1.5 min-w-80 space-y-1 rounded-2xl border border-olive-primary/20 bg-surface-light p-2 text-espresso shadow-paper-lift"
                    >
                      {entry.items.map((subItem) => (
                        <li key={subItem.id}>
                          <a
                            href={subItem.href}
                            target={subItem.external ? '_blank' : undefined}
                            rel={subItem.external ? 'noreferrer' : undefined}
                            onClick={() => handleSubItemActivate(subItem)}
                            className="flex min-h-11 flex-col justify-center rounded-xl px-3.5 py-2 transition-colors hover:bg-card-butter/65"
                          >
                            <span className="text-xs font-bold text-espresso sm:text-sm">
                              {subItem.label}
                            </span>
                            <span className="mt-0.5 text-xs text-warm-muted">
                              {subItem.description}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {isMobileMenuOpen ? (
            <div
              id="mobile-flagship-nav"
              className="space-y-2 py-3 lg:hidden"
            >
              {FLAGSHIP_HEADER_NAV.map((entry) => {
                if (entry.kind === 'link') {
                  return (
                    <a
                      key={entry.id}
                      href={entry.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex min-h-11 items-center justify-between rounded-xl border border-[#3F3A2D] bg-[#363125]/80 px-4 py-2.5 text-xs font-bold tracking-[0.08em] text-surface-light uppercase transition-colors hover:border-card-butter hover:text-card-butter"
                    >
                      <span>{entry.label}</span>
                      <span aria-hidden="true" className="text-card-butter">
                        →
                      </span>
                    </a>
                  );
                }

                const isGroupOpen = openMobileGroup === entry.id;
                return (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-[#3F3A2D] bg-[#363125]/80"
                  >
                    <button
                      type="button"
                      aria-expanded={isGroupOpen}
                      onClick={() =>
                        setOpenMobileGroup((current) =>
                          current === entry.id ? null : entry.id,
                        )
                      }
                      className="flex min-h-11 w-full cursor-pointer items-center justify-between px-4 py-2.5 text-xs font-bold tracking-[0.08em] text-surface-light uppercase transition-colors hover:text-card-butter"
                    >
                      <span>{entry.label}</span>
                      <ChevronDownIcon isOpen={isGroupOpen} />
                    </button>

                    {isGroupOpen ? (
                      <ul className="space-y-1 border-t border-[#3F3A2D] px-2.5 py-2">
                        {entry.items.map((subItem) => (
                          <li key={subItem.id}>
                            <a
                              href={subItem.href}
                              target={subItem.external ? '_blank' : undefined}
                              rel={subItem.external ? 'noreferrer' : undefined}
                              onClick={() => handleSubItemActivate(subItem)}
                              className="flex min-h-11 flex-col justify-center rounded-lg px-3 py-2 text-surface-light transition-colors hover:bg-surface-light/10"
                            >
                              <span className="text-xs font-bold text-card-butter">
                                {subItem.label}
                              </span>
                              <span className="text-xs text-[#DDD6C5]">
                                {subItem.description}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

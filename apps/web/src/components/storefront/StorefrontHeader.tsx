'use client';

import {
  type BranchInfo,
  type DrinkCategoryId,
  formatShortPrice,
  getBranchPhoto,
} from '@omsua/shared';
import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
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

function MapPinEmblem() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card-butter/18 text-card-butter"
    >
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
        <path
          d="M8 14.2C8 14.2 12.6 10.1 12.6 6.4C12.6 3.86 10.54 1.8 8 1.8C5.46 1.8 3.4 3.86 3.4 6.4C3.4 10.1 8 14.2 8 14.2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="8"
          cy="6.3"
          r="1.75"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </span>
  );
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
  const branchTriggerRef = useRef<HTMLButtonElement | null>(null);
  const branchOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const mobileMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const triggerRefs = useRef<
    Partial<Record<HeaderDropdownKey, HTMLButtonElement | null>>
  >({});
  const prevCartCountRef = useRef<number>(cartItemCount);
  const [isCartPulsing, setIsCartPulsing] = useState<boolean>(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<HeaderDropdownKey | null>(
    null,
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [openMobileGroup, setOpenMobileGroup] =
    useState<HeaderDropdownKey | null>(null);

  const closeHeaderMenus = useCallback(() => {
    setIsBranchMenuOpen(false);
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, []);

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
    if (!isBranchMenuOpen && !openDropdown && !isMobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isBranchMenuOpen) {
          setIsBranchMenuOpen(false);
          branchTriggerRef.current?.focus();
        }
        if (openDropdown) {
          const activeKey = openDropdown;
          setOpenDropdown(null);
          triggerRefs.current[activeKey]?.focus();
        }
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
          mobileMenuTriggerRef.current?.focus();
        }
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && headerRef.current && !headerRef.current.contains(target)) {
        setIsBranchMenuOpen(false);
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
  }, [isBranchMenuOpen, isMobileMenuOpen, openDropdown]);

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

  const handleBranchWrapperBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const nextFocused = event.relatedTarget as Node | null;
      if (nextFocused && !event.currentTarget.contains(nextFocused)) {
        setIsBranchMenuOpen(false);
      }
    },
    [],
  );

  const handleBranchPick = useCallback(
    (branchId: string) => {
      onSelectBranch(branchId);
      setIsBranchMenuOpen(false);
      branchTriggerRef.current?.focus();
    },
    [onSelectBranch],
  );

  const handleBranchOptionKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
      const total = branches.length;
      if (total === 0) {
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        branchOptionRefs.current[(index + 1) % total]?.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        branchOptionRefs.current[(index - 1 + total) % total]?.focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        branchOptionRefs.current[0]?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        branchOptionRefs.current[total - 1]?.focus();
      }
    },
    [branches.length],
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
            onClick={closeHeaderMenus}
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
            <div
              data-branch-picker="true"
              onBlur={handleBranchWrapperBlur}
              className="relative"
            >
              <input
                type="hidden"
                name="branchId"
                value={selectedBranch.id}
              />
              <button
                ref={branchTriggerRef}
                id="storefront-branch-select"
                type="button"
                aria-expanded={isBranchMenuOpen}
                aria-controls="storefront-branch-panel"
                aria-label={`Chọn chi nhánh: ${selectedBranch.shortLabel}`}
                onClick={() => {
                  setOpenDropdown(null);
                  setIsMobileMenuOpen(false);
                  setIsBranchMenuOpen((prev) => !prev);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown' && !isBranchMenuOpen) {
                    event.preventDefault();
                    setOpenDropdown(null);
                    setIsMobileMenuOpen(false);
                    setIsBranchMenuOpen(true);
                    const activeIdx = Math.max(
                      0,
                      branches.findIndex((b) => b.id === selectedBranch.id),
                    );
                    window.requestAnimationFrame(() => {
                      branchOptionRefs.current[activeIdx]?.focus();
                    });
                  }
                }}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-2 text-xs font-semibold text-surface-light transition-colors sm:text-sm ${
                  isBranchMenuOpen
                    ? 'border-card-butter bg-[#3F392A]'
                    : 'border-card-butter/30 bg-[#353024] hover:border-card-butter/70 hover:bg-[#3F392A]'
                }`}
              >
                <MapPinEmblem />
                <span className="truncate font-semibold tracking-tight text-surface-light">
                  {selectedBranch.shortLabel}
                </span>
                <ChevronDownIcon isOpen={isBranchMenuOpen} />
              </button>

              {isBranchMenuOpen ? (
                <div
                  id="storefront-branch-panel"
                  className="absolute top-full left-0 z-50 mt-2 max-h-[calc(100dvh-7.5rem)] w-[min(23.5rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-olive-primary/20 bg-surface-light p-2.5 text-espresso shadow-paper-lift sm:right-0 sm:left-auto lg:right-auto lg:left-0"
                >
                  <div className="flex items-center justify-between border-b border-olive-primary/12 px-2.5 pt-1 pb-2">
                    <span
                      id="storefront-branch-heading"
                      className="text-xs font-bold tracking-wider text-ochre-deep uppercase"
                    >
                      Chọn cơ sở phục vụ
                    </span>
                    <span className="rounded-full bg-card-butter/80 px-2.5 py-0.5 text-xs font-bold text-olive-primary tabular-nums">
                      {branches.length} cơ sở
                    </span>
                  </div>

                  <div
                    id="storefront-branch-listbox"
                    role="listbox"
                    aria-labelledby="storefront-branch-heading"
                    className="mt-1.5 space-y-1"
                  >
                    {branches.map((branch, index) => {
                      const isSelected = branch.id === selectedBranch.id;
                      const branchPhoto = getBranchPhoto(branch.id);
                      return (
                        <button
                          key={branch.id}
                          ref={(node) => {
                            branchOptionRefs.current[index] = node;
                          }}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleBranchPick(branch.id)}
                          onKeyDown={(event) =>
                            handleBranchOptionKeyDown(event, index)
                          }
                          className={`flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                            isSelected
                              ? 'border-artichoke-deep/35 bg-card-butter/60'
                              : 'border-transparent hover:border-olive-primary/15 hover:bg-canvas-cream'
                          }`}
                        >
                          {branchPhoto ? (
                            <Image
                              unoptimized
                              width={44}
                              height={44}
                              src={branchPhoto.src}
                              alt=""
                              className="h-11 w-11 shrink-0 rounded-xl border border-olive-primary/15 object-cover"
                            />
                          ) : null}
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center justify-between gap-1.5">
                              <span className="font-display text-sm font-bold text-espresso">
                                {branch.name}
                              </span>
                              {isSelected ? (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-artichoke-deep px-2 py-0.5 text-xs font-bold text-surface-light">
                                  ✓ Đang chọn
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block text-xs leading-snug text-warm-muted">
                              {branch.address}
                            </span>
                            <span className="mt-1 block text-xs font-semibold text-terracotta-deep tabular-nums">
                              Hotline: {branch.hotline}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 border-t border-olive-primary/12 pt-1.5">
                    <a
                      href="#chi-nhanh"
                      onClick={closeHeaderMenus}
                      className="flex min-h-11 items-center justify-between rounded-xl px-2.5 py-2 text-xs font-bold text-olive-primary transition-colors hover:bg-card-butter/55"
                    >
                      <span>Xem chi tiết không gian 4 cơ sở</span>
                      <span aria-hidden="true">↓</span>
                    </a>
                  </div>
                </div>
              ) : null}
            </div>

            {onOpenOrderLookup ? (
              <button
                type="button"
                onClick={() => {
                  closeHeaderMenus();
                  onOpenOrderLookup();
                }}
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-card-butter/40 bg-card-butter px-3.5 py-2 text-xs font-bold text-olive-primary tabular-nums transition-opacity hover:opacity-92 sm:text-sm"
              >
                <span>{orderLookupLabel}</span>
              </button>
            ) : null}

            <button
              type="button"
              data-cart-pulse={isCartPulsing ? 'true' : undefined}
              onClick={() => {
                closeHeaderMenus();
                onOpenCart();
              }}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-card-butter/35 bg-terracotta-deep px-4 py-2 text-xs font-bold text-surface-light tabular-nums transition-transform duration-200 hover:opacity-92 sm:text-sm ${
                isCartPulsing ? 'scale-105' : 'scale-100'
              }`}
            >
              <span>
                Giỏ hàng ({cartItemCount}) • {formatShortPrice(cartTotal)}
              </span>
            </button>

            <button
              ref={mobileMenuTriggerRef}
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-flagship-nav"
              onClick={() => {
                setIsBranchMenuOpen(false);
                setOpenDropdown(null);
                setIsMobileMenuOpen((prev) => !prev);
              }}
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
                    onClick={() => {
                      setIsBranchMenuOpen(false);
                      setOpenDropdown((current) =>
                        current === entry.id ? null : entry.id,
                      );
                    }}
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
              className="max-h-[calc(100dvh-7.5rem)] space-y-2 overflow-y-auto overscroll-contain py-3 lg:hidden"
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

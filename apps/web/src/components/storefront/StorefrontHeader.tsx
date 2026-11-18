'use client';

import { type BranchInfo, formatShortPrice } from '@omsua/shared';
import { OmSuaLogo } from '@/components/artwork/OmSuaArtwork';

export interface StorefrontHeaderProps {
  branches: BranchInfo[];
  selectedBranch: BranchInfo;
  onSelectBranch: (branchId: string) => void;
  cartItemCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export function StorefrontHeader({
  branches,
  selectedBranch,
  onSelectBranch,
  cartItemCount,
  cartTotal,
  onOpenCart,
}: StorefrontHeaderProps) {
  const navItems = [
    { label: 'Trang chủ', href: '#hero' },
    { label: 'Thực đơn', href: '#thuc-don' },
    { label: 'Bánh tráng Snack', href: '#banh-trang' },
    { label: 'Câu chuyện Ốm', href: '#cau-chuyen' },
    { label: `Chi nhánh (${branches.length})`, href: '#chi-nhanh' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-olive-primary/12 bg-canvas-cream/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#hero"
          className="flex items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-primary"
        >
          <OmSuaLogo className="h-11 w-11 shrink-0" />
          <div className="leading-tight">
            <span className="block font-display text-xl font-bold tracking-tight text-olive-primary">
              Ốm sữa
            </span>
            <span className="block text-[10px] font-semibold tracking-wider text-warm-muted uppercase">
              SINCE 2017 • ĐÀ LẠT
            </span>
          </div>
        </a>

        <nav
          aria-label="Điều hướng cửa hàng"
          className="hidden items-center gap-6 lg:flex"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-espresso transition hover:text-olive-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center rounded-full border border-olive-primary/20 bg-surface-light px-3 py-1.5 text-xs font-semibold text-espresso shadow-2xs">
            <span aria-hidden="true" className="mr-1.5">
              📍
            </span>
            <select
              aria-label="Chọn chi nhánh"
              value={selectedBranch.id}
              onChange={(event) => onSelectBranch(event.target.value)}
              className="cursor-pointer appearance-none bg-transparent pr-4 text-xs font-semibold text-espresso focus:outline-none"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.shortLabel}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 text-[10px] text-warm-muted"
            >
              ▾
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-terracotta px-4 py-2 text-xs font-bold text-surface-light shadow-xs transition hover:opacity-92 sm:text-sm"
          >
            <span>
              Giỏ hàng ({cartItemCount}) • {formatShortPrice(cartTotal)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

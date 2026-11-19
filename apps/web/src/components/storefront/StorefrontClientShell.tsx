'use client';

import {
  type BranchInfo,
  type CatalogPayload,
  type DrinkCategoryId,
  type OrderRecord,
  type ProductItem,
  type SpiceLevel,
  formatVnd,
  normalizeApiBaseUrl,
} from '@omsua/shared';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CartCheckoutDrawer } from '@/components/modals/CartCheckoutDrawer';
import { OrderLookupModal } from '@/components/modals/OrderLookupModal';
import { ProductCustomizerModal } from '@/components/modals/ProductCustomizerModal';
import { fetchCatalog } from '@/lib/api';
import { readRecentOrders } from '@/lib/recent-orders';
import { CartProvider, useCart } from '@/store/cart-store';
import { BrandFooter } from './BrandFooter';
import { BrandStorySection } from './BrandStorySection';
import { DrinkMenuSection } from './DrinkMenuSection';
import { HeroSpotlight } from './HeroSpotlight';
import { SnackMenuSection } from './SnackMenuSection';
import { StorefrontHeader } from './StorefrontHeader';
import { ToppingStripSection } from './ToppingStripSection';

export interface StorefrontClientShellProps {
  initialCatalog: CatalogPayload;
  initialBranches: BranchInfo[];
  apiBaseUrl?: string;
}

interface StorefrontShellInnerProps {
  catalog: CatalogPayload;
  branches: BranchInfo[];
  apiBaseUrl: string;
  onRefreshCatalog: () => Promise<void>;
}

function StorefrontShellInner({
  catalog,
  branches,
  apiBaseUrl,
  onRefreshCatalog,
}: StorefrontShellInnerProps) {
  const {
    selectedBranch,
    setSelectedBranchId,
    totals,
    unavailableItems,
  } = useCart();

  const [activeCategory, setActiveCategory] = useState<DrinkCategoryId | 'all'>(
    'all',
  );
  const [activeSpice, setActiveSpice] = useState<SpiceLevel>('cay-vua');
  const [activeProductForModal, setActiveProductForModal] =
    useState<ProductItem | null>(null);
  const [initialToppingIdsForModal, setInitialToppingIdsForModal] = useState<
    string[]
  >([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState<boolean>(false);
  const [trackedOrder, setTrackedOrder] = useState<OrderRecord | null>(null);
  const [recentOrderCount, setRecentOrderCount] = useState<number>(0);

  useEffect(() => {
    setRecentOrderCount(readRecentOrders().length);
  }, []);

  const syncRecentOrderCount = useCallback(() => {
    setRecentOrderCount(readRecentOrders().length);
  }, []);

  const spotlightProducts = useMemo(
    () => catalog.products.filter((product) => product.isSpotlight),
    [catalog.products],
  );

  const drinks = useMemo(
    () => catalog.products.filter((product) => product.kind === 'drink'),
    [catalog.products],
  );

  const snacks = useMemo(
    () => catalog.products.filter((product) => product.kind === 'snack'),
    [catalog.products],
  );

  const showMobileStickyCartBar =
    (totals.totalItems > 0 || unavailableItems.length > 0) &&
    !isCartOpen &&
    !activeProductForModal &&
    !isOrderLookupOpen;

  const openCartDrawer = useCallback(() => {
    setIsCartOpen(true);
    void onRefreshCatalog();
  }, [onRefreshCatalog]);

  return (
    <div
      data-api-base-url={apiBaseUrl}
      className={`min-h-screen bg-canvas-cream text-espresso ${
        showMobileStickyCartBar ? 'pb-20 lg:pb-0' : ''
      }`}
    >
      <a
        href="#thuc-don"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-hero-espresso focus:px-4 focus:py-2.5 focus:text-xs focus:font-bold focus:text-surface-light focus:shadow-lg"
      >
        Chuyển đến thực đơn chính
      </a>

      <StorefrontHeader
        branches={branches}
        selectedBranch={selectedBranch}
        onSelectBranch={setSelectedBranchId}
        cartItemCount={totals.totalItems}
        cartTotal={totals.grandTotal}
        onOpenCart={openCartDrawer}
        recentOrderCount={recentOrderCount}
        onOpenOrderLookup={() => {
          setTrackedOrder(null);
          setIsOrderLookupOpen(true);
        }}
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-6 sm:px-6 lg:px-8">
        <HeroSpotlight
          spotlightProducts={spotlightProducts}
          onSelectProduct={(product) => {
            setInitialToppingIdsForModal([]);
            setActiveProductForModal(product);
          }}
        />

        <DrinkMenuSection
          categories={catalog.categories}
          drinks={drinks}
          activeCategory={activeCategory}
          onChangeCategory={setActiveCategory}
          onSelectDrink={(drink) => {
            setInitialToppingIdsForModal([]);
            setActiveProductForModal(drink);
          }}
        />

        <ToppingStripSection
          toppings={catalog.toppings}
          onSelectTopping={(topping) => {
            const defaultDrink =
              catalog.products.find(
                (product) =>
                  product.id === 'tra-sua-atiso' && product.isAvailable,
              ) ??
              drinks.find((drink) => drink.isAvailable) ??
              null;

            if (defaultDrink) {
              setInitialToppingIdsForModal([topping.id]);
              setActiveProductForModal(defaultDrink);
            }
          }}
        />

        <SnackMenuSection
          snacks={snacks}
          activeSpice={activeSpice}
          onChangeSpice={setActiveSpice}
          onSelectSnack={(snack, spice) => {
            setActiveSpice(spice);
            setInitialToppingIdsForModal([]);
            setActiveProductForModal(snack);
          }}
        />

        <BrandStorySection />
      </main>

      <BrandFooter
        branches={branches}
        selectedBranchId={selectedBranch.id}
        onSelectBranch={setSelectedBranchId}
      />

      {showMobileStickyCartBar && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-olive-primary/15 bg-hero-espresso/95 p-3 text-surface-light backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={openCartDrawer}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-terracotta px-4 py-3 text-sm font-bold text-surface-light shadow-xs transition hover:opacity-92"
          >
            {totals.totalItems > 0
              ? `Xem giỏ hàng (${totals.totalItems} món) • ${formatVnd(totals.grandTotal)} →`
              : `Xem giỏ hàng (${unavailableItems.length} món tạm hết) →`}
          </button>
        </div>
      )}

      <ProductCustomizerModal
        product={activeProductForModal}
        toppings={catalog.toppings}
        defaultSpice={activeSpice}
        initialToppingIds={initialToppingIdsForModal}
        onClose={() => {
          setActiveProductForModal(null);
          setInitialToppingIdsForModal([]);
        }}
      />

      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        apiBaseUrl={apiBaseUrl}
        onOrderError={() => {
          void onRefreshCatalog();
        }}
        onOrderCreated={syncRecentOrderCount}
        onTrackOrder={(order) => {
          setTrackedOrder(order);
          setIsOrderLookupOpen(true);
        }}
      />

      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => {
          setIsOrderLookupOpen(false);
          setTrackedOrder(null);
        }}
        apiBaseUrl={apiBaseUrl}
        initialOrder={trackedOrder}
        onOrderLoaded={syncRecentOrderCount}
      />
    </div>
  );
}

export function StorefrontClientShell({
  initialCatalog,
  initialBranches,
  apiBaseUrl,
}: StorefrontClientShellProps) {
  const resolvedApiBaseUrl = normalizeApiBaseUrl(
    apiBaseUrl ?? process.env.NEXT_PUBLIC_API_URL,
  );
  const [catalog, setCatalog] = useState<CatalogPayload>(initialCatalog);
  const requestSeqRef = useRef<number>(0);

  const refreshCatalog = useCallback(async () => {
    const seq = ++requestSeqRef.current;
    const result = await fetchCatalog(resolvedApiBaseUrl);
    if (seq === requestSeqRef.current && !result.isFallback) {
      setCatalog(result.catalog);
    }
  }, [resolvedApiBaseUrl]);

  useEffect(() => {
    let isCancelled = false;
    const seq = ++requestSeqRef.current;

    void fetchCatalog(resolvedApiBaseUrl).then((result) => {
      if (!isCancelled && seq === requestSeqRef.current && !result.isFallback) {
        setCatalog(result.catalog);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [resolvedApiBaseUrl]);

  return (
    <CartProvider catalog={catalog} branches={initialBranches}>
      <StorefrontShellInner
        catalog={catalog}
        branches={initialBranches}
        apiBaseUrl={resolvedApiBaseUrl}
        onRefreshCatalog={refreshCatalog}
      />
    </CartProvider>
  );
}

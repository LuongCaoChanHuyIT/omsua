'use client';

import {
  DRINK_CATEGORY_IDS,
  type BranchInfo,
  type CatalogPayload,
  type DrinkCategoryId,
  type OrderRecord,
  type ProductItem,
  type SpiceLevel,
  formatVnd,
  normalizeApiBaseUrl,
} from '@omsua/shared';
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CartCheckoutDrawer } from '@/components/modals/CartCheckoutDrawer';
import { OrderLookupModal } from '@/components/modals/OrderLookupModal';
import { ProductCustomizerModal } from '@/components/modals/ProductCustomizerModal';
import { AppViewTransition } from '@/components/transitions/AppViewTransition';
import { fetchCatalog } from '@/lib/api';
import { readRecentOrders } from '@/lib/recent-orders';
import { CartProvider, useCart } from '@/store/cart-store';
import { BrandFooter } from './BrandFooter';
import { BrandStorySection } from './BrandStorySection';
import { CareersAndFranchiseSection } from './CareersAndFranchiseSection';
import {
  DrinkMenuSection,
  FLAVOR_MOOD_OPTIONS,
  type FlavorMoodId,
} from './DrinkMenuSection';
import { FanpageGallerySection } from './FanpageGallerySection';
import { HeroSpotlight } from './HeroSpotlight';
import { MemberClubSection } from './MemberClubSection';
import { NewsSeasonSection } from './NewsSeasonSection';
import { SnackMenuSection } from './SnackMenuSection';
import { StorefrontHeader } from './StorefrontHeader';
import { ToppingStripSection } from './ToppingStripSection';
import type { NewsCategoryFilter } from './header-nav-config';

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

const VALID_DRINK_CATEGORIES = new Set<string>(DRINK_CATEGORY_IDS);
const VALID_FLAVOR_MOODS = new Set<string>(
  FLAVOR_MOOD_OPTIONS.map((option) => option.id).filter((id) => id !== 'all'),
);
export const CLIENT_CATALOG_TIMEOUT_MS = 20_000;

function parseUrlMenuState(search: string): {
  category: DrinkCategoryId | 'all';
  mood: FlavorMoodId;
  query: string;
  preferIllustration: boolean;
} {
  const params = new URLSearchParams(search);
  const rawCat = params.get('cat')?.trim() ?? '';
  const category = VALID_DRINK_CATEGORIES.has(rawCat)
    ? (rawCat as DrinkCategoryId)
    : 'all';
  const rawMood = params.get('mood')?.trim() ?? '';
  const mood = VALID_FLAVOR_MOODS.has(rawMood)
    ? (rawMood as FlavorMoodId)
    : 'all';
  const query = params.get('q')?.trim() ?? '';
  const preferIllustration = params.get('media') === 'studio';
  return { category, mood, query, preferIllustration };
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
    addItem,
    totals,
    unavailableItems,
  } = useCart();

  const [activeCategory, setActiveCategory] = useState<DrinkCategoryId | 'all'>(
    'all',
  );
  const [activeMood, setActiveMood] = useState<FlavorMoodId>('all');
  const [activeNewsCategory, setActiveNewsCategory] =
    useState<NewsCategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [preferIllustration, setPreferIllustration] = useState<boolean>(false);
  const [activeSpice, setActiveSpice] = useState<SpiceLevel>('cay-vua');
  const [activeProductForModal, setActiveProductForModal] =
    useState<ProductItem | null>(null);
  const [initialToppingIdsForModal, setInitialToppingIdsForModal] = useState<
    string[]
  >([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [reorderNotice, setReorderNotice] = useState<string | null>(null);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState<boolean>(false);
  const [trackedOrder, setTrackedOrder] = useState<OrderRecord | null>(null);
  const [recentOrderCount, setRecentOrderCount] = useState<number>(0);
  const [recentOrdersVersion, setRecentOrdersVersion] = useState<number>(0);
  const [hasHydratedUrl, setHasHydratedUrl] = useState<boolean>(false);
  const hasOpenOverlay = Boolean(
    activeProductForModal ||
      isCartOpen ||
      isOrderLookupOpen ||
      isLightboxOpen ||
      isNewsModalOpen,
  );

  useEffect(() => {
    setRecentOrderCount(readRecentOrders().length);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const parsed = parseUrlMenuState(window.location.search);
    setActiveCategory(parsed.category);
    setActiveMood(parsed.mood);
    setSearchQuery(parsed.query);
    setPreferIllustration(parsed.preferIllustration);
    setHasHydratedUrl(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedUrl || typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (activeCategory === 'all') {
      params.delete('cat');
    } else {
      params.set('cat', activeCategory);
    }

    if (activeMood === 'all') {
      params.delete('mood');
    } else {
      params.set('mood', activeMood);
    }

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      params.delete('q');
    } else {
      params.set('q', trimmedQuery);
    }

    if (preferIllustration) {
      params.set('media', 'studio');
    } else {
      params.delete('media');
    }

    const serialized = params.toString();
    const nextUrl = `${window.location.pathname}${serialized ? `?${serialized}` : ''}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, '', nextUrl);
    }
  }, [
    activeCategory,
    activeMood,
    hasHydratedUrl,
    preferIllustration,
    searchQuery,
  ]);

  const syncRecentOrderCount = useCallback(() => {
    setRecentOrderCount(readRecentOrders().length);
    setRecentOrdersVersion((prev) => prev + 1);
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
    !isOrderLookupOpen &&
    !isNewsModalOpen;

  const openCartDrawer = useCallback(() => {
    setIsCartOpen(true);
    void onRefreshCatalog();
  }, [onRefreshCatalog]);

  const handleReorderFromLookup = useCallback(
    (order: OrderRecord): { addedCount: number; skippedCount: number } => {
      const availableProducts = new Map(
        catalog.products
          .filter((product) => product.isAvailable)
          .map((product) => [product.id, product]),
      );
      const availableToppingIds = new Set(
        catalog.toppings
          .filter((topping) => topping.isAvailable)
          .map((topping) => topping.id),
      );

      let addedCount = 0;
      let skippedCount = 0;
      let droppedToppingCount = 0;

      for (const item of order.items) {
        const product = availableProducts.get(item.productId);
        if (!product || product.sizes.length === 0) {
          skippedCount += 1;
          continue;
        }
        const resolvedSize = product.sizes.some(
          (option) => option.size === item.size,
        )
          ? item.size
          : product.sizes[0]!.size;

        if (product.kind === 'snack') {
          addItem({
            productId: product.id,
            quantity: item.quantity,
            size: resolvedSize,
            spiceLevel: item.spiceLevel ?? 'cay-vua',
          });
        } else {
          const validToppings = item.toppings
            .map((topping) => topping.id)
            .filter((id) => availableToppingIds.has(id));
          droppedToppingCount += item.toppings.length - validToppings.length;
          addItem({
            productId: product.id,
            quantity: item.quantity,
            size: resolvedSize,
            sugarLevel: item.sugarLevel ?? '70',
            iceLevel: item.iceLevel ?? '70',
            toppingIds: validToppings,
          });
        }
        addedCount += 1;
      }

      if (addedCount > 0) {
        if (branches.some((branch) => branch.id === order.branchId)) {
          setSelectedBranchId(order.branchId);
        }
        if (skippedCount > 0 || droppedToppingCount > 0) {
          const omittedParts: string[] = [];
          if (skippedCount > 0) {
            omittedParts.push(`${skippedCount} món`);
          }
          if (droppedToppingCount > 0) {
            omittedParts.push(`${droppedToppingCount} topping`);
          }
          setReorderNotice(
            `Đã khôi phục ${addedCount} dòng món còn bán vào giỏ; lược bỏ ${omittedParts.join(' và ')} đang tạm hết.`,
          );
        } else {
          setReorderNotice(null);
        }
        setIsOrderLookupOpen(false);
        setTrackedOrder(null);
        openCartDrawer();
      }

      return { addedCount, skippedCount };
    },
    [
      addItem,
      branches,
      catalog.products,
      catalog.toppings,
      openCartDrawer,
      setSelectedBranchId,
    ],
  );

  return (
    <div
      data-api-base-url={apiBaseUrl}
      className={`min-h-screen bg-canvas-cream bg-paper-grain text-espresso ${
        showMobileStickyCartBar ? 'pb-24 lg:pb-0' : ''
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
          void onRefreshCatalog();
        }}
        onSelectDrinkCategory={(category) => {
          startTransition(() => {
            setActiveCategory(category);
            setActiveMood('all');
            setSearchQuery('');
          });
        }}
        onSelectNewsCategory={(newsCat) => {
          startTransition(() => {
            setActiveNewsCategory(newsCat);
          });
        }}
        suppressViewTransition={hasOpenOverlay}
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-6 sm:px-6 lg:px-8">
        <HeroSpotlight
          spotlightProducts={spotlightProducts}
          preferIllustration={preferIllustration}
          onSelectProduct={(product) => {
            setInitialToppingIdsForModal([]);
            setActiveProductForModal(product);
          }}
        />

        <DrinkMenuSection
          categories={catalog.categories}
          drinks={drinks}
          activeCategory={activeCategory}
          onChangeCategory={(nextCat) => {
            startTransition(() => {
              setActiveCategory(nextCat);
            });
          }}
          activeMood={activeMood}
          onChangeMood={setActiveMood}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          preferIllustration={preferIllustration}
          onToggleMediaMode={(preferStudio) => {
            startTransition(() => {
              setPreferIllustration(preferStudio);
            });
          }}
          onSelectDrink={(drink) => {
            setInitialToppingIdsForModal([]);
            setActiveProductForModal(drink);
          }}
        />

        <AppViewTransition>
          <ToppingStripSection
            toppings={catalog.toppings}
            preferIllustration={preferIllustration}
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
        </AppViewTransition>

        <AppViewTransition>
          <SnackMenuSection
            snacks={snacks}
            activeSpice={activeSpice}
            onChangeSpice={(nextSpice) => {
              startTransition(() => {
                setActiveSpice(nextSpice);
              });
            }}
            preferIllustration={preferIllustration}
            onSelectSnack={(snack, spice) => {
              setActiveSpice(spice);
              setInitialToppingIdsForModal([]);
              setActiveProductForModal(snack);
            }}
          />
        </AppViewTransition>

        <BrandStorySection />

        <FanpageGallerySection onLightboxOpenChange={setIsLightboxOpen} />

        <NewsSeasonSection
          activeCategory={activeNewsCategory}
          onChangeCategory={(nextCat) => {
            startTransition(() => {
              setActiveNewsCategory(nextCat);
            });
          }}
          onModalOpenChange={setIsNewsModalOpen}
        />

        <MemberClubSection recentOrdersVersion={recentOrdersVersion} />

        <CareersAndFranchiseSection branches={branches} />
      </main>

      <BrandFooter
        branches={branches}
        selectedBranchId={selectedBranch.id}
        onSelectBranch={setSelectedBranchId}
      />

      {showMobileStickyCartBar ? (
        <div
          style={{
            viewTransitionName: hasOpenOverlay
              ? undefined
              : 'omsua-sticky-cart',
          }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-olive-primary/15 bg-hero-espresso/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-surface-light backdrop-blur-md lg:hidden"
        >
          <button
            type="button"
            onClick={openCartDrawer}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-terracotta-deep px-4 py-3 text-sm font-bold text-surface-light tabular-nums transition-opacity hover:opacity-92"
          >
            {totals.totalItems > 0
              ? `Xem giỏ hàng (${totals.totalItems} món) • ${formatVnd(totals.grandTotal)} →`
              : `Xem giỏ hàng (${unavailableItems.length} món tạm hết) →`}
          </button>
        </div>
      ) : null}

      <ProductCustomizerModal
        product={activeProductForModal}
        toppings={catalog.toppings}
        defaultSpice={activeSpice}
        initialToppingIds={initialToppingIdsForModal}
        preferIllustration={preferIllustration}
        onClose={() => {
          setActiveProductForModal(null);
          setInitialToppingIdsForModal([]);
        }}
      />

      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
          setReorderNotice(null);
        }}
        apiBaseUrl={apiBaseUrl}
        preferIllustration={preferIllustration}
        reorderNotice={reorderNotice}
        onDismissReorderNotice={() => setReorderNotice(null)}
        onOrderError={() => {
          void onRefreshCatalog();
        }}
        onOrderCreated={() => {
          setReorderNotice(null);
          syncRecentOrderCount();
        }}
        onTrackOrder={(order) => {
          setTrackedOrder(order);
          setIsOrderLookupOpen(true);
          void onRefreshCatalog();
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
        onReorder={handleReorderFromLookup}
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
    const result = await fetchCatalog(
      resolvedApiBaseUrl,
      fetch,
      CLIENT_CATALOG_TIMEOUT_MS,
    );
    if (seq === requestSeqRef.current && !result.isFallback) {
      setCatalog(result.catalog);
    }
  }, [resolvedApiBaseUrl]);

  useEffect(() => {
    let isCancelled = false;
    const seq = ++requestSeqRef.current;

    void fetchCatalog(
      resolvedApiBaseUrl,
      fetch,
      CLIENT_CATALOG_TIMEOUT_MS,
    ).then((result) => {
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

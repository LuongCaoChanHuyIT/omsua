'use client';

import {
  type BranchInfo,
  type CatalogPayload,
  type DrinkCategoryId,
  type ProductItem,
  type SpiceLevel,
  normalizeApiBaseUrl,
} from '@omsua/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartCheckoutDrawer } from '@/components/modals/CartCheckoutDrawer';
import { ProductCustomizerModal } from '@/components/modals/ProductCustomizerModal';
import { fetchCatalog } from '@/lib/api';
import { CartProvider, useCart } from '@/store/cart-store';
import { BrandFooter } from './BrandFooter';
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
  const { selectedBranch, setSelectedBranchId, totals } = useCart();

  const [activeCategory, setActiveCategory] = useState<DrinkCategoryId | 'all'>(
    'all',
  );
  const [activeSpice, setActiveSpice] = useState<SpiceLevel>('cay-vua');
  const [activeProductForModal, setActiveProductForModal] =
    useState<ProductItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

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

  return (
    <div
      data-api-base-url={apiBaseUrl}
      className="min-h-screen bg-canvas-cream text-espresso"
    >
      <StorefrontHeader
        branches={branches}
        selectedBranch={selectedBranch}
        onSelectBranch={setSelectedBranchId}
        cartItemCount={totals.totalItems}
        cartTotal={totals.grandTotal}
        onOpenCart={() => {
          setIsCartOpen(true);
          void onRefreshCatalog();
        }}
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-6 sm:px-6 lg:px-8">
        <HeroSpotlight
          spotlightProducts={spotlightProducts}
          onSelectProduct={(product) => setActiveProductForModal(product)}
        />

        <DrinkMenuSection
          categories={catalog.categories}
          drinks={drinks}
          activeCategory={activeCategory}
          onChangeCategory={setActiveCategory}
          onSelectDrink={(drink) => setActiveProductForModal(drink)}
        />

        <ToppingStripSection toppings={catalog.toppings} />

        <SnackMenuSection
          snacks={snacks}
          activeSpice={activeSpice}
          onChangeSpice={setActiveSpice}
          onSelectSnack={(snack, spice) => {
            setActiveSpice(spice);
            setActiveProductForModal(snack);
          }}
        />
      </main>

      <BrandFooter
        branches={branches}
        selectedBranchId={selectedBranch.id}
        onSelectBranch={setSelectedBranchId}
      />

      <ProductCustomizerModal
        product={activeProductForModal}
        toppings={catalog.toppings}
        defaultSpice={activeSpice}
        onClose={() => setActiveProductForModal(null)}
      />

      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        apiBaseUrl={apiBaseUrl}
        onOrderError={() => {
          void onRefreshCatalog();
        }}
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

  const refreshCatalog = useCallback(async () => {
    const result = await fetchCatalog(resolvedApiBaseUrl);
    if (!result.isFallback) {
      setCatalog(result.catalog);
    }
  }, [resolvedApiBaseUrl]);

  useEffect(() => {
    let isCancelled = false;

    void fetchCatalog(resolvedApiBaseUrl).then((result) => {
      if (!isCancelled && !result.isFallback) {
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

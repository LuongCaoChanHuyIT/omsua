'use client';

import {
  OMSUA_BRANCHES,
  type BranchInfo,
  type CatalogPayload,
  type OrderItemInput,
  type OrderLineResolved,
  type OrderTotals,
  calculateOrderTotals,
  canonicalizeCartItemKey,
  resolveOrderLine,
} from '@omsua/shared';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const CART_STORAGE_KEY = 'omsua.cart.v1';
const DEFAULT_BRANCH_ID = 'cs1-hoang-dieu';

export interface CartContextValue {
  branches: BranchInfo[];
  selectedBranch: BranchInfo;
  setSelectedBranchId: (branchId: string) => void;
  items: OrderItemInput[];
  lines: OrderLineResolved[];
  totals: OrderTotals;
  addItem: (item: OrderItemInput) => void;
  updateQuantity: (canonicalKey: string, quantity: number) => void;
  removeItem: (canonicalKey: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function normalizeToppingIds(toppingIds?: readonly string[]): string[] {
  if (!toppingIds || toppingIds.length === 0) {
    return [];
  }
  return Array.from(new Set(toppingIds)).sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
}

function normalizeOrderItemInput(item: OrderItemInput): OrderItemInput {
  const clampedQuantity = Math.min(99, Math.max(1, Math.round(item.quantity)));

  if (item.spiceLevel !== undefined) {
    return {
      productId: item.productId,
      quantity: clampedQuantity,
      size: item.size,
      spiceLevel: item.spiceLevel,
    };
  }

  return {
    productId: item.productId,
    quantity: clampedQuantity,
    size: item.size,
    sugarLevel: item.sugarLevel,
    iceLevel: item.iceLevel,
    toppingIds: normalizeToppingIds(item.toppingIds),
  };
}

export function resolvedLineToOrderItemInput(
  line: OrderLineResolved,
): OrderItemInput {
  if (line.kind === 'snack') {
    return {
      productId: line.productId,
      quantity: line.quantity,
      size: line.size,
      spiceLevel: line.spiceLevel,
    };
  }

  return {
    productId: line.productId,
    quantity: line.quantity,
    size: line.size,
    sugarLevel: line.sugarLevel,
    iceLevel: line.iceLevel,
    toppingIds: line.toppings.map((topping) => topping.id),
  };
}

function mergeItemIntoList(
  list: readonly OrderItemInput[],
  incoming: OrderItemInput,
): OrderItemInput[] {
  const normalized = normalizeOrderItemInput(incoming);
  const targetKey = canonicalizeCartItemKey(normalized);
  let merged = false;

  const next = list.map((existing) => {
    if (canonicalizeCartItemKey(existing) !== targetKey) {
      return existing;
    }
    merged = true;
    return {
      ...existing,
      quantity: Math.min(99, existing.quantity + normalized.quantity),
    };
  });

  if (!merged) {
    next.push(normalized);
  }

  return next;
}

function isOrderItemCandidate(value: unknown): value is OrderItemInput {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.productId === 'string' &&
    typeof candidate.quantity === 'number' &&
    typeof candidate.size === 'string'
  );
}

export interface CartProviderProps {
  catalog: CatalogPayload;
  branches: BranchInfo[];
  children: ReactNode;
}

export function CartProvider({
  catalog,
  branches,
  children,
}: CartProviderProps) {
  const fallbackBranchId = branches[0]?.id ?? DEFAULT_BRANCH_ID;
  const [rawItems, setRawItems] = useState<OrderItemInput[]>([]);
  const [selectedBranchId, setSelectedBranchIdState] =
    useState<string>(fallbackBranchId);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const hasHydratedRef = useRef<boolean>(false);

  const productsById = useMemo(
    () => new Map(catalog.products.map((product) => [product.id, product])),
    [catalog.products],
  );

  const toppingsById = useMemo(
    () => new Map(catalog.toppings.map((topping) => [topping.id, topping])),
    [catalog.toppings],
  );

  useEffect(() => {
    if (hasHydratedRef.current) {
      return;
    }
    hasHydratedRef.current = true;

    try {
      const storedRaw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (storedRaw) {
        const parsed: unknown = JSON.parse(storedRaw);
        if (parsed && typeof parsed === 'object') {
          const record = parsed as Record<string, unknown>;
          if (
            typeof record.selectedBranchId === 'string' &&
            branches.some((branch) => branch.id === record.selectedBranchId)
          ) {
            setSelectedBranchIdState(record.selectedBranchId);
          }

          if (Array.isArray(record.items)) {
            let hydratedItems: OrderItemInput[] = [];
            for (const candidate of record.items) {
              if (!isOrderItemCandidate(candidate)) {
                continue;
              }
              try {
                const resolved = resolveOrderLine(
                  candidate,
                  productsById,
                  toppingsById,
                );
                hydratedItems = mergeItemIntoList(
                  hydratedItems,
                  resolvedLineToOrderItemInput(resolved),
                );
              } catch {
                // Ignore persisted items that fail resolution against current catalog
              }
            }
            setRawItems(hydratedItems);
          }
        }
      }
    } catch {
      // Ignore SecurityError or malformed JSON in localStorage
    }

    setIsHydrated(true);
  }, [branches, productsById, toppingsById]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          version: 1,
          selectedBranchId,
          items: rawItems,
        }),
      );
    } catch {
      // Ignore SecurityError or QuotaExceededError
    }
  }, [isHydrated, rawItems, selectedBranchId]);

  const setSelectedBranchId = useCallback(
    (branchId: string) => {
      if (branches.some((branch) => branch.id === branchId)) {
        setSelectedBranchIdState(branchId);
      }
    },
    [branches],
  );

  const addItem = useCallback((item: OrderItemInput) => {
    setRawItems((prev) => mergeItemIntoList(prev, item));
  }, []);

  const updateQuantity = useCallback(
    (canonicalKey: string, quantity: number) => {
      setRawItems((prev) => {
        if (quantity <= 0) {
          return prev.filter(
            (entry) => canonicalizeCartItemKey(entry) !== canonicalKey,
          );
        }
        const clamped = Math.min(99, Math.max(1, Math.round(quantity)));
        return prev.map((entry) =>
          canonicalizeCartItemKey(entry) === canonicalKey
            ? { ...entry, quantity: clamped }
            : entry,
        );
      });
    },
    [],
  );

  const removeItem = useCallback((canonicalKey: string) => {
    setRawItems((prev) =>
      prev.filter((entry) => canonicalizeCartItemKey(entry) !== canonicalKey),
    );
  }, []);

  const clearCart = useCallback(() => {
    setRawItems([]);
  }, []);

  const selectedBranch = useMemo<BranchInfo>(() => {
    return (
      branches.find((branch) => branch.id === selectedBranchId) ??
      branches[0] ??
      OMSUA_BRANCHES[0]!
    );
  }, [branches, selectedBranchId]);

  const lines = useMemo<OrderLineResolved[]>(() => {
    const resolvedLines: OrderLineResolved[] = [];
    for (const item of rawItems) {
      try {
        resolvedLines.push(resolveOrderLine(item, productsById, toppingsById));
      } catch {
        // Skip items that became unavailable or invalid against live catalog
      }
    }
    return resolvedLines;
  }, [rawItems, productsById, toppingsById]);

  const items = useMemo<OrderItemInput[]>(
    () => lines.map((line) => resolvedLineToOrderItemInput(line)),
    [lines],
  );

  const totals = useMemo<OrderTotals>(
    () => calculateOrderTotals(lines),
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      branches,
      selectedBranch,
      setSelectedBranchId,
      items,
      lines,
      totals,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      addItem,
      branches,
      clearCart,
      items,
      lines,
      removeItem,
      selectedBranch,
      setSelectedBranchId,
      totals,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider.');
  }
  return context;
}

export function useOptionalCart(): CartContextValue | null {
  return useContext(CartContext);
}

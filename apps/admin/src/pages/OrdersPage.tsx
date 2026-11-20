import {
  ICE_LEVEL_LABELS,
  OMSUA_BRANCHES,
  ORDER_STATUSES,
  PAYMENT_METHOD_LABELS,
  SPICE_LEVEL_LABELS,
  SUGAR_LEVEL_LABELS,
  formatVnd,
  resolveOrderAge,
  type OrderLineResolved,
  type OrderRecord,
  type OrderStatus,
} from '@omsua/shared';
import {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  AppViewTransition,
  DirectionalPageTransition,
} from '../components/transitions/AppViewTransition';
import { fetchOrders, updateOrderStatus } from '../lib/api';
import { normalizeVietnameseSearch } from '../lib/text';

type StatusFilter = 'all' | OrderStatus;

const AUTO_REFRESH_INTERVAL_MS = 12_000;
const PRINT_RESET_FALLBACK_MS = 60_000;

const VALID_ORDER_STATUS_SET = new Set<string>(ORDER_STATUSES);
const VALID_BRANCH_ID_SET = new Set<string>(
  OMSUA_BRANCHES.map((branch) => branch.id),
);

function clampOrderStatus(raw: string | null): StatusFilter {
  if (raw && VALID_ORDER_STATUS_SET.has(raw)) {
    return raw as OrderStatus;
  }
  return 'all';
}

function clampBranchId(raw: string | null): string {
  if (raw && VALID_BRANCH_ID_SET.has(raw)) {
    return raw;
  }
  return '';
}

function clampCompactView(raw: string | null): boolean {
  return raw === 'compact';
}

function buildOrderSearchParams(next: {
  status: StatusFilter;
  branchId: string;
  q: string;
  compact: boolean;
}): URLSearchParams {
  const params = new URLSearchParams();
  if (next.status !== 'all') {
    params.set('status', next.status);
  }
  if (next.branchId) {
    params.set('branch', next.branchId);
  }
  if (next.q) {
    params.set('q', next.q);
  }
  if (next.compact) {
    params.set('view', 'compact');
  }
  return params;
}

const STATUS_FILTER_PILLS: ReadonlyArray<{
  value: StatusFilter;
  label: string;
}> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'preparing', label: 'Đang pha chế' },
  { value: 'delivering', label: 'Đang giao' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const ADMIN_ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  preparing: 'Đang pha chế',
  delivering: 'Đang giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

const ORDER_STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending: 'border-[#DCC67E] bg-card-butter text-olive-primary',
  preparing: 'border-[#E6B38E] bg-[#F6DFCE] text-[#9A460B]',
  delivering: 'border-[#D3C19D] bg-[#EFE4CC] text-[#6E5015]',
  completed: 'border-[#B4C488] bg-[#E3EAD1] text-[#45531B]',
  cancelled: 'border-[#E6ABA6] bg-[#F7DFDC] text-[#8F3530]',
};

function formatOrderTime(isoTimestamp: string): string {
  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) {
    return isoTimestamp;
  }
  return parsed.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function renderLineMetadata(item: OrderLineResolved): string {
  const parts: string[] = [item.sizeLabel];
  if (item.kind === 'drink') {
    if (item.sugarLevel) {
      parts.push(SUGAR_LEVEL_LABELS[item.sugarLevel]);
    }
    if (item.iceLevel) {
      parts.push(ICE_LEVEL_LABELS[item.iceLevel]);
    }
  } else if (item.spiceLevel) {
    parts.push(SPICE_LEVEL_LABELS[item.spiceLevel]);
  }
  return parts.join(' • ');
}

function matchesOrderQuery(order: OrderRecord, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const topLevelFields = [
    order.orderCode,
    order.branchName,
    order.customerName,
    order.customerPhone,
    order.deliveryAddress,
    order.note ?? '',
  ];
  for (const field of topLevelFields) {
    if (normalizeVietnameseSearch(field).includes(normalizedQuery)) {
      return true;
    }
  }

  return order.items.some(
    (item) =>
      normalizeVietnameseSearch(item.productName).includes(normalizedQuery) ||
      item.toppings.some((topping) =>
        normalizeVietnameseSearch(
          `${topping.name} ${topping.shortName}`,
        ).includes(normalizedQuery),
      ),
  );
}

interface CancelActionControlsProps {
  orderId: string;
  isConfirming: boolean;
  isUpdating: boolean;
  onRequestCancel: (orderId: string) => void;
  onDismissCancel: () => void;
  onConfirmCancel: (orderId: string) => void;
}

function CancelActionControls({
  orderId,
  isConfirming,
  isUpdating,
  onRequestCancel,
  onDismissCancel,
  onConfirmCancel,
}: CancelActionControlsProps) {
  if (isConfirming) {
    return (
      <>
        <button
          type="button"
          disabled={isUpdating}
          onClick={onDismissCancel}
          className="min-h-11 rounded-xl border border-[#D4C9B0] bg-canvas-cream px-4 py-2.5 text-sm font-semibold text-espresso transition hover:bg-card-butter/50 disabled:opacity-60"
        >
          Giữ lại
        </button>
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => onConfirmCancel(orderId)}
          className="min-h-11 rounded-xl border border-[#8F3530] bg-[#8F3530] px-4 py-2.5 text-sm font-semibold text-surface-light transition hover:bg-[#742A26] disabled:opacity-60"
        >
          Xác nhận hủy đơn
        </button>
      </>
    );
  }

  return (
    <button
      type="button"
      disabled={isUpdating}
      onClick={() => onRequestCancel(orderId)}
      className="min-h-11 rounded-xl border border-coral-sketch bg-[#F7DFDC] px-4 py-2.5 text-sm font-semibold text-[#8F3530] transition hover:bg-[#F2CECA] disabled:opacity-60"
    >
      Hủy đơn
    </button>
  );
}

interface AdminOrderCardProps {
  order: OrderRecord;
  isCompact: boolean;
  isPrintActive: boolean;
  isUpdating: boolean;
  isConfirmingCancel: boolean;
  onPrintOrder: (orderId: string) => void;
  onRequestCancel: (orderId: string) => void;
  onDismissCancel: () => void;
  onConfirmCancel: (orderId: string) => void;
  onAdvanceStatus: (orderId: string, nextStatus: OrderStatus) => void;
}

const AdminOrderCard = memo(function AdminOrderCard({
  order,
  isCompact,
  isPrintActive,
  isUpdating,
  isConfirmingCancel,
  onPrintOrder,
  onRequestCancel,
  onDismissCancel,
  onConfirmCancel,
  onAdvanceStatus,
}: AdminOrderCardProps) {
  const orderAge = resolveOrderAge(order.createdAt, order.status);

  return (
    <article
      data-testid={`order-card-${order.id}`}
      data-print-active={isPrintActive ? 'true' : undefined}
      className={`rounded-2xl border bg-surface-light shadow-paper-rest transition-colors ${
        isCompact ? 'p-4' : 'p-5 sm:p-6'
      } ${
        orderAge?.isOverdue
          ? 'border-terracotta/55 hover:border-terracotta'
          : 'border-[#DDD4C0] hover:border-[#CBBFA4]'
      }`}
    >
      <div className="hidden print:mb-3 print:block print:border-b print:border-dashed print:border-[#29261D] print:pb-2">
        <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-espresso">
          Ốm Sữa Đà Lạt • Phiếu pha chế quầy bếp
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5DEC9] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-base font-bold text-espresso tabular-nums sm:text-lg">
              {order.orderCode}
            </span>
            <span
              data-testid={`order-status-${order.id}`}
              className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold ${ORDER_STATUS_BADGE_CLASSES[order.status]}`}
            >
              {ADMIN_ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className="inline-flex items-center rounded-full border border-[#D5CCB6] bg-canvas-cream px-2.5 py-0.5 text-xs font-medium text-espresso">
              {PAYMENT_METHOD_LABELS[order.paymentMethod]}
            </span>
            {orderAge ? (
              <span
                data-testid="order-age-badge"
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums ${
                  orderAge.isOverdue
                    ? 'border-terracotta/45 bg-coral-sketch/28 text-espresso'
                    : 'border-[#D5CCB6] bg-canvas-cream text-warm-muted'
                }`}
              >
                {orderAge.isOverdue
                  ? `Quá hạn • ${orderAge.label}`
                  : orderAge.label}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-xs font-medium text-warm-muted tabular-nums">
            {order.branchName} • Đặt lúc {formatOrderTime(order.createdAt)}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs font-medium text-warm-muted tabular-nums">
            Tổng thanh toán ({order.totalItems} món)
          </p>
          <p className="font-display text-xl font-bold text-terracotta-deep tabular-nums">
            {formatVnd(order.grandTotal)}
          </p>
        </div>
      </div>

      <div
        className={
          isCompact
            ? 'mt-3 space-y-3'
            : 'mt-4 grid gap-5 lg:grid-cols-12'
        }
      >
        <div
          className={`space-y-2 rounded-xl border border-[#E5DEC9] bg-canvas-cream/70 p-4 text-sm ${
            isCompact ? '' : 'lg:col-span-5'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-ochre-deep">
            Thông tin giao nhận
          </p>
          <p className="font-semibold text-espresso">
            {order.customerName}{' '}
            <span className="font-mono font-medium text-warm-muted tabular-nums">
              • {order.customerPhone}
            </span>
          </p>
          <p className="text-espresso">{order.deliveryAddress}</p>
          {order.paymentMethod === 'qr' ? (
            <p className="rounded-lg border border-[#B4C488] bg-[#E3EAD1]/80 px-3 py-2 font-mono text-xs font-semibold text-[#45531B] tabular-nums">
              CK: OMSUA {order.orderCode} {order.customerPhone}
            </p>
          ) : null}
          {order.note ? (
            <p className="rounded-lg border border-[#DEC98A] bg-card-butter/60 px-3 py-2 text-xs font-medium text-olive-primary">
              Ghi chú: {order.note}
            </p>
          ) : null}
        </div>

        <div className={`space-y-2.5 ${isCompact ? '' : 'lg:col-span-7'}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-ochre-deep tabular-nums">
            Chi tiết món ({order.items.length} dòng)
          </p>
          <ul className="divide-y divide-[#E5DEC9] rounded-xl border border-[#E5DEC9] bg-canvas-cream/50 px-4">
            {order.items.map((item) => (
              <li
                key={item.canonicalKey}
                className="flex items-start justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-editorial font-semibold text-espresso">
                    <span className="mr-1.5 font-sans font-bold text-terracotta-deep tabular-nums">
                      {item.quantity}×
                    </span>
                    {item.productName}
                  </p>
                  <p className="mt-0.5 text-xs text-warm-muted">
                    {renderLineMetadata(item)}
                  </p>
                  {item.toppings.length > 0 ? (
                    <p className="mt-1 text-xs font-medium text-olive-primary tabular-nums">
                      Topping:{' '}
                      {item.toppings
                        .map(
                          (topping) =>
                            `${topping.shortName} (+${formatVnd(topping.price)})`,
                        )
                        .join(', ')}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 font-semibold text-espresso tabular-nums">
                  {formatVnd(item.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        data-order-actions="true"
        className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#E5DEC9] pt-4"
      >
        <button
          type="button"
          onClick={() => onPrintOrder(order.id)}
          className="min-h-11 rounded-xl border border-[#D4C9B0] bg-canvas-cream px-3.5 py-2 text-xs font-semibold text-espresso transition-colors hover:border-olive-primary hover:bg-card-butter/60 sm:text-sm"
        >
          In phiếu bếp
        </button>

        {order.status === 'pending' ||
        order.status === 'preparing' ||
        order.status === 'delivering' ? (
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {order.status === 'pending' ? (
              <>
                <CancelActionControls
                  orderId={order.id}
                  isConfirming={isConfirmingCancel}
                  isUpdating={isUpdating}
                  onRequestCancel={onRequestCancel}
                  onDismissCancel={onDismissCancel}
                  onConfirmCancel={onConfirmCancel}
                />
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onAdvanceStatus(order.id, 'preparing')}
                  className="min-h-11 rounded-xl bg-terracotta-deep px-4 py-2.5 text-sm font-semibold text-surface-light shadow-xs transition-colors hover:bg-[#8C3D09] disabled:opacity-60"
                >
                  Xác nhận pha chế
                </button>
              </>
            ) : null}

            {order.status === 'preparing' ? (
              <>
                <CancelActionControls
                  orderId={order.id}
                  isConfirming={isConfirmingCancel}
                  isUpdating={isUpdating}
                  onRequestCancel={onRequestCancel}
                  onDismissCancel={onDismissCancel}
                  onConfirmCancel={onConfirmCancel}
                />
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onAdvanceStatus(order.id, 'delivering')}
                  className="min-h-11 rounded-xl bg-terracotta-deep px-4 py-2.5 text-sm font-semibold text-surface-light shadow-xs transition-colors hover:bg-[#8C3D09] disabled:opacity-60"
                >
                  Giao hàng
                </button>
              </>
            ) : null}

            {order.status === 'delivering' ? (
              <>
                <CancelActionControls
                  orderId={order.id}
                  isConfirming={isConfirmingCancel}
                  isUpdating={isUpdating}
                  onRequestCancel={onRequestCancel}
                  onDismissCancel={onDismissCancel}
                  onConfirmCancel={onConfirmCancel}
                />
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onAdvanceStatus(order.id, 'completed')}
                  className="min-h-11 rounded-xl bg-artichoke-deep px-4 py-2.5 text-sm font-semibold text-surface-light shadow-xs transition-colors hover:bg-[#3D471A] disabled:opacity-60"
                >
                  Hoàn tất
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
});

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() =>
    clampBranchId(searchParams.get('branch')),
  );
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>(() =>
    clampOrderStatus(searchParams.get('status')),
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    () => searchParams.get('q') ?? '',
  );
  const [isCompactView, setIsCompactView] = useState<boolean>(() =>
    clampCompactView(searchParams.get('view')),
  );
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingCancelOrderId, setConfirmingCancelOrderId] = useState<
    string | null
  >(null);
  const [updatingOrderIds, setUpdatingOrderIds] = useState<Set<string>>(
    () => new Set(),
  );
  const fetchSeqRef = useRef<number>(0);
  const mutationEpochRef = useRef<number>(0);
  const inFlightMutationsRef = useRef<number>(0);
  const activeForegroundSeqRef = useRef<number>(0);
  const committedMutationsRef = useRef<Map<string, OrderRecord>>(new Map());
  const printFallbackTimerRef = useRef<number | null>(null);
  const activeBranchRef = useRef<string>(selectedBranchId);
  activeBranchRef.current = selectedBranchId;

  useEffect(() => {
    const nextBranch = clampBranchId(searchParams.get('branch'));
    const nextStatus = clampOrderStatus(searchParams.get('status'));
    const nextQuery = searchParams.get('q') ?? '';
    const nextCompact = clampCompactView(searchParams.get('view'));

    setSelectedBranchId((prev) => (prev === nextBranch ? prev : nextBranch));
    setSelectedStatus((prev) => (prev === nextStatus ? prev : nextStatus));
    setSearchQuery((prev) => (prev === nextQuery ? prev : nextQuery));
    setIsCompactView((prev) => (prev === nextCompact ? prev : nextCompact));

    const canonical = buildOrderSearchParams({
      status: nextStatus,
      branchId: nextBranch,
      q: nextQuery,
      compact: nextCompact,
    });
    if (canonical.toString() !== searchParams.toString()) {
      setSearchParams(canonical, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const handleAfterPrint = () => {
      if (printFallbackTimerRef.current !== null) {
        window.clearTimeout(printFallbackTimerRef.current);
        printFallbackTimerRef.current = null;
      }
      setPrintingOrderId(null);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      if (printFallbackTimerRef.current !== null) {
        window.clearTimeout(printFallbackTimerRef.current);
        printFallbackTimerRef.current = null;
      }
    };
  }, []);

  const syncOrderUrl = useCallback(
    (
      overrides: Partial<{
        status: StatusFilter;
        branchId: string;
        q: string;
        compact: boolean;
      }>,
    ) => {
      const nextParams = buildOrderSearchParams({
        status: overrides.status ?? selectedStatus,
        branchId: overrides.branchId ?? selectedBranchId,
        q: overrides.q ?? searchQuery,
        compact: overrides.compact ?? isCompactView,
      });
      setSearchParams(nextParams, { replace: true });
    },
    [
      isCompactView,
      searchQuery,
      selectedBranchId,
      selectedStatus,
      setSearchParams,
    ],
  );

  const handlePrintOrder = useCallback((orderId: string) => {
    if (printFallbackTimerRef.current !== null) {
      window.clearTimeout(printFallbackTimerRef.current);
      printFallbackTimerRef.current = null;
    }
    flushSync(() => {
      setPrintingOrderId(orderId);
    });
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
    printFallbackTimerRef.current = window.setTimeout(() => {
      setPrintingOrderId(null);
      printFallbackTimerRef.current = null;
    }, PRINT_RESET_FALLBACK_MS);
  }, []);

  const loadOrders = useCallback(async (branchId: string) => {
    const seq = ++fetchSeqRef.current;
    const mutEpoch = mutationEpochRef.current;
    activeForegroundSeqRef.current = seq;
    setLoading(true);
    setError(null);
    setConfirmingCancelOrderId(null);
    const result = await fetchOrders({
      branchId: branchId || undefined,
    });
    if (seq !== fetchSeqRef.current) {
      return;
    }
    activeForegroundSeqRef.current = 0;
    if (result.ok) {
      if (
        mutEpoch === mutationEpochRef.current &&
        inFlightMutationsRef.current === 0
      ) {
        committedMutationsRef.current.clear();
        setOrders(result.data);
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    const initialSeq = ++fetchSeqRef.current;
    const initialMutEpoch = mutationEpochRef.current;
    activeForegroundSeqRef.current = initialSeq;
    setLoading(true);
    setError(null);
    setConfirmingCancelOrderId(null);

    void fetchOrders({
      branchId: selectedBranchId || undefined,
    }).then((result) => {
      if (!active || initialSeq !== fetchSeqRef.current) return;
      activeForegroundSeqRef.current = 0;
      if (result.ok) {
        if (
          initialMutEpoch === mutationEpochRef.current &&
          inFlightMutationsRef.current === 0
        ) {
          committedMutationsRef.current.clear();
          setOrders(result.data);
        } else {
          setOrders(
            result.data.map(
              (entry) => committedMutationsRef.current.get(entry.id) ?? entry,
            ),
          );
        }
      } else {
        setError(result.error);
      }
      setLoading(false);
    });

    const intervalId = window.setInterval(() => {
      if (
        typeof document !== 'undefined' &&
        document.visibilityState !== 'visible'
      ) {
        return;
      }
      if (
        inFlightMutationsRef.current > 0 ||
        activeForegroundSeqRef.current !== 0
      ) {
        return;
      }

      const seq = ++fetchSeqRef.current;
      const mutEpoch = mutationEpochRef.current;

      void fetchOrders({
        branchId: selectedBranchId || undefined,
      }).then((result) => {
        if (
          !active ||
          seq !== fetchSeqRef.current ||
          mutEpoch !== mutationEpochRef.current ||
          inFlightMutationsRef.current > 0
        ) {
          return;
        }
        if (result.ok) {
          committedMutationsRef.current.clear();
          setOrders(result.data);
        }
      });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [selectedBranchId]);

  const { counts, validRevenue } = useMemo(() => {
    const tally: Record<StatusFilter, number> = {
      all: orders.length,
      pending: 0,
      preparing: 0,
      delivering: 0,
      completed: 0,
      cancelled: 0,
    };
    let revenue = 0;

    for (const order of orders) {
      tally[order.status] += 1;
      if (order.status !== 'cancelled') {
        revenue += order.grandTotal;
      }
    }

    return { counts: tally, validRevenue: revenue };
  }, [orders]);

  const normalizedQuery = useMemo(
    () => normalizeVietnameseSearch(searchQuery),
    [searchQuery],
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (selectedStatus !== 'all' && order.status !== selectedStatus) {
        return false;
      }
      return matchesOrderQuery(order, normalizedQuery);
    });
  }, [orders, selectedStatus, normalizedQuery]);

  const handleTransition = useCallback(
    async (orderId: string, nextStatus: OrderStatus) => {
      mutationEpochRef.current += 1;
      inFlightMutationsRef.current += 1;
      setConfirmingCancelOrderId((current) =>
        current === orderId ? null : current,
      );
      setUpdatingOrderIds((prev) => {
        const next = new Set(prev);
        next.add(orderId);
        return next;
      });
      setError(null);
      try {
        const result = await updateOrderStatus(orderId, nextStatus);

        if (!result.ok) {
          setError(result.error);
          return;
        }

        committedMutationsRef.current.set(orderId, result.data);
        setOrders((current) => {
          if (
            activeBranchRef.current &&
            result.data.branchId !== activeBranchRef.current
          ) {
            return current;
          }
          return current.map((entry) =>
            entry.id === orderId ? result.data : entry,
          );
        });
      } finally {
        mutationEpochRef.current += 1;
        inFlightMutationsRef.current -= 1;
        setUpdatingOrderIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    },
    [],
  );

  const handleRequestCancel = useCallback((orderId: string) => {
    setConfirmingCancelOrderId(orderId);
  }, []);

  const handleDismissCancel = useCallback(() => {
    setConfirmingCancelOrderId(null);
  }, []);

  const handleConfirmCancel = useCallback(
    (orderId: string) => {
      void handleTransition(orderId, 'cancelled');
    },
    [handleTransition],
  );

  const handleAdvanceStatus = useCallback(
    (orderId: string, nextStatus: OrderStatus) => {
      void handleTransition(orderId, nextStatus);
    },
    [handleTransition],
  );

  return (
    <DirectionalPageTransition>
      <div
        data-admin-orders-root={printingOrderId ? 'isolating' : undefined}
        className="mx-auto max-w-6xl space-y-6"
      >
        <div
          data-print-hide="true"
          className="flex flex-wrap items-start justify-between gap-4"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ochre-deep">
              Điều phối quầy pha chế
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-olive-primary sm:text-3xl">
              Quản lý Đơn hàng
            </h1>
            <p className="mt-1 text-sm text-warm-muted">
              Tiếp nhận đơn mới, xác nhận pha chế và theo dõi giao hàng tại 4 cơ sở
              Ốm Sữa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              aria-pressed={isCompactView}
              onClick={() => {
                const nextCompact = !isCompactView;
                setIsCompactView(nextCompact);
                syncOrderUrl({ compact: nextCompact });
              }}
              className={`min-h-11 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                isCompactView
                  ? 'border-hero-espresso bg-hero-espresso text-surface-light shadow-xs'
                  : 'border-[#D4C9B0] bg-surface-light text-espresso hover:border-olive-primary hover:bg-card-butter/50'
              }`}
            >
              Chế độ Thẻ Bếp gọn
            </button>

            <button
              type="button"
              onClick={() => void loadOrders(selectedBranchId)}
              disabled={loading}
              className="min-h-11 rounded-xl border border-[#D4C9B0] bg-surface-light px-4 py-2.5 text-sm font-semibold text-espresso transition-colors hover:border-olive-primary hover:bg-card-butter/50 disabled:opacity-60"
            >
              {loading ? 'Đang tải…' : 'Làm mới'}
            </button>
          </div>
        </div>

        <section
          data-admin-kpi="true"
          aria-label="Tổng quan đơn hàng"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <div className="rounded-2xl border border-[#DDD4C0] bg-surface-light p-4 shadow-paper-rest">
            <p className="text-xs font-semibold uppercase tracking-wider text-warm-muted">
              Tổng đơn hàng
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-espresso tabular-nums">
              {counts.all}
            </p>
          </div>
          <div className="rounded-2xl border border-[#DEC98A] bg-card-butter/60 p-4 shadow-paper-rest">
            <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">
              Chờ xác nhận
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-olive-primary tabular-nums">
              {counts.pending}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E6B38E] bg-[#F6DFCE]/70 p-4 shadow-paper-rest">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9A460B]">
              Đang pha chế &amp; giao
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-[#9A460B] tabular-nums">
              {counts.preparing + counts.delivering}
            </p>
          </div>
          <div className="rounded-2xl border border-[#B4C488] bg-[#E3EAD1]/75 p-4 shadow-paper-rest">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#45531B]">
              Doanh thu hợp lệ
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-[#45531B] tabular-nums">
              {formatVnd(validRevenue)}
            </p>
          </div>
        </section>

        <section
          data-admin-toolbar="true"
          className="space-y-4 rounded-2xl border border-[#DDD4C0] bg-surface-light p-4 shadow-xs sm:p-5"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <input
                id="order-search"
                name="orderSearch"
                type="search"
                aria-label="Tìm kiếm đơn hàng"
                value={searchQuery}
                onChange={(event) => {
                  const nextQ = event.target.value;
                  setSearchQuery(nextQ);
                  syncOrderUrl({ q: nextQ });
                }}
                placeholder="Tìm mã OM-…, tên khách, SĐT, món…"
                className="min-h-11 w-full rounded-xl border border-[#D4C9B0] bg-canvas-cream px-3.5 py-2.5 text-base text-espresso placeholder:text-warm-muted focus:border-olive-primary focus:outline-none sm:text-sm"
              />
              {searchQuery.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    syncOrderUrl({ q: '' });
                  }}
                  className="min-h-11 shrink-0 rounded-xl border border-[#D4C9B0] bg-canvas-cream px-3.5 py-2 text-xs font-semibold text-espresso transition-colors hover:border-olive-primary hover:bg-card-butter/60 sm:text-sm"
                >
                  Xóa tìm
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2.5">
              <label
                htmlFor="branch-filter"
                className="shrink-0 text-xs font-semibold uppercase tracking-wider text-warm-muted"
              >
                Chi nhánh
              </label>
              <select
                id="branch-filter"
                aria-label="Lọc theo chi nhánh"
                value={selectedBranchId}
                onChange={(event) => {
                  const nextBranch = clampBranchId(event.target.value);
                  setSelectedBranchId(nextBranch);
                  syncOrderUrl({ branchId: nextBranch });
                }}
                className="min-h-11 w-full rounded-xl border border-[#D4C9B0] bg-canvas-cream px-3.5 py-2 text-base font-medium text-espresso focus:border-olive-primary focus:outline-none sm:text-sm md:w-64"
              >
                <option value="" className="bg-surface-light text-espresso">
                  Tất cả chi nhánh
                </option>
                {OMSUA_BRANCHES.map((branch) => (
                  <option
                    key={branch.id}
                    value={branch.id}
                    className="bg-surface-light text-espresso"
                  >
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Lọc theo trạng thái"
          >
            {STATUS_FILTER_PILLS.map((pill) => {
              const isSelected = selectedStatus === pill.value;
              return (
                <button
                  key={pill.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    startTransition(() => {
                      setSelectedStatus(pill.value);
                    });
                    syncOrderUrl({ status: pill.value });
                  }}
                  className={`relative min-h-11 overflow-hidden rounded-full px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                    isSelected
                      ? 'bg-hero-espresso text-surface-light shadow-xs'
                      : 'border border-[#D8CEB8] bg-canvas-cream text-espresso hover:bg-card-butter/60'
                  }`}
                >
                  {isSelected ? (
                    <AppViewTransition
                      name="admin-status-pill"
                      share="tab-pill"
                      default="none"
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-3.5 bottom-1 h-[2.5px] rounded-full bg-card-butter"
                      />
                    </AppViewTransition>
                  ) : null}
                  <span className="relative z-10 tabular-nums">
                    {pill.label} ({counts[pill.value]})
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-[#E6ABA6] bg-[#F7DFDC] px-5 py-4 text-sm text-[#8F3530]"
          >
            <p className="font-semibold">Không thể đồng bộ dữ liệu đơn hàng</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : null}

        {loading && orders.length === 0 ? (
          <div className="rounded-2xl border border-[#DDD4C0] bg-surface-light p-10 text-center text-sm text-warm-muted">
            Đang tải danh sách đơn hàng từ máy chủ Ốm Sữa…
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-[#DDD4C0] bg-surface-light p-10 text-center">
            <p className="font-editorial text-lg font-semibold text-espresso">
              Chưa có đơn hàng nào trong danh mục lọc này
            </p>
            <p className="mt-1 text-sm text-warm-muted">
              Đơn đặt mới từ Website sẽ xuất hiện tại đây ngay khi khách xác nhận.
            </p>
          </div>
        ) : (
          <div
            data-view-mode={isCompactView ? 'compact' : 'comfortable'}
            data-print-isolating={printingOrderId ? 'true' : undefined}
            className={
              isCompactView ? 'grid gap-4 lg:grid-cols-2' : 'space-y-4'
            }
          >
            {filteredOrders.map((order) => (
              <AppViewTransition key={order.id} default="none">
                <AdminOrderCard
                  order={order}
                  isCompact={isCompactView}
                  isPrintActive={printingOrderId === order.id}
                  isUpdating={updatingOrderIds.has(order.id)}
                  isConfirmingCancel={confirmingCancelOrderId === order.id}
                  onPrintOrder={handlePrintOrder}
                  onRequestCancel={handleRequestCancel}
                  onDismissCancel={handleDismissCancel}
                  onConfirmCancel={handleConfirmCancel}
                  onAdvanceStatus={handleAdvanceStatus}
                />
              </AppViewTransition>
            ))}
          </div>
        )}
      </div>
    </DirectionalPageTransition>
  );
}

import {
  ICE_LEVEL_LABELS,
  OMSUA_BRANCHES,
  PAYMENT_METHOD_LABELS,
  SPICE_LEVEL_LABELS,
  SUGAR_LEVEL_LABELS,
  formatVnd,
  type OrderLineResolved,
  type OrderRecord,
  type OrderStatus,
} from '@omsua/shared';
import { useCallback, useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus } from '../lib/api';

type StatusFilter = 'all' | OrderStatus;

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

export function OrdersPage() {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderIds, setUpdatingOrderIds] = useState<Set<string>>(
    () => new Set(),
  );

  const loadOrders = useCallback(
    async (statusFilter: StatusFilter, branchId: string) => {
      setLoading(true);
      setError(null);
      const result = await fetchOrders({
        status: statusFilter === 'all' ? undefined : statusFilter,
        branchId: branchId || undefined,
      });
      if (result.ok) {
        setOrders(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    void fetchOrders({
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      branchId: selectedBranchId || undefined,
    }).then((result) => {
      if (!active) return;
      if (result.ok) {
        setOrders(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [selectedBranchId, selectedStatus]);

  const handleTransition = async (orderId: string, nextStatus: OrderStatus) => {
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

      setOrders((current) => {
        if (selectedStatus !== 'all' && result.data.status !== selectedStatus) {
          return current.filter((entry) => entry.id !== orderId);
        }
        return current.map((entry) =>
          entry.id === orderId ? result.data : entry,
        );
      });
    } finally {
      setUpdatingOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-subhead-ochre">
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

        <button
          type="button"
          onClick={() => void loadOrders(selectedStatus, selectedBranchId)}
          disabled={loading}
          className="rounded-xl border border-[#D4C9B0] bg-surface-light px-4 py-2.5 text-sm font-semibold text-espresso transition hover:border-olive-primary hover:bg-card-butter/50 disabled:opacity-60"
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      <section className="rounded-2xl border border-[#DDD4C0] bg-surface-light p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo trạng thái">
            {STATUS_FILTER_PILLS.map((pill) => {
              const isSelected = selectedStatus === pill.value;
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => setSelectedStatus(pill.value)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition sm:text-sm ${
                    isSelected
                      ? 'bg-hero-espresso text-surface-light shadow-xs'
                      : 'border border-[#D8CEB8] bg-canvas-cream text-espresso hover:bg-card-butter/60'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
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
              onChange={(event) => setSelectedBranchId(event.target.value)}
              className="w-full rounded-xl border border-[#D4C9B0] bg-canvas-cream px-3.5 py-2 text-sm font-medium text-espresso focus:border-olive-primary focus:outline-none lg:w-64"
            >
              <option value="">Tất cả chi nhánh</option>
              {OMSUA_BRANCHES.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
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
          Đang tải danh sách đơn hàng từ máy chủ Ốm Sữa...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-[#DDD4C0] bg-surface-light p-10 text-center">
          <p className="font-editorial text-lg font-semibold text-espresso">
            Chưa có đơn hàng nào trong danh mục lọc này
          </p>
          <p className="mt-1 text-sm text-warm-muted">
            Đơn đặt mới từ Website sẽ xuất hiện tại đây ngay khi khách xác nhận.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isUpdating = updatingOrderIds.has(order.id);

            return (
              <article
                key={order.id}
                data-testid={`order-card-${order.id}`}
                className="rounded-2xl border border-[#DDD4C0] bg-surface-light p-5 shadow-xs transition hover:border-[#CBBFA4] sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5DEC9] pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-base font-bold text-espresso sm:text-lg">
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
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-warm-muted">
                      {order.branchName} • Đặt lúc {formatOrderTime(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs font-medium text-warm-muted">
                      Tổng thanh toán ({order.totalItems} món)
                    </p>
                    <p className="font-display text-xl font-bold text-terracotta">
                      {formatVnd(order.grandTotal)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-5 lg:grid-cols-12">
                  <div className="space-y-2 rounded-xl border border-[#E5DEC9] bg-canvas-cream/70 p-4 text-sm lg:col-span-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-subhead-ochre">
                      Thông tin giao nhận
                    </p>
                    <p className="font-semibold text-espresso">
                      {order.customerName}{' '}
                      <span className="font-mono font-medium text-warm-muted">
                        • {order.customerPhone}
                      </span>
                    </p>
                    <p className="text-espresso">{order.deliveryAddress}</p>
                    {order.note ? (
                      <p className="rounded-lg border border-[#DEC98A] bg-card-butter/60 px-3 py-2 text-xs font-medium text-olive-primary">
                        Ghi chú: {order.note}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2.5 lg:col-span-7">
                    <p className="text-xs font-semibold uppercase tracking-wider text-subhead-ochre">
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
                              <span className="mr-1.5 font-sans font-bold text-terracotta">
                                {item.quantity}×
                              </span>
                              {item.productName}
                            </p>
                            <p className="mt-0.5 text-xs text-warm-muted">
                              {renderLineMetadata(item)}
                            </p>
                            {item.toppings.length > 0 ? (
                              <p className="mt-1 text-xs font-medium text-olive-primary">
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
                          <span className="shrink-0 font-semibold text-espresso">
                            {formatVnd(item.lineTotal)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {order.status === 'pending' ||
                order.status === 'preparing' ||
                order.status === 'delivering' ? (
                  <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5 border-t border-[#E5DEC9] pt-4">
                    {order.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            void handleTransition(order.id, 'cancelled')
                          }
                          className="rounded-xl border border-coral-sketch bg-[#F7DFDC] px-4 py-2 text-sm font-semibold text-[#8F3530] transition hover:bg-[#F2CECA] disabled:opacity-60"
                        >
                          Hủy đơn
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            void handleTransition(order.id, 'preparing')
                          }
                          className="rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-surface-light shadow-xs transition hover:bg-[#C05C16] disabled:opacity-60"
                        >
                          Xác nhận pha chế
                        </button>
                      </>
                    ) : null}

                    {order.status === 'preparing' ? (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            void handleTransition(order.id, 'cancelled')
                          }
                          className="rounded-xl border border-coral-sketch bg-[#F7DFDC] px-4 py-2 text-sm font-semibold text-[#8F3530] transition hover:bg-[#F2CECA] disabled:opacity-60"
                        >
                          Hủy đơn
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            void handleTransition(order.id, 'delivering')
                          }
                          className="rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-surface-light shadow-xs transition hover:bg-[#C05C16] disabled:opacity-60"
                        >
                          Giao hàng
                        </button>
                      </>
                    ) : null}

                    {order.status === 'delivering' ? (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          void handleTransition(order.id, 'completed')
                        }
                        className="rounded-xl bg-artichoke px-4 py-2 text-sm font-semibold text-surface-light shadow-xs transition hover:bg-[#66762F] disabled:opacity-60"
                      >
                        Hoàn tất
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

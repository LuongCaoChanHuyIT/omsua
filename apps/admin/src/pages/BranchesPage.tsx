import {
  OMSUA_BRANCHES,
  formatVnd,
  type BranchInfo,
  type OrderRecord,
} from '@omsua/shared';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchAdminBranches, fetchOrders } from '../lib/api';

interface BranchOrderStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  revenue: number;
}

function computeBranchStats(
  branchId: string,
  orders: readonly OrderRecord[],
): BranchOrderStats {
  let totalOrders = 0;
  let activeOrders = 0;
  let completedOrders = 0;
  let revenue = 0;

  for (const order of orders) {
    if (order.branchId !== branchId) continue;
    totalOrders += 1;
    if (
      order.status === 'pending' ||
      order.status === 'preparing' ||
      order.status === 'delivering'
    ) {
      activeOrders += 1;
    }
    if (order.status === 'completed') {
      completedOrders += 1;
    }
    if (order.status !== 'cancelled') {
      revenue += order.grandTotal;
    }
  }

  return { totalOrders, activeOrders, completedOrders, revenue };
}

export function BranchesPage() {
  const [branches, setBranches] = useState<BranchInfo[]>(() =>
    OMSUA_BRANCHES.map((branch) => ({ ...branch })),
  );
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFallbackBranches, setIsFallbackBranches] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const requestSeqRef = useRef<number>(0);

  const loadData = useCallback(async () => {
    const seq = ++requestSeqRef.current;
    setLoading(true);
    setOrdersError(null);
    const [branchesResult, ordersResult] = await Promise.all([
      fetchAdminBranches(),
      fetchOrders(),
    ]);

    if (seq !== requestSeqRef.current) {
      return;
    }

    const branchesSucceeded =
      branchesResult.ok && branchesResult.data.length > 0;
    if (branchesSucceeded) {
      setBranches(branchesResult.data);
      setIsFallbackBranches(false);
    } else {
      setBranches(OMSUA_BRANCHES.map((branch) => ({ ...branch })));
      setIsFallbackBranches(true);
    }

    if (ordersResult.ok) {
      setOrders(ordersResult.data);
      setOrdersError(null);
    } else if (branchesSucceeded) {
      setOrdersError(ordersResult.error);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    const seq = ++requestSeqRef.current;
    setLoading(true);
    setOrdersError(null);

    void Promise.all([fetchAdminBranches(), fetchOrders()]).then(
      ([branchesResult, ordersResult]) => {
        if (!active || seq !== requestSeqRef.current) return;

        const branchesSucceeded =
          branchesResult.ok && branchesResult.data.length > 0;
        if (branchesSucceeded) {
          setBranches(branchesResult.data);
          setIsFallbackBranches(false);
        } else {
          setBranches(OMSUA_BRANCHES.map((branch) => ({ ...branch })));
          setIsFallbackBranches(true);
        }

        if (ordersResult.ok) {
          setOrders(ordersResult.data);
          setOrdersError(null);
        } else if (branchesSucceeded) {
          setOrdersError(ordersResult.error);
        }

        setLoading(false);
      },
    );

    return () => {
      active = false;
    };
  }, []);

  const chainStats = useMemo(() => {
    let activeOrders = 0;
    let revenue = 0;

    for (const order of orders) {
      if (
        order.status === 'pending' ||
        order.status === 'preparing' ||
        order.status === 'delivering'
      ) {
        activeOrders += 1;
      }
      if (order.status !== 'cancelled') {
        revenue += order.grandTotal;
      }
    }

    return {
      totalOrders: orders.length,
      activeOrders,
      revenue,
    };
  }, [orders]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-subhead-ochre">
            Đà Lạt &amp; Đức Trọng • Lâm Đồng
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-olive-primary sm:text-3xl">
            Hệ thống Chi nhánh Ốm Sữa
          </h1>
          <p className="mt-1 text-sm text-warm-muted">
            Theo dõi địa chỉ, hotline điều phối và lượng đơn hàng trực tiếp theo
            từng cơ sở.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="min-h-11 rounded-xl border border-[#D4C9B0] bg-surface-light px-4 py-2.5 text-sm font-semibold text-espresso transition hover:border-olive-primary hover:bg-card-butter/50 disabled:opacity-60"
        >
          {loading ? 'Đang đồng bộ...' : 'Làm mới'}
        </button>
      </div>

      <section
        aria-label="Tổng quan toàn chuỗi"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="rounded-2xl border border-[#DDD4C0] bg-surface-light p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-muted">
            Quy mô hệ thống
          </p>
          <p className="mt-1 font-display text-xl font-bold text-olive-primary sm:text-2xl">
            {branches.length} Cơ sở hoạt động
          </p>
        </div>
        <div className="rounded-2xl border border-[#DDD4C0] bg-surface-light p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-muted">
            Tổng đơn toàn chuỗi
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-espresso">
            {chainStats.totalOrders}
          </p>
        </div>
        <div className="rounded-2xl border border-[#DEC98A] bg-card-butter/60 p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">
            Đơn đang xử lý
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-terracotta">
            {chainStats.activeOrders}
          </p>
        </div>
        <div className="rounded-2xl border border-[#B4C488] bg-[#E3EAD1]/75 p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#45531B]">
            Tổng doanh thu hợp lệ
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-[#45531B]">
            {formatVnd(chainStats.revenue)}
          </p>
        </div>
      </section>

      {isFallbackBranches ? (
        <div className="rounded-2xl border border-[#DEC98A] bg-card-butter/60 px-5 py-3.5 text-xs font-medium text-olive-primary sm:text-sm">
          Đang hiển thị danh sách cơ sở mặc định từ cấu hình thương hiệu Ốm Sữa
          (chưa kết nối máy chủ API).
        </div>
      ) : null}

      {ordersError ? (
        <div
          role="alert"
          className="rounded-2xl border border-[#E6ABA6] bg-[#F7DFDC] px-5 py-4 text-sm text-[#8F3530]"
        >
          <p className="font-semibold">
            Không thể đồng bộ thống kê đơn hàng theo chi nhánh
          </p>
          <p className="mt-1">{ordersError}</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        {branches.map((branch) => {
          const stats = computeBranchStats(branch.id, orders);

          return (
            <article
              key={branch.id}
              data-testid={`branch-card-${branch.id}`}
              className="flex flex-col justify-between rounded-2xl border border-[#DDD4C0] bg-surface-light p-6 shadow-xs"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-[#DEC98A] bg-card-butter px-3 py-0.5 text-xs font-semibold text-olive-primary">
                    {branch.shortLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#B4C488] bg-[#E3EAD1] px-2.5 py-0.5 text-xs font-bold text-[#45531B]">
                    Đang hoạt động
                  </span>
                </div>

                <h2 className="mt-3 font-display text-xl font-bold text-espresso">
                  {branch.name}
                </h2>
                <p className="mt-1.5 text-sm text-warm-muted">
                  {branch.address}
                </p>
                <p className="mt-2 text-sm font-semibold text-olive-primary">
                  Hotline:{' '}
                  <span className="font-mono text-espresso">
                    {branch.hotline}
                  </span>
                </p>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-[#E5DEC9] pt-4 text-center sm:grid-cols-4">
                <div className="rounded-xl bg-canvas-cream p-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-warm-muted">
                    Tổng đơn
                  </dt>
                  <dd className="mt-1 font-display text-lg font-bold text-espresso">
                    {stats.totalOrders}
                  </dd>
                </div>
                <div className="rounded-xl bg-card-butter/50 p-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-olive-primary">
                    Đang xử lý
                  </dt>
                  <dd className="mt-1 font-display text-lg font-bold text-terracotta">
                    {stats.activeOrders}
                  </dd>
                </div>
                <div className="rounded-xl bg-[#EFE4CC]/75 p-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#6E5015]">
                    Hoàn tất
                  </dt>
                  <dd className="mt-1 font-display text-lg font-bold text-[#6E5015]">
                    {stats.completedOrders}
                  </dd>
                </div>
                <div className="rounded-xl bg-[#E3EAD1]/70 p-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#45531B]">
                    Doanh thu
                  </dt>
                  <dd className="mt-1 font-display text-sm font-bold text-[#45531B] sm:text-base">
                    {formatVnd(stats.revenue)}
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}

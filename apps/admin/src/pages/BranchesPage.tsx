import {
  OMSUA_BRANCHES,
  formatVnd,
  type BranchInfo,
  type OrderRecord,
} from '@omsua/shared';
import { useCallback, useEffect, useState } from 'react';
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

  const loadData = useCallback(async () => {
    setLoading(true);
    const [branchesResult, ordersResult] = await Promise.all([
      fetchAdminBranches(),
      fetchOrders(),
    ]);

    if (branchesResult.ok && branchesResult.data.length > 0) {
      setBranches(branchesResult.data);
      setIsFallbackBranches(false);
    } else {
      setBranches(OMSUA_BRANCHES.map((branch) => ({ ...branch })));
      setIsFallbackBranches(true);
    }

    if (ordersResult.ok) {
      setOrders(ordersResult.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    void Promise.all([fetchAdminBranches(), fetchOrders()]).then(
      ([branchesResult, ordersResult]) => {
        if (!active) return;

        if (branchesResult.ok && branchesResult.data.length > 0) {
          setBranches(branchesResult.data);
          setIsFallbackBranches(false);
        } else {
          setBranches(OMSUA_BRANCHES.map((branch) => ({ ...branch })));
          setIsFallbackBranches(true);
        }

        if (ordersResult.ok) {
          setOrders(ordersResult.data);
        }

        setLoading(false);
      },
    );

    return () => {
      active = false;
    };
  }, []);

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
          className="rounded-xl border border-[#D4C9B0] bg-surface-light px-4 py-2.5 text-sm font-semibold text-espresso transition hover:border-olive-primary hover:bg-card-butter/50 disabled:opacity-60"
        >
          {loading ? 'Đang đồng bộ...' : 'Làm mới'}
        </button>
      </div>

      {isFallbackBranches ? (
        <div className="rounded-2xl border border-[#DEC98A] bg-card-butter/60 px-5 py-3.5 text-xs font-medium text-olive-primary sm:text-sm">
          Đang hiển thị danh sách cơ sở mặc định từ cấu hình thương hiệu Ốm Sữa
          (chưa kết nối máy chủ API).
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

              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-[#E5DEC9] pt-4 text-center">
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

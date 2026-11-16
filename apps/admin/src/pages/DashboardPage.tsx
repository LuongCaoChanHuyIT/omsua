import { DEFAULT_PORTS, type HealthFetchResult } from '@omsua/shared';
import { useCallback, useEffect, useState } from 'react';
import { fetchBackendHealth } from '../lib/api';

export function DashboardPage() {
  const [health, setHealth] = useState<HealthFetchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    const result = await fetchBackendHealth();
    setHealth(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void fetchBackendHealth().then((result) => {
      if (active) {
        setHealth(result);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển</h1>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi trạng thái kết nối các dịch vụ trong monorepo OmSua.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Trạng thái Backend API
            </h2>
            <p className="text-sm text-slate-500">
              Kiểm tra trực tiếp qua endpoint <code className="font-mono">/api/health</code>
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadHealth()}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
          </button>
        </div>

        <div className="mt-4">
          {loading && !health ? (
            <p className="text-sm text-slate-500">Đang kết nối tới Backend...</p>
          ) : health?.ok ? (
            <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">
                ● Đã kết nối: {health.payload.data.service} (v
                {health.payload.data.version})
              </p>
              <p className="mt-1 text-emerald-700">
                Môi trường: {health.payload.data.environment} · Uptime:{' '}
                {Math.round(health.payload.data.uptime)}s
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">○ Không thể kết nối Backend</p>
              <p className="mt-1 text-amber-700">
                Lỗi: {health?.error ?? 'Không xác định'}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase text-slate-400">Web</p>
          <p className="mt-1 font-mono text-lg font-bold text-slate-900">
            :{DEFAULT_PORTS.WEB}
          </p>
          <p className="text-xs text-slate-500">Next.js App Router</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase text-slate-400">Admin</p>
          <p className="mt-1 font-mono text-lg font-bold text-slate-900">
            :{DEFAULT_PORTS.ADMIN}
          </p>
          <p className="text-xs text-slate-500">React + Vite</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Backend
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-slate-900">
            :{DEFAULT_PORTS.BACKEND}
          </p>
          <p className="text-xs text-slate-500">NestJS + Swagger</p>
        </div>
      </section>
    </div>
  );
}

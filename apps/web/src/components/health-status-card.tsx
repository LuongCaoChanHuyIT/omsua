'use client';

import { useCallback, useEffect, useState } from 'react';
import type { HealthFetchResult } from '@omsua/shared';
import { fetchBackendHealth } from '@/lib/api';

export function HealthStatusCard() {
  const [state, setState] = useState<HealthFetchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    const result = await fetchBackendHealth();
    setState(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Kết nối Backend API
          </h2>
          <p className="text-sm text-slate-500">
            Endpoint kiểm tra: <code className="font-mono">/api/health</code>
          </p>
        </div>
        <button
          type="button"
          onClick={() => void checkHealth()}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
        </button>
      </div>

      <div className="mt-4">
        {loading && !state ? (
          <p className="text-sm text-slate-500">Đang kết nối tới NestJS...</p>
        ) : state?.ok ? (
          <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-semibold">
              ● Trực tuyến ({state.payload.data.service} v
              {state.payload.data.version})
            </p>
            <p className="mt-1 text-emerald-700">
              Môi trường: {state.payload.data.environment} · Uptime:{' '}
              {Math.round(state.payload.data.uptime)}s
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">○ Chưa kết nối được tới Backend</p>
            <p className="mt-1 text-amber-700">
              Chi tiết: {state?.error ?? 'Không xác định'} (hãy chạy{' '}
              <code className="font-mono">pnpm dev</code> để bật cả hệ thống).
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

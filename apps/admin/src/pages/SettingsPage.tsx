import {
  DEFAULT_PORTS,
  normalizeApiBaseUrl,
  type HealthFetchResult,
} from '@omsua/shared';
import { useCallback, useEffect, useState } from 'react';
import { DirectionalPageTransition } from '../components/transitions/AppViewTransition';
import { fetchBackendHealth } from '../lib/api';

export function SettingsPage() {
  const apiUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
  const swaggerUrl = `${apiUrl}/docs`;
  const adminOrigin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : `http://localhost:${DEFAULT_PORTS.ADMIN}`;

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
    <DirectionalPageTransition>
      <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-subhead-ochre">
          Cấu hình &amp; Kết nối dịch vụ
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-olive-primary sm:text-3xl">
          Cài đặt hệ thống
        </h1>
        <p className="mt-1 text-sm text-warm-muted">
          Thông tin cấu hình môi trường hiện tại và trạng thái kết nối máy chủ
          Backend Ốm Sữa.
        </p>
      </div>

      <section className="rounded-2xl border border-[#DDD4C0] bg-surface-light p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-editorial text-lg font-semibold text-espresso">
              Trạng thái Backend API
            </h2>
            <p className="text-sm text-warm-muted">
              Kiểm tra trực tiếp qua endpoint{' '}
              <code className="font-mono text-olive-primary">/api/health</code>
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadHealth()}
            disabled={loading}
            className="min-h-11 rounded-xl border border-[#D4C9B0] bg-canvas-cream px-4 py-2.5 text-sm font-semibold text-espresso transition-colors hover:border-olive-primary hover:bg-card-butter/50 disabled:opacity-60"
          >
            {loading ? 'Đang kiểm tra…' : 'Kiểm tra lại'}
          </button>
        </div>

        <div className="mt-4">
          {loading && !health ? (
            <p className="text-sm text-warm-muted">
              Đang kết nối tới Backend…
            </p>
          ) : health?.ok ? (
            <div className="rounded-xl border border-[#B4C488] bg-[#E3EAD1] p-4 text-sm text-[#45531B]">
              <p className="font-semibold">
                ● Đã kết nối: {health.payload.data.service} (v
                {health.payload.data.version})
              </p>
              <p className="mt-1">
                Môi trường: {health.payload.data.environment} · Uptime:{' '}
                {Math.round(health.payload.data.uptime)}s
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#E6ABA6] bg-[#F7DFDC] p-4 text-sm text-[#8F3530]">
              <p className="font-semibold">○ Không thể kết nối Backend</p>
              <p className="mt-1">Lỗi: {health?.error ?? 'Không xác định'}</p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[#DDD4C0] bg-surface-light p-6 shadow-xs">
        <dl className="divide-y divide-[#E5DEC9] text-sm">
          <div className="flex flex-wrap justify-between gap-2 py-3">
            <dt className="font-medium text-warm-muted">
              Admin Origin hiện tại
            </dt>
            <dd className="font-mono font-semibold text-espresso">
              {adminOrigin}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2 py-3">
            <dt className="font-medium text-warm-muted">API Base URL</dt>
            <dd className="font-mono font-semibold text-espresso">{apiUrl}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2 py-3">
            <dt className="font-medium text-warm-muted">
              Tài liệu OpenAPI (Swagger)
            </dt>
            <dd className="font-mono font-semibold text-terracotta">
              <a
                href={swaggerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center underline decoration-terracotta/50 underline-offset-4 transition hover:text-olive-primary"
              >
                {swaggerUrl}
              </a>
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2 py-3">
            <dt className="font-medium text-warm-muted">Chế độ Vite</dt>
            <dd className="font-mono font-semibold text-espresso">
              {import.meta.env.MODE}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2 py-3">
            <dt className="font-medium text-warm-muted">
              Cổng dịch vụ mặc định
            </dt>
            <dd className="font-mono text-espresso">
              Web :{DEFAULT_PORTS.WEB} · Admin :{DEFAULT_PORTS.ADMIN} · Backend :
              {DEFAULT_PORTS.BACKEND}
            </dd>
          </div>
        </dl>
      </section>
      </div>
    </DirectionalPageTransition>
  );
}

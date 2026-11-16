import { normalizeApiBaseUrl } from '@omsua/shared';

export function SettingsPage() {
  const apiUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt hệ thống</h1>
        <p className="mt-1 text-sm text-slate-500">
          Thông tin cấu hình môi trường hiện tại của ứng dụng Admin.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="divide-y divide-slate-100 text-sm">
          <div className="flex justify-between py-3">
            <dt className="font-medium text-slate-600">API Base URL</dt>
            <dd className="font-mono text-slate-900">{apiUrl}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="font-medium text-slate-600">Chế độ Vite</dt>
            <dd className="font-mono text-slate-900">{import.meta.env.MODE}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

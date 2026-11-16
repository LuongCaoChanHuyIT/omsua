import { DEFAULT_PORTS, normalizeApiBaseUrl } from '@omsua/shared';
import { HealthStatusCard } from '@/components/health-status-card';

export default function HomePage() {
  const apiBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

  const services = [
    {
      name: 'Web Storefront (Next.js)',
      url: `http://localhost:${DEFAULT_PORTS.WEB}`,
      port: DEFAULT_PORTS.WEB,
    },
    {
      name: 'Admin Portal (React + Vite)',
      url: `http://localhost:${DEFAULT_PORTS.ADMIN}`,
      port: DEFAULT_PORTS.ADMIN,
    },
    {
      name: 'Backend Health (NestJS)',
      url: `${apiBaseUrl}/health`,
      port: DEFAULT_PORTS.BACKEND,
    },
    {
      name: 'Swagger API Docs',
      url: `${apiBaseUrl}/docs`,
      port: DEFAULT_PORTS.BACKEND,
    },
  ];

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="space-y-3">
        <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
          OmSua Monorepo Skeleton
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          OmSua Web Application
        </h1>
        <p className="text-base text-slate-600">
          Bộ khung giao diện khách hàng xây dựng trên Next.js App Router,
          TypeScript và Tailwind CSS.
        </p>
      </header>

      <HealthStatusCard />

      <section className="grid gap-4 sm:grid-cols-2">
        {services.map((svc) => (
          <a
            key={svc.url}
            href={svc.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-sky-300 hover:shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Port {svc.port}
            </p>
            <p className="mt-1 font-semibold text-slate-900">{svc.name}</p>
            <p className="mt-1 font-mono text-xs text-sky-700">{svc.url}</p>
          </a>
        ))}
      </section>
    </main>
  );
}

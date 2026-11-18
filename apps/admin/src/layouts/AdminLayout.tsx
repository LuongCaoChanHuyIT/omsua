import { OMSUA_BRAND } from '@omsua/shared';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Đơn hàng', end: true },
  { to: '/menu', label: 'Thực đơn', end: false },
  { to: '/branches', label: 'Chi nhánh', end: false },
  { to: '/settings', label: 'Cài đặt', end: false },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas-cream text-espresso lg:flex-row">
      <aside className="w-full shrink-0 border-b border-[#3F3A2D] bg-hero-espresso text-surface-light lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-b-0">
        <div className="border-b border-[#3F3A2D] px-5 py-4 lg:px-6 lg:py-6">
          <div className="flex items-center justify-between gap-3 lg:block">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-card-butter">
                Đà Lạt • Since {OMSUA_BRAND.sinceYear}
              </p>
              <p className="mt-0.5 font-display text-xl font-bold tracking-tight text-surface-light">
                Ốm Sữa Admin
              </p>
            </div>
            <span className="rounded-full border border-[#4D4636] bg-[#363125] px-2.5 py-1 text-[11px] font-medium text-card-butter lg:mt-3 lg:inline-block">
              Quầy vận hành
            </span>
          </div>
          <p className="mt-2 hidden text-xs leading-relaxed text-[#BEB6A5] lg:block">
            {OMSUA_BRAND.tagline}
          </p>
        </div>

        <nav
          aria-label="Điều hướng quản trị"
          className="flex flex-wrap gap-1.5 px-4 py-3 lg:flex-1 lg:flex-col lg:gap-1.5 lg:p-4"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-terracotta text-surface-light shadow-sm'
                    : 'text-[#DDD6C5] hover:bg-[#3A3528] hover:text-surface-light'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-[#3F3A2D] px-6 py-4 text-xs text-[#BEB6A5] lg:block">
          <p className="font-semibold text-card-butter">Hotline điều phối</p>
          <p className="mt-0.5 font-mono text-surface-light">0945 396 117</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD4C0] bg-surface-light px-4 py-3.5 sm:px-8">
          <div>
            <p className="text-sm font-semibold text-olive-primary">
              Hệ thống quản trị Ốm Sữa — Đơn hàng &amp; Thực đơn
            </p>
            <p className="text-xs text-warm-muted">
              Đồng bộ thời gian thực cùng quầy pha chế Đà Lạt &amp; Đức Trọng
            </p>
          </div>
          <span className="rounded-full border border-[#DEC98A] bg-card-butter px-3.5 py-1 text-xs font-semibold text-olive-primary">
            Mộc mạc • Tinh tế • Nguyên bản
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

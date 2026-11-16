import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Tổng quan', end: true },
  { to: '/settings', label: 'Cài đặt', end: false },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-slate-900 text-slate-100">
        <div className="border-b border-slate-800 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
            OmSua
          </p>
          <p className="mt-0.5 text-lg font-bold text-white">Admin Portal</p>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
          <span className="text-sm font-medium text-slate-600">
            Hệ thống quản trị OmSua
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-600">
            React + Vite
          </span>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { BranchesPage } from './pages/BranchesPage';
import { MenuPage } from './pages/MenuPage';
import { OrdersPage } from './pages/OrdersPage';
import { SettingsPage } from './pages/SettingsPage';

function NotFoundView() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-[#DDD4C0] bg-surface-light p-8 text-center shadow-xs">
      <h1 className="font-display text-2xl font-bold text-olive-primary">
        Không tìm thấy trang
      </h1>
      <p className="mt-2 text-sm text-warm-muted">
        Đường dẫn bạn truy cập không tồn tại trong hệ thống quản trị Ốm Sữa.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-surface-light shadow-xs transition hover:bg-[#C05C16]"
      >
        Quay về Đơn hàng
      </Link>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<OrdersPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundView />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;

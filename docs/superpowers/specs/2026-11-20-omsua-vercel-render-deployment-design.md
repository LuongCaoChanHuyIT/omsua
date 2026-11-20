# Ốm Sữa Cloud Deployment Design Spec — Vercel (`@omsua/web`, `@omsua/admin`) & Render (`@omsua/backend`)

**Ngày lập:** 2026-11-20  
**Nhánh nguồn hiện tại:** `feat/omsua-storefront-ordering` -> phát hành lên `main` (`github.com/LuongCaoChanHuyIT/omsua`)  
**Đích triển khai:**
- **Frontend Storefront (`@omsua/web`) & Admin Portal (`@omsua/admin`):** `https://vercel.com/luong-cao-chan-huys-projects` (Team slug: `luong-cao-chan-huys-projects`)
- **Backend REST API + SQLite (`@omsua/backend`):** `https://dashboard.render.com/` (Region: `singapore`)

---

## 1. Kiến trúc Triển khai Đám mây Tổng thể

```text
GitHub Repository: LuongCaoChanHuyIT/omsua (branch: main)
 ├── apps/web     ──► Vercel Project #1: omsua-web   (Next.js 15 App Router, SSR + Edge CDN)
 │                    Env: NEXT_PUBLIC_API_URL = https://<omsua-backend>.onrender.com/api
 │                         API_URL             = https://<omsua-backend>.onrender.com/api
 │
 ├── apps/admin   ──► Vercel Project #2: omsua-admin (Vite 6 Static SPA + SPA Rewrite)
 │                    Env: VITE_API_URL        = https://<omsua-backend>.onrender.com/api
 │
 └── apps/backend ──► Render Web Service: omsua-backend (Node 22.x Native + node:sqlite WAL)
                      Region: singapore | Health Check: /api/health
                      Env: NODE_VERSION = 22
                           NODE_ENV     = production
                           SQLITE_PATH  = /tmp/omsua.sqlite (hoặc /var/data/omsua.sqlite khi gắn Disk)
                           CORS_ORIGINS = https://omsua-web.vercel.app,https://omsua-admin.vercel.app,https://omsua-web*.vercel.app,https://omsua-admin*.vercel.app
```

---

## 2. Giải quyết 5 Rủi ro Kỹ thuật Thực tế khi Deploy Monorepo lên Vercel & Render

### 2.1. Tương thích `node:sqlite` & `devDependencies` khi Build trên Render (`@omsua/backend`)
- **Vấn đề:** `@omsua/backend` sử dụng mô-đun tích hợp `node:sqlite` (`DatabaseSync`, yêu cầu Node.js `>= 22.5.0`) và cần `tsup` + `@nestjs/cli` lúc biên dịch. Trên Render, nếu `NODE_VERSION` mặc định là Node 20 sẽ lỗi `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite`; nếu `NODE_ENV=production` có sẵn lúc build thì `pnpm install` sẽ bỏ qua `devDependencies` khiến `tsup`/`nest` thất bại. Ngoài ra NestJS cần lắng nghe trên `'0.0.0.0'` để bộ kiểm tra cổng của Render nhận diện dịch vụ.
- **Thiết kế:**
  - Thêm tệp `.node-version` (`22`) ở gốc repo và nâng `engines.node` lên `">=22.5.0"`.
  - Cập nhật `apps/backend/src/main.ts` gọi `await app.listen(port, '0.0.0.0')`.
  - Khai báo Blueprint `render.yaml` ở gốc repo:
    - `runtime: node`, `region: singapore`, `plan: free`, `healthCheckPath: /api/health`
    - `buildCommand: pnpm install --frozen-lockfile --prod=false && pnpm --filter @omsua/shared build && pnpm --filter @omsua/backend build`
    - `startCommand: node apps/backend/dist/main.js`
    - `SQLITE_PATH: /tmp/omsua.sqlite` (tự động tạo bảng & seed 30 món, 8 topping, 4 chi nhánh ngay khi khởi động).

### 2.2. Kiểm soát CORS Hỗ trợ Cả Production & Preview Subdomains trên Vercel (`cors.config.ts`)
- **Vấn đề:** Vercel sinh nhiều tên miền cho mỗi dự án (`https://omsua-web.vercel.app`, `https://omsua-web-luong-cao-chan-huys-projects.vercel.app`, `https://omsua-web-git-main-luong-cao-chan-huys-projects.vercel.app`). Danh sách chuỗi tĩnh tuyệt đối trong `parseCorsOrigins` hiện tại sẽ chặn các URL preview/team alias của Vercel, nhưng mở `*` toàn cục lại mất an toàn khi `credentials: true`.
- **Thiết kế:**
  - Mở rộng `apps/backend/src/config/cors.config.ts` với `isCorsOriginAllowed(origin, allowedPatterns)` và `createCorsOriginDelegate(rawOrigins)`:
    - Cho phép request không có `Origin` header (như `curl`, Render health check `/api/health`, SSR `HomePage` từ máy chủ Vercel).
    - Khớp chính xác chuỗi (`http://localhost:3000`, `https://omsua-web.vercel.app`) **và** mẫu ký tự đại diện một phần tên miền con an toàn có tiền tố giao thức rõ ràng như `https://omsua-web*.vercel.app` hoặc `https://omsua-admin*.vercel.app` (chỉ cho phép ký tự nhãn DNS hợp lệ `[a-z0-9-]`, không bao giờ khớp chéo sang miền giả mạo kiểu `https://omsua-web.vercel.app.evil.com` hay giao thức `http://`).

### 2.3. Phụ thuộc Gói Nội bộ `@omsua/shared` & SPA Deep-Link trên Vercel (`vercel.json`)
- **Vấn đề:**
  1. Thư mục `packages/shared/dist` không lưu trong Git; khi Vercel đặt `Root Directory` là `apps/web` hoặc `apps/admin`, lệnh build mặc định chỉ chạy trong thư mục con nên thiếu `packages/shared/dist` và gãy kiểu TypeScript.
  2. `@omsua/admin` là SPA dùng `BrowserRouter` (`/`, `/menu`, `/branches`, `/settings`); nếu tải lại trang trực tiếp ở `/menu` trên Vercel mà không có rewrite sẽ bị lỗi `404`.
- **Thiết kế:**
  - Tạo `apps/web/vercel.json`:
    - `framework: "nextjs"`, `installCommand: "pnpm install --frozen-lockfile"`, `buildCommand: "pnpm --dir ../.. build:shared && pnpm build"`.
  - Tạo `apps/admin/vercel.json`:
    - `framework: "vite"`, `installCommand: "pnpm install --frozen-lockfile"`, `buildCommand: "pnpm --dir ../.. build:shared && pnpm build"`, `outputDirectory: "dist"`.
    - Cấu hình `rewrites` chuyển mọi đường dẫn điều hướng SPA (loại trừ `/assets/*`, `/images/*`, `/favicon.svg`, `/robots.txt`) về `/index.html`.

### 2.4. Chống Nghẽn Cold-Start Render Free Tier trên Trang chủ SSR (`apps/web`)
- **Vấn đề:** Dịch vụ Render Free tự ngủ sau 15 phút không có truy cập và mất ~25–40 giây để thức dậy ở request đầu tiên.
- **Thiết kế:**
  - Giữ nguyên `timeoutMs = 1500` cho SSR `HomePage` (`apps/web/src/app/page.tsx`) để trang chủ trên Vercel luôn phản hồi tức thì `< 1.5s` bằng dữ liệu chuẩn từ `@omsua/shared` + 54 ảnh `.webp` tĩnh trên CDN Vercel.
  - Tăng thời gian chờ đồng bộ danh mục nền phía trình duyệt trong `StorefrontClientShell.tsx` lên `CLIENT_CATALOG_TIMEOUT_MS = 20_000` (`fetchCatalog(resolvedApiBaseUrl, fetch, 20_000)`) để đánh thức máy chủ Render êm ái ở hậu cảnh mà không chặn hiển thị giao diện.

---

## 3. Ràng buộc Toàn cục (Global Constraints)

- **Node.js & Package Manager:** Node.js `>= 22.5.0` (`.node-version` = `22`), `pnpm@12.18.0`; không cài thêm bất kỳ runtime npm dependency mới nào trong cả 4 gói workspace.
- **Bảo mật Khóa & Biến môi trường:** Tuyệt đối không commit bất kỳ token, secret, hay `.vercel/` vào Git (bổ sung `.vercel` vào `.gitignore`).
- **Bảo toàn Thiết kế & Chất lượng:** Giữ nguyên quy tắc 0 mã màu `#FFFFFF` / `#000000`, giữ xanh toàn bộ 173+ bài kiểm thử hiện hữu (`pnpm build && pnpm typecheck && pnpm lint && pnpm test`) và không dừng các tiến trình dev cục bộ của người dùng.

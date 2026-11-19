# Ốm Sữa — Hệ sinh thái Đặt món & Quản trị Chuỗi Trà Sữa Đà Lạt

> **“Trà sữa của người Đà Lạt — Gói trọn sương sớm & vị ngọt lành nguyên bản từ 2017”**  
> *Commercial Full-Stack Monorepo (`pnpm workspaces`) • `@omsua/shared` · `@omsua/backend` · `@omsua/web` · `@omsua/admin`*

---

## 1. Giới thiệu dự án Ốm Sữa (*Since 2017*)

**Ốm Sữa** là thương hiệu trà sữa thủ công ra đời từ năm **2017** tại thành phố sương mù **Đà Lạt**, nổi tiếng với dòng **Trà Sữa Atiso xanh nấu tươi**, trà trái cây & Kombucha thanh mát, cà phê — cacao ấm nóng, Matcha Uji Nhật Bản và quầy **Bánh tráng Snack Đà Lạt** nhâm nhi tại chỗ hoặc giao tận nơi.

Hệ sinh thái phần mềm **Ốm Sữa** được thiết kế chuẩn thương mại nhằm số hóa trọn vẹn chuỗi giá trị từ trải nghiệm đặt món trực tuyến của khách hàng (**Storefront Web**) đến điều phối pha chế — giao nhận thời gian thực tại quầy (**Admin Portal**), vận hành trên nền tảng dữ liệu tập trung (**NestJS + SQLite WAL**).

### Triết lý Thị giác & Hệ thống Nhận diện Thương hiệu (Brand Design System)

Toàn bộ giao diện trên cả `@omsua/web` và `@omsua/admin` tuân thủ **nguyên tắc không dùng trắng tinh (`#FFFFFF`) hay đen tuyền (`#000000`)** — thay thế hoàn toàn bằng **14 mã màu giấy mỹ thuật kem ấm & thảo mộc Đà Lạt** (`OMSUA_COLORS`):

| Nhóm | Token (`@omsua/shared`) | CSS Variable | Mã Hex | Vai trò hiển thị |
|---|---|---|---|---|
| **Nền & Thẻ** | `bgCanvasCream` | `--color-canvas-cream` | `#EEEADF` | Nền trang giấy mỹ thuật kem ấm chủ đạo |
| **Nền & Thẻ** | `bgSurfaceLight` | `--color-surface-light` | `#F7F4EC` | Nền thẻ sản phẩm, hộp thoại Modal, thanh Header |
| **Nền & Thẻ** | `bgCardButter` | `--color-card-butter` | `#F4E3AD` | Nền nhấn nhóm Trà Sữa, huy hiệu & thông báo ấm |
| **Nền & Thẻ** | `bgCardSage` | `--color-card-sage` | `#C7CBBD` | Nền nhấn nhóm Giữ Dáng (Fruit Tea & Kombucha) |
| **Nền & Thẻ** | `bgCardOliveGold` | `--color-card-olive-gold` | `#B6A152` | Nhãn Signature (chữ `#29261D` đạt tương phản WCAG AA `5.88:1`) |
| **Nền & Thẻ** | `bgCardTaupe` | `--color-card-taupe` | `#C8BA9B` | Nền nhấn nhóm Cà Phê & Cacao, đường viền phụ |
| **Nền & Thẻ** | `bgHeroEspresso` | `--color-hero-espresso` | `#29261D` | Nền Spotlight, Sidebar quản trị & Footer |
| **Chữ & Thương hiệu** | `brandOlivePrimary` | `--color-olive-primary` | `#594C00` | Tiêu đề chính `H1`/`H2`, viền nhấn & `:focus-visible` |
| **Chữ & Thương hiệu** | `textEspresso` | `--color-espresso` | `#29261D` | Chữ nội dung chính sắc nét, ấm mắt |
| **Chữ & Thương hiệu** | `textWarmMuted` | `--color-warm-muted` | `#6B6255` | Mô tả phụ, phụ đề tiếng Anh, nhãn thời gian |
| **Chữ & Thương hiệu** | `textSubheadOchre` | `--color-subhead-ochre` | `#A67C2E` | Nhãn phân mục nhỏ (*Eyebrow / Subheader*) |
| **Điểm nhấn (Accent)** | `accentTerracotta` | `--color-terracotta` | `#D96B1E` | Nút hành động chính (CTA), giá tiền & trạng thái đang pha chế |
| **Điểm nhấn (Accent)** | `accentCoralSketch` | `--color-coral-sketch` | `#E07D77` | Viền cảnh báo nhẹ, tia vẽ tay khu vực Snack |
| **Điểm nhấn (Accent)** | `accentArtichoke` | `--color-artichoke` | `#7A8B3B` | Huy hiệu Búp Atiso xanh, trạng thái hoàn tất / mở bán |

### Hệ thống 5 Phông chữ Tiếng Việt (`Google Fonts`)

| Vai trò | Phông chữ | Biến CSS | Ứng dụng |
|---|---|---|---|
| **Display & Hero** | `Fraunces` (600, 700) | `--font-display` | Tiêu đề lớn, con số KPI doanh thu, tên thương hiệu |
| **Editorial & Menu** | `Lora` (500, 600, Italic 400) | `--font-editorial` | Tên món thực đơn, phụ đề tiếng Anh & câu chuyện thương hiệu |
| **UI & Controls** | `Be Vietnam Pro` (400–700) | `--font-sans` | Giao diện điều khiển, bộ lọc, nút bấm, biểu mẫu thanh toán |
| **Emotional Quote** | `Dancing Script` (700) | `--font-quote` | Câu trích dẫn cảm xúc chủ đạo của người Đà Lạt |
| **Playful Snack** | `Shantell Sans` (700, 800) | `--font-snack` | Tiêu đề khu vực Bánh Tráng Snack Đà Lạt |

---

## 2. Kiến trúc Monorepo (`pnpm workspaces`)

Dự án được tổ chức theo mô hình **Monorepo 4 gói** giúp chia sẻ tuyệt đối kiểu dữ liệu TypeScript, công thức tính giá VND và danh mục chuẩn giữa Frontend, Admin và Backend:

```text
OmSua/
├── packages/
│   └── shared/          # @omsua/shared  — Hợp đồng kiểu dữ liệu, 14 mã màu, thực đơn gốc & bộ tính giá VND
└── apps/
    ├── backend/         # @omsua/backend — NestJS 11 REST API + OpenAPI (/api/docs) + Node 22 SQLite (WAL)
    ├── web/             # @omsua/web     — Next.js 15 Storefront đặt món, giỏ hàng & tra cứu đơn trực tuyến
    └── admin/           # @omsua/admin   — React 19 + Vite 6 Cổng vận hành quầy pha chế & quản lý thực đơn
```

| Workspace Package | Thư mục | Công nghệ cốt lõi | URL / Cổng mặc định |
|---|---|---|---|
| `@omsua/shared` | `packages/shared` | TypeScript 5.7 + `tsup` (xuất kép CJS/ESM + `.d.ts`) | Thư viện nội bộ |
| `@omsua/backend` | `apps/backend` | NestJS 11 + `node:sqlite` (`WAL`) + `ValidationPipe` + Swagger | `http://localhost:4000/api` (Docs: `/api/docs`) |
| `@omsua/web` | `apps/web` | Next.js 15 (App Router) + React 19 + Tailwind CSS v4 + Bespoke SVG Studio | `http://localhost:3000` |
| `@omsua/admin` | `apps/admin` | React 19 + Vite 6 + React Router 7 + Tailwind CSS v4 | `http://localhost:3001` |

### Điểm nhấn kỹ thuật theo từng phân hệ

- **`@omsua/shared`**: Nguồn chân lý duy nhất (*Single Source of Truth*) cho `OMSUA_COLORS`, `OMSUA_BRAND`, danh mục chuẩn (`OMSUA_CATEGORIES`, `OMSUA_PRODUCTS`, `OMSUA_TOPPINGS`, `OMSUA_BRANCHES`), hàm chuẩn hóa khóa giỏ hàng `canonicalizeCartItemKey`, cùng bộ giải quyết dòng đơn `resolveOrderLine` và tổng tiền `calculateOrderTotals`.
- **`@omsua/backend`**: Sử dụng mô-đun gốc `node:sqlite` (`DatabaseSync`) của Node.js 22 (không phụ thuộc addon C++ bên ngoài), tự động khởi tạo lược đồ & seed dữ liệu chuẩn khi khởi động, kiểm tra tính hợp lệ đầu vào bằng `class-validator` (`whitelist: true`, `forbidNonWhitelisted: true`) và cung cấp tài liệu tương tác OpenAPI tại `/api/docs`.
- **`@omsua/web`**: Trang đặt món thương mại mang đậm hơi thở Đà Lạt với bộ minh họa SVG thủ công riêng biệt cho từng món (búp Atiso, linh vật Bé Búp Atiso, khay topping macro), hộp tùy chỉnh Size / Đường / Đá / Độ cay / Topping tính giá trực tiếp, ngăn giỏ hàng lưu trữ bền vững (`localStorage`), đặt hàng kèm mã chuyển khoản VietQR tự động và tra cứu trạng thái đơn theo mã `OM-YYYYMMDD-XXXX`.
- **`@omsua/admin`**: Bảng điều phối vận hành chuyên dụng cho thu ngân & barista:
  - Tải đơn toàn chi nhánh kèm **bộ đếm trực tiếp trên từng tab trạng thái**, **4 thẻ KPI doanh thu hợp lệ** và **tự động làm mới ngầm mỗi `12s`** không gây nhấp nháy giao diện (*zero-flicker background polling*).
  - **Tìm kiếm tức thì không phân biệt dấu tiếng Việt** (tìm `"nguyen minh anh"`, `"duc trong"`, `"atiso"`, SĐT hoặc mã đơn).
  - **Khóa xác nhận 2 bước khi `Hủy đơn`** (`Hủy đơn` -> `Xác nhận hủy đơn` / `Giữ lại`) tránh thao tác nhầm giờ cao điểm, đồng thời giữ 1 chạm nhanh cho `Xác nhận pha chế`, `Giao hàng`, `Hoàn tất` và hiển thị sẵn cú pháp đối soát `CK: OMSUA <Mã đơn> <SĐT>` cho đơn QR.
  - Quản lý **Thực đơn 30 món** với bộ lọc trạng thái / nhóm món, tìm kiếm nhanh và nút bật/tắt `Còn món` ↔ `Tạm hết` đồng bộ tức thì sang Storefront.

---

## 3. Cơ sở dữ liệu & Danh mục chuẩn Đà Lạt

### Cấu hình SQLite & Lược đồ Bảng (`apps/backend/src/database/database.service.ts`)

Backend vận hành trên SQLite với bộ `PRAGMA` tối ưu cho tải đọc/ghi đồng thời tại cửa hàng:

```sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
```

Hệ thống gồm **5 bảng quan hệ** và **2 chỉ mục tăng tốc truy vấn**:

| Bảng / Chỉ mục | Khóa chính / Tham chiếu | Mô tả |
|---|---|---|
| `products` | `id TEXT PRIMARY KEY` | 30 sản phẩm chuẩn (`kind`: `'drink'` hoặc `'snack'`, `sizes_json`, cờ `is_signature`, `is_best_seller`, `is_new`, `is_spotlight`, `is_available`) |
| `toppings` | `id TEXT PRIMARY KEY` | 8 loại topping nhà làm (`price`, `short_name`, `is_available`) |
| `branches` | `id TEXT PRIMARY KEY` | 4 cơ sở hoạt động tại Đà Lạt & Đức Trọng (`address`, `area`, `hotline`, `delivery_eta`) |
| `orders` | `id TEXT PRIMARY KEY`, `order_code UNIQUE`, `branch_id -> branches(id)` | Thông tin khách nhận, phương thức thanh toán (`cod` / `qr`), trạng thái vận hành & tổng tiền VND |
| `order_items` | `id INTEGER PRIMARY KEY AUTOINCREMENT`, `order_id -> orders(id) ON DELETE CASCADE` | Chi tiết từng dòng món đã chốt giá (`size`, `sugar_level`, `ice_level`, `spice_level`, `toppings_json`, `unit_price`, `line_total`) |
| `idx_order_items_order_id` | `ON order_items(order_id)` | Tăng tốc nạp chi tiết dòng món khi truy vấn danh sách đơn |
| `idx_orders_branch_status_created` | `ON orders(branch_id, status, created_at DESC)` | Tối ưu lọc đơn theo cơ sở, trạng thái và sắp xếp mới nhất trước |

### Danh mục Thực đơn & Cơ sở Chuẩn (Seed Data)

- **24 Đồ uống** chia làm 4 chuyên mục:
  1. **Trà Sữa Đà Lạt (`milk-tea`, 6 món)**: *Trà Sữa Atiso (Signature)*, *Trà Sữa Atiso Chuối*, *Trà Sữa Ô Long Nướng*, *Trà Sữa Gạo Rang*, *Trà Sữa Nguyên Lá Ốm*, *Hồng Trà Kem Phô Mai*.
  2. **Giữ Dáng — Fruit Tea & Kombucha (`fruit-tea`, 6 món)**: *Quýt Nhài Cát Tường (Spotlight)*, *Kombucha Dâu Tằm Đà Lạt*, *Trà Atiso Đỏ Hạt Đác*, *Trà Đào Cam Sả Đồi Cao*, *Trà Ổi Hồng Chanh Dây*, *Trà Vải Hoa Hồng*.
  3. **Cà Phê & Cacao Ấm (`coffee-cacao`, 6 món)**: *Cà Phê Sữa Đà Lạt Phin Nhôm*, *Bạc Xỉu Kem Muối*, *Cà Phê Kem Trứng Khò*, *Cacao Nóng Nguyên Chất*, *Cacao Dầm Trân Châu Đen*, *Cold Brew Mơ Má Đào*.
  4. **Matcha Uji Nhật Bản (`matcha`, 6 món)**: *Matcha Latte Sữa Yến Mạch*, *Matcha Kem Phô Mai*, *Matcha Đậu Đỏ Nhà Nấu*, *Matcha Dâu Tây Đà Lạt*, *Matcha Dừa Nướng*, *Hojicha Sữa Hạt*.
- **8 Topping nhà làm**: Trân châu đen (`10.000đ`), Trân châu trắng (`10.000đ`), Kem trứng khò (`20.000đ`), Bánh flan trứng caramel (`15.000đ`), Hạt sen (`15.000đ`), Khúc bạch hạnh nhân (`10.000đ`), Hạt đác rim (`15.000đ`), Thạch củ năng (`10.000đ`).
- **6 Món Bánh Tráng Snack Đà Lạt (`snack`, phần tiêu chuẩn `STD`)**: *Bánh Tráng Trộn Tóp Mỡ*, *Bánh Tráng Cuốn Bơ Lòng Đào*, *Bánh Tráng Chấm Sốt Me Lòng Đào*, *Cơm Cháy Chà Bông Mỡ Hành*, *Bánh Tráng Nướng Mắm Ruốc Đà Lạt*, *Khô Gà Lá Chanh Đà Lạt*.
- **4 Cơ sở Chính thức**:
  1. **Cơ sở 1 — Hoàng Diệu**: `28A Hoàng Diệu, Phường Cam Ly, TP. Đà Lạt` (`0945 396 117`)
  2. **Cơ sở 2 — Hẻm 33 Nguyễn Công Trứ**: `Hẻm 33 Nguyễn Công Trứ, P. Lâm Viên, TP. Đà Lạt` (`0945 396 117`)
  3. **Cơ sở 3 — 158 Nguyễn Công Trứ**: `158 Nguyễn Công Trứ, P. Lâm Viên, TP. Đà Lạt` (`0945 396 117`)
  4. **Cơ sở 4 — Đức Trọng**: `544 Quốc lộ 20, Thị trấn Liên Nghĩa, Huyện Đức Trọng` (`037 444 0869`)

### Định giá VND Tất định & Giao dịch Nguyên tử (`BEGIN IMMEDIATE`)

- **Không bao giờ tin giá gửi từ phía trình duyệt**: Khi nhận `POST /api/orders`, Backend chỉ đọc `productId`, `size`, `quantity`, `sugarLevel`/`iceLevel` (cho đồ uống) hoặc `spiceLevel` (cho bánh tráng snack) và `toppingIds`, sau đó đối chiếu trực tiếp trạng thái `is_available` và bảng giá trong SQLite thông qua `resolveOrderLine`.
- **Gộp dòng thông minh**: Các dòng giỏ hàng trùng khóa chuẩn hóa (`productId|size|sugar|ice|spice|sortedToppings`) được tự động hợp nhất số lượng trước khi lưu.
- **Giao dịch `BEGIN IMMEDIATE`**: Quá trình sinh mã đơn `OM-YYYYMMDD-XXXX` (theo múi giờ Việt Nam `UTC+7`), ghi `orders` và ghi toàn bộ `order_items` diễn ra bên trong một giao dịch `BEGIN IMMEDIATE ... COMMIT` (tự động `ROLLBACK` nếu có bất kỳ lỗi nào), đảm bảo tính toàn vẹn tuyệt đối dưới tải đồng thời.

---

## 4. Danh sách REST API & Tài liệu OpenAPI (`/api/docs`)

Tất cả phản hồi thành công đều được bao bọc chuẩn hóa theo cấu trúc `ApiResponse<T>`:

```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-11-19T03:00:00.000Z"
}
```

Khi máy chủ Backend đang chạy, truy cập giao diện **Swagger UI** trực tiếp tại: **`http://localhost:4000/api/docs`**.

### Bảng tổng hợp 8 REST Endpoints

| # | Phương thức & Đường dẫn | Mô tả chức năng | Mã phản hồi |
|---|---|---|---|
| 1 | `GET /api/health` | Kiểm tra trạng thái hoạt động, phiên bản, môi trường và `uptime` của Backend | `200`, `400` |
| 2 | `GET /api/catalog` | Lấy toàn bộ thực đơn gồm `categories` (4 nhóm), `products` (30 món) và `toppings` (8 loại) | `200` |
| 3 | `PATCH /api/catalog/products/:id/availability` | Bật/tắt trạng thái mở bán (`isAvailable: boolean`) của một món theo `id` | `200`, `400`, `404` |
| 4 | `GET /api/branches` | Lấy danh sách 4 cơ sở chính thức tại Đà Lạt & Đức Trọng | `200` |
| 5 | `POST /api/orders` | Tạo đơn hàng mới với định giá VND xác thực từ máy chủ trong giao dịch `BEGIN IMMEDIATE` | `201`, `400` |
| 6 | `GET /api/orders` | Liệt kê đơn hàng mới nhất trước, hỗ trợ lọc tùy chọn `?status=...&branchId=...` | `200`, `400` |
| 7 | `GET /api/orders/code/:orderCode` | Tra cứu chi tiết đơn hàng công khai theo mã `OM-YYYYMMDD-XXXX` | `200`, `400`, `404` |
| 8 | `PATCH /api/orders/:id/status` | Cập nhật trạng thái vận hành đơn (`pending` · `preparing` · `delivering` · `completed` · `cancelled`) | `200`, `400`, `404` |

### Ví dụ Request / Response tiêu biểu

#### 1) Tạo đơn hàng mới (`POST /api/orders`)

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": "cs1-hoang-dieu",
    "customerName": "Nguyễn Minh Anh",
    "customerPhone": "0905123456",
    "deliveryAddress": "12 Khu Hòa Bình, Phường 1, Đà Lạt",
    "note": "Giao cổng chính, ít đá",
    "paymentMethod": "qr",
    "items": [
      {
        "productId": "tra-sua-atiso",
        "quantity": 1,
        "size": "M",
        "sugarLevel": "70",
        "iceLevel": "50",
        "toppingIds": ["tran-chau-den"]
      },
      {
        "productId": "banh-trang-tron-top-mo",
        "quantity": 1,
        "size": "STD",
        "spiceLevel": "cay-vua"
      }
    ]
  }'
```

Phản hồi `201 Created` (rút gọn):

```json
{
  "success": true,
  "data": {
    "id": "8e3b0f52-9d7b-4f08-9f11-4a2b8c7d6e5f",
    "orderCode": "OM-20261119-A1B2",
    "branchId": "cs1-hoang-dieu",
    "branchName": "Cơ sở 1 — Hoàng Diệu",
    "customerName": "Nguyễn Minh Anh",
    "customerPhone": "0905123456",
    "deliveryAddress": "12 Khu Hòa Bình, Phường 1, Đà Lạt",
    "note": "Giao cổng chính, ít đá",
    "paymentMethod": "qr",
    "status": "pending",
    "subtotal": 95000,
    "shippingFee": 0,
    "ecoFee": 0,
    "grandTotal": 95000,
    "totalItems": 2,
    "createdAt": "2026-11-19T03:05:00.000Z",
    "updatedAt": "2026-11-19T03:05:00.000Z"
  },
  "timestamp": "2026-11-19T03:05:00.000Z"
}
```

#### 2) Cập nhật trạng thái món tại quầy (`PATCH /api/catalog/products/:id/availability`)

```bash
curl -X PATCH http://localhost:4000/api/catalog/products/tra-sua-atiso/availability \
  -H "Content-Type: application/json" \
  -d '{"isAvailable": false}'
```

#### 3) Chuyển trạng thái vận hành đơn (`PATCH /api/orders/:id/status`)

```bash
curl -X PATCH http://localhost:4000/api/orders/8e3b0f52-9d7b-4f08-9f11-4a2b8c7d6e5f/status \
  -H "Content-Type: application/json" \
  -d '{"status": "preparing"}'
```

#### 4) Lọc danh sách đơn & Tra cứu theo mã đơn

```bash
# Lọc đơn theo chi nhánh và trạng thái
curl "http://localhost:4000/api/orders?branchId=cs1-hoang-dieu&status=pending"

# Khách tra cứu đơn công khai bằng mã OM-YYYYMMDD-XXXX
curl "http://localhost:4000/api/orders/code/OM-20261119-A1B2"
```

---

## 5. Hướng dẫn Cài đặt, Chạy Môi trường Dev & Đổi Cổng (Port Overrides)

### Yêu cầu hệ thống (Prerequisites)

- **Node.js** `>= 22.0.0` *(bắt buộc để sử dụng mô-đun `node:sqlite` tích hợp sẵn)*
- **pnpm** `>= 10.0.0` *(được cấu hình chuẩn với `pnpm@12.18.0` trong `packageManager`)*

### Khởi tạo nhanh (Quick Start)

```bash
# 1. Cài đặt toàn bộ gói phụ thuộc cho cả 4 workspace
pnpm install

# 2. Sao chép tệp cấu hình môi trường mẫu (nếu mới clone kho mã nguồn)
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env

# 3. Biên dịch @omsua/shared và khởi chạy đồng thời shared + backend + web + admin
pnpm dev
```

Sau khi khởi chạy thành công:
- **Storefront đặt món (`@omsua/web`)**: `http://localhost:3000`
- **Cổng quản trị quầy (`@omsua/admin`)**: `http://localhost:3001`
- **Backend REST API (`@omsua/backend`)**: `http://localhost:4000/api`
- **OpenAPI / Swagger UI**: `http://localhost:4000/api/docs`

### Bảng Biến Môi trường & Cơ chế Override Cổng (Port Overrides)

| Biến môi trường | Phân hệ áp dụng | Giá trị mặc định | Ý nghĩa & Quy tắc ưu tiên |
|---|---|---|---|
| `BACKEND_PORT` | `@omsua/backend` | `4000` | Cổng HTTP của NestJS Backend (ưu tiên `BACKEND_PORT` -> `PORT` -> `4000`) |
| `WEB_PORT` | `@omsua/web` | `3000` | Cổng chạy Next.js dev & production (`WEB_PORT` -> `PORT` -> `3000`) |
| `ADMIN_PORT` | `@omsua/admin` | `3001` | Cổng Vite dev & preview với `strictPort: true` (`ADMIN_PORT` -> `PORT` -> `3001`) |
| `SQLITE_PATH` | `@omsua/backend` | `data/omsua.sqlite` | Đường dẫn tệp cơ sở dữ liệu SQLite (tương đối từ `apps/backend`, hoặc `:memory:` khi chạy kiểm thử cô lập) |
| `CORS_ORIGINS` | `@omsua/backend` | `http://localhost:3000,http://localhost:3001` | Danh sách Origin được phép gọi API, phân tách bằng dấu phẩy |
| `NEXT_PUBLIC_API_URL` | `@omsua/web` | `http://localhost:4000/api` | URL gốc của Backend API cho ứng dụng Storefront Next.js |
| `VITE_API_URL` | `@omsua/admin` | `http://localhost:4000/api` | URL gốc của Backend API cho ứng dụng Quản trị Vite |

#### Ví dụ chạy toàn bộ hệ thống trên bộ cổng tùy chỉnh (`4100` / `3100` / `3101`)

Khi các cổng mặc định `3000`, `3001`, `4000` trên máy đang bận, bạn có thể đổi cổng đồng bộ chỉ bằng biến môi trường ngay trên dòng lệnh:

```bash
BACKEND_PORT=4100 \
WEB_PORT=3100 \
ADMIN_PORT=3101 \
CORS_ORIGINS="http://localhost:3100,http://localhost:3101" \
NEXT_PUBLIC_API_URL="http://localhost:4100/api" \
VITE_API_URL="http://localhost:4100/api" \
pnpm dev
```

---

## 6. Chạy Production (`build` & `start:*`) & Kiểm thử Chất lượng

### Bảng Lệnh điều hành Monorepo (`package.json` gốc)

| Lệnh | Mô tả chi tiết |
|---|---|
| `pnpm build:shared` | Biên dịch gói `@omsua/shared` ra CJS/ESM + khai báo kiểu `.d.ts` |
| `pnpm dev` | Build `@omsua/shared`, sau đó chạy song song `shared` (watch), `backend`, `web` và `admin` |
| `pnpm dev:backend` | Chạy riêng máy chủ NestJS ở chế độ theo dõi thay đổi (`:4000`) |
| `pnpm dev:web` | Chạy riêng Storefront Next.js ở chế độ phát triển (`:3000`) |
| `pnpm dev:admin` | Chạy riêng Admin Portal Vite ở chế độ phát triển (`:3001`) |
| `pnpm build` | Build tuần tự `@omsua/shared` rồi build production cho cả 3 ứng dụng trong `apps/*` |
| `pnpm start:backend` | Khởi chạy bản build production của Backend (`node apps/backend/dist/main.js`) |
| `pnpm start:web` | Khởi chạy máy chủ production Next.js (`next start`) |
| `pnpm start:admin` | Khởi chạy máy chủ preview bản đóng gói tĩnh của Admin (`vite preview`) |
| `pnpm typecheck` | Kiểm tra kiểu tĩnh TypeScript nghiêm ngặt trên toàn bộ 4 gói |
| `pnpm lint` | Kiểm tra quy chuẩn mã nguồn ESLint 9 trên toàn bộ 4 gói |
| `pnpm test` | Chạy toàn bộ Unit Test, Component Test & E2E API Test trên cả 4 gói |

### Quy trình Đóng gói & Khởi chạy Production

```bash
# Bước 1: Biên dịch toàn bộ thư viện dùng chung và 3 ứng dụng
pnpm build

# Bước 2: Khởi chạy từng dịch vụ ở chế độ Production (trên 3 tiến trình / dịch vụ systemd / container)
NODE_ENV=production pnpm start:backend
NODE_ENV=production pnpm start:web
NODE_ENV=production pnpm start:admin
```

### Cổng Kiểm định Chất lượng Toàn diện (Verification Gate)

Trước khi phát hành, chạy chuỗi lệnh kiểm định một dòng để xác nhận **0 lỗi biên dịch, 0 lỗi kiểu dữ liệu, 0 cảnh báo ESLint và 100% bài kiểm thử vượt qua**:

```bash
pnpm --reporter=append-only build && \
pnpm --reporter=append-only typecheck && \
pnpm --reporter=append-only lint && \
pnpm --reporter=append-only test
```

- **`@omsua/shared` (Vitest)**: Kiểm thử hợp đồng API, định giá VND, kiểm tra ràng buộc topping/độ cay/đường/đá và gộp khóa giỏ hàng.
- **`@omsua/backend` (Jest Unit + Supertest E2E trên `:memory:` SQLite)**: Kiểm thử CORS/cổng, thực đơn, khởi tạo giao dịch đơn hàng, lọc trạng thái và ràng buộc lỗi HTTP `400`/`404`.
- **`@omsua/web` (Vitest + Testing Library + Static Palette Scanner)**: Kiểm thử luồng chọn món, hộp tùy chỉnh giá, giỏ hàng, đặt đơn, tra cứu mã đơn và quét tĩnh đảm bảo không vi phạm mã màu thuần trắng/đen.
- **`@omsua/admin` (Vitest + Testing Library + Static Palette Scanner)**: Kiểm thử điều phối đơn hàng, xác nhận hủy 2 bước, tự động làm mới ngầm `12s`, tìm kiếm tiếng Việt không dấu, bộ lọc thực đơn, thống kê chi nhánh, kiểm tra kết nối hệ thống và quét tĩnh toàn bộ mã nguồn/SVG.

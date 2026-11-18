# Ốm Sữa — Storefront, Ordering API & Admin Portal Design Specification

**Date:** 2026-11-18  
**Brand:** Ốm Sữa — Trà sữa của người Đà Lạt • Since 2017  
**Visual References:**
- `docs/superpowers/specs/assets/figma-01-storefront-landing.jpg` (Full Storefront Landing & Menu)
- `docs/superpowers/specs/assets/figma-02-customizer-and-cart.jpg` (Drink Customizer Modal & Cart/Checkout Drawer)
- `docs/superpowers/specs/assets/figma-03-brand-style-guide.jpg` (Brand & Web UI Style Guide)

---

## 1. Intent & Scope

Implement the complete **Ốm Sữa** artisanal Đà Lạt milk tea & snack ordering experience across all four workspace packages of the monorepo:
1. **`@omsua/shared`:** Canonical brand tokens, menu & branch seed catalog, TypeScript contracts, and deterministic VND pricing engine shared between server and clients.
2. **`@omsua/backend` (NestJS + SQLite):** Zero-daemon `node:sqlite` persistence seeded with all 24 drinks, 8 homemade toppings, 6 Đà Lạt snacks, and 4 branches; public catalog/branch/order creation APIs with authoritative server-side price calculation; Admin order status & menu availability management APIs.
3. **`@omsua/web` (Next.js 15 App Router):** Pixel-accurate implementation of the 3 Figma sheets — warm cream/botanical Đà Lạt theme (no pure `#FFFFFF` or `#000000`), 5 Vietnamese Google Fonts, custom vector Logo & Bé Búp Atiso mascot, category filtering, interactive Drink/Snack Customizer Modal, persistent Cart & Checkout Drawer (`COD` / `Chuyển khoản QR`), and live order placement.
4. **`@omsua/admin` (React + Vite):** Matching warm brand theme providing live incoming Order Operations (filter by branch/status, inspect drink customizations, advance order status) and Menu Availability toggles (`Còn món` / `Tạm hết`).

---

## 2. Brand & UI Design Tokens (Figma Sheet 03)

### 2.1 Color Palette *(Strict rule: never use pure `#FFFFFF` or `#000000`)*

| Token | Hex | Role |
|---|---|---|
| `bg-canvas-cream` | `#EEEADF` | Main page background |
| `bg-surface-light` | `#F7F4EC` | Product cards, modals, Sữa Tươi & Đá Xay container |
| `bg-card-butter` | `#F4E3AD` | Category 1 (Trà Sữa Đà Lạt) container & customizer header |
| `bg-card-sage` | `#C7CBBD` | Category 2 (Giữ Dáng — Fruit Tea & Kombucha) container |
| `bg-card-olive-gold` | `#B6A152` | Signature highlights |
| `bg-card-taupe` | `#C8BA9B` | Category 4 (Cà Phê Pha Phin & Cold Brew) container |
| `bg-hero-espresso` | `#29261D` | Hero spotlight box, dark buttons & Footer background |
| `brand-olive-primary` | `#594C00` | H1/H2 headings, active dark-olive pills (`70% Đá`), borders |
| `text-espresso` | `#29261D` | Primary body & title text |
| `text-warm-muted` | `#6B6255` | English subtitles & secondary descriptions |
| `text-subhead-ochre` | `#A67C2E` | Eyebrow labels & small category subheads |
| `accent-terracotta` | `#D96B1E` | Primary CTA buttons (`+ Thêm`, `Đặt món ngay`), prices, active sugar pill |
| `accent-coral-sketch` | `#E07D77` | Snack spice badges (`Cay vừa`) |
| `accent-artichoke` | `#7A8B3B` | `+ SIGNATURE` / `BEST SELLER` badges & topping `+ Chọn` buttons |

### 2.2 Typography (`next/font/google`, `vietnamese` subset)

- **Display & Hero Headings:** `Fraunces` (Bold 700 — `40px` hero, `28px` section headers)
- **Menu Item Titles & Editorial Body:** `Lora` (SemiBold 600 item titles `18px`, Regular/Italic 400 `14px`)
- **UI Controls, Chips, Navigation & Prices:** `Be Vietnam Pro` (Medium 500 / SemiBold 600 / Bold 700 — `13px–16px`)
- **Emotional Quotes:** `Dancing Script` (Bold 700 — `26px`)
- **Playful Snack Section Header:** `Shantell Sans` (ExtraBold 800 — `24px`)

---

## 3. Canonical Catalog & Branch Data (Figma Sheets 01 & 02)

### 3.1 Drink Categories (24 Drinks)

1. **`milk-tea` — `1. TRÀ SỮA ĐÀ LẠT (MILK TEA)`** (`#F4E3AD`, subtitle: *Nền trà nguyên lá ủ chậm kết hợp Atiso xanh, gạo rang & kem phô mai thủ công*):
   - `tra-sua-atiso`: **Trà Sữa Atiso** (*Artichoke Milk Tea*) — *Atiso xanh Đà Lạt & trân châu đen* — `M: 45.000đ`, `L: 50.000đ` (`signature`, `bestSeller`, spotlight)
   - `tra-sua-atiso-chuoi`: **Trà Sữa Atiso Chuối** (*Artichoke Banana Milk Tea*) — *Chuối Laba dẻo quyện trà sữa Atiso* — `M: 48.000đ`, `L: 53.000đ` (`signature`)
   - `tra-sua-gao-rang-khuc-bach`: **Trà Sữa Gạo Rang Khúc Bạch** (*Roasted Rice Milk Tea*) — *Gạo rang thơm bùi & khúc bạch mềm* — `M: 40.000đ`, `L: 45.000đ`
   - `tra-sua-tiramisu`: **Trà Sữa Tiramisu** (*Tiramisu Milk Tea*) — *Kem Tiramisu béo mịn phủ cacao* — `M: 40.000đ`, `L: 45.000đ` (`signature`)
   - `tra-sua-flan-chay-canh`: **Trà Sữa Flan Cháy Cạnh** (*Caramel Flan Milk Tea*) — *Hồng trà đậm vị đi kèm bánh flan* — `M: 45.000đ`, `L: 50.000đ`
   - `oolong-sen-gung`: **Oolong Sen Gừng** (*Oolong Lotus Ginger*) — *Trà Oolong hạt sen bùi và gừng ấm* — `L: 45.000đ` (`signature`)

2. **`fruit-tea` — `2. GIỮ DÁNG — FRUIT TEA & KOMBUCHA`** (`#C7CBBD`, subtitle: *Thanh lọc tự nhiên từ dâu tằm, quýt nhài, sơ ri bưởi hồng & trà lên men Kombucha*):
   - `quyt-nhai-cat-tuong`: **Trà Quýt Nhài Cát Tường** (*Mandarin Jasmine Tea*) — *Hương hoa nhài thanh, mứt quýt tươi* — `L: 45.000đ` (`signature`, `isNew`, spotlight)
   - `tra-atiso-sen-chia`: **Trà Atiso Sen Chia** (*Artichoke Lotus & Chia*) — *Atiso thanh mát cùng hạt sen & chia* — `L: 45.000đ` (`signature`)
   - `tra-dau-tam-da-lat`: **Trà Dâu Tằm Đà Lạt** (*Dalat Mulberry Tea*) — *Dâu tằm chín mọng ngâm đường phèn* — `L: 45.000đ` (`signature`)
   - `tra-me-thot-not`: **Trà Me Thốt Nốt** (*Tamarind Palmyra Tea*) — *Sốt me rừng chua dịu rim thốt nốt* — `L: 45.000đ`
   - `tra-so-ri-buoi-hong`: **Trà Sơ Ri Bưởi Hồng** (*Pink Grapefruit Acerola*) — *Sơ ri giàu vitamin C & tép bưởi hồng* — `L: 45.000đ`
   - `kombucha-chanh-vang`: **Kombucha Chanh Vàng** (*Lemon Kombucha*) — *Trà lên men tự nhiên vị chanh vàng* — `L: 48.000đ` (`signature`)

3. **`fresh-milk-blended` — `3. SỮA TƯƠI & ĐÁ XAY CAO NGUYÊN`** (`#F7F4EC`, subtitle: *Sữa tươi thanh trùng béo dịu, kem trứng khò lửa & đá xay mát lạnh*):
   - `sua-tuoi-kem-trung-nuong`: **Sữa Tươi Kem Trứng Nướng** (*Torched Egg Fresh Milk*) — *Sữa tươi phủ kem trứng khò đường* — `M: 45.000đ`, `L: 50.000đ`
   - `sua-tuoi-duong-den`: **Sữa Tươi Đường Đen** (*Brown Sugar Fresh Milk*) — *Sữa tươi Đà Lạt & trân châu đường đen* — `M: 35.000đ`, `L: 40.000đ`
   - `matcha-latte`: **Matcha Latte** (*Uji Matcha Fresh Milk*) — *Trà xanh Uji đánh tay cùng sữa tươi* — `M: 40.000đ`, `L: 45.000đ`
   - `oreo-tra-da-xay`: **Oreo Trà Đá Xay** (*Oreo Tea Ice Blended*) — *Đá xay hồng trà quyện bánh Oreo giòn* — `S: 45.000đ`, `L: 50.000đ` (`signature`)
   - `matcha-oreo-da-xay`: **Matcha Oreo Đá Xay** (*Oreo Matcha Blended*) — *Đá xay Matcha quyện bánh Oreo giòn* — `S: 48.000đ`, `L: 53.000đ`
   - `yogurt-dau-tam`: **Yogurt Dâu Tằm** (*Mulberry Yogurt*) — *Sữa chua nhà làm dầm dâu tằm tươi* — `S: 45.000đ`, `L: 50.000đ` (`signature`)

4. **`coffee` — `4. CÀ PHÊ PHA PHIN & COLD BREW`** (`#C8BA9B`, subtitle: *Hạt cà phê Lâm Đồng rang mộc kết hợp kem muối biển & sốt me đặc trưng*):
   - `cold-brew-me`: **Cold Brew Me** (*Tamarind Cold Brew*) — *Cà phê ủ lạnh 18h điểm vị me chín* — `S: 45.000đ` (`signature`)
   - `ca-phe-muoi`: **Cà Phê Muối** (*Salted Cream Coffee*) — *Phin đậm đà phủ lớp kem muối biển* — `S: 40.000đ` (`signature`)
   - `ca-phe-kem-tiramisu`: **Cà Phê Kem Tiramisu** (*Tiramisu Phin Coffee*) — *Cà phê phin quyện kem trứng Tiramisu* — `S: 45.000đ` (`signature`)
   - `ca-phe-sua`: **Cà Phê Sữa** (*Condensed Milk Coffee*) — *Hạt Cầu Đất rang mộc pha phin sữa* — `S: 30.000đ`
   - `bac-xiu-da-lat`: **Bạc Xỉu Đà Lạt** (*Vietnamese White Coffee*) — *Ba tầng sữa thơm béo ấm vị cà phê* — `S: 35.000đ`
   - `ca-phe-den`: **Cà Phê Đen** (*Highland Black Coffee*) — *Nguyên bản vị đắng thanh vùng Cầu Đất* — `S: 28.000đ`

### 3.2 Homemade Toppings (8 Toppings — Drinks Only)

- `tran-chau-den`: **Trân châu đen nấu mật** (`10.000đ`)
- `tran-chau-trang`: **Trân châu trắng** (`10.000đ`)
- `kem-trung`: **Kem trứng khò béo mịn** (`20.000đ`)
- `banh-flan`: **Bánh flan trứng caramel** (`15.000đ`)
- `hat-sen`: **Hạt sen** (`15.000đ`)
- `khuc-bach`: **Khúc bạch hạnh nhân** (`10.000đ`)
- `hat-dac-rim`: **Hạt đác rim** (`15.000đ`)
- `thach-cu-nang`: **Thạch củ năng** (`10.000đ`)

### 3.3 Đà Lạt Bánh Tráng Snacks (6 Snacks — Single Portion + Spice Level)

Spice levels: `'cay-nhieu'` (*Cay nhiều*), `'cay-vua'` (*Cay vừa*, default), `'it-cay'` (*Ít cay*).
- `banh-trang-tron-top-mo`: **Bánh Tráng Trộn Tóp Mỡ** (*Crispy Pork Rind Mixed Rice Paper*) — *Tóp mỡ nhà thắng giòn rụm, sốt tắc hành phi* — `40.000đ`
- `com-chay-cha-bong`: **Cơm Cháy Chà Bông** (*Pork Floss Crispy Rice*) — *Xốt mắm cay ngọt, chà bông đầy đặn* — `45.000đ`
- `banh-trang-cuon-bo`: **Bánh Tráng Cuốn Bơ** (*Butter Roll Rice Paper*) — *Cuốn sốt bơ trứng lòng đào béo ngậy* — `45.000đ` (`bestSeller`)
- `banh-trang-sot-tac`: **Bánh Tráng Sốt Tắc** (*Kumquat Sauce Rice Paper*) — *Chua cay mặn ngọt chuẩn vị Đà Lạt* — `35.000đ`
- `phoi-suong-toi-ot`: **Phơi Sương Tỏi Ớt** (*Dew-Softened Garlic Chili Rice Paper*) — *Bánh dẻo sương sớm, muối tỏi ớt phi* — `35.000đ`
- `banh-cham-long-dao`: **Bánh Chấm Lòng Đào** (*Soft-Boiled Egg Dipping Rice Paper*) — *Chấm sốt me rừng & trứng lòng đào* — `45.000đ`

### 3.4 Branches (4 Locations)

1. `cs1-hoang-dieu`: **Cơ sở 1 — Hoàng Diệu** · `28A Hoàng Diệu, Phường Cam Ly, TP. Đà Lạt, Lâm Đồng` · Short label: `28A Hoàng Diệu, ĐL` · Hotline: `0945 396 117`
2. `cs2-hem-33-nct`: **Cơ sở 2 — Hẻm 33 Nguyễn Công Trứ** · `Hẻm 33 Nguyễn Công Trứ, P. Lâm Viên, TP. Đà Lạt, Lâm Đồng` · Short label: `Hẻm 33 Nguyễn Công Trứ` · Hotline: `0945 396 117`
3. `cs3-158-nct`: **Cơ sở 3 — 158 Nguyễn Công Trứ** · `158 Nguyễn Công Trứ, P. Lâm Viên, TP. Đà Lạt, Lâm Đồng` · Short label: `158 Nguyễn Công Trứ` · Hotline: `0945 396 117`
4. `cs4-duc-trong`: **Cơ sở 4 — Đức Trọng** · `544 Quốc lộ 20, Thị trấn Liên Nghĩa, Huyện Đức Trọng, Lâm Đồng` · Short label: `544 QL20, Đức Trọng` · Hotline: `037 444 0869`

---

## 4. Ordering & Customizer Rules (Figma Sheet 02)

- **Drinks (`kind: 'drink'`):**
  - Required `size` (`'S' | 'M' | 'L'`, must exist on the chosen drink's `sizes` array; defaults to the first available size).
  - Required `sugarLevel`: `'70'` (*70% Chuẩn*, default), `'50'` (*50% Vừa*), `'30'` (*30% Ít*), `'0'` (*0% Không*).
  - Required `iceLevel`: `'70'` (*70% Đá*, default), `'50'` (*50% Đá*), `'30'` (*30% Ít đá*), `'0'` (*0% Đá riêng*).
  - Optional `toppingIds`: deduplicated & sorted array of valid topping IDs.
  - `unitPrice = sizePrice + sum(topping.price)`; `lineTotal = unitPrice * quantity`.
  - Live breakdown text: e.g. `45k (Size M) + 10k (Trân châu đen) + 10k (Khúc bạch) = 65.000đ` (multiplied by `quantity` when `quantity > 1`).
- **Snacks (`kind: 'snack'`):**
  - Single portion price (`sizes: [{ size: 'STD', label: 'Phần tiêu chuẩn', price }]`).
  - Required `spiceLevel`: `'cay-nhieu' | 'cay-vua' | 'it-cay'` (defaults to current Snack section spice filter, initially `'cay-vua'`).
  - Toppings are prohibited on snacks.
- **Checkout & Delivery:**
  - Delivery fee (`shippingFee`) = `0` (*Miễn phí nội thành Đà Lạt*), eco-packaging (`ecoFee`) = `0` (`Dụng cụ ống hút & ly giấy thân thiện: 0đ`).
  - Payment methods: `'cod'` (*Tiền mặt (COD)*, default) or `'qr'` (*Chuyển khoản QR*).
  - Customer fields required at order confirmation: `customerName` (2–80 chars), `customerPhone` (valid VN phone `^0\d{9,10}$` after stripping spaces), `deliveryAddress` (5–200 chars), optional `note` (max 300 chars), `branchId`.
  - Server generates human-friendly order code `OM-YYYYMMDD-XXXX`, stores order in SQLite, and returns `OrderRecord`.

---

## 5. Backend & Admin Architecture

- **Persistence:** Node.js v22 built-in `node:sqlite` (`DatabaseSync`) wrapped in `DatabaseService` (`SQLITE_PATH` env var, default `data/omsua.sqlite`, `:memory:` in unit/e2e tests). Tables: `products`, `toppings`, `branches`, `orders`, `order_items`. Seeded idempotently from `@omsua/shared` on startup.
- **REST Endpoints (`/api` prefix):**
  - `GET /api/catalog` -> `ApiResponse<CatalogPayload>` (`categories`, `products`, `toppings`)
  - `GET /api/branches` -> `ApiResponse<BranchInfo[]>`
  - `POST /api/orders` -> `201 ApiResponse<OrderRecord>`
  - `GET /api/orders?status=&branchId=` -> `ApiResponse<OrderRecord[]>`
  - `PATCH /api/orders/:id/status` -> `ApiResponse<OrderRecord>` (`status`: `'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled'`)
  - `PATCH /api/catalog/products/:id/availability` -> `ApiResponse<ProductItem>` (`{ isAvailable: boolean }`)
- **Admin Portal (`@omsua/admin`, port `3001`):**
  - `/` **Quản lý đơn hàng:** Filter by branch & order status, inspect customer info + drink/snack customizations + payment method, update order status (`Xác nhận pha chế` -> `Giao hàng` -> `Hoàn tất` / `Hủy đơn`).
  - `/menu` **Thực đơn & Tình trạng món:** Grouped list of all 24 drinks & 6 snacks with instant `Còn món` / `Tạm hết` toggle wired to `PATCH /api/catalog/products/:id/availability`.
  - `/branches` **Chi nhánh (4):** Overview of the 4 Đà Lạt / Đức Trọng branches and order counts per branch.


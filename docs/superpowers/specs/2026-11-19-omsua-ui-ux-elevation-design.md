# Ốm Sữa — Thiết Kế Nâng Cấp Toàn Diện UI/UX: “Sương Sớm Cầu Đất” (8-Skill Studio Synthesis)

**Date:** 2026-11-19  
**Branch:** `feat/omsua-storefront-ordering`  
**Authority Order:** 3 Figma Visual Sheets (`figma-01`, `figma-02`, `figma-03`) -> Companion Specs (`2026-11-18-omsua-storefront-ordering-design.md`, `2026-11-19-omsua-full-fanpage-photo-harvest-design.md`) -> This UI/UX Elevation Spec  

---

## 1. Vai trò & Sự phối hợp của 8 Kỹ năng Thiết kế (8-Skill Architecture)

Bản thiết kế này hợp nhất 8 kỹ năng chuyên sâu thành một ngôn ngữ thị giác và tương tác thống nhất cho **Ốm Sữa — Trà sữa của người Đà Lạt (Since 2017)** mà không gây phình gói bundle sản phẩm:

| Kỹ năng (`SKILL.md`) | Vai trò kiến tạo trong hệ sinh thái Ốm Sữa | Đầu ra cụ thể |
|---|---|---|
| **`frontend-design`** | Định hướng thẩm mỹ thủ công Đà Lạt, phá bỏ sự đơn điệu của các khối `rounded-3xl` đồng nhất, thiết lập nhịp điệu thị giác bất đối xứng có chủ đích, thước chữ `tabular-nums` / `text-wrap: balance` và micro-interaction phản hồi trực tiếp hành động chọn món | Cải tổ bố cục `HeroSpotlight`, thanh tìm kiếm & lọc thực đơn ghim nổi, thước đo trực quan **Cup Gauge** trong `ProductCustomizerModal`, nhịp điệu trang sử biên niên `BrandStorySection` |
| **`theme-factory`** | Đóng gói hệ thống nhận diện thành custom theme chính thức **“Sương Sớm Cầu Đất” (*Highland Artichoke & Warm Paper*)** kế thừa trọn vẹn 14 mã màu gốc từ Figma (tuyệt đối `0` `#FFFFFF`/`#000000`) bổ sung lớp vân giấy mỹ thuật, bóng đổ ấm màu gỗ thông và đường kẻ thảo mộc | Đặc tả theme trong mục 2 + biến CSS ngữ nghĩa dùng chung cho `apps/web`, `apps/admin`, ấn phẩm in ấn và HTML artifacts |
| **`web-design-guidelines`** | Chuẩn hóa kỹ thuật giao diện theo Vercel Web Interface Guidelines: kích thước tường minh `width`/`height` chống nhảy bố cục (CLS), `fetchPriority="high"` cho ảnh Hero trên màn hình đầu, `autoComplete`/`inputMode` + focus lỗi đầu tiên cho form đặt đơn, `overscroll-contain`, `safe-area`, `theme-color`, `translate="no"`, dấu ba chấm chuẩn `…`, đồng bộ trạng thái lọc lên URL | Nâng cấp toàn bộ `apps/web` & `apps/admin` + bộ quét kiểm chứng tự động trong `apps/web/src/lib/web-review.test.ts` |
| **`a11y-debugging`** | Khắc phục triệt để các điểm nghẽn khả năng tiếp cận qua cây Accessibility & Lighthouse: sửa chẩn đoán `label-content-name-mismatch` trên 16 thẻ thư viện ảnh, xóa toàn bộ điểm co nhỏ vùng chạm `< 44px` (`sm:min-h-9`, `sm:min-h-10`), nâng cỡ chữ siêu nhỏ `< 12px` (`text-[9px]`, `text-[10px]`) lên chuẩn đọc tốt | Cổng kiểm chứng Chrome DevTools thực tế (`lighthouse_audit`, `take_snapshot`, `press_key` `Tab`/`Shift+Tab`) đạt `0` lỗi Console/Issue và `label-content-name-mismatch = 1` |
| **`algorithmic-art`** | Xây dựng triết lý nghệ thuật tính toán **“Sương Sớm Atiso” (*Highland Mist & Phyllotaxis*)** — trường dòng chảy Perlin noise có hạt giống cố định (`seed`) mô phỏng làn sương mai Cầu Đất lượn quanh cánh búp Atiso theo góc vàng `137.5°` | 1) Component nhẹ không phụ thuộc ngoài `<DalatMorningMistCanvas />` làm điểm nhấn duy nhất nơi `HeroSpotlight` (tự dừng khi khuất màn hình hoặc bật `prefers-reduced-motion`, kèm nút tạm dừng); 2) Studio p5.js tương tác độc lập (`suong-som-atiso-viewer.html`) tạo từ `templates/viewer.html` |
| **`canvas-design`** | Xây dựng triết lý thị giác tĩnh **“Đà Lạt Botanical Press”** — nghệ thuật sắp chữ & tiêu bản thực vật mang hơi thở sách nghệ thuật cao nguyên (90% không gian thị giác, 10% chữ tinh tuyển) | Trình xuất tự động `scripts/generate-brand-poster.py` tạo ấn phẩm thực đơn để bàn / poster thương hiệu chất lượng in ấn `apps/web/public/brand/omsua-botanical-menu-poster.pdf` & `.png` tải trực tiếp từ Storefront |
| **`web-artifacts-builder`** | Đóng gói bộ **Ốm Sữa Interactive Design System & Cup Customizer Playground** đa component (React + TypeScript + Tailwind + shadcn/ui đã tinh chỉnh sang bảng màu giấy kem ấm, không dùng tím gradient hay font Inter) thành 1 tệp `bundle.html` độc lập | Artifact `omsua-design-system-playground.html` phục vụ trình diễn & bàn giao thiết kế mà không làm bẩn `pnpm-lock.yaml` của monorepo |
| **`generative_ui`** | Trực quan hóa ngay trong khung trò chuyện / bảng bên các widget HTML tương tác dùng biến giao diện hệ thống để kiểm chứng bảng màu, thước đo ly trà sữa và trường hạt sương mù | Widget tương tác `omsua-suong-som-ui-blueprint.html` hiển thị trực tiếp cùng kế hoạch và báo cáo |

---

## 2. Hệ Thống Theme “Sương Sớm Cầu Đất” (`theme-factory` + `frontend-design`)

### 2.1. Bảng màu Gốc 14 Token & Lớp Chiều sâu Giấy Mỹ thuật (Zero `#FFFFFF` / `#000000`)

Giữ nguyên 100% 14 mã màu Figma trong `@omsua/shared` (`OMSUA_COLORS`) và bổ sung các biến bề mặt vật liệu dẫn xuất từ chính hệ màu nâu Espresso (`41, 38, 29`) & xanh Olive (`89, 76, 0`):

- **Nền chính (`bgCanvasCream` `#EEEADF`):** Phủ lớp vân giấy mỹ thuật cực nhẹ (`--pattern-paper-grain`, SVG `feTurbulence` đơn sắc `#594C00` ở độ mờ `0.024`, `pointer-events: none`) tạo cảm giác chạm vào thực đơn giấy thủ công Đà Lạt.
- **Nền nổi (`bgSurfaceLight` `#F7F4EC`) & Nhấn chuyên mục (`#F4E3AD`, `#C7CBBD`, `#C8BA9B`, `#B6A152`):** Bóng đổ sử dụng sắc nâu gỗ thông ấm thay vì xám đen công nghiệp:
  - `--shadow-paper-rest: 0 1px 2px rgba(41, 38, 29, 0.06), 0 6px 16px -6px rgba(89, 76, 0, 0.08)`
  - `--shadow-paper-lift: 0 4px 10px rgba(41, 38, 29, 0.10), 0 16px 32px -10px rgba(89, 76, 0, 0.14)`
- **Tương phản đêm cao nguyên (`bgHeroEspresso` `#29261D`) & Điểm nhấn (`accentTerracotta` `#D96B1E`, `accentArtichoke` `#7A8B3B`, `accentCoralSketch` `#E07D77`):** Giữ đúng phân vai trên Figma Sheet 01–03.

### 2.2. Hệ thống Chữ & Quy tắc Sắp chữ (`frontend-design` + `web-design-guidelines`)

- **5 Phông chữ Thương hiệu:** `Fraunces` (Display), `Lora` (Editorial), `Be Vietnam Pro` (UI & Controls), `Dancing Script` (Emotional Quote), `Shantell Sans` (Snack Header).
- **Kỷ luật Sắp chữ:**
  - Tiêu đề `h1`–`h3` áp dụng `text-wrap: balance`; văn bản mô tả giới hạn độ rộng `max-w-[65ch]` và `text-pretty`.
  - Mọi con số giá tiền VND (`45.000đ`), bộ đếm giỏ hàng, số lượng (`SL: 1`), đồng hồ tuổi đơn và KPI doanh thu bắt buộc bật `font-variant-numeric: tabular-nums` (`tabular-nums`) để không giật ngang khi đổi giá/số lượng.
  - Xóa bỏ cỡ chữ siêu nhỏ khó đọc `text-[9px]` / `text-[10px]` trên các huy hiệu thẻ sản phẩm, nâng sàn chữ hiển thị lên `text-xs` (`12px`) rõ nét (ngoại trừ `sm:text-xs` đi kèm `text-base` trên `#storefront-branch-select` vốn đã đạt chuẩn).
  - Sử dụng dấu ba chấm chuẩn Unicode `…` thay cho `...` ở toàn bộ placeholder và trạng thái tải (`"Đang xử lý đơn hàng…"`).
  - Bọc tên thương hiệu gốc `<span translate="no">Ốm Sữa</span>` ở vùng nhận diện chính để trình dịch tự động không dịch sai tên riêng.

### 2.3. Hai vòng Phê bình Thiết kế (`frontend-design` Two-Pass Self-Critique)

- **Phác thảo Vòng 1 & Điểm bị loại bỏ:** Hiện tại cả 6 phân vùng trong `StorefrontClientShell` đều đóng khung trong cùng một kiểu hộp `rounded-3xl border bg-surface-light p-6` xếp dọc đều nhau — tạo cảm giác "bộ thẻ SaaS lắp ghép" thay vì tiệm trà thủ công Đà Lạt.
- **Điều chỉnh Vòng 2 (Bản chốt):**
  1. **Dồn điểm nhấn thị giác vào một nơi duy nhất (*Spend boldness in one place*):** Đặt làn sương sớm tương tác `<DalatMorningMistCanvas />` làm nền sống động tinh tế bên trong khối Spotlight Espresso của `HeroSpotlight`, trong khi các phân vùng bên dưới giữ sự tĩnh tại, thoáng đãng.
  2. **Phân tầng nhịp điệu không gian (*Spatial Rhythm*):**
     - `HeroSpotlight`: Tấm bưu thiếp đôi Đà Lạt — cột trái biên tập trên nền giấy sáng kem ấm kèm tem mộc `"ĐÀ LẠT • 1.500M • TỪ 2017"`, cột phải là khung gỗ tối `#29261D` phủ làn sương Atiso và 2 thẻ Spotlight nổi chiều sâu.
     - `DrinkMenuSection`: Thanh điều khiển khám phá thực đơn (ô tìm kiếm tiếng Việt không dấu + công tắc Ảnh thực tế/Studio + chip chuyên mục) ghim gọn gàng khi cuộn (`sticky top-[72px] z-30`), có đường phân cách cành lá Atiso mảnh giữa tiêu đề và lưới món.
     - `BrandStorySection`: Chuyển từ hộp thẻ phẳng sang bố cục **Trang Nhật Ký Ủ Trà Đà Lạt** có đường trục thời gian thảo mộc nối 3 cột mốc `01 — Nguyên bản Cầu Đất`, `02 — Vị trà đằm dịu`, `03 — Bếp nhà mỗi sáng` cùng nút tải trực tiếp **Menu Ấn Phẩm Đà Lạt (PDF)**.

```text
+-----------------------------------------------------------------------------------+
| [Logo Ốm Sữa]   Trang chủ  Thực đơn  Snack  Câu chuyện  Không gian  [📍Chi nhánh] [Giỏ] |
+-----------------------------------------------------------------------------------+
|  ✦ TRÀ SỮA CỦA NGƯỜI ĐÀ LẠT              |  [ Nền #29261D + Sương Sớm Canvas ]    |
|  Mộc mạc • Tinh tế                       |  +----------------+ +----------------+ |
|  Đậm vị Atiso nguyên bản                 |  | Trà Sữa Atiso  | | Quýt Nhài      | |
|  [Đặt món ngay →] [Xem 4 chi nhánh]      |  | (eager + high) | | (eager + high) | |
|  [Bé Búp Atiso + Trích dẫn từ 2017]      |  +----------------+ +----------------+ |
+-----------------------------------------------------------------------------------+
|  [Sticky Bar] 🔍 Tìm nhanh món (Atiso, me, kem trứng…) | [Ảnh/Studio] | [Chips]  |
|  ── ✿ ── 1. TRÀ SỮA ĐÀ LẠT · 2. GIỮ DÁNG · 3. SỮA TƯƠI · 4. CÀ PHÊ ── ✿ ──       |
+-----------------------------------------------------------------------------------+
|  [Hộp Tùy Chỉnh Ly]  [Ảnh món] + [Thước Đo Trực Quan: Mức Đường 70% | Đá 70%]    |
+-----------------------------------------------------------------------------------+
```

---

## 3. Nâng Cấp Tương Tác Đặt Món, Quản Trị Quầy & Chuẩn `web-design-guidelines` / `a11y-debugging`

### 3.1. Khám phá Thực đơn & Đồng bộ URL (`DrinkMenuSection` + `StorefrontClientShell`)
- **Tìm kiếm nhanh không phân biệt dấu tiếng Việt (`normalizeVietnameseSearch` trong `@omsua/shared`):** Cho phép khách gõ `"atiso"`, `"khuc bach"`, `"sua tuoi"`, `"khong duong"` để lọc tức thì danh sách đồ uống kèm thông báo kết quả `aria-live="polite"` và nút `"Xóa bộ lọc"` khi không khớp món nào.
- **Đồng bộ URL nhẹ (`?cat=...&q=...&media=studio`):** Đọc tham số lúc khởi tạo client và cập nhật bằng `window.history.replaceState` để khách có thể chia sẻ đường dẫn trực tiếp tới nhóm món yêu thích mà không gây tải lại trang hay lệch SSR.

### 3.2. Thước đo Ly Trực quan & Hộp Tùy chỉnh (`ProductCustomizerModal`)
- Bổ sung thanh **Visual Cup Spec Strip (`Thước đo vị ly của bạn`)** ngay dưới thẻ tóm tắt món uống: hiển thị trực quan thanh mức **Đường (`70% / 50% / 30% / 0%`)**, thanh mức **Đá (`70% / 50% / 30% / 0%`)** và danh sách chip **Topping đã chọn** chuyển động mượt bằng `transform`/`opacity` theo thời gian thực khi khách bấm chọn.
- Cuộn nội bộ áp dụng `overscroll-contain` để không kéo trượt trang nền trên điện thoại.

### 3.3. Biểu mẫu Giao hàng & Phản hồi Giỏ hàng (`CartCheckoutDrawer` + `StorefrontHeader`)
- Bổ sung đầy đủ thuộc tính chuẩn biểu mẫu:
  - `customerName`: `autoComplete="name"`
  - `customerPhone`: `autoComplete="tel"`, `inputMode="tel"`, `spellCheck={false}`
  - `deliveryAddress`: `autoComplete="street-address"`
  - `note`: `autoComplete="off"`
- Khi gửi form bị lỗi dữ liệu: hiển thị thông báo lỗi cụ thể ngay cạnh trường lỗi (`aria-invalid="true"`, `aria-describedby`) **và tự động `focus()` vào ô lỗi đầu tiên**.
- Nút giỏ hàng trên `StorefrontHeader` và thanh giỏ hàng di động (`pb-[max(0.75rem,env(safe-area-inset-bottom))]`) có hiệu ứng nảy nhẹ `scale` (`prefers-reduced-motion` an toàn) mỗi khi `cartItemCount` tăng lên.

### 3.4. Khắc phục Triệt để Lỗi `a11y-debugging` & CLS Hình ảnh
1. **`FanpageGallerySection.tsx` (`label-content-name-mismatch`):** Chuyển từng ô trong lưới `#khong-gian` thành thẻ `<article>` chứa `<button type="button">` bao lấy khung ảnh + tiêu đề `{item.title}` kèm `<span className="sr-only"> — Xem ảnh lớn</span>`, còn đoạn mô tả `{item.caption}` nằm ngay bên dưới nút trong `<article>`. Nhờ đó chuỗi văn bản hiển thị bên trong `<button>` (`"{title}"`) khớp tuyệt đối làm tiền tố cho tên tiếp cận (`"{title} — Xem ảnh lớn"`), đưa kiểm toán `label-content-name-mismatch` của Axe/Lighthouse lên **`1.0` (`PASS`)** mà vẫn giữ trọn giao diện và bài kiểm thử hiện hữu!
2. **`ProductMedia.tsx`, `FanpageGallerySection.tsx`, `BrandFooter.tsx`, `BranchesPage.tsx`:**
   - Gắn tường minh `width` và `height` trên mọi thẻ `<img>` (`spotlight`: `640x480`, `card`: `320x380`, `snack`: `480x480`, `topping`: `256x256`, `branch`: `960x540`, `gallery`: `800x1000`) chống nhảy bố cục (CLS = `0`).
   - Khi `variant === 'spotlight'`, đặt `loading="eager"` và `fetchPriority="high"` để tối ưu LCP ngay khung nhìn đầu tiên.
3. **Vùng chạm `>= 44px` đồng nhất:** Gỡ toàn bộ lớp thu nhỏ `sm:min-h-9` và `sm:min-h-10` trên `HeroSpotlight.tsx`, `DrinkMenuSection.tsx`, `SnackMenuSection.tsx`, `CartCheckoutDrawer.tsx`; gắn `touch-action: manipulation` cho các nút tương tác.
4. **Metadata trình duyệt (`layout.tsx` & `apps/admin/index.html`):** Xuất `export const viewport: Viewport = { themeColor: '#EEEADF' }` trong Next.js 15 và `<meta name="theme-color" content="#EEEADF" />` trong Admin.

### 3.5. Buồng lái Pha chế & Điều phối (`@omsua/admin`)
- Bổ sung huy hiệu **Thời gian chờ đơn (`formatOrderAgeLabel`)** trên từng thẻ đơn trong `OrdersPage.tsx` (`Vừa đặt`, `8 phút trước`, cảnh báo nổi bật bằng viền cam đất khi đơn `pending`/`preparing` chờ quá `15 phút`), giúp thu ngân ưu tiên xử lý ngay đơn trễ giờ cao điểm.
- Chuẩn hóa `tabular-nums` cho toàn bộ 4 thẻ KPI doanh thu, bộ đếm tab trạng thái và bảng chi nhánh `BranchesPage.tsx`.

---

## 4. Ấn Phẩm Nghệ Thuật & Studio Artifacts (`canvas-design`, `algorithmic-art`, `web-artifacts-builder`)

1. **Ấn phẩm Thực đơn Nghệ thuật Tĩnh (`canvas-design`):**
   - Triết lý thị giác: `docs/superpowers/specs/art/dalat-botanical-press-philosophy.md`.
   - Trình tạo tất định: `scripts/generate-brand-poster.py` (sử dụng Python + phông chữ `Lora` / `InstrumentSerif` / `DMMono` từ `canvas-design/canvas-fonts` và bảng màu 14 mã `OMSUA_COLORS`) sinh tệp in ấn `apps/web/public/brand/omsua-botanical-menu-poster.pdf` + ảnh xem trước `apps/web/public/brand/omsua-botanical-menu-poster.png`, gắn liên kết tải xuống tại `BrandStorySection.tsx`.
2. **Nghệ thuật Thuật toán Sương Sớm (`algorithmic-art`):**
   - Triết lý thuật toán: `docs/superpowers/specs/art/suong-som-atiso-algorithmic-philosophy.md`.
   - Bản chạy nhúng sản phẩm: `apps/web/src/components/artwork/DalatMorningMistCanvas.tsx` (HTML5 `<canvas>` thuần TypeScript `~120` dòng, PRNG `mulberry32(seed)` + trường dòng chảy lượng giác đa tầng, `0` thư viện ngoài).
   - Bản Studio khám phá hạt giống p5.js độc lập: tệp HTML tự chứa trong thư mục Artifact khởi tạo nguyên bản từ `algorithmic-art/templates/viewer.html` (giữ nguyên thanh bên Seed Prev/Next/Random/Jump + thanh trượt thông số Sương mù / Xoắn ốc Atiso / Hạt phấn trà + nút Tải PNG).
3. **Interactive Design System Playground (`web-artifacts-builder`):**
   - Khởi tạo trong không gian tạm ngoài repo và đóng gói bằng `bundle-artifact.sh` thành 1 tệp `omsua-design-system-playground.html` độc lập lưu trong thư mục Artifact để trình diễn trực quan toàn bộ hệ thống Token, Typography, Thẻ món & Thước đo Ly tùy chỉnh.

---

## 5. Ràng Buộc Toàn Cục (Global Constraints)

- **Node.js `>= 22.0.0` & `pnpm >= 10.0.0`:** Không cài thêm thư viện runtime nặng (`p5`, `framer-motion`, `shadcn` Tailwind v3) vào `apps/web` hay `apps/admin` để giữ tốc độ build/LCP tối đa.
- **0 Mã màu `#FFFFFF` / `#000000`:** Tuyệt đối không xuất hiện `#fff`, `#ffffff`, `#000`, `#000000`, `rgb(255,255,255)`, `rgb(0,0,0)` hay `*-white` / `*-black` trong toàn bộ mã nguồn, CSS, SVG và ấn phẩm.
- **Bảo toàn Hợp đồng Kiểm thử Hiện hữu:** Toàn bộ `153` bài kiểm thử hiện có trên cả 4 gói (`@omsua/shared`, `@omsua/backend`, `@omsua/web`, `@omsua/admin`) phải tiếp tục xanh 100% song song với các bài kiểm thử UI/UX mới.
- **Không dừng tiến trình người dùng:** Không tác động tới các máy chủ dev đang chạy trên `:3000`, `:3001`, `:4000`.

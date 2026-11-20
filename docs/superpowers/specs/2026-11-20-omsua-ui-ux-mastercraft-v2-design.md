# Ốm Sữa UI/UX Mastercraft v2 Design Spec — “Bản Khắc Cao Nguyên” (8-Skill Synthesis)

**Ngày lập:** 2026-11-20  
**Nhánh phát triển:** `feat/omsua-storefront-ordering` (tự động CD lên Vercel `omsua-web`, `omsua-admin` & Render `omsua-backend` khi đồng bộ `main`)  
**Theme tham chiếu:** `docs/superpowers/specs/themes/ban-khac-cao-nguyen-theme.md`  

---

## 1. Mục tiêu & Lý do Nâng cấp (Intent & Why)

Sau đợt nâng cấp nền tảng đầu tiên và triển khai thực tế lên `https://omsua-web.vercel.app` & `https://omsua-admin.vercel.app`, kiểm toán chuyên sâu bằng 8 kỹ năng (`frontend-design`, `web-design-guidelines`, `a11y-debugging`, `theme-factory`, `generative_ui`, `web-artifacts-builder`, `canvas-design`, `algorithmic-art`) phát hiện **4 điểm nghẽn thực tế** ngăn giao diện đạt đẳng cấp studio thủ công & điểm tuyệt đối `100/100`:

1. **Tương phản màu chữ nhỏ `< 4.5:1` làm Lighthouse Accessibility dừng ở `96/100` (`a11y-debugging` + `theme-factory`):**
   - `#F7F4EC` trên `#D96B1E` (`bg-terracotta` CTA) chỉ đạt `3.15:1`; giá tiền `text-terracotta` trên `#F7F4EC` đạt `3.15:1`.
   - `#F7F4EC` trên `#7A8B3B` (`bg-artichoke` nhãn `+ SIGNATURE`, `+ Chọn`) chỉ đạt `3.42:1`.
   - `text-subhead-ochre` (`#A67C2E`) trên `#F7F4EC` đạt `3.45:1`; `text-warm-muted` (`#6B6255`) trên `bg-card-taupe` (`#C8BA9B`) đạt `3.13:1`.
   - Thẻ chọn chi nhánh ở `BrandFooter.tsx` dùng `<div role="button">` bọc ngoài `<h3>`, vừa vi phạm quy tắc semantic HTML của `web-design-guidelines` vừa làm trình đọc màn hình xóa mất cấu trúc tiêu đề `<h3>`; thẻ `<select>` chưa gắn màu nền tường minh cho `<option>` trên Windows/Linux dark mode.
2. **Nhịp điệu bố cục còn lặp lại 6 hộp thẻ giống hệt nhau (`frontend-design` Self-Critique):**
   - Cả 6 phân vùng trên Storefront đều dùng chung một lớp vỏ `rounded-3xl border border-olive-primary/14 bg-surface-light p-6 shadow-paper-rest` xếp chồng đều nhau (dấu hiệu điển hình của layout khung thẻ SaaS), thiếu sự phân tầng chất liệu giữa **Bưu thiếp Hero**, **Quầy Topping giấy bơ**, **Trang báo biên tập Câu chuyện Ốm** và **Bố cục Lookbook bất đối xứng** cho thư viện ảnh.
3. **Trải nghiệm tương tác pha chế & đặt lại đơn còn phẳng (`frontend-design` + `web-design-guidelines`):**
   - `CustomizerCupGauge` mới dừng ở 2 thanh ngang đơn giản, chưa cho khách "nhìn thấy" trực quan lớp đá viên, lớp mật đường và lớp topping dâng lên trong chiếc ly khi tùy chỉnh Size `S/M/L` · `Đường` · `Đá` · `Topping`.
   - Thanh khám phá thực đơn chưa hỗ trợ phím tắt nhanh `/` và bộ lọc gợi ý hợp vị (`?mood=`), còn `OrderLookupModal` chưa có nút **1 chạm Đặt lại đơn cũ (`Đặt lại giỏ món này`)**.
4. **Cổng Admin Quầy pha chế thiếu đồng bộ URL, chế độ Thẻ Bếp gọn & in phiếu (`web-design-guidelines`):**
   - Khi thu ngân lọc đơn theo cơ sở/trạng thái trên `OrdersPage` hoặc lọc món trên `MenuPage` rồi tải lại trang, bộ lọc bị mất do chưa đồng bộ lên query string; chưa có chế độ xem gọn giờ cao điểm và kiểu in `@media print` sạch cho phiếu pha chế.

---

## 2. Phân vai Tích hợp 8 Kỹ năng (`8-Skill Studio Synthesis`)

| Kỹ năng | Giải pháp kiến trúc trong v2 |
|---|---|
| **`theme-factory`** | Ban hành hệ màu **“Bản Khắc Cao Nguyên”** (`ban-khac-cao-nguyen-theme.md`): giữ nguyên 14 mã gốc `OMSUA_COLORS` và bổ sung 3 biến mực in tương phản cao `--color-terracotta-deep` (`#9E450B`, `5.76:1`), `--color-artichoke-deep` (`#4D5922`, `6.90:1`), `--color-ochre-deep` (`#805B1A`, `5.55:1`) đồng bộ cho Web, Admin, PDF và Artifacts |
| **`a11y-debugging`** | Đưa Lighthouse Accessibility từ `96` lên **`100/100`** trên cả Storefront & Admin: khắc phục triệt để `color-contrast`, thay `<div role="button">` ở `BrandFooter` bằng `<article>` + `<button type="button" aria-pressed>` giữ nguyên `<h3>` trong Accessibility Tree, gắn màu tường minh cho `<option>` |
| **`frontend-design`** | Phá bỏ sự lặp lại của 6 khung `rounded-3xl bg-surface-light`: thiết kế dải tem độ cao đục lỗ cho `HeroSpotlight`, dải giấy bơ thủ công cho `ToppingStripSection`, bố cục tạp chí mở không khung hộp cho `BrandStorySection`, và lưới **Editorial Bento Lookbook** (khung tâm điểm `2x2`) cho `FanpageGallerySection` |
| **`web-design-guidelines`** | Phím tắt `/` nhảy vào ô tìm kiếm thực đơn (bỏ qua khi đang gõ trong `input`/`textarea`/`select`/`contentEditable`), lọc gợi ý hợp vị đồng bộ URL (`?mood=thanh-mat\|dam-vi\|tinh-tao`), nút `Đặt lại giỏ món này` trong `OrderLookupModal`, đồng bộ URL `?status=&branch=&q=` + chế độ **Thẻ Bếp gọn** + `@media print` cho Admin |
| **`algorithmic-art`** | Nâng cấp `<DalatMorningMistCanvas />` thêm tương tác làn gió nhẹ theo con trỏ (`onPointerMove` không đọc layout, tự tắt khi `prefers-reduced-motion: reduce` hoặc bấm tạm dừng) và xuất bản Studio p5.js v2 (`suong-som-atiso-gallery-v2.html` từ `templates/viewer.html`) có **4 Preset Thời khắc Đà Lạt & Chế độ Lưới 4 Seed** |
| **`canvas-design`** | Nâng cấp `scripts/generate-brand-poster.py` lên **Ấn phẩm Thực đơn & Lookbook 2 trang PDF chuẩn bảo tàng** (`omsua-botanical-menu-poster.pdf` + `.png`): Trang 1 *Tiêu bản Atiso & Danh mục Trà chủ đạo*, Trang 2 *Bản đồ Độ cao 4 Cơ sở & Phối vị Bánh tráng Đà Lạt* |
| **`web-artifacts-builder`** | Khởi tạo & đóng gói ứng dụng đa component React + TypeScript + Tailwind + shadcn/ui **Ốm Sữa Cup Architecture & Barista Workbench v2** thành tệp độc lập `omsua-ui-ux-v2-workbench.html` trong thư mục Artifact |
| **`generative_ui`** | Tạo widget HTML tương tác nhỏ gọn (`< 500px`, dùng biến hệ thống `--card`, `--foreground`, `--border`) nhúng trực tiếp qua `<agent-embed>` để đối chiếu trực quan độ tương phản WCAG AA, mặt cắt ly trà động và nhịp điệu bố cục |

---

## 3. Thiết kế Chi tiết Từng Phân hệ

### 3.1. Phân tầng Chất liệu Bề mặt & Khám phá Thực đơn (`@omsua/web`)
1. **Nhịp điệu 4 chất liệu không lặp vỏ hộp:**
   - `HeroSpotlight`: Tấm bưu thiếp cao nguyên viền đôi kèm dải tem độ cao `"ĐÀ LẠT • 1.500M • CẦU ĐẤT"` đục răng cưa tinh tế (`border-dashed`).
   - `DrinkMenuSection`: Bổ sung hàng chip **Gợi ý hợp vị (`Flavor Mood`)** đồng bộ URL `?mood=`:
     - `'all'`: Tất cả vị
     - `'thanh-mat'` (*Thanh mát ít ngọt*): lọc nhóm `fruit-tea` + các món thanh thảo mộc (`tra-sua-atiso`, `oolong-sen-gung`, `cold-brew-me`)
     - `'dam-vi'` (*Đậm trà béo mịn*): lọc các món trà sữa đậm vị / kem trứng / tiramisu / flan (`tra-sua-atiso-chuoi`, `tra-sua-flan-chay-canh`, `tra-sua-tiramisu`, `sua-tuoi-kem-trung-nuong`, `ca-phe-kem-tiramisu`, `ca-phe-muoi`, `bac-xiu-da-lat`)
     - `'tinh-tao'` (*Tỉnh táo Cầu Đất*): lọc nhóm `coffee` + `matcha-latte` + `matcha-oreo-da-xay`
     - Nhấn phím `/` trên bàn phím (khi tiêu điểm không nằm trong ô nhập liệu và không mở hộp thoại) sẽ `focus()` ngay vào ô tìm kiếm thực đơn kèm huy hiệu phím `<kbd>/</kbd>` hiển thị bên phải ô tìm kiếm.
   - `ToppingStripSection`: Chuyển sang dải băng giấy bơ ấm (`bg-card-butter/45 border-y border-olive-primary/18`) thay vì hộp trắng kem lặp lại.
   - `BrandStorySection`: Trải mở trực tiếp trên nền giấy vân mỹ thuật (`border-y border-olive-primary/16 py-8`, bỏ vỏ hộp `rounded-3xl bg-surface-light`) như một trang tạp chí biên khảo Đà Lạt, hiển thị liên kết tải **Ấn phẩm Thực đơn & Bản đồ Vị 2 trang (PDF)**.
   - `FanpageGallerySection`: Chuyển lưới ảnh sang **Editorial Bento Lookbook** (`sm:col-span-2 sm:row-span-2` cho khung hình đầu tiên khi xem ở chế độ `Tất cả` trên màn hình `>= sm`), bảo toàn tuyệt đối tên chuyển cảnh `gallery-photo-${item.id}` 1-đối-1.

### 3.2. Mặt cắt Ly Trà Tương tác Thời gian thực (`CustomizerCupGauge` trong `CustomizerCompound.tsx`)
- Mở rộng `CustomizerCupGauge` cho đồ uống (`product.kind === 'drink'`) với hình vẽ vector mặt cắt ngang chiếc ly **Live Layered Cup SVG** (`data-testid="customizer-cup-svg"`):
  - **Tỷ lệ thân ly theo Size:** `S` (`scale(0.9)`), `M` (`scale(0.96)`), `L` (`scale(1.03)`) quanh tâm đáy ly (`transform-box: fill-box; transform-origin: bottom center`).
  - **Lớp nền thức uống theo nhóm món:** Sắc xanh thảo mộc cho Atiso/Matcha, hổ phách sáng cho Trà trái cây, kem sữa ấm cho Sữa tươi/Đá xay, nâu rang Cầu Đất cho Cà phê.
  - **Lớp mật đường (`sugarLevel`):** Vệt sóng mật ong caramel ở đáy ly co giãn chiều cao theo `0% / 30% / 50% / 70%`.
  - **Lớp đá viên nổi (`iceLevel`):** Hiển thị `0`, `2` (`30%`), `3` (`50%`) hoặc `5` (`70%`) viên đá trong suốt nổi trên mặt trà.
  - **Lớp hạt Topping (`previewLine.toppings`):** Hiển thị trực quan các hạt trân châu / khúc bạch / lớp kem trứng bồng bềnh dưới đáy/trên miệng ly đúng theo số lượng topping khách vừa tích chọn!

### 3.3. Đặt lại Đơn Nhanh 1 Chạm (`OrderLookupModal.tsx` + `StorefrontClientShell.tsx`)
- Bổ sung prop tùy chọn `onReorder?: (order: OrderRecord) => void` vào `OrderLookupModal`:
  - Khi đang xem chi tiết một đơn hàng `activeOrder`, hiển thị nút **`Đặt lại giỏ món này`** (`min-h-11`).
  - Khi nhấn: `StorefrontShellInner` đối chiếu từng dòng `activeOrder.items` với `catalog.products` và `catalog.toppings` hiện hành; tự động nạp toàn bộ các dòng món còn mở bán (lọc bỏ topping tạm hết nếu có) vào `CartProvider` (`addItem`), đóng `OrderLookupModal` và mở ngay `CartCheckoutDrawer` để khách xác nhận giao hàng trong 1 chạm! Nếu toàn bộ món trong đơn cũ đều đang tạm hết, hiển thị thông báo rõ ràng ngay trong hộp tra cứu thay vì mở giỏ rỗng.

### 3.4. Buồng lái Pha chế Admin (`@omsua/admin` — `OrdersPage.tsx` & `MenuPage.tsx`)
1. **Đồng bộ Bộ lọc lên URL (`useSearchParams` của `react-router-dom`):**
   - `OrdersPage`: đọc/ghi `?status=...&branch=...&q=...` (`replace: true`) — giá trị mặc định `'all'` và chuỗi rỗng được lược bỏ gọn khỏi URL; tham số lạ không hợp lệ tự động kẹp an toàn về `'all'`.
   - `MenuPage`: đọc/ghi `?cat=...&avail=...&q=...` (`replace: true`) — kẹp an toàn tham số không hợp lệ.
2. **Chế độ Thẻ Bếp Gọn (`compact` toggle) & In Phiếu Bếp (`@media print`):**
   - Trên thanh công cụ `OrdersPage`, bổ sung nút bật/tắt **`Chế độ Thẻ Bếp gọn`** (`aria-pressed`) chuyển danh sách đơn sang lưới 2 cột cô đọng tập trung vào Mã đơn + Thời gian chờ + Công thức pha chế (`Size · Đường · Đá · Topping`) + Nút chuyển trạng thái 1 chạm.
   - Mỗi thẻ đơn có nút **`In phiếu bếp`** (`window.print()` sau khi đánh dấu đơn đang in `data-print-active="true"`) kết hợp quy tắc `@media print` trong `apps/admin/src/index.css` ẩn toàn bộ thanh bên, thanh lọc và các đơn khác để in ra đúng 1 phiếu pha chế gọn sắc nét trên giấy kem sáng.

---

## 4. Các Phương án Đã Cân nhắc (Approaches)

1. **Phương án A (Được chọn — *Surgical High-Craft & Zero-Dependency Studio Synthesis*):** Hiệu chỉnh hệ màu tương phản cao qua biến CSS `@theme`, nâng cấp nhịp điệu bố cục biên tập, vẽ SVG mặt cắt ly thuần React, đồng bộ URL bằng `useSearchParams` sẵn có và xuất ấn phẩm/artifacts độc lập ngoài `node_modules`. Giữ `0` gói runtime mới, bảo toàn LCP `< 400ms` desktop và đưa Lighthouse Accessibility lên `100/100`.
2. **Phương án B (*Cài thêm thư viện UI/Animation ngoài như Framer Motion / Radix / Nuqs vào monorepo*):** Tăng kích thước gói JS đầu trang, phá vỡ ràng buộc không thêm runtime dependency và dễ xung đột với `<AppViewTransition />` React 19 hiện hữu -> Loại.
3. **Phương án C (*Chỉ sửa màu tương phản mà giữ nguyên 6 hộp thẻ giống nhau*):** Đạt điểm Lighthouse nhưng không giải quyết triệt để bài toán thẩm mỹ biên tập của `frontend-design` -> Loại.

---

## 5. Ràng buộc Toàn cục (Global Constraints)

- **Node.js `>= 22.5.0` & `pnpm@12.18.0`:** Tuyệt đối `0` runtime npm dependency mới trong `packages/shared`, `apps/backend`, `apps/web` và `apps/admin`.
- **0 Mã màu Trắng tinh / Đen tuyền:** Không xuất hiện `#fff`, `#ffffff`, `#000`, `#000000`, `rgb(255,255,255)`, `rgb(0,0,0)` hay `*-white` / `*-black` ở bất kỳ tệp nào (kể cả kiểu `@media print` và ấn phẩm PDF).
- **Sàn chữ & Vùng chạm:** Cỡ chữ hiển thị tối thiểu `12px` (`text-xs`), vùng chạm tối thiểu `min-h-11` (`>= 44px`), không dùng `transition-all`, `forwardRef` hay `useContext`.
- **Bảo toàn Hợp đồng Kiểm thử & Tự động CD:** Giữ xanh toàn bộ `182+` bài kiểm thử hiện hữu (`pnpm build && pnpm typecheck && pnpm lint && pnpm test`), xác minh Lighthouse Accessibility `100/100` và đồng bộ lên `main` để cập nhật trực tiếp Vercel & Render.

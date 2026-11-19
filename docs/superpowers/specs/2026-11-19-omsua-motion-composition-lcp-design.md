# Ốm Sữa Motion, Composition & Core Web Vitals Optimization — Design Specification

**Date:** 2026-11-19  
**Workspace:** `/home/fedora/Documents/OmSua`  
**Branch:** `feat/omsua-storefront-ordering`  
**Synthesized Skills:** `vercel-react-view-transitions`, `vercel-composition-patterns`, `vercel-react-native-skills`, `debug-optimize-lcp`, `webapp-testing`

---

## 1. Mục tiêu & Tầm nhìn Sản phẩm

Nâng cấp kiến trúc chuyển động, kiến trúc component React 19, hiệu năng hiển thị nội dung chính (LCP / Core Web Vitals) và kiểm thử tự động E2E cho hệ sinh thái **Ốm Sữa** (`@omsua/shared`, `@omsua/web`, `@omsua/admin`) lên chuẩn sản phẩm thương mại tốc độ cao:

1. **Chuyển động tự nhiên bằng Native View Transitions (`vercel-react-view-transitions`):** Mọi chuyển đổi trạng thái có ý nghĩa không gian (mở ảnh thực tế Fanpage sang Lightbox, trượt viên nang lọc danh mục/độ cay/trạng thái đơn, lọc danh sách thức uống, chuyển trang điều hướng trên Admin) đều vận hành mượt qua `<ViewTransition>` và `addTransitionType` mà không cần cài thêm thư viện animation bên thứ ba.
2. **Kiến trúc Compound Components & Explicit Variants chuẩn React 19 (`vercel-composition-patterns`):** Xóa bỏ phân nhánh boolean phức tạp (`isDrink`) và tách nhỏ các modal lớn (`ProductCustomizerModal`, `CartCheckoutDrawer`) thành hệ Compound Components dùng Context `{ state, actions, meta }` và React 19 `use()`, không dùng `forwardRef`.
3. **Kỷ luật Hiệu năng Danh sách & Mobile đa nền tảng (`vercel-react-native-skills`):** Áp dụng các quy tắc cốt lõi cho thiết bị di động ngay từ tầng `@omsua/shared` và các danh sách món/đơn hàng: hoist `Intl.NumberFormat` ra cấp module (`js-hoist-intl`), tách pure reducer cho Customizer dùng chung Web/Expo (`state-must-represent-ground-truth`), bọc `React.memo` cho từng thẻ món/thẻ đơn kèm callback ổn định (`list-performance-item-memo`, `list-performance-callbacks`), chỉ animate `transform`/`opacity` (`animation-gpu-properties`), và cấm tuyệt đối biểu thức `{count && <...>}` gây rò rỉ số `0` hoặc chuỗi rỗng (`rendering-no-falsy-and`).
4. **Tối ưu Toàn diện 4 Thành phần LCP (`debug-optimize-lcp`):** Xử lý đồng bộ cả 4 phân đoạn của Largest Contentful Paint:
   - **TTFB:** Giới hạn thời gian chờ SSR `fetchCatalog`/`fetchBranches` bằng `AbortSignal.timeout(1500)` và cấu hình `Cache-Control: public, max-age=31536000, immutable` cho tài nguyên ảnh tĩnh `/images/fanpage/*` và `/brand/*`.
   - **Resource Load Delay:** Chỉ gắn `fetchPriority="high"` + `loading="eager"` + `decoding="sync"` cho **duy nhất** ảnh Hero LCP số 1 (`Trà Sữa Atiso`, `index === 0`), tránh để ảnh Spotlight số 2 tranh chấp băng thông ưu tiên đầu trang.
   - **Resource Load Duration:** Chỉ giữ `preload: true` cho 2 font hiển thị trên màn hình đầu tiên (`Fraunces` và `Be_Vietnam_Pro`), tắt `preload` cho 3 font trang trí/cuối trang (`Lora`, `Dancing_Script`, `Shantell_Sans`).
   - **Element Render Delay:** Trì hoãn vòng lặp hạt sương `<DalatMorningMistCanvas />` sang sau lần vẽ đầu tiên (`requestIdleCallback` / `setTimeout(..., 120)`) để luồng chính ưu tiên tuyệt đối cho LCP.
5. **Kiểm thử Giao diện Thực tế bằng Python Playwright (`webapp-testing`):** Xây dựng kịch bản kiểm thử tự động `scripts/webapp-playwright-verify.py` (tương thích `with_server.py` và `/usr/bin/google-chrome` headless) đo trực tiếp chỉ số `largest-contentful-paint` (`< 2500ms`), kiểm tra luồng chuyển động View Transition, Compound Customizer/Checkout, Admin Directional Navigation và xuất ảnh chụp màn hình kiểm chứng.

---

## 2. Thiết kế Kiến trúc Chi tiết theo 5 Trụ cột

### 2.1 Cầu nối Isomorphic `<AppViewTransition>` & Bản đồ Chuyển động (`vercel-react-view-transitions`)

Do `@omsua/admin` và Vitest chạy trực tiếp `react@19.3.1` (xuất `React.ViewTransition` và `React.addTransitionType`), trong khi `@omsua/web` chạy Next.js `15.5.29` (khi bật `experimental: { viewTransition: true }` trong `next.config.ts` sẽ ánh xạ sang kênh `react-experimental` xuất `React.unstable_ViewTransition` và `React.unstable_addTransitionType`), hệ thống định nghĩa cầu nối mỏng `AppViewTransition`:
- Tự động phân giải `ViewTransition ?? unstable_ViewTransition ?? Fragment` và `addTransitionType ?? unstable_addTransitionType ?? noop`.
- **Cô lập Thanh điều hướng cố định (Persistent Chrome Isolation):**
  - `StorefrontHeader`: `viewTransitionName: 'omsua-site-header'` kèm quy tắc CSS Backdrop-Blur Workaround (`::view-transition-old(omsua-site-header) { display: none }`, `::view-transition-new(omsua-site-header) { animation: none }`, `z-index: 100`).
  - Thanh giỏ hàng nổi mobile: `viewTransitionName: 'omsua-sticky-cart'`.
  - Khung `AdminLayout` (sidebar & topbar): `viewTransitionName: 'omsua-admin-sidebar'` và `'omsua-admin-topbar'`.
  - Tắt cross-fade mặc định trên `root` (`::view-transition-old(root) { display: none }`, `::view-transition-new(root) { animation: none }`) và bật `::view-transition { pointer-events: none }` để giao diện luôn phản hồi tức thì khi đang chuyển cảnh.
- **5 Mẫu View Transition áp dụng:**
  1. **Shared Element Morph (`share="morph"`):** Khi nhấn thẻ ảnh trong `FanpageGallerySection` (`startTransition`), thẻ lưới đang mở nhường tên `gallery-photo-${item.id}` (`name={lightboxIndex === index ? undefined : ...}`) cho ảnh phóng đại trong `PhotoLightboxModal` (`name="gallery-photo-${currentItem.id}"`), đảm bảo duy nhất 1 phần tử mang tên đó tại mọi thời điểm để tạo hiệu ứng phóng mượt hai chiều.
  2. **Sliding Pill Indicator (`share="tab-pill"`):** Viên nang nền trượt mượt giữa các tab lọc danh mục nước (`drink-category-pill`), độ cay bánh tráng (`snack-spice-pill`), bộ lọc album Fanpage (`gallery-filter-pill`) và bộ lọc trạng thái đơn Admin (`admin-status-pill`).
  3. **Ordered Sequence Slide (`lightbox-next` / `lightbox-prev`):** Chuyển ảnh Trước/Tiếp trong `PhotoLightboxModal` trượt theo hướng tương ứng qua `addAppTransitionType`.
  4. **List Identity & Layout Displacement:** Các thẻ món trong `DrinkMenuSection` dùng `<AppViewTransition key={drink.id}>` kết hợp `useDeferredValue` trên từ khóa tìm kiếm; các phân khu kế tiếp (`ToppingStripSection`, `SnackMenuSection`) bọc `<AppViewTransition>` để trượt mượt thay vì nhảy cục bộ khi chiều cao danh sách thay đổi.
  5. **Directional Route Navigation trên Admin (`nav-forward` / `nav-back`):** Điều hướng giữa 4 phân hệ theo thứ tự (`/`, `/menu`, `/branches`, `/settings`) gắn nhãn hướng dựa trên chỉ số trang hiện tại so với trang đích (bỏ qua khi người dùng giữ phím bổ trợ `Ctrl`/`Meta`/`Shift`/`Alt` hoặc chuột giữa).

### 2.2 Kiến trúc Compound Components & Explicit Variants (`vercel-composition-patterns`)

1. **`CartContext` chuẩn React 19 (`apps/web/src/store/cart-store.tsx`):**
   - Chuyển `<CartContext.Provider value={value}>` sang cú pháp React 19 `<CartContext value={value}>` và đọc context qua `use(CartContext)`.
   - Bổ sung cấu trúc chuẩn DI `{ state, actions, meta }` trên `CartContextValue` song song với các trường phẳng hiện hữu để tương thích ngược 100%.
2. **`Customizer` Compound Component & 2 Biến thể Tường minh (`apps/web/src/components/modals/customizer/`):**
   - Định nghĩa `CustomizerContextValue` gồm `state` (`CustomizerDraftState`), `actions` (`setSize`, `setSugarLevel`, `setIceLevel`, `toggleTopping`, `setSpiceLevel`, `incrementQuantity`, `decrementQuantity`, `submit`, `close`), và `meta` (`product`, `availableToppings`, `resolvedPreviewLine`, `headingId`).
   - Cung cấp các thành phần ghép: `Customizer.Provider`, `Customizer.Dialog`, `Customizer.Header`, `Customizer.SizeSelector`, `Customizer.SugarSelector`, `Customizer.IceSelector`, `Customizer.ToppingPicker`, `Customizer.SpiceSelector`, `Customizer.CupGauge`, `Customizer.Footer`.
   - Hai biến thể tường minh: `<DrinkCustomizerModal />` và `<SnackCustomizerModal />`; `<ProductCustomizerModal />` đóng vai trò bộ định tuyến mỏng theo `product.kind` (kèm `key={product.id}`), xóa bỏ hoàn toàn chuỗi điều kiện `isDrink ? ... : ...` rải rác.
3. **`Checkout` Compound Component (`apps/web/src/components/modals/checkout/`):**
   - Tách `CartCheckoutDrawer.tsx` (hơn 900 dòng) thành hệ thành phần ghép gọn gàng: `Checkout.Provider` (`{ state, actions, meta }`), `Checkout.UnavailableBanner`, `Checkout.ItemList`, `Checkout.BranchCard`, `Checkout.DeliveryFields`, `Checkout.TotalsCard`, `Checkout.PaymentPicker`, `Checkout.ReceiptView`, đọc qua `use(CheckoutContext)`.

### 2.3 Tối ưu Đa nền tảng & Danh sách Mobile (`vercel-react-native-skills`)

1. **`packages/shared/src/pricing.ts`:** Hoist `const VI_NUMBER_FORMATTER = new Intl.NumberFormat('vi-VN')` ở cấp module để `formatVnd` sử dụng lại một thể hiện duy nhất.
2. **`packages/shared/src/customizer-state.ts`:** Tách máy trạng thái thuần TypeScript (`createCustomizerDraftState`, `reduceCustomizerDraftState`, `draftStateToOrderItemInput`) không phụ thuộc DOM, sẵn sàng tái sử dụng trực tiếp cho cả Web lẫn ứng dụng Expo / React Native trong tương lai.
3. **Memoization & Stable Callbacks:** Tách `DrinkMenuItemCard`, `SnackMenuItemCard` và `AdminOrderCard` bọc `React.memo`, truyền dữ liệu nguyên thủy + hàm callback ổn định dùng `useCallback` ở component cha để gõ phím tìm kiếm hoặc đổi bộ lọc không làm render lại các thẻ không đổi.
4. **Chống rò rỉ giá trị Falsy & Hoàn thiện Typography:** Loại bỏ mọi mẫu `{count && ...}` hoặc `{text && ...}` có nguy cơ in số `0` ra giao diện; hoàn tất đồng bộ ký tự `…` và `tabular-nums` trên toàn bộ `@omsua/admin` và `OrderLookupModal.tsx` (giải quyết luôn các mục tồn đọng nhỏ từ đợt trước).

---

## 3. Ràng buộc Bất biến (Global Constraints)

- **Không cài thêm runtime npm dependencies** vào `packages/shared`, `apps/web`, `apps/admin`, hay `apps/backend`. (Playwright Python chạy qua môi trường ảo biệt lập `.venv-playwright` ngoài cây mã nguồn hoặc thư mục tạm, dùng trực tiếp `/usr/bin/google-chrome`).
- **0 Mã màu `#FFFFFF` / `#000000`:** Tuyệt đối không xuất hiện `#fff`, `#ffffff`, `#000`, `#000000`, `rgb(255,255,255)`, `rgb(0,0,0)` hay `*-white` / `*-black` trong toàn bộ mã nguồn, CSS và View Transition pseudo-elements.
- **Bảo toàn Hợp đồng Kiểm thử & A11y:** Giữ xanh toàn bộ **163** bài kiểm thử hiện hữu cùng hợp đồng nhãn nút/hộp thoại WCAG (`Accessibility >= 96`, `CLS = 0`, `LCP < 2.5s`).
- **Bảo vệ Tiến trình Đang chạy:** Tuyệt đối không dừng hoặc kill các server người dùng đang mở trên cổng `:3000`, `:3001`, `:4000`.


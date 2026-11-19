# Ốm Sữa — Tích Hợp Hình Ảnh Thực Tế Từ Fanpage Chính Thức (`@trasuadalatomsua`)

**Date:** 2026-11-19  
**Source Fanpage:** `https://www.facebook.com/trasuadalatomsua?locale=vi_VN` (*Ốm Sữa - Trà sữa Đà Lạt*, Verified, `14K` followers, `96% đề xuất (229 đánh giá)`, thành lập `03/07/2017`)  
**Companion Base Spec:** `docs/superpowers/specs/2026-11-18-omsua-storefront-ordering-design.md`

---

## 1. Mục tiêu & Kiến trúc

Bổ sung bộ ảnh thực tế từ fanpage chính thức của **Ốm Sữa** vào `@omsua/shared`, `@omsua/web` và `@omsua/admin` mà vẫn bảo toàn tuyệt đối:
1. **Không hotlink trực tiếp `fbcdn.net` lúc runtime:** URL `scontent.*.fbcdn.net` có tham số chữ ký `oh`/`oe` hết hạn định kỳ. Toàn bộ ảnh được tải về, kiểm tra magic bytes/kích thước bằng `sharp`, nén sang `.webp` tối ưu và lưu cục bộ trong repo (`apps/web/public/images/fanpage/` và `apps/admin/public/images/fanpage/branches/`).
2. **Kiến trúc Hybrid Ảnh Thực Tế + Vector Studio Fallback:**
   - Các món nước, topping và bánh tráng có ảnh chụp thực tế trên fanpage hiển thị ảnh `.webp` sắc nét trong khung màu ấm Đà Lạt, kèm chế độ chuyển đổi nhanh **`Ảnh thực tế` / `Minh họa Studio`** ngay trên khu vực Thực đơn và tự động fallback tức thì về `<ProductIllustration />` (SVG thủ công) nếu ảnh gặp lỗi tải (`onError`).
   - Toàn bộ 38 món vẫn luôn có hình ảnh đồng bộ 100% (không bao giờ có ô trống hay icon ảnh vỡ).
3. **Section Không Gian & Khoảnh Khắc Đà Lạt (`#khong-gian`) + Lightbox:**
   - Bổ sung bộ sưu tập 12 ảnh thực tế từ các album chính thức (`Không gian Ốm Sữa`, `Hành Trình Nghiên Cứu và Phát Triển Những Búp Hoa`, `ỐM SỮA`, `ĂN VẶT - BÁNH TRÁNG NHÀ ỐM`, chiến dịch mùa thu `Hồng Trứng Láng`), có bộ lọc chủ đề và hộp xem ảnh phóng to (`PhotoLightboxModal`) chuẩn WCAG AA focus trap + phím mũi tên.
4. **Ảnh Mặt Tiền Chi Nhánh & Liên Kết Mạng Xã Hội Xác Minh:**
   - Gắn ảnh mặt tiền/không gian thực tế cho 4 cơ sở trên `BrandFooter` (`@omsua/web`) và `BranchesPage` (`@omsua/admin`).
   - Bổ sung thông tin xác thực từ fanpage (`14K người theo dõi • 96% đề xuất`, liên kết Facebook `@trasuadalatomsua`, Instagram `@omsuadalat`, TikTok `@omsuaphache`).
5. **Kỷ luật Bảng màu Ấm Ốm Sữa:** Tuyệt đối không dùng `#FFFFFF`, `#000000` hoặc các class Tailwind `*-white`, `*-black` trong toàn bộ phần tử UI, lớp phủ caption hay modal lightbox.

---

## 2. Danh Mục Ảnh Thực Tế Đã Khảo Sát & Ánh Xạ Cục Bộ

### 2.1 Nhóm Không Gian & Mặt Tiền Chi Nhánh (`branches/` & `space/`)

| Asset Slug | File cục bộ (`.webp`) | Nguồn Fanpage (`fbid`) | Nội dung & Ánh xạ |
|---|---|---|---|
| `branch-hoang-dieu` | `/images/fanpage/branches/branch-hoang-dieu.webp` | `989323463065654` | Mặt tiền Cơ sở 28A Hoàng Diệu, Đà Lạt -> `cs1-hoang-dieu` |
| `branch-hem-33-nct` | `/images/fanpage/branches/branch-hem-33-nct.webp` | `989324523065548` | Mặt tiền Cơ sở Hẻm 33 Nguyễn Công Trứ, Đà Lạt (`Ốm Sữa SINCE 2017`) -> `cs2-hem-33-nct` |
| `branch-nguyen-cong-tru` | `/images/fanpage/branches/branch-nguyen-cong-tru.webp` | `1812186947445964` | Góc phố & xe máy trước tiệm Ốm Sữa Nguyễn Công Trứ, Đà Lạt -> `cs3-158-nct` |
| `branch-duc-trong-vuon-hoa` | `/images/fanpage/branches/branch-duc-trong-vuon-hoa.webp` | `989323503065650` | Không gian quầy Ốm Sữa Lâm Đồng (`TRÀ SỮA ATISO • SINCE 2017`) -> `cs4-duc-trong` |
| `space-morning-01` | `/images/fanpage/space/space-morning-01.webp` | `1420041026660560` | *Không gian sáng sớm ở Ốm* — góc nắng sớm bình yên Đà Lạt |
| `space-morning-02` | `/images/fanpage/space/space-morning-02.webp` | `1420041009993895` | *Không gian sáng sớm ở Ốm* — bàn gỗ ấm & ánh sáng tự nhiên |
| `space-street-dalat` | `/images/fanpage/space/space-street-dalat.webp` | `1812177980780194` | Nhịp sống phố núi trước hiên tiệm Ốm Sữa |

### 2.2 Nhóm Thức Uống, Topping & Bánh Tráng Thực Tế (`products/` & `seasonal/`)

| Asset Slug | File cục bộ (`.webp`) | Nguồn Fanpage (`fbid`) | Ánh xạ `productId` / `toppingId` & Gallery |
|---|---|---|---|
| `drink-tra-sua-atiso` | `/images/fanpage/products/drink-tra-sua-atiso.webp` | `948069193857748` | `tra-sua-atiso` (*Signature Trà Sữa Atiso*) |
| `drink-atiso-chuoi` | `/images/fanpage/products/drink-atiso-chuoi.webp` | `989321219732545` | `tra-sua-atiso-chuoi`, `tra-atiso-sen-chia` (*Dòng Atiso xanh Đà Lạt*) |
| `drink-quyt-nhai` | `/images/fanpage/products/drink-quyt-nhai.webp` | `1535984961732832` | `quyt-nhai-cat-tuong` (*Nhài Quýt Cát Tường*) |
| `drink-matcha-latte` | `/images/fanpage/products/drink-matcha-latte.webp` | `1409069554424374` | `matcha-latte` (*Matcha Latte Uji*) |
| `drink-matcha-oreo` | `/images/fanpage/products/drink-matcha-oreo.webp` | `1409069551091041` | `matcha-oreo-da-xay` (*Matcha Oreo Đá Xay*) |
| `drink-ca-phe-tiramisu` | `/images/fanpage/products/drink-ca-phe-tiramisu.webp` | `967429995255001` | `ca-phe-kem-tiramisu`, `tra-sua-tiramisu` (*Cà Phê Kem Nâu Tiramisu*) |
| `drink-ca-phe-da-lat` | `/images/fanpage/products/drink-ca-phe-da-lat.webp` | `891659929498675` | `ca-phe-sua`, `ca-phe-muoi`, `bac-xiu-da-lat` (*Cà Phê Cầu Đất Lâm Đồng*) |
| `seasonal-hong-trung-lang` | `/images/fanpage/seasonal/seasonal-hong-trung-lang.webp` | `1811222164209109` | Bộ đôi mùa thu Đà Lạt *Hồng Trà Trứng Láng & Sữa Chua Hồng* (Gallery) |
| `topping-khoai-tam` | `/images/fanpage/products/topping-khoai-tam.webp` | `1068464915151508` | Topping nhà làm nấu mới mỗi ngày (Gallery + `tran-chau-trang`) |
| `snack-banh-trang-top-mo` | `/images/fanpage/products/snack-banh-trang-top-mo.webp` | `1076102457721087` | `banh-trang-tron-top-mo`, `com-chay-cha-bong` (*Bánh tráng trộn tóp mỡ Nhà Ốm*) |
| `snack-banh-trang-sot-tac` | `/images/fanpage/products/snack-banh-trang-sot-tac.webp` | `804925394838796` | `banh-trang-sot-tac`, `phoi-suong-toi-ot` (*Bánh tráng sốt tắc Đà Lạt*) |
| `snack-banh-cham-long-dao` | `/images/fanpage/products/snack-banh-cham-long-dao.webp` | `778432660821403` | `banh-cham-long-dao`, `banh-trang-cuon-bo` (*Bánh tráng trứng lòng đào & cuốn bơ*) |

---

## 3. Liên Kết & Thông Tin Xác Minh Fanpage (`OMSUA_SOCIAL_LINKS`)

- **Facebook Fanpage:** `https://www.facebook.com/trasuadalatomsua` (`@trasuadalatomsua`)
- **Instagram:** `https://www.instagram.com/omsuadalat` (`@omsuadalat`)
- **TikTok:** `https://tiktok.com/@omsuaphache` (`@omsuaphache`)
- **Social Proof:** `14K người theo dõi` • `96% đề xuất (229 đánh giá)` • Thành lập `03/07/2017`

---

## 4. Hợp Đồng Giao Diện & Trải Nghiệm Người Dùng

1. **`<ProductMedia />` (`apps/web/src/components/artwork/ProductMedia.tsx`):**
   - Nhận cùng tập props với `<ProductIllustration />` cộng thêm `preferIllustration?: boolean`.
   - Khi `preferIllustration` là `false` (mặc định) và `getProductPhoto(targetId)` có bản ghi ảnh cục bộ: render `<img>` (`loading="lazy"`, `decoding="async"`, `object-cover`) bên trong khung nền `#29261D` / `#EEEADF` ấm áp; nếu `<img>` phát sinh `onError`, tự chuyển state sang `<ProductIllustration />`.
   - Khi không có `title`/`alt` truyền vào (ảnh nằm cạnh tên món đã có trong thẻ): đặt `alt=""` và `aria-hidden="true"` để không lặp nhãn màn hình đọc.
2. **Nút chuyển chế độ hiển thị trên `DrinkMenuSection`:**
   - Bổ sung cặp nút `Ảnh thực tế` / `Minh họa Studio` (`min-h-11`, `aria-pressed`) giúp khách xem ảnh chụp thật từ fanpage hoặc bộ tranh vẽ studio Đà Lạt đồng bộ.
3. **`<FanpageGallerySection />` (`#khong-gian`) & `<PhotoLightboxModal />`:**
   - Hiển thị lưới ảnh thực tế từ fanpage ngay dưới `#cau-chuyen`, lọc theo 4 nhóm: `Tất cả (12)`, `Không gian Đà Lạt`, `Trà sữa & Mùa hồng`, `Bánh tráng Nhà Ốm`.
   - Nhấn vào bất kỳ tấm ảnh nào mở `PhotoLightboxModal` (dùng `useModalAccessibility`: khóa cuộn nền, bẫy focus `Tab`/`Shift+Tab`, phím `ArrowLeft`/`ArrowRight` chuyển ảnh, `Escape` đóng, kèm link `"Xem bài gốc trên Fanpage ↗"`).
4. **`<BrandFooter />` (`@omsua/web`) & `BranchesPage` (`@omsua/admin`):**
   - Mỗi thẻ chi nhánh hiển thị ảnh mặt tiền thực tế tương ứng từ `getBranchPhoto(branch.id)` (có `onError` ẩn gọn không vỡ khung).
   - Khối QR Theo dõi Ốm ở Footer bổ sung 3 nút liên kết mạng xã hội chính thức (`Facebook`, `Instagram`, `TikTok`) đạt kích thước chạm `min-h-11`.

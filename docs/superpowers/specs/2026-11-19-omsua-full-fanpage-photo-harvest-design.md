# Ốm Sữa — Thu Thập Toàn Diện Ảnh Độ Phân Giải Gốc & Chuẩn Hóa 1:1 Từ Fanpage (`@trasuadalatomsua`)

**Date:** 2026-11-19  
**Source Fanpage:** `https://www.facebook.com/trasuadalatomsua/photos?locale=vi_VN` & `photos_albums` (16/16 album công khai, 1.213 mục đã khảo sát ở chế độ Photo Theater độ phân giải gốc)  
**Companion Specs:**
- `docs/superpowers/specs/2026-11-18-omsua-storefront-ordering-design.md`
- `docs/superpowers/specs/2026-11-19-omsua-fanpage-photo-integration-design.md`

---

## 1. Mục tiêu & Phạm vi Nâng cấp

Nâng cấp hệ thống hình ảnh thực tế của **Ốm Sữa** từ bản tích hợp khởi đầu (19 ảnh, một số dùng thumbnail lưới `ctp=s552x414` và chia sẻ chung 1 ảnh cho 2–3 món) lên **độ phủ ảnh thực tế tối đa 1:1 sắc nét nhất có trên Fanpage công khai**:

1. **Tăng độ phủ thực đơn & tách ảnh riêng 1:1 (`PRODUCT_PHOTO_BY_ID`):**
   - **Đồ uống (`20/24` món có ảnh thực tế riêng biệt 1:1):** Bổ sung ảnh thực tế cho `tra-sua-atiso-chuoi`, `tra-sua-gao-rang-khuc-bach`, `tra-atiso-sen-chia`, `tra-me-thot-not`, `tra-so-ri-buoi-hong`, `kombucha-chanh-vang`, `sua-tuoi-kem-trung-nuong`, `oreo-tra-da-xay`, `cold-brew-me`; đồng thời tách ảnh riêng biệt cho `oolong-sen-gung` (ảnh rót sữa hạt sen chuẩn món thay cho ly đỏ Tết Atiso), `tra-sua-tiramisu`, `matcha-oreo-da-xay`, `yogurt-dau-tam`, `ca-phe-muoi`, `bac-xiu-da-lat`.
   - **Bánh tráng Snack (`6/6` — `100%` có ảnh thực tế riêng biệt 1:1):** Bổ sung `com-chay-cha-bong`, `phoi-suong-toi-ot`, `banh-trang-cuon-bo` từ ảnh đơn độ phân giải cao (`1080px–2048px`), cùng cắt chuẩn khung `banh-trang-tron-top-mo` & `banh-cham-long-dao`, chấm dứt việc dùng chung ảnh.
   - **Topping nhà làm (`5/8` món có ảnh macro thực tế):** Bổ sung ảnh chụp cận cảnh tô hạt sen (`hat-sen`), khay khúc bạch (`khuc-bach`), dòng kem trứng sánh mịn (`kem-trung`), chén trân châu đen (`tran-chau-den`) và hạt đác rim (`hat-dac-rim`) đạt chuẩn sau khi kiểm tra thị giác trực tiếp bằng `read_file`.
   - **Trung thực Thị giác Tuyệt đối:** Các món được xác nhận qua khảo sát toàn bộ 16 album & 32 truy vấn tìm kiếm là **chỉ có Video/Reel hoặc chưa từng chụp ảnh tĩnh đúng món trên Fanpage** (`tra-sua-flan-chay-canh`, `sua-tuoi-duong-den`, `ca-phe-sua`, `ca-phe-den`, `banh-flan`, `tran-chau-trang`, `thach-cu-nang`) giữ nguyên minh họa Studio SVG thủ công của đúng món thông qua `<ProductMedia />`.
2. **4/4 Chi nhánh có ảnh mặt tiền riêng biệt & canh khung `objectPosition` (`BRANCH_PHOTO_BY_ID`):**
   - Nâng cấp `cs1-hoang-dieu` & `cs2-hem-33-nct` lên ảnh gốc `1250x1250` kèm `objectPosition` để hiển thị đẹp trong banner ngang trên `BrandFooter` và `BranchesPage`.
   - Cập nhật `cs3-158-nct` sang ảnh thực tế bảng hiệu gỗ 3D `"ốm sữa 📍 Nguyễn Công Trứ, Đà Lạt"` (`fbid=1359308459400484`, `1474x1842`), không còn trùng với ảnh không gian `space-morning-01`.
3. **Mở rộng `#khong-gian` (`FANPAGE_GALLERY_ITEMS`) lên 16 ảnh độ phân giải cao (`maxDimension: 1200`):**
   - Bổ sung Chợ Đà Lạt mùa dã quỳ, túi tote Ốm Sữa chở bông Atiso xanh, khay 3 món nông sản Đà Lạt, cận cảnh Hồng Trà Trứng Láng `2048x2048`, bộ 3 Kombucha SCOBY, bộ 3 Vị Nắng Hạ Trà Me & Coldbrew Vị Me, Cơm Cháy Chà Bông và Bánh Tráng Cuốn Bơ.
4. **Hỗ trợ cắt khung tỷ lệ `extract` trong `scripts/sync-fanpage-photos.mjs` & Dọn sạch nợ kỹ thuật:**
   - Bổ sung tùy chọn `extract?: { left: number; top: number; width: number; height: number }` (tọa độ tương đối `0..1` theo ảnh sau xoay EXIF) trong `validateAndOptimizePhotoBuffer()` để cắt chuẩn từng ly/chén từ các poster ghép 2–3 món trước khi kiểm tra kích thước `>= 200x200` và nén `.webp`.
   - Chuẩn hóa toàn bộ tên tệp `.webp` theo định danh chuẩn (`branch-<id>.webp`, `drink-<id>.webp`, `snack-<id>.webp`, `topping-<id>.webp`, `gallery-<id>.webp`), tự động dọn các tệp `.webp` cũ không còn nằm trong danh sách nguồn.
   - Bổ sung `AbortSignal.timeout(15_000)` cho `fetch()`, kiểm tra header `RIFF....WEBP` cho cả `apps/web/public` lẫn `apps/admin/public`, thêm `key={currentItem.src}` cho `PhotoLightboxModal.tsx`, và cập nhật thống kê chính xác trong `README.md`.

---

## 2. Ràng buộc Toàn cục (Global Constraints)

- **Node.js `>= 22.0.0` & `pnpm >= 10.0.0`:** Không cài đặt thêm bất kỳ gói npm ngoài nào; nạp `sharp` sẵn có trong workspace.
- **0 Mã màu `#FFFFFF` / `#000000`:** Tuyệt đối không dùng `#fff`, `#ffffff`, `#000`, `#000000`, `rgb(255,255,255)`, `rgb(0,0,0)` hay `*-white` / `*-black` trong toàn bộ mã nguồn.
- **0 URL `fbcdn.net` lúc runtime:** `@omsua/shared`, `@omsua/web`, `@omsua/admin` chỉ tham chiếu đường dẫn tĩnh cục bộ `/images/fanpage/...webp` và liên kết bài đăng vĩnh viễn `https://www.facebook.com/photo/?fbid=...`.
- **Không tác động tiến trình người dùng:** Tuyệt đối không dừng các máy chủ đang chạy trên cổng `:3000`, `:3001`, `:4000`.
- **Kiểm chứng Thị giác `read_file` 100%:** Mọi tệp `.webp` xuất ra phải được mở kiểm tra trực tiếp bằng `read_file` để đảm bảo đúng món, rõ nét, không cắt phạm miệng ly hoặc dính vật thể lạ.


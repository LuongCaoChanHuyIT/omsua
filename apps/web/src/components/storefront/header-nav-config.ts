import type { DrinkCategoryId } from '@omsua/shared';

export type NewsCategoryFilter = 'all' | 'mua-vu' | 'uu-dai';
export type HeaderDropdownKey = 'gioi-thieu' | 'san-pham' | 'tin-tuc';

export interface HeaderSubItem {
  id: string;
  label: string;
  description: string;
  href: string;
  external?: boolean;
  drinkCategory?: DrinkCategoryId | 'all';
  newsCategory?: NewsCategoryFilter;
}

export type HeaderNavEntry =
  | {
      id: HeaderDropdownKey;
      kind: 'dropdown';
      label: string;
      items: readonly HeaderSubItem[];
    }
  | {
      id: string;
      kind: 'link';
      label: string;
      href: string;
    };

export const FLAGSHIP_HEADER_NAV: readonly HeaderNavEntry[] = [
  {
    id: 'gioi-thieu',
    kind: 'dropdown',
    label: 'GIỚI THIỆU',
    items: [
      {
        id: 'story-2017',
        label: 'Câu chuyện từ 2017',
        description: 'Hành trình ủ vị Atiso xanh nguyên bản giữa phố núi Đà Lạt',
        href: '#cau-chuyen',
      },
      {
        id: 'space-dalat',
        label: 'Không gian tiệm Đà Lạt',
        description: 'Góc nắng sớm, bàn mây đan và nhịp sống 4 cơ sở Nhà Ốm',
        href: '#khong-gian',
      },
      {
        id: 'print-menu-pdf',
        label: 'Ấn phẩm Menu Đà Lạt (PDF)',
        description: 'Bản khắc thực đơn 2 trang & lát cắt độ cao Cầu Đất 1.650m',
        href: '/brand/omsua-botanical-menu-poster.pdf',
        external: true,
      },
    ],
  },
  {
    id: 'san-pham',
    kind: 'dropdown',
    label: 'SẢN PHẨM',
    items: [
      {
        id: 'all-drinks',
        label: 'Tất cả Thực đơn Đồ uống',
        description: 'Trọn bộ 24 thức uống Atiso, trà nông sản & cà phê phin',
        href: '#thuc-don',
        drinkCategory: 'all',
      },
      {
        id: 'cat-milk-tea',
        label: '1. Trà Sữa Đà Lạt (Milk Tea)',
        description: 'Trà Sữa Atiso, Atiso Chuối Laba, Oolong Sen Gừng…',
        href: '#thuc-don',
        drinkCategory: 'milk-tea',
      },
      {
        id: 'cat-fruit-tea',
        label: '2. Giữ Dáng — Fruit Tea & Kombucha',
        description: 'Quýt Nhài Cát Tường, Dâu Tằm, Kombucha SCOBY lên men',
        href: '#thuc-don',
        drinkCategory: 'fruit-tea',
      },
      {
        id: 'cat-fresh-milk',
        label: '3. Sữa Tươi & Đá Xay Cao Nguyên',
        description: 'Sữa Tươi Kem Trứng Nướng, Matcha Latte, Yogurt Dâu Tằm',
        href: '#thuc-don',
        drinkCategory: 'fresh-milk-blended',
      },
      {
        id: 'cat-coffee',
        label: '4. Cà Phê Pha Phin & Cold Brew',
        description: 'Cold Brew Me rừng, Cà Phê Muối, Phin hạt Cầu Đất rang mộc',
        href: '#thuc-don',
        drinkCategory: 'coffee',
      },
      {
        id: 'house-toppings',
        label: 'Topping Nhà Làm Mỗi Sáng',
        description: '8 loại trân châu nấu mật, kem trứng khò, khúc bạch, hạt sen',
        href: '#topping',
      },
      {
        id: 'dalat-snacks',
        label: 'Bánh Tráng Snack Đà Lạt',
        description: 'Bánh tráng trộn tóp mỡ, cơm cháy chà bông, cuốn bơ lòng đào',
        href: '#banh-trang',
      },
    ],
  },
  {
    id: 'tin-tuc',
    kind: 'dropdown',
    label: 'TIN TỨC',
    items: [
      {
        id: 'news-all',
        label: 'Tất cả bản tin Nhà Ốm',
        description: 'Nhật ký mùa vụ nông sản Đà Lạt & chương trình tại quán',
        href: '#tin-tuc',
        newsCategory: 'all',
      },
      {
        id: 'news-seasonal',
        label: 'Mùa vụ & Nông sản Đà Lạt',
        description: 'Mùa búp Atiso sương sớm, hồng trứng láng & chuối Laba',
        href: '#tin-tuc',
        newsCategory: 'mua-vu',
      },
      {
        id: 'news-promo',
        label: 'Ưu đãi & Sự kiện tại quán',
        description: 'Quà tặng túi tote vải mộc, khung giờ trà sáng & ưu đãi nhóm',
        href: '#tin-tuc',
        newsCategory: 'uu-dai',
      },
    ],
  },
  {
    id: 'cua-hang',
    kind: 'link',
    label: 'CỬA HÀNG',
    href: '#chi-nhanh',
  },
  {
    id: 'tuyen-dung',
    kind: 'link',
    label: 'TUYỂN DỤNG',
    href: '#tuyen-dung',
  },
  {
    id: 'thanh-vien',
    kind: 'link',
    label: 'THÀNH VIÊN',
    href: '#thanh-vien',
  },
  {
    id: 'nhuong-quyen',
    kind: 'link',
    label: 'NHƯỢNG QUYỀN',
    href: '#nhuong-quyen',
  },
];

export interface NewsArticleItem {
  id: string;
  category: Exclude<NewsCategoryFilter, 'all'>;
  categoryLabel: string;
  publishedLabel: string;
  readTimeLabel: string;
  title: string;
  summary: string;
  imageSrc: string;
  imageAlt: string;
  highlights: readonly string[];
  bodyParagraphs: readonly string[];
  ctaDrinkId?: string;
}

export const OMSUA_NEWS_ARTICLES: readonly NewsArticleItem[] = [
  {
    id: 'mua-atiso-chuoi-laba',
    category: 'mua-vu',
    categoryLabel: 'Mùa vụ Nông sản',
    publishedLabel: 'Tháng 11 • Đà Lạt',
    readTimeLabel: '3 phút đọc',
    title: 'Mùa Sương Sớm Cầu Đất: Búp Atiso Xanh Hội Ngộ Chuối Laba Dẻo',
    summary:
      'Mỗi sáng từ 05:30, những búp Atiso xanh tươi từ vùng nguyên liệu Đà Lạt được nấu chậm cùng lá trà nguyên bản và chuối Laba dẻo thơm.',
    imageSrc: '/images/fanpage/seasonal/gallery-nong-san-da-lat.webp',
    imageAlt: 'Bộ sưu tập thức uống từ nông sản Đà Lạt của Ốm Sữa',
    highlights: [
      'Thu hoạch búp Atiso xanh tươi trong sương sớm để giữ vị ngọt hậu thanh tao.',
      'Chuối Laba sấy dẻo cắt hạt lựu quyện cùng nền trà sữa chuẩn 70% đường.',
      'Phục vụ nóng hoặc đá riêng tại cả 4 cơ sở Đà Lạt & Đức Trọng.',
    ],
    bodyParagraphs: [
      'Từ năm 2017, Ốm Sữa kiên trì nấu cốt trà trực tiếp từ bông Atiso xanh tươi thay vì hương liệu tổng hợp. Sắc xanh nâu tự nhiên cùng hậu ngọt mát nơi cổ họng là dấu ấn khiến người Đà Lạt nhớ mãi.',
      'Mùa thu đông năm nay, bếp Nhà Ốm kết hợp thêm chuối Laba chín dẻo và hạt sen ninh mềm để tạo nên trải nghiệm vừa mộc mạc vừa ấm bụng giữa tiết trời 16°C phố núi.',
    ],
  },
  {
    id: 'mua-hong-trung-lang',
    category: 'mua-vu',
    categoryLabel: 'Mùa vụ Nông sản',
    publishedLabel: 'Mùa Thu Đông • Lâm Đồng',
    readTimeLabel: '2 phút đọc',
    title: 'Hồng Trứng Láng Chín Đỏ & Dòng Kombucha SCOBY Lên Men Tự Nhiên',
    summary:
      'Khám phá mẻ trà lên men tự nhiên giàu lợi khuẩn từ con giống SCOBY kết hợp trái cây chín mọng theo mùa tại cao nguyên Lâm Viên.',
    imageSrc: '/images/fanpage/seasonal/gallery-hong-trung-lang.webp',
    imageAlt: 'Trái hồng trứng láng chín mọng mùa thu Đà Lạt tại Ốm Sữa',
    highlights: [
      'Ủ lên men chậm từng mẻ nhỏ cùng chanh vàng tươi và thảo mộc Đà Lạt.',
      'Vị chua thanh cân bằng, nhẹ bụng khi dùng kèm mẹt bánh tráng trộn tóp mỡ.',
      'Tùy chỉnh linh hoạt mức đường 70% / 50% / 30% / 0% không phụ thu.',
    ],
    bodyParagraphs: [
      'Khi những vườn hồng quanh đèo Mimosa và Cầu Đất chuyển sắc cam rực rỡ, quầy pha chế Ốm Sữa cũng bước vào mùa ủ trà trái cây nhộn nhịp nhất trong năm.',
      'Mỗi ly Kombucha Chanh Vàng hay Trà Quýt Nhài Cát Tường đều giữ trọn độ tươi giòn của tép quả và hương hoa nhài dịu nhẹ, mang lại nguồn năng lượng lành mạnh suốt ngày dài.',
    ],
  },
  {
    id: 'uu-dai-tui-tote-atiso',
    category: 'uu-dai',
    categoryLabel: 'Ưu đãi & Sự kiện',
    publishedLabel: 'Đang diễn ra • 4 Cơ sở',
    readTimeLabel: '2 phút đọc',
    title: 'Tặng Túi Tote Vải Mộc “Chở Sương Sớm Về Nhà” Cho Đơn Nhóm & Thành Viên',
    summary:
      'Góp phần giảm túi nhựa dùng một lần tại Đà Lạt với mẫu túi vải bố thêu họa tiết búp Atiso đặc trưng của Ốm Sữa.',
    imageSrc: '/images/fanpage/space/space-tui-tote-atiso.webp',
    imageAlt: 'Túi tote vải mộc Ốm Sữa đựng búp hoa Atiso xanh Đà Lạt',
    highlights: [
      'Tặng ngay túi tote vải mộc cho thành viên hạng Sương Sớm đổi từ 350 điểm.',
      'Giảm trực tiếp 5.000đ/ly khi khách mang bình cá nhân hoặc túi vải quay lại tiệm.',
      'Áp dụng đồng thời tại Hoàng Diệu, Nguyễn Công Trứ và Liên Nghĩa — Đức Trọng.',
    ],
    bodyParagraphs: [
      'Ốm Sữa luôn tin rằng sự tử tế với thiên nhiên Đà Lạt bắt đầu từ những thói quen nhỏ mỗi ngày tại quầy pha chế: ống hút thân thiện, ly giấy dày giữ nhiệt và chiếc túi vải mộc bền bỉ.',
      'Bạn có thể đăng ký Thẻ Thành Viên Nhà Ốm ngay trên website bằng số điện thoại đặt món để tích điểm tự động và đổi túi tote tại bất kỳ cơ sở nào.',
    ],
  },
  {
    id: 'khung-gio-tra-sang-da-lat',
    category: 'uu-dai',
    categoryLabel: 'Ưu đãi & Sự kiện',
    publishedLabel: '08:00 – 10:30 Hàng ngày',
    readTimeLabel: '2 phút đọc',
    title: 'Khung Giờ Nắng Sớm 08:00 – 10:30: Tặng Topping Nhà Làm Khi Đặt Cặp Trà & Phin',
    summary:
      'Khởi đầu buổi sáng phố núi tỉnh táo với Cà Phê Muối hạt Cầu Đất hoặc Trà Sữa Atiso ấm nóng kèm phần topping nấu mới vừa ra lò.',
    imageSrc: '/images/fanpage/seasonal/gallery-kombucha-series.webp',
    imageAlt: 'Bộ sưu tập đồ uống buổi sáng thanh mát tại Ốm Sữa Đà Lạt',
    highlights: [
      'Mẻ trân châu đen nấu mật và bánh flan trứng caramel hoàn tất đúng 08:00 sáng.',
      'Ưu đãi giao hàng miễn phí nội ô cho đơn đặt trực tuyến trên website.',
      'Ghi chú “Ít đá / Đá riêng” dễ dàng để giữ nguyên vị đậm đà khi giao tới văn phòng.',
    ],
    bodyParagraphs: [
      'Buổi sáng ở Đà Lạt và Đức Trọng luôn mang nét bình yên rất riêng. Từ 08:00, cả 4 cơ sở Ốm Sữa đã mở cửa đón nắng mai với hương cà phê phin rang mộc và nồi Atiso xanh nghi ngút khói.',
      'Đặt trực tuyến trước giờ họp sáng để đội ngũ barista chuẩn bị sẵn sàng và giao tận tay chỉ trong 15–30 phút.',
    ],
  },
];

export interface MemberTierSpec {
  id: 'bup-xanh' | 'suong-som' | 'cau-dat-vang';
  name: string;
  minPoints: number;
  badgeLabel: string;
  perks: readonly string[];
}

export const OMSUA_MEMBER_TIERS: readonly MemberTierSpec[] = [
  {
    id: 'bup-xanh',
    name: 'Hạng Búp Xanh',
    minPoints: 0,
    badgeLabel: '0 – 499 điểm',
    perks: [
      'Tặng ngay +50 điểm chào mừng khi mở thẻ bằng số điện thoại',
      'Tích lũy 1 điểm cho mỗi 1.000đ chi tiêu hợp lệ',
      'Miễn phí tùy chỉnh mức đường 70% / 50% / 30% / 0% & đá riêng',
    ],
  },
  {
    id: 'suong-som',
    name: 'Hạng Sương Sớm',
    minPoints: 500,
    badgeLabel: '500 – 1.499 điểm',
    perks: [
      'Tặng 01 phần Topping nhà làm mỗi tuần cho đơn từ 2 ly',
      'Đổi túi Tote vải mộc Atiso phiên bản Đà Lạt với 350 điểm',
      'Ưu tiên trải nghiệm sớm bộ sưu tập nông sản theo mùa',
    ],
  },
  {
    id: 'cau-dat-vang',
    name: 'Hạng Cầu Đất Vàng',
    minPoints: 1500,
    badgeLabel: 'Từ 1.500 điểm',
    perks: [
      'Tặng 01 ly Signature Size L miễn phí trong tuần lễ sinh nhật',
      'Ưu đãi 10% cho mọi đơn nhóm văn phòng từ 5 món trở lên',
      'Quà tri ân trà Atiso túi lọc & nông sản Đà Lạt dịp cuối năm',
    ],
  },
];

export interface SavedMemberProfile {
  name: string;
  phone: string;
  favoriteDrink: string;
  joinedAt: string;
}

export const MEMBER_PROFILE_STORAGE_KEY = 'omsua_member_profile_v1';

export function normalizeVietnamPhone(raw: string): string {
  const compact = raw.replace(/[\s.-]+/g, '').trim();
  if (compact.startsWith('+84') && compact.length === 12) {
    return `0${compact.slice(3)}`;
  }
  return compact;
}

export function isValidVietnamPhone(raw: string): boolean {
  const normalized = normalizeVietnamPhone(raw);
  return /^0\d{9}$/.test(normalized);
}

export interface LoyaltyOrderEntry {
  status: string;
  grandTotal: number;
  customerPhone?: string;
}

export function computeMemberStatus(
  phone: string,
  recentOrders: readonly LoyaltyOrderEntry[],
  savedProfile: SavedMemberProfile | null,
): {
  normalizedPhone: string;
  orderCount: number;
  totalSpent: number;
  points: number;
  currentTier: MemberTierSpec;
  nextTier: MemberTierSpec | null;
  pointsToNext: number;
} {
  const normalizedPhone = normalizeVietnamPhone(phone);
  const matchingOrders = recentOrders.filter((order) => {
    if (order.status === 'cancelled' || !normalizedPhone) {
      return false;
    }
    if (typeof order.customerPhone !== 'string' || !order.customerPhone.trim()) {
      return false;
    }
    return normalizeVietnamPhone(order.customerPhone) === normalizedPhone;
  });
  const totalSpent = matchingOrders.reduce(
    (sum, order) => sum + order.grandTotal,
    0,
  );
  const welcomeBonus =
    savedProfile && normalizeVietnamPhone(savedProfile.phone) === normalizedPhone
      ? 50
      : 0;
  const points = Math.floor(totalSpent / 1000) + welcomeBonus;

  let currentTier = OMSUA_MEMBER_TIERS[0]!;
  let nextTier: MemberTierSpec | null = OMSUA_MEMBER_TIERS[1] ?? null;

  for (let i = 0; i < OMSUA_MEMBER_TIERS.length; i += 1) {
    const tier = OMSUA_MEMBER_TIERS[i]!;
    if (points >= tier.minPoints) {
      currentTier = tier;
      nextTier = OMSUA_MEMBER_TIERS[i + 1] ?? null;
    }
  }

  const pointsToNext = nextTier ? Math.max(0, nextTier.minPoints - points) : 0;

  return {
    normalizedPhone,
    orderCount: matchingOrders.length,
    totalSpent,
    points,
    currentTier,
    nextTier,
    pointsToNext,
  };
}

export interface CareerOpeningItem {
  id: string;
  title: string;
  typeLabel: string;
  locationLabel: string;
  compensationLabel: string;
  highlights: readonly string[];
}

export const OMSUA_CAREER_OPENINGS: readonly CareerOpeningItem[] = [
  {
    id: 'barista-pha-che',
    title: 'Chuyên viên Pha chế (Barista Ca Sáng / Tối)',
    typeLabel: 'Full-time / Part-time linh hoạt',
    locationLabel: 'Đà Lạt (Hoàng Diệu, Nguyễn Công Trứ) & Đức Trọng',
    compensationLabel: '24.000đ – 32.000đ/giờ + Thưởng doanh thu quầy',
    highlights: [
      'Được đào tạo bài bản quy trình ủ trà Atiso xanh, pha phin Cầu Đất & khò kem trứng.',
      'Môi trường tử tế, ấm áp, hỗ trợ xoay ca cho sinh viên Đà Lạt.',
    ],
  },
  {
    id: 'cua-hang-truong',
    title: 'Cửa hàng trưởng / Giám sát Ca Vận hành',
    typeLabel: 'Toàn thời gian (Full-time)',
    locationLabel: 'TP. Đà Lạt & TT. Liên Nghĩa — Đức Trọng',
    compensationLabel: '9.500.000đ – 13.500.000đ/tháng + KPI chuỗi',
    highlights: [
      'Điều phối chất lượng món, kiểm soát nguyên liệu tươi mỗi sáng và chăm sóc trải nghiệm khách.',
      'Lộ trình thăng tiến Quản lý Khu vực Lâm Đồng rõ ràng.',
    ],
  },
  {
    id: 'bep-banh-trang-topping',
    title: 'Nhân viên Bếp Topping & Quầy Bánh Tráng Đà Lạt',
    typeLabel: 'Ca Sáng (06:30 – 14:30) / Ca Chiều',
    locationLabel: 'CS1 Hoàng Diệu & CS3 158 Nguyễn Công Trứ',
    compensationLabel: '7.500.000đ – 9.500.000đ/tháng + Phụ cấp bữa ăn',
    highlights: [
      'Nấu mới 8 loại topping thủ công và chuẩn bị quầy bánh tráng trộn tóp mỡ chuẩn vệ sinh.',
      'Thưởng chuyên cần và chế độ gắn bó lâu dài cùng Nhà Ốm.',
    ],
  },
];

export interface FranchiseModelSpec {
  id: 'kiosk-takeaway' | 'flagship-garden';
  name: string;
  areaLabel: string;
  investmentLabel: string;
  paybackLabel: string;
  features: readonly string[];
}

export const OMSUA_FRANCHISE_MODELS: readonly FranchiseModelSpec[] = [
  {
    id: 'kiosk-takeaway',
    name: 'Mô hình Quầy Tinh Gọn (Takeaway & Delivery)',
    areaLabel: 'Diện tích: 35m² – 55m²',
    investmentLabel: 'Vốn dự kiến: 380 – 520 triệu VNĐ',
    paybackLabel: 'Hoàn vốn ước tính: 10 – 14 tháng',
    features: [
      'Tối ưu mặt bằng phố trung tâm, khu trường học & cao ốc văn phòng.',
      'Tích hợp sẵn hệ thống đặt món trực tuyến & điều phối thẻ bếp gọn Ốm Sữa.',
      'Chuyển giao trọn bộ 30 công thức đồ uống & bánh tráng đặc sản Đà Lạt.',
    ],
  },
  {
    id: 'flagship-garden',
    name: 'Mô hình Không Gian Sương Sớm (Flagship Store)',
    areaLabel: 'Diện tích: 80m² – 150m²',
    investmentLabel: 'Vốn dự kiến: 680 – 950 triệu VNĐ',
    paybackLabel: 'Hoàn vốn ước tính: 14 – 18 tháng',
    features: [
      'Thiết kế kiến trúc gỗ ấm, mây đan & bảng màu giấy mỹ thuật đặc trưng Đà Lạt.',
      'Cung ứng trực tiếp nguồn búp Atiso xanh, mứt trái cây & cà phê hạt Cầu Đất.',
      'Đồng hành marketing khai trương, đào tạo đội ngũ Barista & kiểm soát chất lượng định kỳ.',
    ],
  },
];

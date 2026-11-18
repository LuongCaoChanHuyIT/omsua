import { OMSUA_COLORS } from './brand';
import type {
  BranchInfo,
  CatalogPayload,
  CategoryInfo,
  DrinkCategoryId,
  ProductItem,
  ProductSizeCode,
  ProductSizeOption,
  ToppingItem,
} from './domain';

const SIZE_LABELS: Record<ProductSizeCode, string> = {
  S: 'Size S',
  M: 'Size M (Chuẩn)',
  L: 'Size L (Lớn)',
  STD: 'Phần tiêu chuẩn',
};

function sizeOption(
  size: ProductSizeCode,
  price: number,
): ProductSizeOption {
  return {
    size,
    label: SIZE_LABELS[size],
    price,
  };
}

interface DrinkSeedSpec {
  id: string;
  categoryId: DrinkCategoryId;
  name: string;
  englishName: string;
  description: string;
  sizes: ProductSizeOption[];
  isSignature?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  isSpotlight?: boolean;
}

function makeDrink(spec: DrinkSeedSpec): ProductItem {
  return {
    id: spec.id,
    kind: 'drink',
    categoryId: spec.categoryId,
    name: spec.name,
    englishName: spec.englishName,
    description: spec.description,
    sizes: spec.sizes,
    isSignature: spec.isSignature ?? false,
    isBestSeller: spec.isBestSeller ?? false,
    isNew: spec.isNew ?? false,
    isSpotlight: spec.isSpotlight ?? false,
    isAvailable: true,
  };
}

interface SnackSeedSpec {
  id: string;
  name: string;
  englishName: string;
  description: string;
  price: number;
  isBestSeller?: boolean;
}

function makeSnack(spec: SnackSeedSpec): ProductItem {
  return {
    id: spec.id,
    kind: 'snack',
    categoryId: 'snack',
    name: spec.name,
    englishName: spec.englishName,
    description: spec.description,
    sizes: [sizeOption('STD', spec.price)],
    isSignature: false,
    isBestSeller: spec.isBestSeller ?? false,
    isNew: false,
    isSpotlight: false,
    isAvailable: true,
  };
}

export const OMSUA_CATEGORIES: CategoryInfo[] = [
  {
    id: 'milk-tea',
    index: 1,
    title: '1. TRÀ SỮA ĐÀ LẠT (MILK TEA)',
    shortLabel: 'Trà Sữa',
    subtitle:
      'Nền trà nguyên lá ủ chậm kết hợp Atiso xanh, gạo rang & kem phô mai thủ công',
    accentBg: OMSUA_COLORS.bgCardButter,
  },
  {
    id: 'fruit-tea',
    index: 2,
    title: '2. GIỮ DÁNG — FRUIT TEA & KOMBUCHA',
    shortLabel: 'Giữ Dáng',
    subtitle:
      'Thanh lọc tự nhiên từ dâu tằm, quýt nhài, sơ ri bưởi hồng & trà lên men Kombucha',
    accentBg: OMSUA_COLORS.bgCardSage,
  },
  {
    id: 'fresh-milk-blended',
    index: 3,
    title: '3. SỮA TƯƠI & ĐÁ XAY CAO NGUYÊN',
    shortLabel: 'Sữa Tươi & Đá Xay',
    subtitle:
      'Sữa tươi thanh trùng béo dịu, kem trứng khò lửa & đá xay mát lạnh',
    accentBg: OMSUA_COLORS.bgSurfaceLight,
  },
  {
    id: 'coffee',
    index: 4,
    title: '4. CÀ PHÊ PHA PHIN & COLD BREW',
    shortLabel: 'Cà Phê Phin',
    subtitle:
      'Hạt cà phê Lâm Đồng rang mộc kết hợp kem muối biển & sốt me đặc trưng',
    accentBg: OMSUA_COLORS.bgCardTaupe,
  },
];

export const OMSUA_PRODUCTS: ProductItem[] = [
  // 1. TRÀ SỮA ĐÀ LẠT (MILK TEA) — 6 drinks
  makeDrink({
    id: 'tra-sua-atiso',
    categoryId: 'milk-tea',
    name: 'Trà Sữa Atiso',
    englishName: 'Artichoke Milk Tea',
    description: 'Atiso xanh Đà Lạt & trân châu đen',
    sizes: [sizeOption('M', 45000), sizeOption('L', 50000)],
    isSignature: true,
    isBestSeller: true,
    isSpotlight: true,
  }),
  makeDrink({
    id: 'tra-sua-atiso-chuoi',
    categoryId: 'milk-tea',
    name: 'Trà Sữa Atiso Chuối',
    englishName: 'Artichoke Banana Milk Tea',
    description: 'Chuối Laba dẻo quyện trà sữa Atiso',
    sizes: [sizeOption('M', 48000), sizeOption('L', 53000)],
    isSignature: true,
  }),
  makeDrink({
    id: 'tra-sua-gao-rang-khuc-bach',
    categoryId: 'milk-tea',
    name: 'Trà Sữa Gạo Rang Khúc Bạch',
    englishName: 'Roasted Rice Milk Tea',
    description: 'Gạo rang thơm bùi & khúc bạch mềm',
    sizes: [sizeOption('M', 40000), sizeOption('L', 45000)],
  }),
  makeDrink({
    id: 'tra-sua-tiramisu',
    categoryId: 'milk-tea',
    name: 'Trà Sữa Tiramisu',
    englishName: 'Tiramisu Milk Tea',
    description: 'Kem Tiramisu béo mịn phủ cacao',
    sizes: [sizeOption('M', 40000), sizeOption('L', 45000)],
    isSignature: true,
  }),
  makeDrink({
    id: 'tra-sua-flan-chay-canh',
    categoryId: 'milk-tea',
    name: 'Trà Sữa Flan Cháy Cạnh',
    englishName: 'Caramel Flan Milk Tea',
    description: 'Hồng trà đậm vị đi kèm bánh flan',
    sizes: [sizeOption('M', 45000), sizeOption('L', 50000)],
  }),
  makeDrink({
    id: 'oolong-sen-gung',
    categoryId: 'milk-tea',
    name: 'Oolong Sen Gừng',
    englishName: 'Oolong Lotus Ginger',
    description: 'Trà Oolong hạt sen bùi và gừng ấm',
    sizes: [sizeOption('L', 45000)],
    isSignature: true,
  }),

  // 2. GIỮ DÁNG — FRUIT TEA & KOMBUCHA — 6 drinks
  makeDrink({
    id: 'quyt-nhai-cat-tuong',
    categoryId: 'fruit-tea',
    name: 'Trà Quýt Nhài Cát Tường',
    englishName: 'Mandarin Jasmine Tea',
    description: 'Hương hoa nhài thanh, mứt quýt tươi',
    sizes: [sizeOption('L', 45000)],
    isSignature: true,
    isNew: true,
    isSpotlight: true,
  }),
  makeDrink({
    id: 'tra-atiso-sen-chia',
    categoryId: 'fruit-tea',
    name: 'Trà Atiso Sen Chia',
    englishName: 'Artichoke Lotus & Chia',
    description: 'Atiso thanh mát cùng hạt sen & chia',
    sizes: [sizeOption('L', 45000)],
    isSignature: true,
  }),
  makeDrink({
    id: 'tra-dau-tam-da-lat',
    categoryId: 'fruit-tea',
    name: 'Trà Dâu Tằm Đà Lạt',
    englishName: 'Dalat Mulberry Tea',
    description: 'Dâu tằm chín mọng ngâm đường phèn',
    sizes: [sizeOption('L', 45000)],
    isSignature: true,
  }),
  makeDrink({
    id: 'tra-me-thot-not',
    categoryId: 'fruit-tea',
    name: 'Trà Me Thốt Nốt',
    englishName: 'Tamarind Palmyra Tea',
    description: 'Sốt me rừng chua dịu rim thốt nốt',
    sizes: [sizeOption('L', 45000)],
  }),
  makeDrink({
    id: 'tra-so-ri-buoi-hong',
    categoryId: 'fruit-tea',
    name: 'Trà Sơ Ri Bưởi Hồng',
    englishName: 'Pink Grapefruit Acerola',
    description: 'Sơ ri giàu vitamin C & tép bưởi hồng',
    sizes: [sizeOption('L', 45000)],
  }),
  makeDrink({
    id: 'kombucha-chanh-vang',
    categoryId: 'fruit-tea',
    name: 'Kombucha Chanh Vàng',
    englishName: 'Lemon Kombucha',
    description: 'Trà lên men tự nhiên vị chanh vàng',
    sizes: [sizeOption('L', 48000)],
    isSignature: true,
  }),

  // 3. SỮA TƯƠI & ĐÁ XAY CAO NGUYÊN — 6 drinks
  makeDrink({
    id: 'sua-tuoi-kem-trung-nuong',
    categoryId: 'fresh-milk-blended',
    name: 'Sữa Tươi Kem Trứng Nướng',
    englishName: 'Torched Egg Fresh Milk',
    description: 'Sữa tươi phủ kem trứng khò đường',
    sizes: [sizeOption('M', 45000), sizeOption('L', 50000)],
  }),
  makeDrink({
    id: 'sua-tuoi-duong-den',
    categoryId: 'fresh-milk-blended',
    name: 'Sữa Tươi Đường Đen',
    englishName: 'Brown Sugar Fresh Milk',
    description: 'Sữa tươi Đà Lạt & trân châu đường đen',
    sizes: [sizeOption('M', 35000), sizeOption('L', 40000)],
  }),
  makeDrink({
    id: 'matcha-latte',
    categoryId: 'fresh-milk-blended',
    name: 'Matcha Latte',
    englishName: 'Uji Matcha Fresh Milk',
    description: 'Trà xanh Uji đánh tay cùng sữa tươi',
    sizes: [sizeOption('M', 40000), sizeOption('L', 45000)],
  }),
  makeDrink({
    id: 'oreo-tra-da-xay',
    categoryId: 'fresh-milk-blended',
    name: 'Oreo Trà Đá Xay',
    englishName: 'Oreo Tea Ice Blended',
    description: 'Đá xay hồng trà quyện bánh Oreo giòn',
    sizes: [sizeOption('S', 45000), sizeOption('L', 50000)],
    isSignature: true,
  }),
  makeDrink({
    id: 'matcha-oreo-da-xay',
    categoryId: 'fresh-milk-blended',
    name: 'Matcha Oreo Đá Xay',
    englishName: 'Oreo Matcha Blended',
    description: 'Đá xay Matcha quyện bánh Oreo giòn',
    sizes: [sizeOption('S', 48000), sizeOption('L', 53000)],
  }),
  makeDrink({
    id: 'yogurt-dau-tam',
    categoryId: 'fresh-milk-blended',
    name: 'Yogurt Dâu Tằm',
    englishName: 'Mulberry Yogurt',
    description: 'Sữa chua nhà làm dầm dâu tằm tươi',
    sizes: [sizeOption('S', 45000), sizeOption('L', 50000)],
    isSignature: true,
  }),

  // 4. CÀ PHÊ PHA PHIN & COLD BREW — 6 drinks
  makeDrink({
    id: 'cold-brew-me',
    categoryId: 'coffee',
    name: 'Cold Brew Me',
    englishName: 'Tamarind Cold Brew',
    description: 'Cà phê ủ lạnh 18h điểm vị me chín',
    sizes: [sizeOption('S', 45000)],
    isSignature: true,
  }),
  makeDrink({
    id: 'ca-phe-muoi',
    categoryId: 'coffee',
    name: 'Cà Phê Muối',
    englishName: 'Salted Cream Coffee',
    description: 'Phin đậm đà phủ lớp kem muối biển',
    sizes: [sizeOption('S', 40000)],
    isSignature: true,
  }),
  makeDrink({
    id: 'ca-phe-kem-tiramisu',
    categoryId: 'coffee',
    name: 'Cà Phê Kem Tiramisu',
    englishName: 'Tiramisu Phin Coffee',
    description: 'Cà phê phin quyện kem trứng Tiramisu',
    sizes: [sizeOption('S', 45000)],
    isSignature: true,
  }),
  makeDrink({
    id: 'ca-phe-sua',
    categoryId: 'coffee',
    name: 'Cà Phê Sữa',
    englishName: 'Condensed Milk Coffee',
    description: 'Hạt Cầu Đất rang mộc pha phin sữa',
    sizes: [sizeOption('S', 30000)],
  }),
  makeDrink({
    id: 'bac-xiu-da-lat',
    categoryId: 'coffee',
    name: 'Bạc Xỉu Đà Lạt',
    englishName: 'Vietnamese White Coffee',
    description: 'Ba tầng sữa thơm béo ấm vị cà phê',
    sizes: [sizeOption('S', 35000)],
  }),
  makeDrink({
    id: 'ca-phe-den',
    categoryId: 'coffee',
    name: 'Cà Phê Đen',
    englishName: 'Highland Black Coffee',
    description: 'Nguyên bản vị đắng thanh vùng Cầu Đất',
    sizes: [sizeOption('S', 28000)],
  }),

  // ĐÀ LẠT BÁNH TRÁNG SNACKS — 6 snacks
  makeSnack({
    id: 'banh-trang-tron-top-mo',
    name: 'Bánh Tráng Trộn Tóp Mỡ',
    englishName: 'Crispy Pork Rind Mixed Rice Paper',
    description: 'Tóp mỡ nhà thắng giòn rụm, sốt tắc hành phi',
    price: 40000,
  }),
  makeSnack({
    id: 'com-chay-cha-bong',
    name: 'Cơm Cháy Chà Bông',
    englishName: 'Pork Floss Crispy Rice',
    description: 'Xốt mắm cay ngọt, chà bông đầy đặn',
    price: 45000,
  }),
  makeSnack({
    id: 'banh-trang-cuon-bo',
    name: 'Bánh Tráng Cuốn Bơ',
    englishName: 'Butter Roll Rice Paper',
    description: 'Cuốn sốt bơ trứng lòng đào béo ngậy',
    price: 45000,
    isBestSeller: true,
  }),
  makeSnack({
    id: 'banh-trang-sot-tac',
    name: 'Bánh Tráng Sốt Tắc',
    englishName: 'Kumquat Sauce Rice Paper',
    description: 'Chua cay mặn ngọt chuẩn vị Đà Lạt',
    price: 35000,
  }),
  makeSnack({
    id: 'phoi-suong-toi-ot',
    name: 'Phơi Sương Tỏi Ớt',
    englishName: 'Dew-Softened Garlic Chili Rice Paper',
    description: 'Bánh dẻo sương sớm, muối tỏi ớt phi',
    price: 35000,
  }),
  makeSnack({
    id: 'banh-cham-long-dao',
    name: 'Bánh Chấm Lòng Đào',
    englishName: 'Soft-Boiled Egg Dipping Rice Paper',
    description: 'Chấm sốt me rừng & trứng lòng đào',
    price: 45000,
  }),
];

export const OMSUA_TOPPINGS: ToppingItem[] = [
  {
    id: 'tran-chau-den',
    name: 'Trân châu đen nấu mật',
    shortName: 'Trân châu đen',
    price: 10000,
    isAvailable: true,
  },
  {
    id: 'tran-chau-trang',
    name: 'Trân châu trắng',
    shortName: 'Trân châu trắng',
    price: 10000,
    isAvailable: true,
  },
  {
    id: 'kem-trung',
    name: 'Kem trứng khò béo mịn',
    shortName: 'Kem trứng',
    price: 20000,
    isAvailable: true,
  },
  {
    id: 'banh-flan',
    name: 'Bánh flan trứng caramel',
    shortName: 'Bánh flan',
    price: 15000,
    isAvailable: true,
  },
  {
    id: 'hat-sen',
    name: 'Hạt sen',
    shortName: 'Hạt sen',
    price: 15000,
    isAvailable: true,
  },
  {
    id: 'khuc-bach',
    name: 'Khúc bạch hạnh nhân',
    shortName: 'Khúc bạch',
    price: 10000,
    isAvailable: true,
  },
  {
    id: 'hat-dac-rim',
    name: 'Hạt đác rim',
    shortName: 'Hạt đác rim',
    price: 15000,
    isAvailable: true,
  },
  {
    id: 'thach-cu-nang',
    name: 'Thạch củ năng',
    shortName: 'Thạch củ năng',
    price: 10000,
    isAvailable: true,
  },
];

export const OMSUA_BRANCHES: BranchInfo[] = [
  {
    id: 'cs1-hoang-dieu',
    name: 'Cơ sở 1 — Hoàng Diệu',
    address: '28A Hoàng Diệu, Phường Cam Ly, TP. Đà Lạt, Lâm Đồng',
    shortLabel: '28A Hoàng Diệu, ĐL',
    hotline: '0945 396 117',
  },
  {
    id: 'cs2-hem-33-nct',
    name: 'Cơ sở 2 — Hẻm 33 Nguyễn Công Trứ',
    address: 'Hẻm 33 Nguyễn Công Trứ, P. Lâm Viên, TP. Đà Lạt, Lâm Đồng',
    shortLabel: 'Hẻm 33 Nguyễn Công Trứ',
    hotline: '0945 396 117',
  },
  {
    id: 'cs3-158-nct',
    name: 'Cơ sở 3 — 158 Nguyễn Công Trứ',
    address: '158 Nguyễn Công Trứ, P. Lâm Viên, TP. Đà Lạt, Lâm Đồng',
    shortLabel: '158 Nguyễn Công Trứ',
    hotline: '0945 396 117',
  },
  {
    id: 'cs4-duc-trong',
    name: 'Cơ sở 4 — Đức Trọng',
    address: '544 Quốc lộ 20, Thị trấn Liên Nghĩa, Huyện Đức Trọng, Lâm Đồng',
    shortLabel: '544 QL20, Đức Trọng',
    hotline: '037 444 0869',
  },
];

export function getDefaultCatalog(): CatalogPayload {
  return {
    categories: OMSUA_CATEGORIES.map((category) => ({ ...category })),
    products: OMSUA_PRODUCTS.map((product) => ({
      ...product,
      sizes: product.sizes.map((size) => ({ ...size })),
    })),
    toppings: OMSUA_TOPPINGS.map((topping) => ({ ...topping })),
  };
}

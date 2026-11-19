export type FanpageGalleryCategory =
  | 'all'
  | 'khong-gian'
  | 'thuc-uong'
  | 'banh-trang';

export interface FanpagePhotoItem {
  id: string;
  category: Exclude<FanpageGalleryCategory, 'all'>;
  src: string;
  title: string;
  caption: string;
  postUrl: string;
  aspectRatio: '4/3' | '4/5' | '1/1';
}

export interface ProductPhotoMeta {
  src: string;
  objectPosition?: string;
  postUrl: string;
}

export interface BranchPhotoMeta {
  src: string;
  caption: string;
  postUrl: string;
  objectPosition?: string;
}

export const OMSUA_SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/trasuadalatomsua',
  instagram: 'https://www.instagram.com/omsuadalat',
  tiktok: 'https://tiktok.com/@omsuaphache',
  handle: '@trasuadalatomsua',
  followersLabel: '14K người theo dõi',
  ratingLabel: '96% đề xuất (229 đánh giá)',
} as const;

export const OMSUA_STORY_PHOTO = {
  src: '/images/fanpage/space/space-barista-quay-om.webp',
  alt: 'Barista Ốm Sữa Đà Lạt đang chăm chút từng mẻ trà tại quầy pha chế',
  objectPosition: 'center 24%',
  postUrl: 'https://omsua.vn',
} as const;

export const BRANCH_PHOTO_BY_ID: Readonly<Record<string, BranchPhotoMeta>> = {
  'cs1-hoang-dieu': {
    src: '/images/fanpage/branches/branch-cs1-hoang-dieu.webp',
    caption: 'Cơ sở 28A Hoàng Diệu, Đà Lạt',
    objectPosition: 'center 12%',
    postUrl:
      'https://www.facebook.com/photo/?fbid=989323463065654&set=a.1027171502614183',
  },
  'cs2-hem-33-nct': {
    src: '/images/fanpage/branches/branch-cs2-hem-33-nct.webp',
    caption: 'Cơ sở Hẻm 33 Nguyễn Công Trứ, Đà Lạt — Ốm Sữa Since 2017',
    objectPosition: 'center 10%',
    postUrl:
      'https://www.facebook.com/photo/?fbid=989324523065548&set=a.1027171502614183',
  },
  'cs3-158-nct': {
    src: '/images/fanpage/branches/branch-cs3-158-nct.webp',
    caption: 'Bảng hiệu mặt tiền gỗ Ốm Sữa Nguyễn Công Trứ, Đà Lạt',
    objectPosition: 'center 46%',
    postUrl: 'https://www.facebook.com/photo/?fbid=1359308459400484',
  },
  'cs4-duc-trong': {
    src: '/images/fanpage/branches/branch-cs4-duc-trong.webp',
    caption: 'Mặt tiền vòm 544 Quốc lộ 20, Thị trấn Liên Nghĩa, Đức Trọng',
    objectPosition: 'center 28%',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1812177980780194&set=pb.100059640288584.-2207520000',
  },
};

export const PRODUCT_PHOTO_BY_ID: Readonly<Record<string, ProductPhotoMeta>> = {
  // 1. TRÀ SỮA ĐÀ LẠT (6/6 — 100%)
  'tra-sua-atiso': {
    src: '/images/fanpage/products/drink-tra-sua-atiso.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=989321219732545&set=a.870975204900481',
  },
  'tra-sua-atiso-chuoi': {
    src: '/images/fanpage/products/drink-tra-sua-atiso-chuoi.webp',
    objectPosition: 'center 35%',
    postUrl: 'https://www.facebook.com/photo/?fbid=1452471570084172',
  },
  'tra-sua-gao-rang-khuc-bach': {
    src: '/images/fanpage/products/drink-tra-sua-gao-rang-khuc-bach.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/photo/?fbid=1144272717570727',
  },
  'tra-sua-tiramisu': {
    src: '/images/fanpage/products/drink-tra-sua-tiramisu.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/photo/?fbid=821671889830813',
  },
  'tra-sua-flan-chay-canh': {
    src: '/images/fanpage/products/drink-tra-sua-flan-chay-canh.webp',
    objectPosition: 'center 28%',
    postUrl: 'https://omsua.vn/menu',
  },
  'oolong-sen-gung': {
    src: '/images/fanpage/products/drink-oolong-sen-gung.webp',
    objectPosition: 'center 42%',
    postUrl: 'https://www.facebook.com/photo/?fbid=1453754913289171',
  },

  // 2. GIỮ DÁNG — FRUIT TEA & KOMBUCHA (6/6 — 100%)
  'quyt-nhai-cat-tuong': {
    src: '/images/fanpage/products/drink-quyt-nhai-cat-tuong.webp',
    objectPosition: 'center 38%',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1535984961732832&set=a.529351485729523',
  },
  'tra-atiso-sen-chia': {
    src: '/images/fanpage/products/drink-tra-atiso-sen-chia.webp',
    objectPosition: 'center 32%',
    postUrl: 'https://www.facebook.com/photo/?fbid=1141880497809949',
  },
  'tra-dau-tam-da-lat': {
    src: '/images/fanpage/products/drink-tra-dau-tam-da-lat.webp',
    objectPosition: 'center 35%',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1068464915151508&set=a.792794062718596',
  },
  'tra-me-thot-not': {
    src: '/images/fanpage/products/drink-tra-me-thot-not.webp',
    objectPosition: 'center 42%',
    postUrl: 'https://www.facebook.com/photo/?fbid=1669588588372468',
  },
  'tra-so-ri-buoi-hong': {
    src: '/images/fanpage/products/drink-tra-so-ri-buoi-hong.webp',
    objectPosition: 'center 42%',
    postUrl: 'https://www.facebook.com/photo/?fbid=1319762356688428',
  },
  'kombucha-chanh-vang': {
    src: '/images/fanpage/products/drink-kombucha-chanh-vang.webp',
    objectPosition: 'center 38%',
    postUrl: 'https://www.facebook.com/photo/?fbid=1282900063707991',
  },

  // 3. SỮA TƯƠI & ĐÁ XAY CAO NGUYÊN (6/6 — 100%)
  'sua-tuoi-kem-trung-nuong': {
    src: '/images/fanpage/products/drink-sua-tuoi-kem-trung-nuong.webp',
    objectPosition: 'center 52%',
    postUrl: 'https://www.facebook.com/photo/?fbid=777807947550541',
  },
  'sua-tuoi-duong-den': {
    src: '/images/fanpage/products/drink-sua-tuoi-duong-den.webp',
    objectPosition: 'center 52%',
    postUrl: 'https://www.facebook.com/trasuadalatomsua',
  },
  'matcha-latte': {
    src: '/images/fanpage/products/drink-matcha-latte.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1409069554424374&set=pcb.1409069571091039',
  },
  'oreo-tra-da-xay': {
    src: '/images/fanpage/products/drink-oreo-tra-da-xay.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/photo/?fbid=858219706176031',
  },
  'matcha-oreo-da-xay': {
    src: '/images/fanpage/products/drink-matcha-oreo-da-xay.webp',
    objectPosition: 'center 55%',
    postUrl: 'https://www.facebook.com/photo/?fbid=816452760352726',
  },
  'yogurt-dau-tam': {
    src: '/images/fanpage/products/drink-yogurt-dau-tam.webp',
    objectPosition: 'center 38%',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1068464915151508&set=a.792794062718596',
  },

  // 4. CÀ PHÊ PHA PHIN & COLD BREW (6/6 — 100%)
  'cold-brew-me': {
    src: '/images/fanpage/products/drink-cold-brew-me.webp',
    objectPosition: 'center 36%',
    postUrl: 'https://www.facebook.com/photo/?fbid=1669588588372468',
  },
  'ca-phe-muoi': {
    src: '/images/fanpage/products/drink-ca-phe-muoi.webp',
    objectPosition: 'center 42%',
    postUrl: 'https://www.facebook.com/photo/?fbid=1057852299546103',
  },
  'ca-phe-kem-tiramisu': {
    src: '/images/fanpage/products/drink-ca-phe-kem-tiramisu.webp',
    objectPosition: 'center 54%',
    postUrl:
      'https://www.facebook.com/photo/?fbid=967429995255001&set=a.792098612788141',
  },
  'ca-phe-sua': {
    src: '/images/fanpage/products/drink-ca-phe-sua.webp',
    objectPosition: 'center 46%',
    postUrl: 'https://omsua.vn/menu',
  },
  'bac-xiu-da-lat': {
    src: '/images/fanpage/products/drink-bac-xiu-da-lat.webp',
    objectPosition: 'center 42%',
    postUrl: 'https://www.facebook.com/photo/?fbid=1057852299546103',
  },
  'ca-phe-den': {
    src: '/images/fanpage/products/drink-ca-phe-den.webp',
    objectPosition: 'center 46%',
    postUrl: 'https://omsua.vn/menu',
  },

  // 5. BÁNH TRÁNG SNACK ĐÀ LẠT (6/6 — 100%)
  'banh-trang-tron-top-mo': {
    src: '/images/fanpage/products/snack-banh-trang-tron-top-mo.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/photo/?fbid=1044727677525232',
  },
  'com-chay-cha-bong': {
    src: '/images/fanpage/products/snack-com-chay-cha-bong.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/photo/?fbid=1006530684678265',
  },
  'banh-trang-cuon-bo': {
    src: '/images/fanpage/products/snack-banh-trang-cuon-bo.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/photo/?fbid=975221324475868',
  },
  'banh-trang-sot-tac': {
    src: '/images/fanpage/products/snack-banh-trang-sot-tac.webp',
    objectPosition: 'center 60%',
    postUrl:
      'https://www.facebook.com/photo/?fbid=804925394838796&set=a.792098612788141',
  },
  'phoi-suong-toi-ot': {
    src: '/images/fanpage/products/snack-phoi-suong-toi-ot.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/photo/?fbid=901185245212810',
  },
  'banh-cham-long-dao': {
    src: '/images/fanpage/products/snack-banh-cham-long-dao.webp',
    objectPosition: 'center 65%',
    postUrl: 'https://www.facebook.com/photo/?fbid=1044727677525232',
  },

  // 6. TOPPING NHÀ LÀM MACRO (8/8 — 100%)
  'tran-chau-den': {
    src: '/images/fanpage/products/topping-tran-chau-den.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/photo/?fbid=1452471570084172',
  },
  'tran-chau-trang': {
    src: '/images/fanpage/products/topping-tran-chau-trang.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/trasuadalatomsua',
  },
  'kem-trung': {
    src: '/images/fanpage/products/topping-kem-trung.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/photo/?fbid=777807947550541',
  },
  'banh-flan': {
    src: '/images/fanpage/products/topping-banh-flan.webp',
    objectPosition: 'center',
    postUrl: 'https://omsua.vn/menu',
  },
  'hat-sen': {
    src: '/images/fanpage/products/topping-hat-sen.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/photo/?fbid=1453741196623876',
  },
  'khuc-bach': {
    src: '/images/fanpage/products/topping-khuc-bach.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/photo/?fbid=1005130318151635',
  },
  'hat-dac-rim': {
    src: '/images/fanpage/products/topping-hat-dac-rim.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/photo/?fbid=983624600302207',
  },
  'thach-cu-nang': {
    src: '/images/fanpage/products/topping-thach-cu-nang.webp',
    objectPosition: 'center',
    postUrl: 'https://www.facebook.com/trasuadalatomsua',
  },
};

export const FANPAGE_GALLERY_ITEMS: readonly FanpagePhotoItem[] = [
  // Không gian Đà Lạt (6)
  {
    id: 'space-morning-01',
    category: 'khong-gian',
    src: '/images/fanpage/space/space-morning-01.webp',
    title: 'Không gian sáng sớm ở Ốm',
    caption:
      'Hãy để sáng sớm của bạn có thêm một chút bình yên và hương vị Đà Lạt nơi góc tiệm ấm.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1420041026660560&set=a.1027171502614183',
    aspectRatio: '4/5',
  },
  {
    id: 'space-morning-02',
    category: 'khong-gian',
    src: '/images/fanpage/space/space-morning-02.webp',
    title: 'Góc bàn mây đan & nắng mai phố núi',
    caption:
      'Ánh nắng ban mai dịu nhẹ trên tường vàng kem mộc mạc tại không gian Ốm Sữa Đà Lạt.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1420041009993895&set=a.1027171502614183',
    aspectRatio: '4/5',
  },
  {
    id: 'space-cho-da-lat-da-quy',
    category: 'khong-gian',
    src: '/images/fanpage/space/space-cho-da-lat-da-quy.webp',
    title: 'Chợ Đà Lạt mùa hoa dã quỳ nở vàng',
    caption:
      'Nắng thu phố núi nhuộm vàng hoa dã quỳ bên nhịp sống quen thuộc của người Đà Lạt.',
    postUrl: 'https://www.facebook.com/photo/?fbid=1453865349944794',
    aspectRatio: '4/3',
  },
  {
    id: 'space-tui-tote-atiso',
    category: 'khong-gian',
    src: '/images/fanpage/space/space-tui-tote-atiso.webp',
    title: 'Hành trình chở búp Atiso về tiệm',
    caption:
      'Túi vải Ốm Sữa đong đầy những búp hoa Atiso Đà Lạt vừa thu hoạch mỗi sớm.',
    postUrl: 'https://www.facebook.com/photo/?fbid=1453865493278113',
    aspectRatio: '1/1',
  },
  {
    id: 'branch-cs3-158-nct',
    category: 'khong-gian',
    src: '/images/fanpage/branches/branch-cs3-158-nct.webp',
    title: 'Bảng hiệu Ốm Sữa Nguyễn Công Trứ',
    caption:
      'Không gian Ốm tại cung đường Nguyễn Công Trứ thân thương — nơi hẹn hò quen của người Đà Lạt.',
    postUrl: 'https://www.facebook.com/photo/?fbid=1359308459400484',
    aspectRatio: '4/5',
  },
  {
    id: 'space-street-dalat',
    category: 'khong-gian',
    src: '/images/fanpage/space/space-street-dalat.webp',
    title: 'Đêm Đà Lạt tại Vườn Hoa Thành Phố',
    caption:
      'Quầy Trà Sữa Atiso rực đèn ấm áp giữa tiết trời đêm se lạnh Đà Lạt.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=989323503065650&set=a.1027171502614183',
    aspectRatio: '1/1',
  },

  // Trà sữa & Mùa hồng (6)
  {
    id: 'gallery-atiso-4-bong',
    category: 'thuc-uong',
    src: '/images/fanpage/seasonal/gallery-atiso-4-bong.webp',
    title: 'Signature Trà Sữa Atiso Đà Lạt',
    caption:
      'Ly trà sữa Atiso đầy ắp trân châu đen nấu mật sánh đôi cùng những búp Atiso xanh tươi.',
    postUrl: 'https://www.facebook.com/photo/?fbid=1161282152536450',
    aspectRatio: '1/1',
  },
  {
    id: 'gallery-nong-san-da-lat',
    category: 'thuc-uong',
    src: '/images/fanpage/seasonal/gallery-nong-san-da-lat.webp',
    title: 'Bộ sưu tập Vị Mới Từ Nông Sản Đà Lạt',
    caption:
      'Ký ức tuổi thơ gói trọn trong Atiso Chuối Laba sấy dẻo, Olong Sữa Bắp và Olong Sen Gừng.',
    postUrl: 'https://www.facebook.com/photo/?fbid=1452471366750859',
    aspectRatio: '4/5',
  },
  {
    id: 'gallery-hong-trung-lang',
    category: 'thuc-uong',
    src: '/images/fanpage/seasonal/gallery-hong-trung-lang.webp',
    title: 'Mùa Hồng Chín Đà Lạt — Hồng Trà Trứng Láng',
    caption:
      'Từng trái hồng trứng láng chín mọng mùa thu Đà Lạt được rim ngọt thanh tao.',
    postUrl: 'https://www.facebook.com/photo/?fbid=1801518158512843',
    aspectRatio: '1/1',
  },
  {
    id: 'gallery-kombucha-series',
    category: 'thuc-uong',
    src: '/images/fanpage/seasonal/gallery-kombucha-series.webp',
    title: 'Kombucha Series Lên Men Tự Nhiên',
    caption:
      'Trà lên men từ con giống SCOBY kết hợp chanh vàng bạc hà, táo gừng và hắc mai biển thanh mát.',
    postUrl: 'https://www.facebook.com/photo/?fbid=1282900057041325',
    aspectRatio: '4/5',
  },
  {
    id: 'gallery-vi-nang-ha-me',
    category: 'thuc-uong',
    src: '/images/fanpage/seasonal/gallery-vi-nang-ha-me.webp',
    title: 'Vị Nắng Hạ — Trà Me & Coldbrew Vị Me',
    caption:
      'Cốt me rừng tự sên chua thanh quyện cùng trà ủ mới và cà phê ủ lạnh Cầu Đất.',
    postUrl: 'https://www.facebook.com/photo/?fbid=1669588588372468',
    aspectRatio: '4/5',
  },
  {
    id: 'gallery-mulberry-season',
    category: 'thuc-uong',
    src: '/images/fanpage/seasonal/gallery-mulberry-season.webp',
    title: 'Mulberry Season — Mùa Dâu Tằm Tự Ngâm',
    caption:
      'Dâu tằm Đà Lạt chín mọng tự ngâm đường phèn cho Trà Dâu Tằm và Yogurt Dâu Tằm Bạch Tuyết.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1068464915151508&set=a.792794062718596',
    aspectRatio: '4/5',
  },

  // Bánh tráng Nhà Ốm (4)
  {
    id: 'snack-banh-trang-tron-top-mo',
    category: 'banh-trang',
    src: '/images/fanpage/products/snack-banh-trang-tron-top-mo.webp',
    title: 'Bánh Tráng Trộn Tóp Mỡ Lòng Đào',
    caption:
      'Mẹt bánh tráng trộn tóp mỡ nhà thắng giòn rụm kèm trứng lòng đào và rau răm Đà Lạt.',
    postUrl: 'https://www.facebook.com/photo/?fbid=1044727677525232',
    aspectRatio: '4/3',
  },
  {
    id: 'snack-com-chay-cha-bong',
    category: 'banh-trang',
    src: '/images/fanpage/products/snack-com-chay-cha-bong.webp',
    title: 'Cơm Cháy Chà Bông Mỡ Hành Nhà Ốm',
    caption:
      'Cơm cháy đáy nồi giòn tan phủ sốt mắm cay ngọt, mỡ hành xanh mướt và chà bông đầy đặn.',
    postUrl: 'https://www.facebook.com/photo/?fbid=1006530684678265',
    aspectRatio: '4/5',
  },
  {
    id: 'snack-banh-trang-cuon-bo',
    category: 'banh-trang',
    src: '/images/fanpage/products/snack-banh-trang-cuon-bo.webp',
    title: 'Bánh Tráng Cuốn Bơ Trứng Béo Ngậy',
    caption:
      'Từng cuốn bánh tráng dẻo đẫm sốt bơ trứng vàng ươm, ăn kèm xoài xanh và tóp mỡ.',
    postUrl: 'https://www.facebook.com/photo/?fbid=975221324475868',
    aspectRatio: '4/5',
  },
  {
    id: 'snack-banh-cham-long-dao',
    category: 'banh-trang',
    src: '/images/fanpage/products/snack-banh-cham-long-dao.webp',
    title: 'Bánh Tráng Chấm Sốt Trứng Lòng Đào',
    caption:
      'Sốt me rừng đậu phộng bơ trứng sánh đậm chấm cùng bánh tráng dẻo và trứng lòng đào béo bùi.',
    postUrl: 'https://www.facebook.com/photo/?fbid=1044727677525232',
    aspectRatio: '4/3',
  },
];

export function getProductPhoto(
  targetId: string | undefined,
): ProductPhotoMeta | null {
  if (!targetId) {
    return null;
  }
  return PRODUCT_PHOTO_BY_ID[targetId] ?? null;
}

export function getBranchPhoto(
  branchId: string | undefined,
): BranchPhotoMeta | null {
  if (!branchId) {
    return null;
  }
  return BRANCH_PHOTO_BY_ID[branchId] ?? null;
}

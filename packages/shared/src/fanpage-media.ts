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
}

export const OMSUA_SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/trasuadalatomsua',
  instagram: 'https://www.instagram.com/omsuadalat',
  tiktok: 'https://tiktok.com/@omsuaphache',
  handle: '@trasuadalatomsua',
  followersLabel: '14K người theo dõi',
  ratingLabel: '96% đề xuất (229 đánh giá)',
} as const;

export const BRANCH_PHOTO_BY_ID: Readonly<Record<string, BranchPhotoMeta>> = {
  'cs1-hoang-dieu': {
    src: '/images/fanpage/branches/branch-hoang-dieu.webp',
    caption: 'Cơ sở 28A Hoàng Diệu, Đà Lạt',
    postUrl:
      'https://www.facebook.com/photo/?fbid=989323463065654&set=a.1027171502614183',
  },
  'cs2-hem-33-nct': {
    src: '/images/fanpage/branches/branch-hem-33-nct.webp',
    caption: 'Cơ sở Hẻm 33 Nguyễn Công Trứ, Đà Lạt — Ốm Sữa Since 2017',
    postUrl:
      'https://www.facebook.com/photo/?fbid=989324523065548&set=a.1027171502614183',
  },
  'cs3-158-nct': {
    src: '/images/fanpage/branches/branch-nguyen-cong-tru.webp',
    caption: 'Góc phố trước hiên Ốm Sữa Nguyễn Công Trứ, Đà Lạt',
    postUrl:
      'https://www.facebook.com/photo.php?fbid=1812186947445964&set=pb.100059640288584.-2207520000&type=3',
  },
  'cs4-duc-trong': {
    src: '/images/fanpage/branches/branch-duc-trong-vuon-hoa.webp',
    caption: 'Không gian quầy Ốm Sữa Lâm Đồng — Trà Sữa Atiso Since 2017',
    postUrl:
      'https://www.facebook.com/photo/?fbid=989323503065650&set=a.1027171502614183',
  },
};

export const PRODUCT_PHOTO_BY_ID: Readonly<Record<string, ProductPhotoMeta>> = {
  'tra-sua-atiso': {
    src: '/images/fanpage/products/drink-tra-sua-atiso.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=948069193857748&set=a.870975204900481',
  },
  'tra-sua-atiso-chuoi': {
    src: '/images/fanpage/products/drink-atiso-chuoi.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=989321219732545&set=a.870975204900481',
  },
  'tra-atiso-sen-chia': {
    src: '/images/fanpage/products/drink-atiso-chuoi.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=989321219732545&set=a.870975204900481',
  },
  'quyt-nhai-cat-tuong': {
    src: '/images/fanpage/products/drink-quyt-nhai.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1535984961732832&set=a.529351485729523',
  },
  'matcha-latte': {
    src: '/images/fanpage/products/drink-matcha-latte.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1409069554424374&set=pcb.1409069571091039',
  },
  'matcha-oreo-da-xay': {
    src: '/images/fanpage/products/drink-matcha-oreo.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1409069551091041&set=pcb.1409069571091039',
  },
  'ca-phe-kem-tiramisu': {
    src: '/images/fanpage/products/drink-ca-phe-tiramisu.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=967429995255001&set=a.792098612788141',
  },
  'tra-sua-tiramisu': {
    src: '/images/fanpage/products/drink-ca-phe-tiramisu.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=967429995255001&set=a.792098612788141',
  },
  'ca-phe-sua': {
    src: '/images/fanpage/products/drink-ca-phe-da-lat.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=891659929498675&set=a.792794062718596',
  },
  'ca-phe-muoi': {
    src: '/images/fanpage/products/drink-ca-phe-da-lat.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=891659929498675&set=a.792794062718596',
  },
  'bac-xiu-da-lat': {
    src: '/images/fanpage/products/drink-ca-phe-da-lat.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=891659929498675&set=a.792794062718596',
  },
  'tran-chau-trang': {
    src: '/images/fanpage/products/topping-khoai-tam.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1068464915151508&set=a.792794062718596',
  },
  'banh-trang-tron-top-mo': {
    src: '/images/fanpage/products/snack-banh-trang-top-mo.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1076102457721087&set=pcb.1076102631054403',
  },
  'com-chay-cha-bong': {
    src: '/images/fanpage/products/snack-banh-trang-top-mo.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1076102457721087&set=pcb.1076102631054403',
  },
  'banh-trang-sot-tac': {
    src: '/images/fanpage/products/snack-banh-trang-sot-tac.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=804925394838796&set=a.792098612788141',
  },
  'phoi-suong-toi-ot': {
    src: '/images/fanpage/products/snack-banh-trang-sot-tac.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=804925394838796&set=a.792098612788141',
  },
  'banh-cham-long-dao': {
    src: '/images/fanpage/products/snack-banh-cham-long-dao.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=778432660821403&set=a.792098612788141',
  },
  'banh-trang-cuon-bo': {
    src: '/images/fanpage/products/snack-banh-cham-long-dao.webp',
    objectPosition: 'center',
    postUrl:
      'https://www.facebook.com/photo/?fbid=778432660821403&set=a.792098612788141',
  },
};

export const FANPAGE_GALLERY_ITEMS: readonly FanpagePhotoItem[] = [
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
    title: 'Góc bàn gỗ & nắng mai phố núi',
    caption:
      'Ánh nắng ban mai xuyên qua khung cửa gỗ mộc mạc tại không gian Ốm Sữa Đà Lạt.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1420041009993895&set=a.1027171502614183',
    aspectRatio: '4/5',
  },
  {
    id: 'space-street-dalat',
    category: 'khong-gian',
    src: '/images/fanpage/space/space-street-dalat.webp',
    title: 'Nhịp sống trước hiên tiệm Ốm',
    caption:
      'Điểm hẹn quen thuộc của người Đà Lạt và khách ghé thăm từ năm 2017.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1812177980780194&set=pb.100059640288584.-2207520000',
    aspectRatio: '4/5',
  },
  {
    id: 'branch-hoang-dieu',
    category: 'khong-gian',
    src: '/images/fanpage/branches/branch-hoang-dieu.webp',
    title: 'Cơ sở 28A Hoàng Diệu, Đà Lạt',
    caption:
      'Mặt tiền ấm cúng tại 28A Hoàng Diệu, Phường Cam Ly, Thành phố Đà Lạt.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=989323463065654&set=a.1027171502614183',
    aspectRatio: '1/1',
  },
  {
    id: 'branch-hem-33-nct',
    category: 'khong-gian',
    src: '/images/fanpage/branches/branch-hem-33-nct.webp',
    title: 'Cơ sở Hẻm 33 Nguyễn Công Trứ',
    caption:
      'Góc hẻm Đà Lạt gắn liền với dấu ấn Ốm Sữa Since 2017 và hương trà Atiso nguyên bản.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=989324523065548&set=a.1027171502614183',
    aspectRatio: '1/1',
  },
  {
    id: 'drink-tra-sua-atiso',
    category: 'thuc-uong',
    src: '/images/fanpage/products/drink-tra-sua-atiso.webp',
    title: 'Signature Trà Sữa Atiso Đà Lạt',
    caption:
      'Hành trình nghiên cứu và phát triển những búp hoa Atiso xanh thành thức uống đặc trưng của Ốm.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=948069193857748&set=a.870975204900481',
    aspectRatio: '4/5',
  },
  {
    id: 'drink-quyt-nhai',
    category: 'thuc-uong',
    src: '/images/fanpage/products/drink-quyt-nhai.webp',
    title: 'Nhài Quýt Cát Tường',
    caption:
      'Hương hoa nhài thanh tao quyện cùng mứt quýt chín vàng tươi mát cho ngày se lạnh.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1535984961732832&set=a.529351485729523',
    aspectRatio: '4/5',
  },
  {
    id: 'seasonal-hong-trung-lang',
    category: 'thuc-uong',
    src: '/images/fanpage/seasonal/seasonal-hong-trung-lang.webp',
    title: 'Mùa Hồng Chín Đà Lạt — Hồng Trứng Láng',
    caption:
      'Từng trái hồng chín mọng mùa thu Đà Lạt được lựa kỹ đem rim ngọt thanh tao.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1801518178512841&set=pcb.1801518298512829',
    aspectRatio: '4/5',
  },
  {
    id: 'drink-matcha-latte',
    category: 'thuc-uong',
    src: '/images/fanpage/products/drink-matcha-latte.webp',
    title: 'Bộ Đôi Matcha Cao Nguyên',
    caption:
      'Sắc xanh Matcha Uji đánh tay mượt mà hòa quyện sữa tươi thanh trùng mát lạnh.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1409069554424374&set=pcb.1409069571091039',
    aspectRatio: '4/5',
  },
  {
    id: 'snack-banh-trang-top-mo',
    category: 'banh-trang',
    src: '/images/fanpage/products/snack-banh-trang-top-mo.webp',
    title: 'Bánh Tráng Trộn Tóp Mỡ Nhà Ốm',
    caption:
      'Mẹt ăn vặt đường phố Đà Lạt với tóp mỡ nhà thắng giòn rụm và hành phi thơm lừng.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=1076102457721087&set=pcb.1076102631054403',
    aspectRatio: '4/5',
  },
  {
    id: 'snack-banh-trang-sot-tac',
    category: 'banh-trang',
    src: '/images/fanpage/products/snack-banh-trang-sot-tac.webp',
    title: 'Bánh Tráng Sốt Tắc & Phơi Sương',
    caption:
      'Vị chua cay mặn ngọt chuẩn phố núi, trộn mới ngay khi khách vừa lên đơn.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=804925394838796&set=a.792098612788141',
    aspectRatio: '4/5',
  },
  {
    id: 'snack-banh-cham-long-dao',
    category: 'banh-trang',
    src: '/images/fanpage/products/snack-banh-cham-long-dao.webp',
    title: 'Bánh Tráng Trứng Lòng Đào & Cuốn Bơ',
    caption:
      'Sốt me rừng sánh đậm cùng trứng lòng đào béo bùi nhâm nhi hợp vị cùng trà sữa Atiso.',
    postUrl:
      'https://www.facebook.com/photo/?fbid=778432660821403&set=a.792098612788141',
    aspectRatio: '1/1',
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

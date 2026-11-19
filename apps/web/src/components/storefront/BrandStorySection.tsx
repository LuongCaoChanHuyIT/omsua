import { AtisoMascot } from '@/components/artwork/OmSuaArtwork';

const STORY_PILLARS = [
  {
    badge: '01 • NGUYÊN BẢN CẦU ĐẤT',
    title: 'Bông Atiso xanh Cầu Đất',
    description:
      'Tuyển chọn bông Atiso xanh tươi từ vùng đất sương mù Cầu Đất, hầm chậm mỗi sáng để giữ trọn vị ngọt thanh tự nhiên.',
  },
  {
    badge: '02 • VỊ TRÀ ĐẦM DỊU',
    title: 'Lá trà ủ chậm & Sữa thanh trùng',
    description:
      'Cân bằng hương trà cao nguyên ủ mới theo mẻ nhỏ cùng dòng sữa tươi thanh trùng mát lành, chuẩn vị 70% đường của quán.',
  },
  {
    badge: '03 • BẾP NHÀ MỖI SÁNG',
    title: 'Topping & Sốt tắc nhà làm mỗi sáng',
    description:
      'Trân châu nấu mật dẻo ấm, khúc bạch hạnh nhân béo mịn và sốt tắc hành phi Đà Lạt trộn mới ngay khi lên đơn.',
  },
] as const;

export function BrandStorySection() {
  return (
    <section
      id="cau-chuyen"
      className="scroll-mt-24 rounded-3xl border border-olive-primary/12 bg-surface-light p-6 shadow-2xs sm:p-8 lg:p-10"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <span className="inline-flex items-center rounded-full bg-card-butter px-3.5 py-1 text-xs font-bold tracking-wider text-olive-primary uppercase">
            ✦ CÂU CHUYỆN ỐM SỮA • TỪ 2017
          </span>

          <h2 className="font-display text-2xl leading-tight font-bold tracking-tight text-olive-primary sm:text-3xl">
            Hành trình ủ vị Atiso xanh giữa sương sớm Đà Lạt
          </h2>

          <p className="font-quote text-xl leading-relaxed font-bold text-espresso sm:text-2xl">
            “Trà sữa của người Đà Lạt — Gói trọn sương sớm &amp; vị ngọt lành
            nguyên bản từ 2017”
          </p>

          <p className="font-editorial text-sm leading-relaxed text-warm-muted sm:text-base">
            Khởi đầu từ căn tiệm nhỏ nơi phố núi năm 2017, Ốm Sữa chọn đi chậm
            cùng nông sản bản địa: nấu trà từ bông Atiso xanh, giữ vị trà mộc
            mạc, ít ngọt gắt và chăm chút từng mẻ trân châu, bánh tráng ăn vặt
            mỗi ngày cho người Đà Lạt lẫn khách ghé thăm.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl border border-olive-primary/12 bg-card-butter/55 p-6 text-center lg:col-span-5">
          <AtisoMascot className="h-24 w-24 shrink-0 sm:h-28 sm:w-28" />
          <p className="mt-3 font-display text-lg font-bold text-olive-primary">
            Mộc mạc • Tinh tế • Nguyên bản
          </p>
          <p className="mt-1 text-xs font-medium text-warm-muted sm:text-sm">
            4 cơ sở tại Đà Lạt &amp; Đức Trọng • Phục vụ 08:00 – 22:00 hàng ngày
          </p>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
        {STORY_PILLARS.map((pillar) => (
          <article
            key={pillar.title}
            className="rounded-2xl border border-olive-primary/10 bg-canvas-cream/70 p-4 sm:p-5"
          >
            <span className="text-[11px] font-bold tracking-wider text-subhead-ochre uppercase">
              {pillar.badge}
            </span>
            <h3 className="mt-1.5 font-editorial text-base font-semibold text-espresso sm:text-lg">
              {pillar.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-warm-muted sm:text-sm">
              {pillar.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

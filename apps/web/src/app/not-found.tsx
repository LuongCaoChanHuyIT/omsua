import Link from 'next/link';
import { AtisoMascot, OmSuaLogo } from '@/components/artwork/OmSuaArtwork';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas-cream px-4 py-12 text-espresso">
      <div className="w-full max-w-lg rounded-3xl border border-olive-primary/15 bg-surface-light p-7 text-center shadow-sm sm:p-10">
        <div className="flex items-center justify-center gap-3">
          <OmSuaLogo className="h-12 w-12 shrink-0" />
          <AtisoMascot className="h-16 w-16 shrink-0" />
        </div>

        <p className="mt-4 text-xs font-bold tracking-[0.18em] text-subhead-ochre uppercase">
          404 • ỐM SỮA ĐÀ LẠT
        </p>

        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-olive-primary sm:text-3xl">
          Không tìm thấy trang này
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-espresso/85 sm:text-base">
          Trang bạn tìm kiếm không tồn tại hoặc đã chuyển về quầy thực đơn chính
          của Ốm Sữa.
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-bold text-surface-light shadow-xs transition hover:opacity-92"
          >
            Quay về Thực đơn Ốm Sữa
          </Link>
        </div>
      </div>
    </main>
  );
}

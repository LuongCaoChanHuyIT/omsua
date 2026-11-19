'use client';

import type { BranchInfo } from '@omsua/shared';

export interface BrandFooterProps {
  branches: BranchInfo[];
  selectedBranchId?: string;
  onSelectBranch?: (branchId: string) => void;
}

function QrFollowGraphic() {
  const cells = [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [6, 0],
    [7, 0],
    [8, 0],
    [6, 1],
    [8, 1],
    [6, 2],
    [7, 2],
    [8, 2],
    [0, 6],
    [1, 6],
    [2, 6],
    [0, 7],
    [2, 7],
    [0, 8],
    [1, 8],
    [2, 8],
    [4, 1],
    [4, 3],
    [3, 4],
    [4, 4],
    [5, 4],
    [4, 5],
    [6, 4],
    [7, 5],
    [5, 7],
    [7, 7],
    [8, 6],
    [8, 8],
  ];

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16 shrink-0"
      role="img"
      aria-label="Mã QR Theo dõi Ốm Sữa"
    >
      <rect
        width="64"
        height="64"
        rx="10"
        fill="#EEEADF"
        stroke="#594C00"
        strokeOpacity="0.2"
      />
      {cells.map(([col, row], index) => (
        <rect
          key={index}
          x={6 + (col ?? 0) * 5.8}
          y={6 + (row ?? 0) * 5.8}
          width="4.6"
          height="4.6"
          rx="1"
          fill="#29261D"
        />
      ))}
    </svg>
  );
}

export function BrandFooter({
  branches,
  selectedBranchId,
  onSelectBranch,
}: BrandFooterProps) {
  return (
    <footer className="mt-14 bg-hero-espresso text-surface-light">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="pb-7">
          <p className="font-quote text-2xl leading-relaxed font-bold text-card-butter sm:text-[26px]">
            “Mộc mạc - Tinh tế - Nguyên bản. Là những từ ngữ mô tả ngắn gọn nhất
            tinh thần mà Ốm muốn gửi đến bạn.”
          </p>
        </div>

        <div
          id="chi-nhanh"
          className="scroll-mt-24 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12"
        >
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-4">
            {branches.map((branch) => {
              const isSelected = selectedBranchId === branch.id;

              return (
                <div
                  key={branch.id}
                  role={onSelectBranch ? 'button' : undefined}
                  aria-pressed={onSelectBranch ? isSelected : undefined}
                  tabIndex={onSelectBranch ? 0 : undefined}
                  onClick={
                    onSelectBranch
                      ? () => onSelectBranch(branch.id)
                      : undefined
                  }
                  onKeyDown={
                    onSelectBranch
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onSelectBranch(branch.id);
                          }
                        }
                      : undefined
                  }
                  className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                    onSelectBranch ? 'cursor-pointer' : ''
                  } ${
                    isSelected
                      ? 'border-card-butter bg-surface-light/12'
                      : 'border-surface-light/15 bg-surface-light/5 hover:border-surface-light/30'
                  }`}
                >
                  <div>
                    <h3 className="font-editorial text-sm font-semibold text-card-butter">
                      {branch.name}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-surface-light/80">
                      {branch.address}
                    </p>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-terracotta">
                    📞 Hotline: {branch.hotline}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl bg-surface-light p-4 text-espresso lg:col-span-3">
            <QrFollowGraphic />
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-wider text-olive-primary uppercase">
                THEO DÕI ỐM
              </p>
              <p className="mt-1 text-xs leading-snug text-warm-muted">
                Quét mã kết nối ưu đãi &amp; bản tin mới mỗi ngày từ Đà Lạt
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-surface-light/12 pt-5 text-xs text-surface-light/65 sm:flex-row">
          <p>© 2017 - 2026 Ốm Sữa • Mở cửa 08:00 - 22:00 hàng ngày</p>
          <p>Trà sữa của người Đà Lạt • Miễn phí giao nội thành</p>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { formatVnd } from '@omsua/shared';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface VietQrTransferCardProps {
  amount: number;
  transferContent: string;
}

const GRID_SIZE = 21;

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function isFinderCell(
  row: number,
  col: number,
  originRow: number,
  originCol: number,
): boolean | null {
  const r = row - originRow;
  const c = col - originCol;
  if (r < -1 || r > 7 || c < -1 || c > 7) {
    return null;
  }
  if (r === -1 || r === 7 || c === -1 || c === 7) {
    return false;
  }
  if (r === 0 || r === 6 || c === 0 || c === 6) {
    return true;
  }
  if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
    return true;
  }
  return false;
}

function buildDeterministicQrCells(seedText: string): Array<[number, number]> {
  let state = hashSeed(seedText) || 0x9e3779b9;
  const cells: Array<[number, number]> = [];

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      // Reserve center 3x3 for warm Ốm Sữa emblem
      if (row >= 9 && row <= 11 && col >= 9 && col <= 11) {
        continue;
      }

      const tl = isFinderCell(row, col, 0, 0);
      if (tl !== null) {
        if (tl) cells.push([col, row]);
        continue;
      }

      const tr = isFinderCell(row, col, 0, GRID_SIZE - 7);
      if (tr !== null) {
        if (tr) cells.push([col, row]);
        continue;
      }

      const bl = isFinderCell(row, col, GRID_SIZE - 7, 0);
      if (bl !== null) {
        if (bl) cells.push([col, row]);
        continue;
      }

      if (row === 6) {
        if (col % 2 === 0) cells.push([col, row]);
        continue;
      }
      if (col === 6) {
        if (row % 2 === 0) cells.push([col, row]);
        continue;
      }

      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      if ((state >>> 0) % 100 < 48) {
        cells.push([col, row]);
      }
    }
  }

  return cells;
}

export function VietQrTransferCard({
  amount,
  transferContent,
}: VietQrTransferCardProps) {
  const [copiedMemo, setCopiedMemo] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cells = useMemo(
    () => buildDeterministicQrCells(`${amount}:${transferContent}`),
    [amount, transferContent],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const isCopied = copiedMemo === transferContent;

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(transferContent);
      } else if (typeof document !== 'undefined') {
        const fallbackArea = document.createElement('textarea');
        fallbackArea.value = transferContent;
        fallbackArea.setAttribute('readonly', 'true');
        fallbackArea.style.position = 'fixed';
        fallbackArea.style.opacity = '0';
        document.body.appendChild(fallbackArea);
        fallbackArea.select();
        document.execCommand?.('copy');
        document.body.removeChild(fallbackArea);
      }
    } catch {
      // Ignore clipboard permission errors while still surfacing polite confirmation
    }

    setCopiedMemo(transferContent);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setCopiedMemo(null);
    }, 2500);
  }

  return (
    <div className="rounded-2xl border border-olive-primary/20 bg-surface-light p-4 shadow-2xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="mx-auto shrink-0 rounded-2xl border border-olive-primary/15 bg-canvas-cream p-2.5 sm:mx-0">
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-28 w-28"
            role="img"
            aria-label="Mã VietQR chuyển khoản Ốm Sữa"
          >
            <rect
              x="2"
              y="2"
              width="116"
              height="116"
              rx="14"
              fill="#F7F4EC"
              stroke="#594C00"
              strokeOpacity="0.22"
              strokeWidth="2"
            />
            {cells.map(([col, row], index) => (
              <rect
                key={index}
                x={9 + col * 4.85}
                y={9 + row * 4.85}
                width="4.1"
                height="4.1"
                rx="0.9"
                fill="#29261D"
              />
            ))}
            <rect
              x="51"
              y="51"
              width="18"
              height="18"
              rx="5"
              fill="#EEEADF"
              stroke="#594C00"
              strokeWidth="1.4"
            />
            <circle cx="60" cy="58.5" r="4" fill="#7A8B3B" />
            <circle cx="60" cy="64" r="2.2" fill="#D96B1E" />
          </svg>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5 text-xs sm:text-sm">
          <span className="inline-flex items-center rounded-full bg-card-butter px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-olive-primary uppercase">
            VIETQR • CHUYỂN KHOẢN NHANH 24/7
          </span>
          <p className="text-espresso">
            <span className="text-warm-muted">Ngân hàng:</span>{' '}
            <strong className="font-semibold">Vietcombank — CN Lâm Đồng</strong>
          </p>
          <p className="text-espresso">
            <span className="text-warm-muted">Chủ TK:</span>{' '}
            <strong className="font-semibold">OM SUA DA LAT</strong>
          </p>
          <p className="text-espresso">
            <span className="text-warm-muted">Số TK:</span>{' '}
            <strong className="font-bold tracking-wide text-olive-primary">
              0561 0005 20178
            </strong>
          </p>
          <p className="text-espresso">
            <span className="text-warm-muted">Số tiền CK:</span>{' '}
            <strong className="font-bold text-terracotta">
              {formatVnd(amount)}
            </strong>
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-olive-primary/15 bg-card-butter/65 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="block text-[11px] font-semibold text-warm-muted">
            Nội dung chuyển khoản:
          </span>
          <code className="mt-0.5 block truncate font-sans text-xs font-bold text-olive-primary sm:text-sm">
            {transferContent}
          </code>
        </div>

        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-olive-primary/25 bg-surface-light px-3.5 py-2 text-xs font-bold text-olive-primary shadow-2xs transition hover:bg-canvas-cream"
        >
          <span aria-live="polite">
            {isCopied ? '✓ Đã sao chép' : 'Sao chép nội dung CK'}
          </span>
        </button>
      </div>
    </div>
  );
}

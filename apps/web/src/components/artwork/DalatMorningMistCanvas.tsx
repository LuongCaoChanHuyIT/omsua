'use client';

import { useEffect, useRef, useState } from 'react';

export interface DalatMorningMistCanvasProps {
  seed?: number;
  className?: string;
  defaultPaused?: boolean;
}

interface MistParticle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  phase: number;
  color: string;
}

const GOLDEN_ANGLE_RAD = 2.399963229728653;

const MIST_PALETTE = [
  'rgba(244, 227, 173, 0.26)',
  'rgba(122, 139, 59, 0.30)',
  'rgba(200, 186, 155, 0.22)',
  'rgba(217, 107, 30, 0.20)',
] as const;

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createParticles(
  seed: number,
  width: number,
  height: number,
): MistParticle[] {
  const rand = mulberry32(seed);
  return Array.from({ length: 36 }, (_, index) => ({
    x: rand() * width,
    y: rand() * height,
    radius: 1.4 + rand() * 3.2,
    speed: 0.18 + rand() * 0.38,
    phase: index * GOLDEN_ANGLE_RAD,
    color: MIST_PALETTE[index % MIST_PALETTE.length]!,
  }));
}

export function DalatMorningMistCanvas({
  seed = 2017,
  className = '',
  defaultPaused = false,
}: DalatMorningMistCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(defaultPaused);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () => {
      if (
        typeof window === 'undefined' ||
        typeof window.matchMedia !== 'function'
      ) {
        return false;
      }
      return (
        window.matchMedia('(prefers-reduced-motion: reduce)')?.matches ?? false
      );
    },
  );
  const [isInView, setIsInView] = useState<boolean>(true);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) {
      return;
    }
    setPrefersReducedMotion(Boolean(mediaQuery.matches));

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    return undefined;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (
      !canvas ||
      typeof window === 'undefined' ||
      typeof window.IntersectionObserver !== 'function'
    ) {
      return;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isPaused || !isInView) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const isUnpatchedJsdom =
      typeof navigator !== 'undefined' &&
      /jsdom/i.test(navigator.userAgent) &&
      !('mock' in canvas.getContext);
    if (isUnpatchedJsdom) {
      return;
    }

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      ctx = null;
    }
    if (!ctx) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const particles = createParticles(seed, width, height);
    let tick = 0;
    let rafId = 0;

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);
      tick += 0.012;

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i]!;
        const wave =
          Math.sin(p.x * 0.007 + tick + p.phase) * 0.5 +
          Math.cos(p.y * 0.011 - tick * 0.7) * 0.35;
        p.x = (p.x + Math.cos(wave) * p.speed + width) % width;
        p.y = (p.y + Math.sin(wave) * p.speed * 0.65 + height) % height;

        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.radius * 0.9;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - Math.cos(wave) * 18, p.y - Math.sin(wave) * 9);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);
    return () => window.cancelAnimationFrame(rafId);
  }, [isInView, isPaused, prefersReducedMotion, seed]);

  return (
    <>
      {prefersReducedMotion ? (
        <svg
          data-reduced-motion="true"
          aria-hidden="true"
          viewBox="0 0 640 360"
          fill="none"
          preserveAspectRatio="none"
          className={`pointer-events-none absolute inset-0 h-full w-full opacity-35 ${className}`}
        >
          <path
            d="M-20 92C110 58 230 128 360 94C490 60 560 108 660 82"
            stroke="#F4E3AD"
            strokeOpacity="0.28"
            strokeWidth="2"
          />
          <path
            d="M-20 198C130 164 260 226 400 188C510 158 585 204 660 184"
            stroke="#7A8B3B"
            strokeOpacity="0.34"
            strokeWidth="2"
          />
          <path
            d="M-20 288C120 256 275 308 420 276C535 250 595 286 660 268"
            stroke="#C8BA9B"
            strokeOpacity="0.22"
            strokeWidth="1.5"
          />
        </svg>
      ) : (
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 h-full w-full opacity-75 ${className}`}
        />
      )}

      <div className="relative z-10 mb-2.5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-card-butter/90">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-artichoke"
          />
          <span>Món tiêu biểu • Sương sớm Cầu Đất</span>
        </span>

        {!prefersReducedMotion && (
          <button
            type="button"
            aria-pressed={isPaused}
            aria-label={
              isPaused
                ? 'Bật hiệu ứng sương sớm'
                : 'Tạm dừng hiệu ứng sương sớm'
            }
            onClick={() => setIsPaused((prev) => !prev)}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-surface-light/18 bg-surface-light/10 px-3 py-1.5 text-xs font-semibold text-card-butter transition-colors hover:bg-surface-light/18"
          >
            {isPaused ? '▸ Sương sớm' : '❚❚ Sương sớm'}
          </button>
        )}
      </div>
    </>
  );
}

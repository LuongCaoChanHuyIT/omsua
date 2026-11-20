// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DalatMorningMistCanvas } from './DalatMorningMistCanvas';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  cleanup();
});

describe('DalatMorningMistCanvas seeded flow-field & a11y safety', () => {
  it('renders safely when 2D canvas context is unavailable (JSDOM) and toggles accessible pause/play state', () => {
    const { container } = render(<DalatMorningMistCanvas seed={2017} />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute('aria-hidden', 'true');

    const toggleBtn = screen.getByRole('button', {
      name: 'Tạm dừng hiệu ứng sương sớm',
    });
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(toggleBtn.className).toContain('min-h-11');

    fireEvent.click(toggleBtn);

    const playBtn = screen.getByRole('button', {
      name: 'Bật hiệu ứng sương sớm',
    });
    expect(playBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders static botanical mist SVG and schedules zero requestAnimationFrame ticks when prefers-reduced-motion is reduce', () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    const { container } = render(<DalatMorningMistCanvas seed={2017} />);

    expect(
      container.querySelector('[data-reduced-motion="true"]'),
    ).not.toBeNull();
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it('defers requestAnimationFrame kickoff until post-paint idle/timer and draws deterministic mist ribbons and motes when active', () => {
    vi.useFakeTimers();
    try {
      const strokeSpy = vi.fn();
      const fillSpy = vi.fn();
      const mockCtx = {
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: strokeSpy,
        arc: vi.fn(),
        fill: fillSpy,
        strokeStyle: '',
        fillStyle: '',
        lineWidth: 1,
      } as unknown as CanvasRenderingContext2D;

      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
        (() => mockCtx) as unknown as typeof HTMLCanvasElement.prototype.getContext,
      );

      let frameCallback: FrameRequestCallback | null = null;
      const rafSpy = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((cb) => {
          if (!frameCallback) {
            frameCallback = cb;
          }
          return 1;
        });

      render(<DalatMorningMistCanvas seed={2017} />);
      // Zero RAF calls synchronously during LCP paint!
      expect(rafSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(150);
      expect(frameCallback).not.toBeNull();
      frameCallback!(16);
      expect(strokeSpy).toHaveBeenCalledTimes(36);
      expect(fillSpy).toHaveBeenCalledTimes(36);
    } finally {
      vi.useRealTimers();
    }
  });

  it('hydrates SSR markup cleanly without mismatch when prefers-reduced-motion is reduce on the client', async () => {
    const ssrHtml = renderToString(<DalatMorningMistCanvas seed={2017} />);

    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    const host = document.createElement('div');
    host.innerHTML = ssrHtml;
    document.body.appendChild(host);

    const recoverableErrors: unknown[] = [];
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    let root: ReturnType<typeof hydrateRoot> | null = null;
    try {
      await act(async () => {
        root = hydrateRoot(host, <DalatMorningMistCanvas seed={2017} />, {
          onRecoverableError: (err) => recoverableErrors.push(err),
        });
      });

      expect(recoverableErrors).toEqual([]);
      expect(host.querySelector('[data-reduced-motion="true"]')).not.toBeNull();
      expect(rafSpy).not.toHaveBeenCalled();
    } finally {
      await act(async () => {
        root?.unmount();
      });
      host.remove();
    }
  });

  it('responds to pointer-breeze deflection without calling getBoundingClientRect and stays inert under prefers-reduced-motion', () => {
    vi.useFakeTimers();
    try {
      const rectSpy = vi
        .spyOn(Element.prototype, 'getBoundingClientRect')
        .mockReturnValue({
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          toJSON: () => ({}),
        } as DOMRect);

      const moveToPoints: Array<[number, number]> = [];
      const mockCtx = {
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn((x: number, y: number) => {
          moveToPoints.push([x, y]);
        }),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        strokeStyle: '',
        fillStyle: '',
        lineWidth: 1,
      } as unknown as CanvasRenderingContext2D;

      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
        (() => mockCtx) as unknown as typeof HTMLCanvasElement.prototype.getContext,
      );

      let latestRaf: FrameRequestCallback | null = null;
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        latestRaf = cb;
        return 1;
      });

      // Baseline frame without pointer breeze
      const baseline = render(<DalatMorningMistCanvas seed={2017} />);
      vi.advanceTimersByTime(150);
      latestRaf!(16);
      const baselineFirstPoint = moveToPoints[0]!;
      baseline.unmount();

      // Active pointer-breeze frame bubbling from nested child in right-column stage (left: 600, clientX: 600 -> left edge nx = -1, deflecting left)
      let ioCallback: IntersectionObserverCallback = () => {};
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor(cb: IntersectionObserverCallback) {
            ioCallback = cb;
          }
          observe() {}
          disconnect() {}
          unobserve() {}
          takeRecords() {
            return [];
          }
        },
      );

      moveToPoints.length = 0;
      latestRaf = null;
      const { container, unmount } = render(
        <div data-testid="mist-host">
          <DalatMorningMistCanvas seed={2017} />
          <div data-testid="nested-spotlight-card">Card</div>
        </div>,
      );
      ioCallback(
        [
          {
            isIntersecting: true,
            boundingClientRect: {
              left: 600,
              top: 200,
              width: 640,
              height: 360,
            } as DOMRectReadOnly,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );

      const canvas = container.querySelector('canvas')!;
      const nestedCard = screen.getByTestId('nested-spotlight-card');
      nestedCard.dispatchEvent(
        new MouseEvent('pointermove', {
          bubbles: true,
          clientX: 600,
          clientY: 220,
        }),
      );
      expect(canvas).toHaveAttribute('data-breeze-active', 'true');

      vi.advanceTimersByTime(150);
      latestRaf!(16);
      const breezedFirstPoint = moveToPoints[0]!;

      // Left edge of stage (nx = -1) must deflect particle LEFT relative to baseline (not right from viewport clientX=600)
      expect(breezedFirstPoint[0]).toBeLessThan(baselineFirstPoint[0] - 0.05);
      fireEvent.pointerLeave(container.querySelector('[data-testid="mist-host"]')!);
      expect(canvas).toHaveAttribute('data-breeze-active', 'false');
      expect(rectSpy).not.toHaveBeenCalled();
      unmount();
    } finally {
      vi.useRealTimers();
    }
  });
});

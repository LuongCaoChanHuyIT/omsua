// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
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

  it('draws deterministic mist ribbons and motes onto a 2D context when active', () => {
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
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      if (!frameCallback) {
        frameCallback = cb;
      }
      return 1;
    });

    render(<DalatMorningMistCanvas seed={2017} />);
    expect(frameCallback).not.toBeNull();
    frameCallback!(16);
    expect(strokeSpy).toHaveBeenCalledTimes(36);
    expect(fillSpy).toHaveBeenCalledTimes(36);
  });
});

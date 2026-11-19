// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { startTransition, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AppViewTransition,
  addAppTransitionType,
  resolveViewTransitionRuntime,
} from './AppViewTransition';

afterEach(() => {
  cleanup();
});

describe('AppViewTransition isomorphic runtime bridge', () => {
  it('prefers stable ViewTransition & addTransitionType when present (React 19.3+)', () => {
    const addSpy = vi.fn();
    function MockStableVT({
      children,
      name,
    }: {
      children?: ReactNode;
      name?: string;
    }) {
      return <div data-stable-vt={name ?? 'unnamed'}>{children}</div>;
    }

    const runtime = resolveViewTransitionRuntime({
      ViewTransition: MockStableVT,
      addTransitionType: addSpy,
      unstable_ViewTransition: () => null,
      unstable_addTransitionType: vi.fn(),
    });

    const { container } = render(
      <runtime.Component name="hero-cup">
        <span>Trà Sữa Atiso</span>
      </runtime.Component>,
    );
    expect(container.querySelector('[data-stable-vt="hero-cup"]')).not.toBeNull();
    runtime.addType('nav-forward');
    expect(addSpy).toHaveBeenCalledWith('nav-forward');
  });

  it('falls back to unstable_ViewTransition & unstable_addTransitionType (Next.js 15.5 react-experimental)', () => {
    const unstableAddSpy = vi.fn();
    function MockUnstableVT({
      children,
      share,
    }: {
      children?: ReactNode;
      share?: string;
    }) {
      return <div data-unstable-share={share}>{children}</div>;
    }

    const runtime = resolveViewTransitionRuntime({
      unstable_ViewTransition: MockUnstableVT,
      unstable_addTransitionType: unstableAddSpy,
    });

    const { container } = render(
      <runtime.Component share="morph">
        <span>Quýt Nhài</span>
      </runtime.Component>,
    );
    expect(container.querySelector('[data-unstable-share="morph"]')).not.toBeNull();
    runtime.addType('lightbox-next');
    expect(unstableAddSpy).toHaveBeenCalledWith('lightbox-next');
  });

  it('degrades gracefully to Fragment + no-op when neither channel exposes ViewTransition', () => {
    const runtime = resolveViewTransitionRuntime({});
    render(
      <runtime.Component name="missing-vt" share="morph" default="none">
        <span>Fallback Safe</span>
      </runtime.Component>,
    );
    expect(screen.getByText('Fallback Safe')).toBeInTheDocument();
    expect(() => runtime.addType('nav-back')).not.toThrow();

    render(
      <AppViewTransition name="live-vt" share="morph" default="none">
        <span>Live Bridge Child</span>
      </AppViewTransition>,
    );
    expect(screen.getByText('Live Bridge Child')).toBeInTheDocument();
    expect(() =>
      startTransition(() => {
        addAppTransitionType('test-type');
      }),
    ).not.toThrow();
  });
});

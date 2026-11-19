import * as ReactNamespace from 'react';
import {
  Fragment,
  startTransition,
  type ComponentType,
  type JSX,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export type ViewTransitionClassValue =
  | string
  | { readonly default: string; readonly [transitionType: string]: string };

export interface AppViewTransitionProps {
  children?: ReactNode;
  name?: string;
  default?: ViewTransitionClassValue;
  enter?: ViewTransitionClassValue;
  exit?: ViewTransitionClassValue;
  share?: ViewTransitionClassValue;
  update?: ViewTransitionClassValue;
}

function FallbackViewTransition({
  children,
}: AppViewTransitionProps): JSX.Element {
  return <Fragment>{children}</Fragment>;
}

const noopAddType = (_type: string): void => {};

function isUsableReactBoundary(candidate: unknown): boolean {
  return (
    Boolean(candidate) &&
    (typeof candidate === 'function' ||
      typeof candidate === 'symbol' ||
      typeof candidate === 'object')
  );
}

export function resolveViewTransitionRuntime(
  reactModule: Record<string, unknown>,
): {
  Component: ComponentType<AppViewTransitionProps>;
  addType: (type: string) => void;
} {
  const stableVT = reactModule['ViewTransition'];
  const unstableVT = reactModule['unstable_ViewTransition'];

  const Component = (
    isUsableReactBoundary(stableVT)
      ? stableVT
      : isUsableReactBoundary(unstableVT)
        ? unstableVT
        : FallbackViewTransition
  ) as ComponentType<AppViewTransitionProps>;

  const stableAddType = reactModule['addTransitionType'];
  const unstableAddType = reactModule['unstable_addTransitionType'];

  const addType = (
    typeof stableAddType === 'function'
      ? stableAddType
      : typeof unstableAddType === 'function'
        ? unstableAddType
        : noopAddType
  ) as (type: string) => void;

  return { Component, addType };
}

const activeRuntime = resolveViewTransitionRuntime(
  ReactNamespace as unknown as Record<string, unknown>,
);

export function AppViewTransition(props: AppViewTransitionProps): JSX.Element {
  const Underlying = activeRuntime.Component;
  return <Underlying {...props} />;
}

export function addAppTransitionType(type: string): void {
  activeRuntime.addType(type);
}

export function DirectionalPageTransition({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <AppViewTransition
      enter={{
        'nav-forward': 'nav-forward',
        'nav-back': 'nav-back',
        default: 'none',
      }}
      exit={{
        'nav-forward': 'nav-forward',
        'nav-back': 'nav-back',
        default: 'none',
      }}
      default="none"
    >
      {children}
    </AppViewTransition>
  );
}

const ORDERED_ADMIN_ROUTES = ['/', '/menu', '/branches', '/settings'] as const;

function getAdminRouteIndex(pathname: string): number {
  const normalized =
    pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const idx = ORDERED_ADMIN_ROUTES.indexOf(
    normalized as (typeof ORDERED_ADMIN_ROUTES)[number],
  );
  return idx >= 0 ? idx : 0;
}

export interface DirectionalNavLinkProps {
  to: string;
  end?: boolean;
  children: ReactNode;
  className: (state: { isActive: boolean }) => string;
}

export function DirectionalNavLink({
  to,
  end = false,
  children,
  className,
}: DirectionalNavLinkProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = end
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(`${to}/`);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    if (location.pathname === to) {
      return;
    }

    const currentIdx = getAdminRouteIndex(location.pathname);
    const targetIdx = getAdminRouteIndex(to);
    const direction = targetIdx >= currentIdx ? 'nav-forward' : 'nav-back';

    startTransition(() => {
      addAppTransitionType(direction);
      navigate(to);
    });
  }

  return (
    <Link
      to={to}
      aria-current={isActive ? 'page' : undefined}
      onClick={handleClick}
      className={className({ isActive })}
    >
      {children}
    </Link>
  );
}

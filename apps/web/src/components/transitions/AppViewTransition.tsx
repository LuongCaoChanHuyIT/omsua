'use client';

import * as ReactNamespace from 'react';
import {
  Fragment,
  type ComponentType,
  type JSX,
  type ReactNode,
} from 'react';

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

function FallbackViewTransition({ children }: AppViewTransitionProps): JSX.Element {
  return <Fragment>{children}</Fragment>;
}

const noopAddType: (type: string) => void = () => {};

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

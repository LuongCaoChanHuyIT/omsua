'use client';

import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface UseModalAccessibilityOptions {
  isOpen: boolean;
  onClose: () => void;
  isCloseDisabled?: boolean;
  restoreFocusRef?: RefObject<boolean>;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

let activeScrollLockCount = 0;
let savedBodyOverflow = '';

function lockBodyScroll() {
  if (typeof document === 'undefined') {
    return;
  }
  if (activeScrollLockCount === 0) {
    savedBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  activeScrollLockCount += 1;
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') {
    return;
  }
  activeScrollLockCount = Math.max(0, activeScrollLockCount - 1);
  if (activeScrollLockCount === 0) {
    document.body.style.overflow = savedBodyOverflow;
  }
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
  return nodes.filter(
    (node) =>
      !node.hasAttribute('disabled') &&
      node.getAttribute('aria-hidden') !== 'true',
  );
}

export function useModalAccessibility<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  isCloseDisabled = false,
  restoreFocusRef,
}: UseModalAccessibilityOptions): RefObject<T | null> {
  const dialogRef = useRef<T | null>(null);
  const onCloseRef = useRef<() => void>(onClose);
  const isCloseDisabledRef = useRef<boolean>(isCloseDisabled);

  useIsomorphicLayoutEffect(() => {
    onCloseRef.current = onClose;
    isCloseDisabledRef.current = isCloseDisabled;
  }, [isCloseDisabled, onClose]);

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    lockBodyScroll();

    const dialogNode = dialogRef.current;
    if (dialogNode && !dialogNode.contains(document.activeElement)) {
      const focusables = getFocusableElements(dialogNode);
      if (focusables.length > 0) {
        focusables[0]?.focus();
      } else {
        dialogNode.focus();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (!isCloseDisabledRef.current) {
          event.preventDefault();
          onCloseRef.current();
        }
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const currentDialog = dialogRef.current;
      if (!currentDialog) {
        return;
      }

      const focusables = getFocusableElements(currentDialog);
      if (focusables.length === 0) {
        event.preventDefault();
        currentDialog.focus();
        return;
      }

      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !currentDialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !currentDialog.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unlockBodyScroll();
      const shouldRestore = restoreFocusRef ? restoreFocusRef.current : true;
      if (shouldRestore && previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, restoreFocusRef]);

  return dialogRef;
}

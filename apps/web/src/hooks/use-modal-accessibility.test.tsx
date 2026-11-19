// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useModalAccessibility } from './use-modal-accessibility';

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

function TestDialog({
  isOpen,
  onClose,
  isCloseDisabled = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  isCloseDisabled?: boolean;
}) {
  const [text, setText] = useState('');
  const dialogRef = useModalAccessibility<HTMLDivElement>({
    isOpen,
    onClose,
    isCloseDisabled,
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1}>
      <button type="button">Nút đóng đầu</button>
      <input
        aria-label="Ô nhập nội dung"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button type="button" disabled>
        Nút bị khóa
      </button>
      <button type="button">Nút xác nhận cuối</button>
    </div>
  );
}

describe('useModalAccessibility hook', () => {
  it('moves initial focus into dialog, locks body overflow, and restores focus + overflow on close', () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button type="button" onClick={() => setOpen(true)}>
            Mở hộp thoại
          </button>
          <TestDialog isOpen={open} onClose={() => setOpen(false)} />
        </div>
      );
    }

    render(<Harness />);
    const triggerBtn = screen.getByRole('button', { name: 'Mở hộp thoại' });
    triggerBtn.focus();
    expect(document.activeElement).toBe(triggerBtn);
    expect(document.body.style.overflow).toBe('');

    fireEvent.click(triggerBtn);

    expect(document.body.style.overflow).toBe('hidden');
    const firstBtn = screen.getByRole('button', { name: 'Nút đóng đầu' });
    expect(document.activeElement).toBe(firstBtn);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(triggerBtn);
  });

  it('does not steal focus on subsequent re-renders when typing in an input with inline onClose', () => {
    function ReRenderHarness() {
      const [count, setCount] = useState(0);
      return (
        <div>
          <button type="button" onClick={() => setCount((c) => c + 1)}>
            Tăng bộ đếm ({count})
          </button>
          <TestDialog isOpen={true} onClose={() => setCount((c) => c + 1)} />
        </div>
      );
    }

    const { rerender } = render(<ReRenderHarness />);
    const input = screen.getByLabelText('Ô nhập nội dung');
    input.focus();
    expect(document.activeElement).toBe(input);

    fireEvent.change(input, { target: { value: 'OM-20261119-AB12' } });
    rerender(<ReRenderHarness />);

    expect(document.activeElement).toBe(input);
  });

  it('traps Tab and Shift+Tab across enabled focusable descendants inside dialog', () => {
    render(<TestDialog isOpen={true} onClose={vi.fn()} />);

    const firstBtn = screen.getByRole('button', { name: 'Nút đóng đầu' });
    const lastBtn = screen.getByRole('button', { name: 'Nút xác nhận cuối' });

    lastBtn.focus();
    expect(document.activeElement).toBe(lastBtn);

    const tabForwardEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(tabForwardEvent);
    expect(tabForwardEvent.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(firstBtn);

    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(shiftTabEvent);
    expect(shiftTabEvent.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(lastBtn);
  });

  it('respects isCloseDisabled on Escape and cleans up body scroll lock on unmount', () => {
    const onClose = vi.fn();
    const { rerender, unmount } = render(
      <TestDialog isOpen={true} onClose={onClose} isCloseDisabled={true} />,
    );

    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();

    rerender(
      <TestDialog isOpen={true} onClose={onClose} isCloseDisabled={false} />,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});

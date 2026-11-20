import '@testing-library/jest-dom/vitest';
import { OMSUA_BRANCHES } from '@omsua/shared';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RECENT_ORDERS_STORAGE_KEY } from '@/lib/recent-orders';
import { CareersAndFranchiseSection } from './CareersAndFranchiseSection';
import { MemberClubSection } from './MemberClubSection';
import { NewsSeasonSection } from './NewsSeasonSection';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('Flagship Brand Hubs (#tin-tuc, #thanh-vien, #tuyen-dung, #nhuong-quyen)', () => {
  it('filters NewsSeasonSection articles, opens aria-modal reader dialog calling onModalOpenChange, and restores focus on Escape', () => {
    const onModalOpenChange = vi.fn();
    const { container } = render(
      <NewsSeasonSection onModalOpenChange={onModalOpenChange} />,
    );

    const section = container.querySelector('#tin-tuc');
    expect(section).not.toBeNull();
    expect(
      screen.getByRole('heading', {
        name: /Mùa Sương Sớm Cầu Đất: Búp Atiso Xanh Hội Ngộ Chuối Laba Dẻo/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Tặng Túi Tote Vải Mộc/i,
      }),
    ).toBeInTheDocument();

    const promoBtn = screen.getByRole('button', {
      name: /Ưu đãi & Sự kiện/i,
    });
    fireEvent.click(promoBtn);
    expect(promoBtn).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.queryByRole('heading', {
        name: /Mùa Sương Sớm Cầu Đất: Búp Atiso Xanh Hội Ngộ Chuối Laba Dẻo/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Tặng Túi Tote Vải Mộc/i,
      }),
    ).toBeInTheDocument();

    const detailButtons = screen.getAllByRole('button', {
      name: /Đọc chi tiết/i,
    });
    const firstDetailBtn = detailButtons[0]!;
    firstDetailBtn.focus();
    fireEvent.click(firstDetailBtn);

    expect(onModalOpenChange).toHaveBeenCalledWith(true);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(
      within(dialog).getByText(/Góp phần giảm túi nhựa dùng một lần/i),
    ).toBeInTheDocument();

    // Tab focus trap wraps from last focusable ("Đặt món ngay →") back to first ("Đóng")
    const closeBtn = within(dialog).getByRole('button', { name: 'Đóng' });
    const orderNowLink = within(dialog).getByRole('link', {
      name: /Đặt món ngay/i,
    });
    orderNowLink.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(closeBtn);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onModalOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(firstDetailBtn);

    // Clicking "Đặt món ngay →" closes modal WITHOUT yanking focus back to firstDetailBtn
    fireEvent.click(firstDetailBtn);
    const reopenedDialog = screen.getByRole('dialog');
    const reopenedCta = within(reopenedDialog).getByRole('link', {
      name: /Đặt món ngay/i,
    });
    reopenedCta.focus();
    fireEvent.click(reopenedCta);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).not.toBe(firstDetailBtn);
  });

  it('validates Vietnam mobile numbers in MemberClubSection, computes 600 points (Hạng Sương Sớm) excluding cancelled/other-phone/unphoned orders, and preserves unsaved edits across recentOrdersVersion bumps', () => {
    window.localStorage.setItem(
      RECENT_ORDERS_STORAGE_KEY,
      JSON.stringify([
        {
          orderCode: 'OM-20261120-MB01',
          branchName: 'Cơ sở 1 — Hoàng Diệu',
          grandTotal: 550000,
          totalItems: 10,
          paymentMethod: 'qr',
          status: 'completed',
          createdAt: '2026-11-20T03:00:00.000Z',
          customerPhone: '0905123456',
        },
        {
          orderCode: 'OM-20261120-OTHER',
          branchName: 'Cơ sở 2 — Hẻm 33 Nguyễn Công Trứ',
          grandTotal: 300000,
          totalItems: 6,
          paymentMethod: 'cod',
          status: 'completed',
          createdAt: '2026-11-20T03:05:00.000Z',
          customerPhone: '0988777666',
        },
        {
          orderCode: 'OM-20261120-CANC',
          branchName: 'Cơ sở 1 — Hoàng Diệu',
          grandTotal: 200000,
          totalItems: 4,
          paymentMethod: 'cod',
          status: 'cancelled',
          createdAt: '2026-11-20T03:10:00.000Z',
          customerPhone: '0905123456',
        },
        {
          orderCode: 'OM-20261120-NO-PHONE',
          branchName: 'Cơ sở 1 — Hoàng Diệu',
          grandTotal: 400000,
          totalItems: 8,
          paymentMethod: 'cod',
          status: 'completed',
          createdAt: '2026-11-20T03:12:00.000Z',
        },
      ]),
    );

    const { container, rerender, unmount } = render(
      <MemberClubSection recentOrdersVersion={0} />,
    );
    expect(container.querySelector('#thanh-vien')).not.toBeNull();

    const nameInput = screen.getByLabelText(/Họ và tên thành viên/i);
    const phoneInput = screen.getByLabelText(/Số điện thoại tích điểm/i);
    const submitBtn = screen.getByRole('button', {
      name: /Tra cứu \/ Mở thẻ thành viên/i,
    });

    // Reject invalid phone
    fireEvent.change(nameInput, { target: { value: 'Nguyễn Minh Anh' } });
    fireEvent.change(phoneInput, { target: { value: '12345' } });
    fireEvent.click(submitBtn);
    expect(screen.getByRole('alert')).toHaveTextContent(
      /Số điện thoại gồm 10 chữ số bắt đầu bằng 0/i,
    );

    // Valid enrollment with spaces in phone -> normalizes to 0905123456, 550 order pts + 50 welcome pts = 600 pts -> Hạng Sương Sớm
    fireEvent.change(phoneInput, { target: { value: '0905 123 456' } });
    fireEvent.click(submitBtn);

    const cardRegion = screen.getByTestId('member-card-preview');
    expect(within(cardRegion).getByText('600 điểm')).toBeInTheDocument();
    expect(within(cardRegion).getByText('Hạng Sương Sớm')).toBeInTheDocument();
    expect(within(cardRegion).getByText(/Nguyễn Minh Anh/)).toBeInTheDocument();

    // User starts typing a new name while a background order refresh bumps recentOrdersVersion -> must NOT overwrite unsaved nameInput
    fireEvent.change(nameInput, { target: { value: 'Nguyễn Minh Anh (Đang sửa)' } });
    rerender(<MemberClubSection recentOrdersVersion={1} />);
    expect(nameInput).toHaveValue('Nguyễn Minh Anh (Đang sửa)');

    unmount();

    // Remount -> restores saved member profile from localStorage automatically
    render(<MemberClubSection />);
    const restoredRegion = screen.getByTestId('member-card-preview');
    expect(within(restoredRegion).getByText('600 điểm')).toBeInTheDocument();
    expect(
      within(restoredRegion).getByText('Hạng Sương Sớm'),
    ).toBeInTheDocument();
  });

  it('pre-selects career role on card click and validates recruitment & franchise forms in CareersAndFranchiseSection', () => {
    const { container } = render(
      <CareersAndFranchiseSection branches={OMSUA_BRANCHES} />,
    );

    const careersSection = container.querySelector('#tuyen-dung') as HTMLElement;
    const franchiseSection = container.querySelector(
      '#nhuong-quyen',
    ) as HTMLElement;
    expect(careersSection).not.toBeNull();
    expect(franchiseSection).not.toBeNull();

    // Click "Ứng tuyển vị trí này" on Cửa hàng trưởng card -> updates role select value
    const leaderCard = within(careersSection)
      .getByRole('heading', {
        name: /Cửa hàng trưởng \/ Giám sát Ca Vận hành/i,
      })
      .closest('article')!;
    fireEvent.click(
      within(leaderCard).getByRole('button', {
        name: /Ứng tuyển vị trí này/i,
      }),
    );

    const roleSelect = within(careersSection).getByLabelText(
      /Vị trí ứng tuyển/i,
    ) as HTMLSelectElement;
    expect(roleSelect.value).toBe('cua-hang-truong');
    expect(roleSelect.querySelector('option')?.className).toContain(
      'bg-surface-light',
    );
    expect(roleSelect.querySelector('option')?.className).toContain(
      'text-espresso',
    );

    // Invalid empty submit shows alert
    fireEvent.click(
      within(careersSection).getByRole('button', {
        name: /Gửi hồ sơ ứng tuyển/i,
      }),
    );
    expect(within(careersSection).getByRole('alert')).toBeInTheDocument();

    // Valid career application
    fireEvent.change(within(careersSection).getByLabelText(/Họ và tên ứng viên/i), {
      target: { value: 'Lê Hoàng Nam' },
    });
    fireEvent.change(
      within(careersSection).getByLabelText(/Số điện thoại liên hệ/i),
      { target: { value: '0945396117' } },
    );
    fireEvent.click(
      within(careersSection).getByRole('button', {
        name: /Gửi hồ sơ ứng tuyển/i,
      }),
    );
    expect(
      within(careersSection).getByText(/Đã ghi nhận thông tin ứng tuyển/i),
    ).toBeInTheDocument();

    // Franchise inquiry validation & valid submit
    fireEvent.click(
      within(franchiseSection).getByRole('button', {
        name: /Đăng ký nhận hồ sơ nhượng quyền/i,
      }),
    );
    expect(within(franchiseSection).getByRole('alert')).toBeInTheDocument();

    fireEvent.change(within(franchiseSection).getByLabelText(/Họ và tên đối tác/i), {
      target: { value: 'Trần Bảo Châu' },
    });
    fireEvent.change(
      within(franchiseSection).getByLabelText(/Số điện thoại đối tác/i),
      { target: { value: '0912345678' } },
    );
    fireEvent.change(
      within(franchiseSection).getByLabelText(/Tỉnh \/ Thành phố dự kiến mở quán/i),
      { target: { value: 'Bảo Lộc, Lâm Đồng' } },
    );
    fireEvent.click(
      within(franchiseSection).getByRole('button', {
        name: /Đăng ký nhận hồ sơ nhượng quyền/i,
      }),
    );
    expect(
      within(franchiseSection).getByText(/Đã tiếp nhận yêu cầu tư vấn nhượng quyền/i),
    ).toBeInTheDocument();
  });
});

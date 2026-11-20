'use client';

import { formatVnd } from '@omsua/shared';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { readRecentOrders, type RecentOrderSummary } from '@/lib/recent-orders';
import {
  MEMBER_PROFILE_STORAGE_KEY,
  OMSUA_MEMBER_TIERS,
  computeMemberStatus,
  isValidVietnamPhone,
  normalizeVietnamPhone,
  type SavedMemberProfile,
} from './header-nav-config';

export interface MemberClubSectionProps {
  recentOrdersVersion?: number;
}

function readSavedMemberProfile(): SavedMemberProfile | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(MEMBER_PROFILE_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<SavedMemberProfile>;
    if (
      typeof parsed?.name === 'string' &&
      typeof parsed?.phone === 'string' &&
      isValidVietnamPhone(parsed.phone)
    ) {
      return {
        name: parsed.name.trim() || 'Khách thân thiết Nhà Ốm',
        phone: normalizeVietnamPhone(parsed.phone),
        favoriteDrink:
          typeof parsed.favoriteDrink === 'string' && parsed.favoriteDrink
            ? parsed.favoriteDrink
            : 'Dòng Trà Sữa Atiso nguyên bản',
        joinedAt:
          typeof parsed.joinedAt === 'string'
            ? parsed.joinedAt
            : new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function MemberClubSection({
  recentOrdersVersion = 0,
}: MemberClubSectionProps = {}) {
  const [nameInput, setNameInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [favoriteDrink, setFavoriteDrink] = useState<string>(
    'Dòng Trà Sữa Atiso nguyên bản',
  );
  const [savedProfile, setSavedProfile] = useState<SavedMemberProfile | null>(
    null,
  );
  const [recentOrders, setRecentOrders] = useState<RecentOrderSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const existing = readSavedMemberProfile();
    if (existing) {
      setSavedProfile(existing);
      setNameInput(existing.name);
      setPhoneInput(existing.phone);
      setFavoriteDrink(existing.favoriteDrink);
    }
    setRecentOrders(readRecentOrders());
  }, [recentOrdersVersion]);

  const memberStats = useMemo(() => {
    const targetPhone = savedProfile?.phone ?? phoneInput;
    if (!isValidVietnamPhone(targetPhone)) {
      return null;
    }
    return computeMemberStatus(targetPhone, recentOrders, savedProfile);
  }, [phoneInput, recentOrders, savedProfile]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidVietnamPhone(phoneInput)) {
      setErrorMessage(
        'Vui lòng nhập số điện thoại gồm 10 chữ số bắt đầu bằng 0 (ví dụ: 0905123456).',
      );
      return;
    }

    const normalizedPhone = normalizeVietnamPhone(phoneInput);
    const trimmedName = nameInput.trim() || 'Khách thân thiết Nhà Ốm';
    const nextProfile: SavedMemberProfile = {
      name: trimmedName,
      phone: normalizedPhone,
      favoriteDrink,
      joinedAt: savedProfile?.joinedAt ?? new Date().toISOString(),
    };

    setErrorMessage(null);
    setSavedProfile(nextProfile);
    setPhoneInput(normalizedPhone);
    setRecentOrders(readRecentOrders());

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          MEMBER_PROFILE_STORAGE_KEY,
          JSON.stringify(nextProfile),
        );
      } catch {
        // Ignore storage quota errors cleanly
      }
    }
  };

  return (
    <section
      id="thanh-vien"
      className="scroll-mt-32 rounded-3xl bg-hero-espresso p-6 text-surface-light shadow-paper-lift sm:p-8 lg:p-10"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-card-butter px-3.5 py-1 text-xs font-bold tracking-wider text-olive-primary uppercase">
              ✦ THÀNH VIÊN NHÀ ỐM • TÍCH ĐIỂM SỐ ĐIỆN THOẠI
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight text-card-butter sm:text-3xl">
              Thẻ Ấm Sương Sớm — Đặc quyền Người Yêu Trà Đà Lạt
            </h2>
            <p className="text-xs leading-relaxed text-[#DDD6C5] sm:text-sm">
              Mỗi <strong className="text-card-butter">1.000đ</strong> đặt món
              tương đương <strong className="text-card-butter">1 điểm</strong>{' '}
              tích lũy tự động theo số điện thoại nhận hàng, cộng ngay{' '}
              <strong className="text-card-butter">+50 điểm chào mừng</strong>{' '}
              khi kích hoạt thẻ trực tuyến.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {OMSUA_MEMBER_TIERS.map((tier) => {
              const isCurrent = memberStats?.currentTier.id === tier.id;
              return (
                <article
                  key={tier.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 transition-colors ${
                    isCurrent
                      ? 'border-card-butter bg-surface-light/14'
                      : 'border-[#4D4636] bg-[#363125]/85'
                  }`}
                >
                  <div>
                    <span className="inline-block rounded-full bg-card-butter px-2.5 py-0.5 text-xs font-bold text-olive-primary tabular-nums">
                      {tier.badgeLabel}
                    </span>
                    <h3 className="mt-2.5 font-display text-base font-bold text-surface-light">
                      {tier.name}
                    </h3>
                    <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-[#DDD6C5]">
                      {tier.perks.map((perk) => (
                        <li key={perk}>• {perk}</li>
                      ))}
                    </ul>
                  </div>

                  {isCurrent ? (
                    <p className="mt-3 rounded-xl bg-artichoke-deep px-2.5 py-1 text-center text-xs font-bold text-surface-light">
                      ✓ Hạng hiện tại của bạn
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-card-butter/30 bg-surface-light p-5 text-espresso shadow-paper-rest sm:p-6 lg:col-span-5">
          <h3 className="font-display text-xl font-bold text-olive-primary">
            Tra cứu &amp; Mở thẻ Thành viên
          </h3>
          <p className="mt-1 text-xs text-warm-muted">
            Nhập số điện thoại bạn dùng đặt món để xem điểm tích lũy và hạng thẻ
            tức thì.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3.5">
            <div>
              <label
                htmlFor="member-name-input"
                className="mb-1 block text-xs font-bold text-espresso"
              >
                Họ và tên thành viên
              </label>
              <input
                id="member-name-input"
                name="memberName"
                type="text"
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="Ví dụ: Nguyễn Minh Anh"
                className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-canvas-cream px-3.5 py-2 text-base text-espresso placeholder:text-warm-muted focus:border-olive-primary focus:outline-none sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="member-phone-input"
                className="mb-1 block text-xs font-bold text-espresso"
              >
                Số điện thoại tích điểm *
              </label>
              <input
                id="member-phone-input"
                name="memberPhone"
                type="tel"
                inputMode="tel"
                value={phoneInput}
                onChange={(event) => {
                  setPhoneInput(event.target.value);
                  if (errorMessage) {
                    setErrorMessage(null);
                  }
                }}
                placeholder="Ví dụ: 0905 123 456"
                className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-canvas-cream px-3.5 py-2 text-base text-espresso placeholder:text-warm-muted focus:border-olive-primary focus:outline-none sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="member-favorite-drink"
                className="mb-1 block text-xs font-bold text-espresso"
              >
                Món tủ tại Ốm Sữa
              </label>
              <select
                id="member-favorite-drink"
                name="favoriteDrink"
                value={favoriteDrink}
                onChange={(event) => setFavoriteDrink(event.target.value)}
                className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-canvas-cream px-3.5 py-2 text-base font-medium text-espresso focus:border-olive-primary focus:outline-none sm:text-sm"
              >
                {[
                  'Dòng Trà Sữa Atiso nguyên bản',
                  'Dòng Trà Trái Cây & Kombucha',
                  'Dòng Sữa Tươi Kem Trứng',
                  'Dòng Cà Phê Phin Cầu Đất',
                  'Quầy Bánh Tráng Nhà Ốm',
                ].map((drinkName) => (
                  <option
                    key={drinkName}
                    value={drinkName}
                    className="bg-surface-light text-espresso"
                  >
                    {drinkName}
                  </option>
                ))}
              </select>
            </div>

            {errorMessage ? (
              <p
                role="alert"
                className="rounded-xl border border-coral-sketch bg-coral-sketch/18 px-3.5 py-2.5 text-xs font-semibold text-espresso"
              >
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-terracotta-deep px-5 py-2.5 text-xs font-bold text-surface-light shadow-paper-rest transition-opacity hover:opacity-92 sm:text-sm"
            >
              Tra cứu / Mở thẻ thành viên
            </button>
          </form>

          {savedProfile && memberStats ? (
            <div
              data-testid="member-card-preview"
              className="mt-4 space-y-2 rounded-2xl border border-olive-primary/20 bg-card-butter p-4 text-espresso"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-artichoke-deep px-2.5 py-0.5 text-xs font-bold text-surface-light">
                  {memberStats.currentTier.name}
                </span>
                <span className="font-display text-lg font-bold text-terracotta-deep tabular-nums">
                  {memberStats.points} điểm
                </span>
              </div>
              <p className="text-sm font-bold text-espresso">
                {savedProfile.name} •{' '}
                <span className="font-mono text-xs tabular-nums">
                  {memberStats.normalizedPhone}
                </span>
              </p>
              <p className="text-xs text-warm-muted tabular-nums">
                Đã tích từ {memberStats.orderCount} đơn gần đây (
                {formatVnd(memberStats.totalSpent)}) + 50 điểm mở thẻ • Món tủ:{' '}
                <strong className="text-espresso">
                  {savedProfile.favoriteDrink}
                </strong>
              </p>
              {memberStats.nextTier ? (
                <p className="text-xs font-semibold text-olive-primary tabular-nums">
                  Còn {memberStats.pointsToNext} điểm nữa để thăng hạng{' '}
                  {memberStats.nextTier.name}.
                </p>
              ) : (
                <p className="text-xs font-semibold text-olive-primary">
                  Bạn đang ở hạng thẻ cao nhất của Nhà Ốm Đà Lạt!
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

'use client';

import type { BranchInfo } from '@omsua/shared';
import { useRef, useState, type FormEvent } from 'react';
import {
  OMSUA_CAREER_OPENINGS,
  OMSUA_FRANCHISE_MODELS,
  isValidVietnamPhone,
  normalizeVietnamPhone,
} from './header-nav-config';

export interface CareersAndFranchiseSectionProps {
  branches: readonly BranchInfo[];
}

export function CareersAndFranchiseSection({
  branches,
}: CareersAndFranchiseSectionProps) {
  // Careers state
  const applicantNameRef = useRef<HTMLInputElement | null>(null);
  const [careerName, setCareerName] = useState<string>('');
  const [careerPhone, setCareerPhone] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    OMSUA_CAREER_OPENINGS[0]!.id,
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    branches[0]?.id ?? 'cs1-hoang-dieu',
  );
  const [careerShiftNote, setCareerShiftNote] = useState<string>('');
  const [careerError, setCareerError] = useState<string | null>(null);
  const [careerSubmitted, setCareerSubmitted] = useState<{
    name: string;
    phone: string;
    roleTitle: string;
  } | null>(null);

  // Franchise state
  const [partnerName, setPartnerName] = useState<string>('');
  const [partnerPhone, setPartnerPhone] = useState<string>('');
  const [partnerCity, setPartnerCity] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>(
    OMSUA_FRANCHISE_MODELS[0]!.id,
  );
  const [franchiseError, setFranchiseError] = useState<string | null>(null);
  const [franchiseSubmitted, setFranchiseSubmitted] = useState<{
    name: string;
    phone: string;
    city: string;
    modelName: string;
  } | null>(null);

  const handleCareerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!careerName.trim()) {
      setCareerError('Vui lòng nhập họ và tên ứng viên.');
      return;
    }
    if (!isValidVietnamPhone(careerPhone)) {
      setCareerError(
        'Vui lòng nhập số điện thoại liên hệ hợp lệ (10 chữ số bắt đầu bằng 0).',
      );
      return;
    }

    const role =
      OMSUA_CAREER_OPENINGS.find((entry) => entry.id === selectedRoleId) ??
      OMSUA_CAREER_OPENINGS[0]!;
    setCareerError(null);
    setCareerSubmitted({
      name: careerName.trim(),
      phone: normalizeVietnamPhone(careerPhone),
      roleTitle: role.title,
    });
  };

  const handleFranchiseSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!partnerName.trim()) {
      setFranchiseError('Vui lòng nhập họ và tên đối tác.');
      return;
    }
    if (!isValidVietnamPhone(partnerPhone)) {
      setFranchiseError(
        'Vui lòng nhập số điện thoại đối tác hợp lệ (10 chữ số bắt đầu bằng 0).',
      );
      return;
    }
    if (!partnerCity.trim()) {
      setFranchiseError('Vui lòng nhập tỉnh/thành phố dự kiến mở quán.');
      return;
    }

    const model =
      OMSUA_FRANCHISE_MODELS.find((entry) => entry.id === selectedModelId) ??
      OMSUA_FRANCHISE_MODELS[0]!;
    setFranchiseError(null);
    setFranchiseSubmitted({
      name: partnerName.trim(),
      phone: normalizeVietnamPhone(partnerPhone),
      city: partnerCity.trim(),
      modelName: model.name,
    });
  };

  return (
    <div className="space-y-10">
      {/* 1. TUYỂN DỤNG (#tuyen-dung) */}
      <section
        id="tuyen-dung"
        className="scroll-mt-32 rounded-3xl border border-olive-primary/16 bg-card-butter/40 p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <span className="inline-flex items-center rounded-full bg-surface-light px-3.5 py-1 text-xs font-bold tracking-wider text-olive-primary uppercase">
              ✦ TUYỂN DỤNG ĐỒNG ĐỘI NHÀ ỐM
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight text-olive-primary sm:text-3xl">
              Gia nhập Quầy Pha Chế Đà Lạt &amp; Đức Trọng
            </h2>
            <p className="text-xs leading-relaxed text-warm-muted sm:text-sm">
              Ốm Sữa tìm kiếm những người bạn yêu hương trà nông sản Đà Lạt,
              trân trọng sự chỉn chu và niềm vui phục vụ khách hàng mỗi sớm.
            </p>

            <div className="space-y-3.5">
              {OMSUA_CAREER_OPENINGS.map((opening) => {
                const isSelected = selectedRoleId === opening.id;
                return (
                  <article
                    key={opening.id}
                    className={`rounded-2xl border bg-surface-light p-4 shadow-paper-rest transition-colors sm:p-5 ${
                      isSelected
                        ? 'border-olive-primary'
                        : 'border-olive-primary/14'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-ochre-deep uppercase">
                          {opening.typeLabel}
                        </span>
                        <h3 className="mt-0.5 font-editorial text-base font-bold text-espresso sm:text-lg">
                          {opening.title}
                        </h3>
                      </div>
                      <span className="rounded-full bg-card-butter px-3 py-1 text-xs font-bold text-olive-primary tabular-nums">
                        {opening.compensationLabel}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-warm-muted">
                      📍 {opening.locationLabel}
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-espresso">
                      {opening.highlights.map((line) => (
                        <li key={line}>• {line}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoleId(opening.id);
                        setCareerSubmitted(null);
                        applicantNameRef.current?.focus();
                      }}
                      className="mt-3 inline-flex min-h-11 cursor-pointer items-center rounded-full bg-artichoke-deep px-4 py-2 text-xs font-bold text-surface-light transition-opacity hover:opacity-92"
                    >
                      <span>Ứng tuyển vị trí này</span>
                      <span className="sr-only"> — {opening.title}</span>
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-olive-primary/18 bg-surface-light p-5 shadow-paper-rest sm:p-6 lg:col-span-5">
            <h3 className="font-display text-xl font-bold text-olive-primary">
              Gửi thông tin ứng tuyển nhanh
            </h3>
            <p className="mt-1 text-xs text-warm-muted">
              Bộ phận Nhân sự Ốm Sữa sẽ liên hệ hẹn lịch phỏng vấn trong vòng 24
              giờ làm việc.
            </p>

            {careerSubmitted ? (
              <div
                role="status"
                className="mt-4 space-y-2 rounded-2xl border border-artichoke-deep/35 bg-card-sage/45 p-4 text-xs text-espresso sm:text-sm"
              >
                <p className="font-bold text-artichoke-deep">
                  ✓ Đã ghi nhận thông tin ứng tuyển của {careerSubmitted.name}
                </p>
                <p>
                  Vị trí: <strong>{careerSubmitted.roleTitle}</strong> • SĐT:{' '}
                  <span className="font-mono tabular-nums">
                    {careerSubmitted.phone}
                  </span>
                </p>
                <p className="text-xs text-warm-muted">
                  Hotline nhân sự Đà Lạt: 0945 396 117.
                </p>
                <button
                  type="button"
                  onClick={() => setCareerSubmitted(null)}
                  className="mt-2 inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-olive-primary/20 bg-surface-light px-3.5 py-2 text-xs font-bold text-espresso transition-colors hover:bg-card-butter"
                >
                  Gửi thêm hồ sơ khác
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleCareerSubmit}
                noValidate
                className="mt-4 space-y-3.5"
              >
                <div>
                  <label
                    htmlFor="career-applicant-name"
                    className="mb-1 block text-xs font-bold text-espresso"
                  >
                    Họ và tên ứng viên *
                  </label>
                  <input
                    ref={applicantNameRef}
                    id="career-applicant-name"
                    name="applicantName"
                    type="text"
                    value={careerName}
                    onChange={(event) => setCareerName(event.target.value)}
                    placeholder="Ví dụ: Lê Hoàng Nam"
                    className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-canvas-cream px-3.5 py-2 text-base text-espresso placeholder:text-warm-muted focus:border-olive-primary focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="career-applicant-phone"
                    className="mb-1 block text-xs font-bold text-espresso"
                  >
                    Số điện thoại liên hệ *
                  </label>
                  <input
                    id="career-applicant-phone"
                    name="applicantPhone"
                    type="tel"
                    inputMode="tel"
                    value={careerPhone}
                    onChange={(event) => setCareerPhone(event.target.value)}
                    placeholder="Ví dụ: 0945 396 117"
                    className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-canvas-cream px-3.5 py-2 text-base text-espresso placeholder:text-warm-muted focus:border-olive-primary focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="career-role-select"
                    className="mb-1 block text-xs font-bold text-espresso"
                  >
                    Vị trí ứng tuyển
                  </label>
                  <select
                    id="career-role-select"
                    name="roleId"
                    value={selectedRoleId}
                    onChange={(event) => setSelectedRoleId(event.target.value)}
                    className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-canvas-cream px-3.5 py-2 text-base font-medium text-espresso focus:border-olive-primary focus:outline-none sm:text-sm"
                  >
                    {OMSUA_CAREER_OPENINGS.map((role) => (
                      <option
                        key={role.id}
                        value={role.id}
                        className="bg-surface-light text-espresso"
                      >
                        {role.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="career-branch-select"
                    className="mb-1 block text-xs font-bold text-espresso"
                  >
                    Cơ sở mong muốn làm việc
                  </label>
                  <select
                    id="career-branch-select"
                    name="branchId"
                    value={selectedBranchId}
                    onChange={(event) => setSelectedBranchId(event.target.value)}
                    className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-canvas-cream px-3.5 py-2 text-base font-medium text-espresso focus:border-olive-primary focus:outline-none sm:text-sm"
                  >
                    {branches.map((branch) => (
                      <option
                        key={branch.id}
                        value={branch.id}
                        className="bg-surface-light text-espresso"
                      >
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="career-shift-note"
                    className="mb-1 block text-xs font-bold text-espresso"
                  >
                    Ca làm mong muốn / Kinh nghiệm pha chế
                  </label>
                  <textarea
                    id="career-shift-note"
                    name="shiftNote"
                    rows={2}
                    value={careerShiftNote}
                    onChange={(event) => setCareerShiftNote(event.target.value)}
                    placeholder="Ví dụ: Có thể làm ca sáng 07:30 – 15:00…"
                    className="w-full rounded-xl border border-olive-primary/20 bg-canvas-cream px-3.5 py-2 text-base text-espresso placeholder:text-warm-muted focus:border-olive-primary focus:outline-none sm:text-sm"
                  />
                </div>

                {careerError ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-coral-sketch bg-coral-sketch/18 px-3.5 py-2.5 text-xs font-semibold text-espresso"
                  >
                    {careerError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-terracotta-deep px-5 py-2.5 text-xs font-bold text-surface-light shadow-paper-rest transition-opacity hover:opacity-92 sm:text-sm"
                >
                  Gửi hồ sơ ứng tuyển
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 2. NHƯỢNG QUYỀN (#nhuong-quyen) */}
      <section
        id="nhuong-quyen"
        className="scroll-mt-32 rounded-3xl border border-olive-primary/16 bg-surface-light p-6 shadow-paper-rest sm:p-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="space-y-2">
              <span className="inline-flex items-center rounded-full bg-card-butter px-3.5 py-1 text-xs font-bold tracking-wider text-olive-primary uppercase">
                ✦ HỢP TÁC &amp; NHƯỢNG QUYỀN THƯƠNG HIỆU
              </span>
              <h2 className="font-display text-2xl font-bold tracking-tight text-olive-primary sm:text-3xl">
                Lan tỏa Hương vị Trà Sữa Atiso Đà Lạt Nguyên Bản
              </h2>
              <p className="text-xs leading-relaxed text-warm-muted sm:text-sm">
                Được kiểm chứng từ năm 2017 qua 4 cơ sở hoạt động hiệu quả tại
                Đà Lạt &amp; Đức Trọng, mô hình nhượng quyền Ốm Sữa bàn giao trọn
                gói nguồn nông sản chuẩn gốc Cầu Đất, thiết kế mộc tinh tế và hệ
                thống vận hành số hóa.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {OMSUA_FRANCHISE_MODELS.map((model) => (
                <article
                  key={model.id}
                  className="flex flex-col justify-between rounded-2xl border border-olive-primary/15 bg-canvas-cream/80 p-5"
                >
                  <div className="space-y-2">
                    <span className="inline-block rounded-full bg-card-butter px-3 py-0.5 text-xs font-bold text-olive-primary">
                      {model.areaLabel}
                    </span>
                    <h3 className="font-display text-lg font-bold text-espresso">
                      {model.name}
                    </h3>
                    <p className="text-xs font-bold text-terracotta-deep tabular-nums sm:text-sm">
                      {model.investmentLabel}
                    </p>
                    <p className="text-xs font-semibold text-ochre-deep tabular-nums">
                      {model.paybackLabel}
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-warm-muted">
                      {model.features.map((feat) => (
                        <li key={feat}>✓ {feat}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-olive-primary/18 bg-canvas-cream/75 p-5 sm:p-6 lg:col-span-5">
            <h3 className="font-display text-xl font-bold text-olive-primary">
              Nhận Hồ sơ Năng lực &amp; Dự toán Chi phí
            </h3>
            <p className="mt-1 text-xs text-warm-muted">
              Để lại thông tin để Ban Phát triển Chuỗi Ốm Sữa gửi bộ tài liệu
              nhượng quyền chi tiết và khảo sát mặt bằng cùng bạn.
            </p>

            {franchiseSubmitted ? (
              <div
                role="status"
                className="mt-4 space-y-2 rounded-2xl border border-artichoke-deep/35 bg-surface-light p-4 text-xs text-espresso sm:text-sm"
              >
                <p className="font-bold text-artichoke-deep">
                  ✓ Đã tiếp nhận yêu cầu tư vấn nhượng quyền của{' '}
                  {franchiseSubmitted.name}
                </p>
                <p>
                  Khu vực dự kiến: <strong>{franchiseSubmitted.city}</strong> •
                  Mô hình: <strong>{franchiseSubmitted.modelName}</strong>
                </p>
                <p className="text-xs text-warm-muted">
                  Ban Phát triển Chuỗi sẽ liên hệ SĐT{' '}
                  <span className="font-mono tabular-nums">
                    {franchiseSubmitted.phone}
                  </span>{' '}
                  trong giờ hành chính.
                </p>
                <button
                  type="button"
                  onClick={() => setFranchiseSubmitted(null)}
                  className="mt-2 inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-olive-primary/20 bg-canvas-cream px-3.5 py-2 text-xs font-bold text-espresso transition-colors hover:bg-card-butter"
                >
                  Cập nhật lại thông tin
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleFranchiseSubmit}
                noValidate
                className="mt-4 space-y-3.5"
              >
                <div>
                  <label
                    htmlFor="franchise-partner-name"
                    className="mb-1 block text-xs font-bold text-espresso"
                  >
                    Họ và tên đối tác *
                  </label>
                  <input
                    id="franchise-partner-name"
                    name="partnerName"
                    type="text"
                    value={partnerName}
                    onChange={(event) => setPartnerName(event.target.value)}
                    placeholder="Ví dụ: Trần Bảo Châu"
                    className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-surface-light px-3.5 py-2 text-base text-espresso placeholder:text-warm-muted focus:border-olive-primary focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="franchise-partner-phone"
                    className="mb-1 block text-xs font-bold text-espresso"
                  >
                    Số điện thoại đối tác *
                  </label>
                  <input
                    id="franchise-partner-phone"
                    name="partnerPhone"
                    type="tel"
                    inputMode="tel"
                    value={partnerPhone}
                    onChange={(event) => setPartnerPhone(event.target.value)}
                    placeholder="Ví dụ: 0912 345 678"
                    className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-surface-light px-3.5 py-2 text-base text-espresso placeholder:text-warm-muted focus:border-olive-primary focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="franchise-partner-city"
                    className="mb-1 block text-xs font-bold text-espresso"
                  >
                    Tỉnh / Thành phố dự kiến mở quán *
                  </label>
                  <input
                    id="franchise-partner-city"
                    name="partnerCity"
                    type="text"
                    value={partnerCity}
                    onChange={(event) => setPartnerCity(event.target.value)}
                    placeholder="Ví dụ: Bảo Lộc, Nha Trang, TP.HCM…"
                    className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-surface-light px-3.5 py-2 text-base text-espresso placeholder:text-warm-muted focus:border-olive-primary focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="franchise-model-select"
                    className="mb-1 block text-xs font-bold text-espresso"
                  >
                    Mô hình nhượng quyền quan tâm
                  </label>
                  <select
                    id="franchise-model-select"
                    name="franchiseModel"
                    value={selectedModelId}
                    onChange={(event) => setSelectedModelId(event.target.value)}
                    className="min-h-11 w-full rounded-xl border border-olive-primary/20 bg-surface-light px-3.5 py-2 text-base font-medium text-espresso focus:border-olive-primary focus:outline-none sm:text-sm"
                  >
                    {OMSUA_FRANCHISE_MODELS.map((model) => (
                      <option
                        key={model.id}
                        value={model.id}
                        className="bg-surface-light text-espresso"
                      >
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                {franchiseError ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-coral-sketch bg-coral-sketch/18 px-3.5 py-2.5 text-xs font-semibold text-espresso"
                  >
                    {franchiseError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-terracotta-deep px-5 py-2.5 text-xs font-bold text-surface-light shadow-paper-rest transition-opacity hover:opacity-92 sm:text-sm"
                >
                  Đăng ký nhận hồ sơ nhượng quyền
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

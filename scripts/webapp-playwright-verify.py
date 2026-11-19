#!/usr/bin/env python3
"""
Ốm Sữa Automated Headless Playwright Verification & LCP Suite (`webapp-testing`).

Verifies both `@omsua/web` (Storefront :3000) and `@omsua/admin` (Admin :3001):
  1. LCP (`largest-contentful-paint`) < 2500ms in headless Chromium
  2. Single high-priority Hero LCP image (`img[fetchpriority="high"] == 1`)
  3. Zero console errors & zero uncaught page errors across full user journeys
  4. Persistent chrome `viewTransitionName` + exclusive 1-to-1 `data-vt-name` handoff
     between `FanpageGallerySection` and `PhotoLightboxModal`
  5. Category pill transitions, diacritic-free search, `<DrinkCustomizerModal />`,
     `<SnackCustomizerModal />`, and `<CartCheckoutDrawer />` `aria-describedby` validation
  6. Directional Admin route navigation (`Đơn hàng -> Thực đơn -> Chi nhánh -> Cài đặt -> Đơn hàng`)
  7. Visual screenshots saved under `output/playwright/`

Compatible both standalone against running servers and wrapped with:
  python3 .../webapp-testing/scripts/with_server.py --server ... --port 3000 -- python3 scripts/webapp-playwright-verify.py
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import sys
from typing import Any
import urllib.request

from playwright.sync_api import Page, expect, sync_playwright


LCP_OBSERVER_INIT_SCRIPT = """
(() => {
  window.__omsuaLcpEntries = [];
  try {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        window.__omsuaLcpEntries.push({
          startTime: entry.startTime,
          size: entry.size || 0,
          url: entry.url || '',
          tagName: entry.element ? entry.element.tagName : '',
        });
      }
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (_err) {
    // Browser without LCP PerformanceObserver support
  }
})();
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Run Ốm Sữa Playwright E2E, ViewTransition, Compound Modal, and LCP "
            "verification against @omsua/web and @omsua/admin."
        )
    )
    parser.add_argument(
        "--web-url",
        default=os.environ.get("WEB_URL", "http://localhost:3000"),
        help="Base URL of @omsua/web Storefront (default: http://localhost:3000)",
    )
    parser.add_argument(
        "--admin-url",
        default=os.environ.get("ADMIN_URL", "http://localhost:3001"),
        help="Base URL of @omsua/admin Portal (default: http://localhost:3001)",
    )
    parser.add_argument(
        "--output-dir",
        default="output/playwright",
        help="Directory to write verification screenshots and report.json",
    )
    parser.add_argument(
        "--max-lcp-ms",
        type=float,
        default=2500.0,
        help="Maximum allowed Largest Contentful Paint in milliseconds (default: 2500)",
    )
    parser.add_argument(
        "--skip-admin",
        action="store_true",
        help="Only verify @omsua/web Storefront (useful for single-server runs)",
    )
    return parser.parse_args()


def wait_for_finite_animations(page: Page) -> None:
    """Wait for active CSS / ViewTransition animations to finish before screenshots."""
    page.evaluate(
        """() => Promise.all(
            document.getAnimations()
              .filter((anim) => {
                const timing = anim.effect && anim.effect.getComputedTiming
                  ? anim.effect.getComputedTiming()
                  : null;
                return timing && timing.iterations !== Infinity;
              })
              .map((anim) => anim.finished.catch(() => {}))
        )"""
    )


def assert_unique_vt_names(page: Page, stage: str) -> list[str]:
    names: list[str] = page.evaluate(
        """() => Array.from(document.querySelectorAll('[data-vt-name]'))
            .map((el) => el.getAttribute('data-vt-name') || '')
            .filter(Boolean)"""
    )
    duplicates = sorted({name for name in names if names.count(name) > 1})
    if duplicates:
        raise AssertionError(
            f"[{stage}] Duplicate data-vt-name values detected: {duplicates}"
        )
    return names


def verify_storefront(
    page: Page,
    web_url: str,
    output_dir: Path,
    max_lcp_ms: float,
) -> dict[str, Any]:
    console_errors: list[str] = []
    page_errors: list[str] = []

    page.on(
        "console",
        lambda msg: console_errors.append(msg.text)
        if msg.type == "error"
        else None,
    )
    page.on("pageerror", lambda err: page_errors.append(str(err)))

    page.add_init_script(LCP_OBSERVER_INIT_SCRIPT)
    page.goto(web_url, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")

    # 1. Persistent header isolation & single high-priority LCP image
    header_vt_name = page.locator("header").first.evaluate(
        "(el) => el.style.viewTransitionName"
    )
    if header_vt_name != "omsua-site-header":
        raise AssertionError(
            f"Expected Storefront header viewTransitionName='omsua-site-header', got {header_vt_name!r}"
        )

    high_priority_count = page.locator('img[fetchpriority="high"]').count()
    if high_priority_count != 1:
        raise AssertionError(
            f"Expected exactly 1 img[fetchpriority='high'], got {high_priority_count}"
        )

    desktop_shot = output_dir / "storefront-desktop.png"
    page.screenshot(path=str(desktop_shot), full_page=False)

    # Allow buffered PerformanceObserver microtask flush and read initial-load LCP
    page.wait_for_timeout(150)
    lcp_entries: list[dict[str, Any]] = page.evaluate(
        "() => window.__omsuaLcpEntries || []"
    )
    if not lcp_entries:
        raise AssertionError(
            "No largest-contentful-paint entries recorded on Storefront load"
        )

    latest_lcp = lcp_entries[-1]
    lcp_ms = float(latest_lcp["startTime"])
    if lcp_ms <= 0 or lcp_ms >= max_lcp_ms:
        raise AssertionError(
            f"Storefront LCP {lcp_ms:.1f}ms exceeded threshold {max_lcp_ms:.1f}ms "
            f"(entry={latest_lcp})"
        )

    lcp_breakdown: dict[str, float] = page.evaluate(
        """(lcpEntry) => {
          const nav = performance.getEntriesByType('navigation')[0];
          const ttfb = nav ? nav.responseStart : 0;
          const resList = lcpEntry.url
            ? performance.getEntriesByName(lcpEntry.url, 'resource')
            : [];
          const res = resList.length > 0 ? resList[resList.length - 1] : null;
          if (!res) {
            return {
              ttfb_ms: Number(ttfb.toFixed(2)),
              resource_load_delay_ms: 0,
              resource_load_duration_ms: 0,
              element_render_delay_ms: Number(Math.max(0, lcpEntry.startTime - ttfb).toFixed(2)),
            };
          }
          const loadDelay = Math.max(0, res.startTime - ttfb);
          const loadDuration = Math.max(0, res.responseEnd - res.startTime);
          const renderDelay = Math.max(0, lcpEntry.startTime - res.responseEnd);
          return {
            ttfb_ms: Number(ttfb.toFixed(2)),
            resource_load_delay_ms: Number(loadDelay.toFixed(2)),
            resource_load_duration_ms: Number(loadDuration.toFixed(2)),
            element_render_delay_ms: Number(renderDelay.toFixed(2)),
          };
        }""",
        latest_lcp,
    )

    initial_vt_names = assert_unique_vt_names(page, "storefront-initial")
    if len(initial_vt_names) < 8:
        raise AssertionError(
            f"Expected >= 8 gallery data-vt-name elements on Storefront, got {len(initial_vt_names)}"
        )

    # 2. Category pill transition (`Cà Phê`) + diacritic-free search (`atiso`)
    drink_group = page.get_by_role("group", name="Bộ lọc nhóm thức uống")
    coffee_pill = drink_group.get_by_role(
        "button", name=re.compile(r"Cà Phê", re.IGNORECASE)
    )
    coffee_pill.click()
    expect(coffee_pill).to_have_attribute("aria-pressed", "true")

    all_pill = drink_group.get_by_role("button", name=re.compile(r"^Tất cả"))
    all_pill.click()
    expect(all_pill).to_have_attribute("aria-pressed", "true")

    search_input = page.get_by_role("searchbox", name="Tìm nhanh thức uống")
    search_input.fill("atiso")
    page.get_by_text(re.compile(r"Hiển thị \d+ món")).wait_for(state="visible")

    # 3. Explicit <DrinkCustomizerModal /> (`Trà Sữa Atiso` -> Cup Gauge + Add to cart)
    drink_menu_section = page.locator("#thuc-don")
    atiso_card = drink_menu_section.locator(
        "article",
        has=page.get_by_role("heading", name="Trà Sữa Atiso", exact=True),
    ).first
    atiso_card.get_by_role("button", name="+ Thêm").click()

    dialog = page.get_by_role("dialog")
    expect(dialog).to_be_visible()
    expect(dialog.get_by_text("Tùy chỉnh ly của bạn")).to_be_visible()
    expect(dialog.get_by_test_id("customizer-cup-gauge")).to_have_count(1)
    expect(dialog.get_by_text("Độ cay chuẩn Đà Lạt")).to_have_count(0)

    customizer_shot = output_dir / "storefront-customizer.png"
    wait_for_finite_animations(page)
    page.screenshot(path=str(customizer_shot), full_page=False)

    dialog.get_by_role("button", name=re.compile(r"^Thêm vào giỏ")).click()
    expect(dialog).to_be_hidden()

    # Reset search query
    search_input.fill("")

    # 4. Explicit <SnackCustomizerModal /> (`Bánh Tráng Trộn Tóp Mỡ` -> SpiceSelector, no CupGauge)
    snack_card = page.locator(
        "article",
        has=page.get_by_role("heading", name="Bánh Tráng Trộn Tóp Mỡ", exact=True),
    ).first
    snack_card.scroll_into_view_if_needed()
    snack_card.get_by_role("button", name="+ Thêm món ăn vặt").click()
    snack_dialog = page.get_by_role("dialog")
    expect(snack_dialog).to_be_visible()
    expect(snack_dialog.get_by_text("Tùy chỉnh món ăn vặt")).to_be_visible()
    expect(snack_dialog.get_by_test_id("customizer-cup-gauge")).to_have_count(0)
    snack_dialog.get_by_role("button", name=re.compile(r"^Thêm vào giỏ")).click()
    expect(snack_dialog).to_be_hidden()

    # 5. FanpageGallerySection -> PhotoLightboxModal shared-element handoff + directional next + Escape
    gallery_section = page.locator("#khong-gian")
    gallery_section.scroll_into_view_if_needed()
    first_gallery_btn = gallery_section.locator("article button").first
    first_vt_el = first_gallery_btn.locator("[data-vt-name]").first
    target_vt_name = first_vt_el.get_attribute("data-vt-name")
    if not target_vt_name:
        raise AssertionError("First gallery card missing data-vt-name before open")

    first_gallery_btn.click()
    lightbox = page.get_by_role("dialog")
    expect(lightbox).to_be_visible()
    expect(lightbox.locator(f'[data-vt-name="{target_vt_name}"]')).to_have_count(1)

    open_vt_names = assert_unique_vt_names(page, "storefront-lightbox-open")
    if open_vt_names.count(target_vt_name) != 1:
        raise AssertionError(
            f"Expected exactly 1 active {target_vt_name} in DOM while lightbox is open"
        )

    lightbox_shot = output_dir / "storefront-lightbox.png"
    wait_for_finite_animations(page)
    page.screenshot(path=str(lightbox_shot), full_page=False)

    page.keyboard.press("ArrowRight")
    expect(lightbox.get_by_text(re.compile(r"^2 / \d+"))).to_be_visible()
    assert_unique_vt_names(page, "storefront-lightbox-next")
    page.keyboard.press("Escape")
    expect(lightbox).to_be_hidden()
    expect(
        gallery_section.locator(f'[data-vt-name="{target_vt_name}"]')
    ).to_have_count(1)
    restored_vt_names = assert_unique_vt_names(page, "storefront-lightbox-closed")
    if target_vt_name not in restored_vt_names:
        raise AssertionError(
            f"Expected {target_vt_name} to be restored to gallery card after closing lightbox"
        )

    # 6. <CartCheckoutDrawer /> compound composition + inline aria-describedby validation
    page.locator("header").get_by_role(
        "button", name=re.compile(r"Giỏ hàng", re.IGNORECASE)
    ).click()
    checkout_dialog = page.get_by_role("dialog")
    expect(checkout_dialog).to_be_visible()
    checkout_dialog.get_by_role(
        "button", name=re.compile(r"^Xác nhận đặt món")
    ).click()

    name_input = checkout_dialog.get_by_label("Họ và tên người nhận")
    expect(name_input).to_have_attribute("aria-invalid", "true")
    described_by_id = name_input.get_attribute("aria-describedby")
    if not described_by_id or checkout_dialog.locator(f"#{described_by_id}").count() != 1:
        raise AssertionError(
            f"Expected customerName aria-describedby={described_by_id!r} to resolve to inline error node"
        )
    page.keyboard.press("Escape")
    expect(checkout_dialog).to_be_hidden()

    if console_errors or page_errors:
        raise AssertionError(
            f"Storefront emitted console/page errors: console={console_errors}, page={page_errors}"
        )

    return {
        "web_url": web_url,
        "lcp_ms": round(lcp_ms, 2),
        "lcp_breakdown": lcp_breakdown,
        "lcp_element_tag": latest_lcp.get("tagName", ""),
        "lcp_url": latest_lcp.get("url", ""),
        "fetchpriority_high_count": high_priority_count,
        "gallery_vt_count": len(initial_vt_names),
        "console_errors": len(console_errors),
        "page_errors": len(page_errors),
        "screenshots": [
            str(desktop_shot),
            str(customizer_shot),
            str(lightbox_shot),
        ],
    }


def verify_admin(
    page: Page,
    admin_url: str,
    output_dir: Path,
) -> dict[str, Any]:
    console_errors: list[str] = []
    page_errors: list[str] = []

    page.on(
        "console",
        lambda msg: console_errors.append(msg.text)
        if msg.type == "error"
        else None,
    )
    page.on("pageerror", lambda err: page_errors.append(str(err)))

    page.goto(admin_url, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")

    page.get_by_role("heading", name="Quản lý Đơn hàng").wait_for(state="visible")

    sidebar_vt = page.locator("aside").first.evaluate(
        "(el) => el.style.viewTransitionName"
    )
    topbar_vt = page.locator("header").first.evaluate(
        "(el) => el.style.viewTransitionName"
    )
    if sidebar_vt != "omsua-admin-sidebar" or topbar_vt != "omsua-admin-topbar":
        raise AssertionError(
            f"Unexpected Admin persistent chrome VT names: sidebar={sidebar_vt!r}, topbar={topbar_vt!r}"
        )

    # Status pill filter transition
    status_group = page.get_by_role("group", name="Lọc theo trạng thái")
    pending_pill = status_group.get_by_role(
        "button", name=re.compile(r"^Chờ xác nhận")
    )
    pending_pill.click()
    expect(pending_pill).to_have_attribute("aria-pressed", "true")
    all_status_pill = status_group.get_by_role("button", name=re.compile(r"^Tất cả"))
    all_status_pill.click()
    expect(all_status_pill).to_have_attribute("aria-pressed", "true")

    admin_shot = output_dir / "admin-orders.png"
    wait_for_finite_animations(page)
    page.screenshot(path=str(admin_shot), full_page=False)

    order_age_badges = page.get_by_test_id("order-age-badge").count()

    # Directional route navigation forward & backward across all 4 operational pages
    sidebar_nav = page.locator("aside nav")
    sidebar_nav.get_by_role("link", name="Thực đơn").click()
    page.get_by_role("heading", name="Quản lý Thực đơn").wait_for(state="visible")

    sidebar_nav.get_by_role("link", name="Chi nhánh").click()
    page.get_by_role("heading", name="Hệ thống Chi nhánh").wait_for(state="visible")

    sidebar_nav.get_by_role("link", name="Cài đặt").click()
    page.get_by_role("heading", name="Cài đặt Hệ thống").wait_for(state="visible")

    sidebar_nav.get_by_role("link", name="Đơn hàng").click()
    page.get_by_role("heading", name="Quản lý Đơn hàng").wait_for(state="visible")

    if console_errors or page_errors:
        raise AssertionError(
            f"Admin emitted console/page errors: console={console_errors}, page={page_errors}"
        )

    return {
        "admin_url": admin_url,
        "sidebar_vt": sidebar_vt,
        "topbar_vt": topbar_vt,
        "order_age_badges_visible": order_age_badges,
        "console_errors": len(console_errors),
        "page_errors": len(page_errors),
        "screenshots": [str(admin_shot)],
    }


def measure_throttled_lcp(browser: Any, web_url: str) -> dict[str, Any]:
    """Measure Fast 3G (1.6 Mbps, 150ms RTT) + 4x CPU throttled LCP & 4-part breakdown via CDP."""
    context = browser.new_context(
        viewport={"width": 412, "height": 915},
        locale="vi-VN",
    )
    try:
        page = context.new_page()
        cdp = context.new_cdp_session(page)
        cdp.send("Network.enable")
        cdp.send(
            "Network.emulateNetworkConditions",
            {
                "offline": False,
                "latency": 150,
                "downloadThroughput": int(1.6 * 1024 * 1024 / 8),
                "uploadThroughput": int(750 * 1024 / 8),
            },
        )
        cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
        page.add_init_script(LCP_OBSERVER_INIT_SCRIPT)
        page.goto(web_url, wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(150)

        entries: list[dict[str, Any]] = page.evaluate(
            "() => window.__omsuaLcpEntries || []"
        )
        if not entries:
            raise AssertionError("No LCP entry recorded under Fast 3G + 4x CPU throttling")
        latest = entries[-1]
        breakdown: dict[str, float] = page.evaluate(
            """(lcpEntry) => {
              const nav = performance.getEntriesByType('navigation')[0];
              const ttfb = nav ? nav.responseStart : 0;
              const resList = lcpEntry.url
                ? performance.getEntriesByName(lcpEntry.url, 'resource')
                : [];
              const res = resList.length > 0 ? resList[resList.length - 1] : null;
              if (!res) {
                return {
                  ttfb_ms: Number(ttfb.toFixed(2)),
                  resource_load_delay_ms: 0,
                  resource_load_duration_ms: 0,
                  element_render_delay_ms: Number(Math.max(0, lcpEntry.startTime - ttfb).toFixed(2)),
                };
              }
              return {
                ttfb_ms: Number(ttfb.toFixed(2)),
                resource_load_delay_ms: Number(Math.max(0, res.startTime - ttfb).toFixed(2)),
                resource_load_duration_ms: Number(Math.max(0, res.responseEnd - res.startTime).toFixed(2)),
                element_render_delay_ms: Number(Math.max(0, lcpEntry.startTime - res.responseEnd).toFixed(2)),
              };
            }""",
            latest,
        )
        return {
            "profile": "Fast 3G (1.6 Mbps, 150ms RTT) + 4x CPU",
            "lcp_ms": round(float(latest["startTime"]), 2),
            "lcp_breakdown": breakdown,
            "lcp_url": latest.get("url", ""),
        }
    finally:
        context.close()


def warm_server_route(url: str) -> None:
    """Prime dev-server on-demand compilation without caching in the fresh browser context."""
    try:
        with urllib.request.urlopen(url, timeout=15) as response:
            response.read(2048)
    except Exception:
        pass


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    warm_server_route(args.web_url)
    if not args.skip_admin:
        warm_server_route(args.admin_url)

    configured_chrome = os.environ.get("CHROME_PATH", "/usr/bin/google-chrome")
    executable_path = (
        configured_chrome if Path(configured_chrome).exists() else None
    )

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path=executable_path,
        )
        try:
            web_context = browser.new_context(
                viewport={"width": 1440, "height": 960},
                locale="vi-VN",
            )
            web_page = web_context.new_page()
            storefront_metrics = verify_storefront(
                web_page,
                args.web_url,
                output_dir,
                args.max_lcp_ms,
            )
            web_context.close()

            throttled_metrics = measure_throttled_lcp(browser, args.web_url)

            admin_metrics: dict[str, Any] | None = None
            if not args.skip_admin:
                admin_context = browser.new_context(
                    viewport={"width": 1440, "height": 960},
                    locale="vi-VN",
                )
                admin_page = admin_context.new_page()
                admin_metrics = verify_admin(
                    admin_page,
                    args.admin_url,
                    output_dir,
                )
                admin_context.close()
        finally:
            browser.close()

    report = {
        "status": "ok",
        "chrome_executable": executable_path or "playwright-bundled",
        "storefront": storefront_metrics,
        "storefront_throttled": throttled_metrics,
        "admin": admin_metrics,
    }
    report_path = output_dir / "report.json"
    report_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())

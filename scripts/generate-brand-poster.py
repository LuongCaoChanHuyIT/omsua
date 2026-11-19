#!/usr/bin/env python3
"""Deterministic generator for Ốm Sữa's 'Đà Lạt Botanical Press' printable menu poster (.png + .pdf).

Strictly uses the 14 canonical OMSUA_COLORS (zero #FFFFFF / #000000) and OFL fonts from canvas-design.
"""

from __future__ import annotations

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = REPO_ROOT / "apps" / "web" / "public" / "brand"
FONTS_DIR = Path(
    "/home/fedora/.gemini/config/plugins/anthropic-dev-skills/skills/canvas-design/canvas-fonts"
)

# Canonical 14 OMSUA_COLORS (zero pure white/black)
PALETTE = {
    "canvas_cream": (238, 234, 223),      # #EEEADF
    "surface_light": (247, 244, 236),     # #F7F4EC
    "card_butter": (244, 227, 173),       # #F4E3AD
    "card_sage": (199, 203, 189),         # #C7CBBD
    "card_olive_gold": (182, 161, 82),    # #B6A152
    "card_taupe": (200, 186, 155),        # #C8BA9B
    "hero_espresso": (41, 38, 29),        # #29261D
    "olive_primary": (89, 76, 0),         # #594C00
    "warm_muted": (107, 98, 85),          # #6B6255
    "subhead_ochre": (166, 124, 46),      # #A67C2E
    "terracotta": (217, 107, 30),         # #D96B1E
    "coral_sketch": (224, 125, 119),      # #E07D77
    "artichoke": (122, 139, 59),          # #7A8B3B
}

WIDTH = 1600
HEIGHT = 2260
GOLDEN_ANGLE = math.radians(137.50776405)


def load_font(filename: str, size: int) -> ImageFont.FreeTypeFont:
    font_path = FONTS_DIR / filename
    if font_path.exists():
        return ImageFont.truetype(str(font_path), size=size)
    fallback = Path("/usr/share/fonts/google-noto-vf/NotoSerif[wght].ttf")
    if fallback.exists():
        return ImageFont.truetype(str(fallback), size=size)
    return ImageFont.load_default()


def draw_paper_weave(draw: ImageDraw.ImageDraw) -> None:
    # Subtle deterministic linen weave marks across the warm cream ground
    step = 28
    for y in range(60, HEIGHT - 60, step):
        offset = (y // step) % 2 * 14
        for x in range(60 + offset, WIDTH - 60, step * 2):
            draw.point((x, y), fill=PALETTE["card_taupe"])


def draw_registration_frame(draw: ImageDraw.ImageDraw) -> None:
    outer = (64, 64, WIDTH - 64, HEIGHT - 64)
    inner = (84, 84, WIDTH - 84, HEIGHT - 84)
    draw.rectangle(outer, outline=PALETTE["olive_primary"], width=3)
    draw.rectangle(inner, outline=PALETTE["card_taupe"], width=1)

    # Corner botanical registration crosses
    corners = [
        (64, 64),
        (WIDTH - 64, 64),
        (64, HEIGHT - 64),
        (WIDTH - 64, HEIGHT - 64),
    ]
    for cx, cy in corners:
        draw.ellipse(
            (cx - 8, cy - 8, cx + 8, cy + 8),
            fill=PALETTE["canvas_cream"],
            outline=PALETTE["olive_primary"],
            width=2,
        )
        draw.ellipse((cx - 3, cy - 3, cx + 3, cy + 3), fill=PALETTE["terracotta"])


def draw_artichoke_specimen(draw: ImageDraw.ImageDraw, cx: int, cy: int) -> None:
    # Warm sunlit specimen medallion ground
    medallion_r = 415
    draw.ellipse(
        (cx - medallion_r, cy - medallion_r, cx + medallion_r, cy + medallion_r),
        fill=PALETTE["surface_light"],
        outline=PALETTE["card_taupe"],
        width=2,
    )

    # Topographic Highland contour rings (1,500m elevation)
    for idx, radius in enumerate([392, 356, 312, 262, 206]):
        ring_color = (
            PALETTE["card_olive_gold"] if idx % 2 == 0 else PALETTE["card_sage"]
        )
        draw.ellipse(
            (cx - radius, cy - radius, cx + radius, cy + radius),
            outline=ring_color,
            width=1,
        )

    # 72 compass / botanical degree ticks around outer ring
    for deg in range(0, 360, 5):
        rad = math.radians(deg)
        inner_r = 378 if deg % 30 == 0 else (384 if deg % 15 == 0 else 388)
        outer_r = 398
        x1 = cx + math.cos(rad) * inner_r
        y1 = cy + math.sin(rad) * inner_r
        x2 = cx + math.cos(rad) * outer_r
        y2 = cy + math.sin(rad) * outer_r
        tick_col = (
            PALETTE["olive_primary"] if deg % 30 == 0 else PALETTE["card_taupe"]
        )
        draw.line((x1, y1, x2, y2), fill=tick_col, width=2 if deg % 30 == 0 else 1)

    # Crosshair axes
    draw.line(
        (cx - 432, cy, cx - 398, cy), fill=PALETTE["olive_primary"], width=2
    )
    draw.line(
        (cx + 398, cy, cx + 432, cy), fill=PALETTE["olive_primary"], width=2
    )
    draw.line(
        (cx, cy - 432, cx, cy - 398), fill=PALETTE["olive_primary"], width=2
    )
    draw.line(
        (cx, cy + 398, cx, cy + 432), fill=PALETTE["olive_primary"], width=2
    )

    # Phyllotaxis Artichoke Bracts (drawn outside-in so inner heart crowns the center)
    total_bracts = 132
    for n in range(total_bracts - 1, -1, -1):
        ratio = n / float(total_bracts)
        angle = n * GOLDEN_ANGLE
        dist = 32 + math.sqrt(ratio) * 282

        bx = cx + math.cos(angle) * dist
        by = cy + math.sin(angle) * dist

        length = 40 + ratio * 44
        half_w = 15 + ratio * 18

        # Petal polygon oriented radially outward
        ux, uy = math.cos(angle), math.sin(angle)
        px, py = -uy, ux

        tip = (bx + ux * length, by + uy * length)
        left = (bx + ux * (length * 0.28) + px * half_w, by + uy * (length * 0.28) + py * half_w)
        base = (bx - ux * 10, by - uy * 10)
        right = (bx + ux * (length * 0.28) - px * half_w, by + uy * (length * 0.28) - py * half_w)

        if ratio > 0.72:
            fill_col = PALETTE["olive_primary"]
            edge_col = PALETTE["card_butter"]
        elif ratio > 0.42:
            fill_col = PALETTE["artichoke"]
            edge_col = PALETTE["surface_light"]
        elif ratio > 0.16:
            fill_col = PALETTE["card_olive_gold"]
            edge_col = PALETTE["hero_espresso"]
        else:
            fill_col = PALETTE["card_butter"]
            edge_col = PALETTE["olive_primary"]

        draw.polygon([base, left, tip, right], fill=fill_col, outline=edge_col)
        # Central botanical vein on each bract
        vein_end = (bx + ux * (length * 0.76), by + uy * (length * 0.76))
        draw.line([base, vein_end], fill=edge_col, width=1)

    # Terracotta heart seal at exact center
    draw.ellipse(
        (cx - 32, cy - 32, cx + 32, cy + 32),
        fill=PALETTE["hero_espresso"],
        outline=PALETTE["card_butter"],
        width=3,
    )
    draw.ellipse(
        (cx - 12, cy - 12, cx + 12, cy + 12),
        fill=PALETTE["terracotta"],
    )


def draw_centered_text(
    draw: ImageDraw.ImageDraw,
    y: int,
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
) -> int:
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text(((WIDTH - tw) // 2, y), text, font=font, fill=fill)
    return th


def draw_menu_row(
    draw: ImageDraw.ImageDraw,
    x_left: int,
    x_right: int,
    y: int,
    name: str,
    sub: str,
    price: str,
    font_name: ImageFont.FreeTypeFont,
    font_sub: ImageFont.FreeTypeFont,
    font_price: ImageFont.FreeTypeFont,
) -> None:
    draw.text((x_left, y), name, font=font_name, fill=PALETTE["hero_espresso"])
    pbbox = draw.textbbox((0, 0), price, font=font_price)
    pw = pbbox[2] - pbbox[0]
    draw.text((x_right - pw, y + 2), price, font=font_price, fill=PALETTE["terracotta"])

    nbbox = draw.textbbox((0, 0), name, font=font_name)
    nw = nbbox[2] - nbbox[0]
    dots_start = x_left + nw + 14
    dots_end = x_right - pw - 14
    if dots_end > dots_start + 20:
        for dx in range(int(dots_start), int(dots_end), 10):
            draw.ellipse(
                (dx, y + 18, dx + 2, y + 20), fill=PALETTE["card_taupe"]
            )

    draw.text((x_left, y + 32), sub, font=font_sub, fill=PALETTE["warm_muted"])


def generate() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (WIDTH, HEIGHT), PALETTE["canvas_cream"])
    draw = ImageDraw.Draw(img)

    draw_paper_weave(draw)
    draw_registration_frame(draw)

    font_mono_xs = load_font("IBMPlexMono-Regular.ttf", 20)
    font_mono_bold = load_font("IBMPlexMono-Bold.ttf", 21)
    font_title = load_font("Lora-Bold.ttf", 72)
    font_subtitle = load_font("Lora-Italic.ttf", 28)
    font_sec = load_font("Lora-Bold.ttf", 26)
    font_item = load_font("Lora-Bold.ttf", 25)
    font_item_sub = load_font("Lora-Italic.ttf", 19)

    # Top archival header bar
    draw.text(
        (124, 112),
        "HERBARIUM SPECIMEN NO. 2017 — CYNARA SCOLYMUS",
        font=font_mono_xs,
        fill=PALETTE["subhead_ochre"],
    )
    coords = "11°56′N • 108°26′E • ELEV. 1,500M"
    cbbox = draw.textbbox((0, 0), coords, font=font_mono_xs)
    draw.text(
        (WIDTH - 124 - (cbbox[2] - cbbox[0]), 112),
        coords,
        font=font_mono_xs,
        fill=PALETTE["olive_primary"],
    )
    draw.line((124, 152, WIDTH - 124, 152), fill=PALETTE["card_taupe"], width=2)

    # Brand Headline
    draw_centered_text(draw, 184, "ỐM SỮA ĐÀ LẠT", font_title, PALETTE["olive_primary"])
    draw_centered_text(
        draw,
        274,
        "“Trà sữa của người Đà Lạt — Gói trọn sương sớm & vị ngọt lành nguyên bản từ 2017”",
        font_subtitle,
        PALETTE["warm_muted"],
    )

    # Central Botanical Specimen Rosette
    draw_artichoke_specimen(draw, WIDTH // 2, 790)

    # Specimen Plate Caption Pill
    pill_w, pill_h = 660, 48
    px0 = (WIDTH - pill_w) // 2
    py0 = 1234
    draw.rounded_rectangle(
        (px0, py0, px0 + pill_w, py0 + pill_h),
        radius=24,
        fill=PALETTE["card_butter"],
        outline=PALETTE["olive_primary"],
        width=1,
    )
    draw_centered_text(
        draw,
        py0 + 12,
        "FIG. 01 — BÚP ATISO XANH CẦU ĐẤT & TRÀ Ủ MỚI",
        font_mono_bold,
        PALETTE["olive_primary"],
    )

    # Curated Tasting Index (Two balanced columns)
    draw.line((124, 1320, WIDTH - 124, 1320), fill=PALETTE["olive_primary"], width=2)

    col1_l, col1_r = 124, 756
    col2_l, col2_r = 844, WIDTH - 124
    draw.line((800, 1344, 800, 1986), fill=PALETTE["card_taupe"], width=1)

    draw.text(
        (col1_l, 1348),
        "I. TRÀ SỮA & TRÀ NÔNG SẢN ĐÀ LẠT",
        font=font_sec,
        fill=PALETTE["olive_primary"],
    )
    left_items = [
        ("Trà Sữa Atiso", "Atiso xanh nấu tươi & trân châu đen mật", "45k • 50k"),
        ("Trà Sữa Atiso Chuối", "Chuối Laba dẻo quyện trà sữa Atiso", "48k • 53k"),
        ("Oolong Sen Gừng", "Trà Oolong hạt sen bùi & gừng ấm", "45k"),
        ("Trà Quýt Nhài Cát Tường", "Trà hoa nhài mứt quýt tươi thanh mát", "45k"),
        ("Trà Dâu Tằm Đà Lạt", "Dâu tằm chín mọng ngâm đường phèn", "45k"),
        ("Kombucha Chanh Vàng", "Trà lên men tự nhiên SCOBY & chanh vàng", "48k"),
        ("Sữa Tươi Kem Trứng Nướng", "Sữa thanh trùng phủ kem trứng khò béo mịn", "45k • 50k"),
    ]
    for i, (name, sub, price) in enumerate(left_items):
        draw_menu_row(
            draw,
            col1_l,
            col1_r,
            1404 + i * 82,
            name,
            sub,
            price,
            font_item,
            font_item_sub,
            font_mono_bold,
        )

    draw.text(
        (col2_l, 1348),
        "II. CÀ PHÊ CẦU ĐẤT & BÁNH TRÁNG NHÀ ỐM",
        font=font_sec,
        fill=PALETTE["terracotta"],
    )
    right_items = [
        ("Cold Brew Me", "Cà phê ủ lạnh hạt Cầu Đất & cốt me rừng", "45k"),
        ("Cà Phê Muối / Bạc Xỉu", "Phin đậm Đà Lạt phủ kem muối biển dịu", "40k • 35k"),
        ("Cà Phê Kem Tiramisu", "Lớp kem phô mai cacao phủ cà phê phin", "45k"),
        ("Bánh Tráng Trộn Tóp Mỡ", "Tóp mỡ nhà thắng giòn rụm & sốt tắc", "40k"),
        ("Cơm Cháy Chà Bông", "Cơm cháy đáy nồi sốt mắm cay ngọt", "45k"),
        ("Bánh Tráng Cuốn Bơ", "Cuốn dẻo sốt bơ trứng vàng ươm béo ngậy", "45k"),
        ("Bánh Chấm Lòng Đào", "Sốt me đậu phộng chấm trứng lòng đào", "45k"),
    ]
    for i, (name, sub, price) in enumerate(right_items):
        draw_menu_row(
            draw,
            col2_l,
            col2_r,
            1404 + i * 82,
            name,
            sub,
            price,
            font_item,
            font_item_sub,
            font_mono_bold,
        )

    # Bottom Dark Espresso Colophon Banner
    banner_box = (124, 2016, WIDTH - 124, 2152)
    draw.rounded_rectangle(
        banner_box,
        radius=20,
        fill=PALETTE["hero_espresso"],
        outline=PALETTE["olive_primary"],
        width=2,
    )
    draw_centered_text(
        draw,
        2040,
        "CS1: 28A Hoàng Diệu • CS2: Hẻm 33 Nguyễn Công Trứ • CS3: 158 Nguyễn Công Trứ (Đà Lạt)",
        font_item_sub,
        PALETTE["card_butter"],
    )
    draw_centered_text(
        draw,
        2076,
        "CS4: 544 Quốc lộ 20, Liên Nghĩa (Đức Trọng)  |  Mở cửa 08:00 – 22:00  |  Đường chuẩn 70%",
        font_item_sub,
        PALETTE["surface_light"],
    )
    draw_centered_text(
        draw,
        2112,
        "HOTLINE ĐÀ LẠT: 0945 396 117  •  ĐỨC TRỌNG: 037 444 0869  •  FB.COM/TRASUADALATOMSUA",
        font_mono_xs,
        PALETTE["card_taupe"],
    )

    png_path = OUT_DIR / "omsua-botanical-menu-poster.png"
    pdf_path = OUT_DIR / "omsua-botanical-menu-poster.pdf"

    img.save(png_path, format="PNG", optimize=True)
    img.save(pdf_path, format="PDF", resolution=200.0, title="Ốm Sữa Đà Lạt — Botanical Menu Poster")
    print(f"[poster] wrote {png_path} ({png_path.stat().st_size // 1024} KB)")
    print(f"[poster] wrote {pdf_path} ({pdf_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    generate()

#!/usr/bin/env python3
"""Deterministic 2-page generator for Ốm Sữa's 'Bản Khắc Cao Nguyên' botanical menu atlas (.png + 2-page .pdf).

Strictly uses canonical OMSUA_COLORS + WCAG AA deep companion inks (zero pure white or pure black)
and Open Font License Vietnamese-capable serif/mono fonts from canvas-design.
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

# Canonical OMSUA_COLORS + WCAG AA companion inks (zero pure white or pure black)
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
    "ochre_deep": (128, 91, 26),          # #805B1A
    "terracotta": (217, 107, 30),         # #D96B1E
    "terracotta_deep": (168, 75, 13),     # #A84B0D
    "coral_sketch": (224, 125, 119),      # #E07D77
    "artichoke": (122, 139, 59),          # #7A8B3B
    "artichoke_deep": (77, 89, 34),       # #4D5922
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
        draw.ellipse((cx - 3, cy - 3, cx + 3, cy + 3), fill=PALETTE["terracotta_deep"])


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
    draw.text(
        (x_right - pw, y + 2),
        price,
        font=font_price,
        fill=PALETTE["terracotta_deep"],
    )

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


def draw_artichoke_specimen(draw: ImageDraw.ImageDraw, cx: int, cy: int) -> None:
    medallion_r = 415
    draw.ellipse(
        (cx - medallion_r, cy - medallion_r, cx + medallion_r, cy + medallion_r),
        fill=PALETTE["surface_light"],
        outline=PALETTE["card_taupe"],
        width=2,
    )

    for idx, radius in enumerate([392, 356, 312, 262, 206]):
        ring_color = (
            PALETTE["card_olive_gold"] if idx % 2 == 0 else PALETTE["card_sage"]
        )
        draw.ellipse(
            (cx - radius, cy - radius, cx + radius, cy + radius),
            outline=ring_color,
            width=1,
        )

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

    draw.line((cx - 432, cy, cx - 398, cy), fill=PALETTE["olive_primary"], width=2)
    draw.line((cx + 398, cy, cx + 432, cy), fill=PALETTE["olive_primary"], width=2)
    draw.line((cx, cy - 432, cx, cy - 398), fill=PALETTE["olive_primary"], width=2)
    draw.line((cx, cy + 398, cx, cy + 432), fill=PALETTE["olive_primary"], width=2)

    total_bracts = 132
    for n in range(total_bracts - 1, -1, -1):
        ratio = n / float(total_bracts)
        angle = n * GOLDEN_ANGLE
        dist = 32 + math.sqrt(ratio) * 282

        bx = cx + math.cos(angle) * dist
        by = cy + math.sin(angle) * dist

        length = 40 + ratio * 44
        half_w = 15 + ratio * 18

        ux, uy = math.cos(angle), math.sin(angle)
        px, py = -uy, ux

        tip = (bx + ux * length, by + uy * length)
        left = (
            bx + ux * (length * 0.28) + px * half_w,
            by + uy * (length * 0.28) + py * half_w,
        )
        base = (bx - ux * 10, by - uy * 10)
        right = (
            bx + ux * (length * 0.28) - px * half_w,
            by + uy * (length * 0.28) - py * half_w,
        )

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
        vein_end = (bx + ux * (length * 0.76), by + uy * (length * 0.76))
        draw.line([base, vein_end], fill=edge_col, width=1)

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


def draw_elevation_profile(
    draw: ImageDraw.ImageDraw,
    font_mono_xs: ImageFont.FreeTypeFont,
    font_mono_bold: ImageFont.FreeTypeFont,
    font_item: ImageFont.FreeTypeFont,
    font_sub: ImageFont.FreeTypeFont,
) -> None:
    box = (124, 340, WIDTH - 124, 836)
    draw.rounded_rectangle(
        box,
        radius=24,
        fill=PALETTE["surface_light"],
        outline=PALETTE["card_taupe"],
        width=2,
    )

    # Horizontal elevation datum lines (1.000m -> 1.700m)
    datum_levels = [
        (760, "1.000M"),
        (670, "1.200M"),
        (580, "1.400M"),
        (490, "1.600M"),
    ]
    for y_line, label in datum_levels:
        for dx in range(230, WIDTH - 156, 14):
            draw.line((dx, y_line, dx + 7, y_line), fill=PALETTE["card_taupe"], width=1)
        draw.text((152, y_line - 12), label, font=font_mono_xs, fill=PALETTE["warm_muted"])

    draw.text(
        (152, 366),
        "FIG. 02 — LÁT CẮT ĐỊA HÌNH VÙNG NGUYÊN LIỆU & HỆ THỐNG CƠ SỞ LÂM ĐỒNG",
        font=font_mono_bold,
        fill=PALETTE["ochre_deep"],
    )

    # Highland ridge polygon rising from Đức Trọng (1,050m) -> Đà Lạt (1,500m) -> Cầu Đất (1,650m)
    ridge_points = [
        (230, 742),
        (370, 728),
        (510, 682),
        (650, 610),
        (810, 548),
        (980, 535),
        (1140, 502),
        (1310, 468),
        (1432, 484),
    ]
    polygon_fill = [(230, 792), *ridge_points, (1432, 792)]
    draw.polygon(polygon_fill, fill=PALETTE["card_sage"])

    # Secondary inner contour strata
    lower_strata = [(x, min(790, y + 42)) for x, y in ridge_points]
    draw.polygon([(230, 792), *lower_strata, (1432, 792)], fill=PALETTE["card_butter"])
    draw.line(ridge_points, fill=PALETTE["olive_primary"], width=4)

    stations = [
        (370, 728, "ĐỨC TRỌNG • 1.050M", "CS4 — 544 Quốc lộ 20", PALETTE["terracotta_deep"]),
        (910, 540, "TP. ĐÀ LẠT • 1.500M", "CS1 • CS2 • CS3 Trung tâm", PALETTE["olive_primary"]),
        (1310, 468, "ĐỒI CẦU ĐẤT • 1.650M", "Vùng trà & Atiso sương sớm", PALETTE["artichoke_deep"]),
    ]
    for sx, sy, title, note, marker_col in stations:
        draw.line((sx, sy, sx, 792), fill=marker_col, width=2)
        draw.ellipse(
            (sx - 10, sy - 10, sx + 10, sy + 10),
            fill=PALETTE["surface_light"],
            outline=marker_col,
            width=3,
        )
        draw.ellipse((sx - 4, sy - 4, sx + 4, sy + 4), fill=marker_col)
        label_x = min(max(240, sx - 130), WIDTH - 420)
        label_y = sy - 68
        draw.rounded_rectangle(
            (label_x, label_y, label_x + 276, label_y + 54),
            radius=12,
            fill=PALETTE["canvas_cream"],
            outline=marker_col,
            width=1,
        )
        draw.text((label_x + 12, label_y + 6), title, font=font_mono_xs, fill=marker_col)
        draw.text((label_x + 12, label_y + 28), note, font=font_sub, fill=PALETTE["hero_espresso"])


def render_page_one() -> Image.Image:
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

    draw.text(
        (124, 112),
        "PLATE I / II — HERBARIUM SPECIMEN NO. 2017 (CYNARA SCOLYMUS)",
        font=font_mono_xs,
        fill=PALETTE["ochre_deep"],
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

    draw_centered_text(draw, 184, "ỐM SỮA ĐÀ LẠT", font_title, PALETTE["olive_primary"])
    draw_centered_text(
        draw,
        274,
        "“Trà sữa của người Đà Lạt — Gói trọn sương sớm & vị ngọt lành nguyên bản từ 2017”",
        font_subtitle,
        PALETTE["warm_muted"],
    )

    draw_artichoke_specimen(draw, WIDTH // 2, 790)

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
        fill=PALETTE["terracotta_deep"],
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
        "HOTLINE ĐÀ LẠT: 0945 396 117  •  ĐỨC TRỌNG: 037 444 0869  •  TRANG 01 / 02",
        font_mono_xs,
        PALETTE["card_taupe"],
    )
    return img


def render_page_two() -> Image.Image:
    img = Image.new("RGB", (WIDTH, HEIGHT), PALETTE["canvas_cream"])
    draw = ImageDraw.Draw(img)

    draw_paper_weave(draw)
    draw_registration_frame(draw)

    font_mono_xs = load_font("IBMPlexMono-Regular.ttf", 20)
    font_mono_bold = load_font("IBMPlexMono-Bold.ttf", 21)
    font_title = load_font("Lora-Bold.ttf", 56)
    font_subtitle = load_font("Lora-Italic.ttf", 25)
    font_sec = load_font("Lora-Bold.ttf", 26)
    font_item = load_font("Lora-Bold.ttf", 24)
    font_item_sub = load_font("Lora-Italic.ttf", 19)

    draw.text(
        (124, 112),
        "PLATE II / II — HIGHLAND TOPOGRAPHY, HOUSE TOPPINGS & 4 BRANCHES",
        font=font_mono_xs,
        fill=PALETTE["ochre_deep"],
    )
    edition = "BẢN KHẮC CAO NGUYÊN • ẤN BẢN LƯU TRỮ"
    ebbox = draw.textbbox((0, 0), edition, font=font_mono_xs)
    draw.text(
        (WIDTH - 124 - (ebbox[2] - ebbox[0]), 112),
        edition,
        font=font_mono_xs,
        fill=PALETTE["olive_primary"],
    )
    draw.line((124, 152, WIDTH - 124, 152), fill=PALETTE["card_taupe"], width=2)

    draw_centered_text(
        draw,
        186,
        "BẢN ĐỒ ĐỘ CAO & SỔ TAY TOPPING NHÀ ỐM",
        font_title,
        PALETTE["olive_primary"],
    )
    draw_centered_text(
        draw,
        262,
        "Từ đồi trà Cầu Đất 1.650m đến 4 quầy pha chế ấm áp giữa sương sớm Lâm Đồng",
        font_subtitle,
        PALETTE["warm_muted"],
    )

    draw_elevation_profile(draw, font_mono_xs, font_mono_bold, font_item, font_item_sub)

    # Section III: 8 House-made Toppings
    draw.line((124, 876, WIDTH - 124, 876), fill=PALETTE["olive_primary"], width=2)
    draw.text(
        (124, 904),
        "III. TÁM LOẠI TOPPING NHÀ LÀM — NẤU MỚI MỖI SÁNG",
        font=font_sec,
        fill=PALETTE["olive_primary"],
    )

    col1_l, col1_r = 124, 756
    col2_l, col2_r = 844, WIDTH - 124
    draw.line((800, 956, 800, 1290), fill=PALETTE["card_taupe"], width=1)

    toppings_left = [
        ("Trân châu đen nấu mật", "Nấu chậm cùng đường đen dẻo ấm", "+10k"),
        ("Trân châu trắng", "Giòn sần sật hợp trà trái cây & Atiso", "+10k"),
        ("Kem trứng khò béo mịn", "Đánh bông tươi, khò lửa thơm mặt", "+20k"),
        ("Bánh flan trứng caramel", "Bánh flan sữa tươi Đà Lạt mềm mịn", "+15k"),
    ]
    toppings_right = [
        ("Hạt sen", "Hạt sen ninh bùi ngọt thanh tự nhiên", "+15k"),
        ("Khúc bạch hạnh nhân", "Thạch sữa kem tươi điểm lát hạnh nhân", "+10k"),
        ("Hạt đác rim", "Đác tươi rim dứa & chanh dây giòn ngọt", "+15k"),
        ("Thạch củ năng", "Củ năng giòn mát bọc bột năng trong veo", "+10k"),
    ]
    for i, (name, sub, price) in enumerate(toppings_left):
        draw_menu_row(
            draw,
            col1_l,
            col1_r,
            964 + i * 84,
            name,
            sub,
            price,
            font_item,
            font_item_sub,
            font_mono_bold,
        )
    for i, (name, sub, price) in enumerate(toppings_right):
        draw_menu_row(
            draw,
            col2_l,
            col2_r,
            964 + i * 84,
            name,
            sub,
            price,
            font_item,
            font_item_sub,
            font_mono_bold,
        )

    # Section IV: 4 Official Branches Architectural Grid + Craft Standards
    draw.line((124, 1328, WIDTH - 124, 1328), fill=PALETTE["olive_primary"], width=2)
    draw.text(
        (124, 1356),
        "IV. DANH BẠ 4 CƠ SỞ CHÍNH THỨC & CHUẨN PHA CHẾ NGUYÊN BẢN",
        font=font_sec,
        fill=PALETTE["terracotta_deep"],
    )

    branches = [
        (
            "CƠ SỞ 01 • HOÀNG DIỆU",
            "28A Hoàng Diệu, Phường Cam Ly, TP. Đà Lạt",
            "Hotline: 0945 396 117  •  Giao 15–25 phút",
            PALETTE["card_butter"],
        ),
        (
            "CƠ SỞ 02 • HẺM 33 NGUYỄN CÔNG TRỨ",
            "Hẻm 33 Nguyễn Công Trứ, P. Lâm Viên, TP. Đà Lạt",
            "Hotline: 0945 396 117  •  Góc tiệm nắng sớm",
            PALETTE["surface_light"],
        ),
        (
            "CƠ SỞ 03 • 158 NGUYỄN CÔNG TRỨ",
            "158 Nguyễn Công Trứ, P. Lâm Viên, TP. Đà Lạt",
            "Hotline: 0945 396 117  •  Quầy bánh tráng & trà",
            PALETTE["surface_light"],
        ),
        (
            "CƠ SỞ 04 • LIÊN NGHĨA — ĐỨC TRỌNG",
            "544 Quốc lộ 20, TT. Liên Nghĩa, H. Đức Trọng",
            "Hotline: 037 444 0869  •  Cửa ngõ cao nguyên",
            PALETTE["card_sage"],
        ),
    ]

    card_w = 646
    card_h = 216
    for idx, (code, addr, meta, bg_fill) in enumerate(branches):
        col = idx % 2
        row = idx // 2
        x0 = 124 + col * (card_w + 60)
        y0 = 1418 + row * (card_h + 34)
        draw.rounded_rectangle(
            (x0, y0, x0 + card_w, y0 + card_h),
            radius=20,
            fill=bg_fill,
            outline=PALETTE["olive_primary"],
            width=2,
        )
        draw.text((x0 + 28, y0 + 24), code, font=font_mono_bold, fill=PALETTE["olive_primary"])
        draw.text((x0 + 28, y0 + 74), addr, font=font_item, fill=PALETTE["hero_espresso"])
        draw.line((x0 + 28, y0 + 132, x0 + card_w - 28, y0 + 132), fill=PALETTE["card_taupe"], width=1)
        draw.text((x0 + 28, y0 + 154), meta, font=font_item_sub, fill=PALETTE["warm_muted"])

    # Craft Calibration Footer Box
    footer_box = (124, 1938, WIDTH - 124, 2152)
    draw.rounded_rectangle(
        footer_box,
        radius=20,
        fill=PALETTE["hero_espresso"],
        outline=PALETTE["olive_primary"],
        width=2,
    )
    draw_centered_text(
        draw,
        1966,
        "CHUẨN VỊ PHA CHẾ ỐM SỮA: ĐƯỜNG 70% NGỌT DỊU • ĐÁ 50% GIỮ TRỌN HƯƠNG TRÀ • TRÂN CHÂU NẤU MỚI",
        font_mono_xs,
        PALETTE["card_butter"],
    )
    draw_centered_text(
        draw,
        2018,
        "Đặt món trực tuyến tại omsua-web.vercel.app  •  Chọn độ ngọt (100% / 70% / 50% / 30% / 0%) & đá riêng linh hoạt",
        font_item_sub,
        PALETTE["surface_light"],
    )
    draw_centered_text(
        draw,
        2066,
        "MỞ CỬA MỖI NGÀY: 08:00 – 22:00  •  FB.COM/TRASUADALATOMSUA  •  TRANG 02 / 02",
        font_mono_xs,
        PALETTE["card_taupe"],
    )
    return img


def generate() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    page_one = render_page_one()
    page_two = render_page_two()

    png_path = OUT_DIR / "omsua-botanical-menu-poster.png"
    pdf_path = OUT_DIR / "omsua-botanical-menu-poster.pdf"

    page_one.save(png_path, format="PNG", optimize=True)
    page_one.save(
        pdf_path,
        format="PDF",
        resolution=200.0,
        save_all=True,
        append_images=[page_two],
        title="Ốm Sữa Đà Lạt — Bản Khắc Cao Nguyên (2-Page Botanical Menu Atlas)",
    )
    print(f"[poster] wrote {png_path} ({png_path.stat().st_size // 1024} KB)")
    print(f"[poster] wrote 2-page {pdf_path} ({pdf_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    generate()

#!/usr/bin/env python3
"""Generate public/og-default.png for site-wide social link previews.

Run from the project root:
    uv run python scripts/make-og-default.py
or:
    python3 scripts/make-og-default.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "og-default.png"

W, H = 1200, 630

GBLUE = (66, 133, 244)
GRED = (234, 67, 53)
GYELLOW = (251, 188, 4)
GGREEN = (52, 168, 83)

INK = (24, 24, 27)
CLOUD = (245, 245, 247)
ASH = (113, 113, 122)

TITLE = "GDG Coding Jams"
HEAD1 = "Build with AI."
HEAD2 = "Together."
HEAD3 = "In two hours."
SUBTITLE = "8 weekly tracks · 75-minute Antigravity codelab · drop-in friendly"

# 8 tracks labeled 01–08, each colored by its lineup position.
TRACK_LABELS = [
    ("01", GBLUE), ("02", GRED), ("03", GYELLOW), ("04", GGREEN),
    ("05", GBLUE), ("06", GRED), ("07", GYELLOW), ("08", GGREEN),
]


def load_font(size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in candidates:
        if Path(path).exists():
            # HelveticaNeue.ttc index 7 is Bold, index 4 is Medium, index 0 is Regular
            idx = 7 if bold else 4
            try:
                return ImageFont.truetype(path, size, index=idx)
            except OSError:
                return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def main() -> None:
    img = Image.new("RGB", (W, H), CLOUD)
    draw = ImageDraw.Draw(img)

    # Subtle diagonal gradient feel via two slabs
    for y in range(H):
        # Cloud → slightly whiter at top, slightly more shadowed at bottom
        t = y / H
        r = int(CLOUD[0] * (1 - t * 0.05))
        g = int(CLOUD[1] * (1 - t * 0.05))
        b = int(CLOUD[2] * (1 - t * 0.05))
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Sparse dotted background — kept to the right side only so it doesn't compete with the headline
    import random

    random.seed(42)
    for _ in range(60):
        x = random.randint(700, W - 20)
        y = random.randint(60, H - 100)
        size = random.choice([2, 2, 3])
        draw.ellipse([(x, y), (x + size, y + size)], fill=(180, 180, 188))

    # Eyebrow chip — "8 INDEPENDENT JAMS"
    eyebrow_font = load_font(20, bold=True)
    eyebrow = "GDG · 8 INDEPENDENT TRACKS · CODELAB INSIDE"
    ex = 64
    ey = 64
    bbox = draw.textbbox((ex, ey), eyebrow, font=eyebrow_font)
    pad_x, pad_y = 16, 10
    draw.rounded_rectangle(
        [(bbox[0] - pad_x, bbox[1] - pad_y), (bbox[2] + pad_x, bbox[3] + pad_y)],
        radius=999,
        fill=(255, 255, 255),
        outline=(0, 0, 0, 25),
        width=1,
    )
    draw.text((ex, ey), eyebrow, font=eyebrow_font, fill=ASH)

    # Title
    title_font = load_font(56, bold=True)
    draw.text((64, 130), TITLE, font=title_font, fill=INK)

    # Big headline — three lines with colored "Together."
    head_font = load_font(96, bold=True)
    line_h = 110
    base_y = 215
    draw.text((64, base_y), HEAD1, font=head_font, fill=INK)
    # "Together." cycles through Google colors via per-letter coloring
    colors = [GBLUE, GRED, GYELLOW, GGREEN]
    x_cursor = 64
    for i, ch in enumerate(HEAD2):
        color = colors[i % len(colors)] if ch != "." else INK
        draw.text((x_cursor, base_y + line_h), ch, font=head_font, fill=color)
        w = draw.textbbox((0, 0), ch, font=head_font)[2]
        x_cursor += w
    draw.text((64, base_y + line_h * 2), HEAD3, font=head_font, fill=INK)

    # Subtitle
    sub_font = load_font(26)
    draw.text((64, base_y + line_h * 3 + 30), SUBTITLE, font=sub_font, fill=ASH)

    # Lineup grid on the right — 4x2 numbered colored tiles representing the 8 tracks.
    # Each tile has its number + the track color. Clean, recognizable, and works without emoji fonts.
    label_font = load_font(34, bold=True)
    tile_w, tile_h = 96, 96
    gap = 16
    grid_cols = 2
    grid_x0 = 870
    grid_y0 = 150
    for i, (label, color) in enumerate(TRACK_LABELS):
        col = i % grid_cols
        row = i // grid_cols
        x0 = grid_x0 + col * (tile_w + gap)
        y0 = grid_y0 + row * (tile_h + gap)
        draw.rounded_rectangle(
            [(x0, y0), (x0 + tile_w, y0 + tile_h)],
            radius=18,
            fill=color,
        )
        # Center the label inside the tile
        bbox = draw.textbbox((0, 0), label, font=label_font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(
            (x0 + (tile_w - tw) / 2 - bbox[0], y0 + (tile_h - th) / 2 - bbox[1]),
            label,
            font=label_font,
            fill=(255, 255, 255),
        )

    # Google color bar at the bottom
    bar_h = 14
    bar_y = H - bar_h
    seg = W // 4
    draw.rectangle([(0, bar_y), (seg, H)], fill=GBLUE)
    draw.rectangle([(seg, bar_y), (seg * 2, H)], fill=GRED)
    draw.rectangle([(seg * 2, bar_y), (seg * 3, H)], fill=GYELLOW)
    draw.rectangle([(seg * 3, bar_y), (W, H)], fill=GGREEN)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT.relative_to(ROOT)} ({W}x{H})")


if __name__ == "__main__":
    main()

"""Builds print-ready logo and signboard PNGs into public/branding (needs Pillow)."""
from PIL import Image, ImageDraw, ImageFont
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'public', 'branding')
os.makedirs(OUT, exist_ok=True)
FONTS = r'C:\Windows\Fonts'
BLACK = ['seguibl.ttf', 'segoeuib.ttf', 'arialbd.ttf']
BOLD = ['segoeuib.ttf', 'arialbd.ttf']
REG = ['segoeui.ttf', 'arial.ttf']

GREEN, DEEP, RED, REDL, MINT, WHITE = (15, 107, 61), (10, 59, 42), (193, 18, 31), (239, 51, 64), (123, 227, 163), (255, 255, 255)


def font(names, size):
    for n in names:
        p = os.path.join(FONTS, n)
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def fit(draw, text, names, max_w, start):
    size = start
    while size > 10:
        f = font(names, size)
        if draw.textlength(text, font=f) <= max_w:
            return f
        size -= 4
    return font(names, 10)


def spaced(text, gap=1):
    return (' ' * gap).join(text)


def mark(size, bg=None):
    """Roof + PE monogram tile."""
    S = size * 2
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * 0.24), fill=GREEN)
    w = int(S * 0.07)
    pts = [(S * 0.17, S * 0.46), (S * 0.5, S * 0.17), (S * 0.83, S * 0.46)]
    d.line(pts, fill=(255, 123, 132), width=w, joint='curve')
    for p in (pts[0], pts[2]):
        d.ellipse((p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2), fill=(255, 123, 132))
    d.text((S * 0.5, S * 0.70), 'PE', font=font(BLACK, int(S * 0.34)), fill=WHITE, anchor='mm')
    d.rounded_rectangle((S * 0.26, S * 0.87, S * 0.74, S * 0.91), radius=int(S * 0.02), fill=(255, 123, 132))
    return img.resize((size, size), Image.LANCZOS)


def lockup(dark_bg):
    """Horizontal logo: tile + PANDIT ESTATE + tagline. Transparent background."""
    W, H = 3150, 1100
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    img.paste(mark(900), (60, 100), mark(900))
    text = WHITE if dark_bg else DEEP
    d.text((1060, 430), 'PANDIT', font=font(BLACK, 420), fill=text, anchor='ls')
    d.text((1060, 800), 'ESTATE', font=font(BLACK, 420), fill=(255, 123, 132) if dark_bg else RED, anchor='ls')
    d.rounded_rectangle((1060, 850, 3000, 878), radius=14, fill=(255, 123, 132) if dark_bg else RED)
    d.text((1060, 1010), spaced('PROPERTY DEALERS & CONSULTANTS', 1), font=font(BOLD, 74), fill=text, anchor='ls')
    return img


lockup(False).save(os.path.join(OUT, 'logo-for-light-background.png'))
lockup(True).save(os.path.join(OUT, 'logo-for-dark-background.png'))

# ---- signboard / flex banner, 3:1 (6000 x 2000) ----
W, H = 6000, 2000
img = Image.new('RGB', (W, H), DEEP)
px = img.load()
for y in range(H):  # soft vertical green gradient
    for x in range(0, W, 1):
        t = y / H
        px[x, y] = (int(8 + 6 * t), int(66 - 22 * t), int(44 - 12 * t))
d = ImageDraw.Draw(img)
d.rectangle((0, 0, W, 40), fill=RED)
d.rectangle((0, H - 40, W, H), fill=RED)

m = mark(560)
img.paste(m, (150, 130), m)
d.text((800, 440), 'PANDIT ESTATE', font=fit(d, 'PANDIT ESTATE', BLACK, 4900, 400), fill=WHITE, anchor='ls')
d.rounded_rectangle((800, 490, 2400, 518), radius=14, fill=REDL)
d.text((800, 640), spaced('PROPERTY DEALERS & CONSULTANTS', 1), font=fit(d, spaced('PROPERTY DEALERS & CONSULTANTS', 1), BOLD, 4900, 110), fill=MINT, anchor='ls')

# ribbon
rib = 'SALE   •   PURCHASE   •   RENTING'
rf = font(BLACK, 150)
rw = d.textlength(rib, font=rf)
rx = (W - rw) / 2
d.rounded_rectangle((rx - 160, 730, rx + rw + 160, 940), radius=105, fill=REDL)
d.text((W / 2, 835), rib, font=rf, fill=WHITE, anchor='mm')

lines = ['DDA Plots  ·  Society Flats  ·  DDA Flats  ·  SFS Flats', 'Commercial Plots  ·  Land in L-Zone  ·  Society Membership in L-Zone']
y = 1060
for ln in lines:
    d.text((W / 2, y), ln, font=fit(d, ln, BOLD, 5400, 130), fill=WHITE, anchor='mm')
    y += 150

# contact strip
d.rectangle((0, 1400, W, 1960), fill=WHITE)
ph = '+91 98110 93769   |   +91 88517 91516'
d.text((W / 2, 1545), ph, font=fit(d, ph, BLACK, 5300, 230), fill=DEEP, anchor='mm')
addr = 'Plot No. 5, Sector 19, Dwarka, New Delhi – 110075  (Near Vardhman Crown Mall)'
d.text((W / 2, 1715), addr, font=fit(d, addr, REG, 5300, 110), fill=(60, 80, 68), anchor='mm')
d.text((W / 2, 1850), 'Suresh Bhardwaj  ·  rk.panditestate@gmail.com', font=fit(d, 'Suresh Bhardwaj  ·  rk.panditestate@gmail.com', BOLD, 5000, 100), fill=RED, anchor='mm')
img.save(os.path.join(OUT, 'signboard-3x1.png'), optimize=True)
print('branding written to', OUT)

"""Regenerates the favicon, app icons and the default share image (needs Pillow: pip install pillow)."""
from PIL import Image, ImageDraw, ImageFont
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PUB = os.path.join(ROOT, 'public')
FONTS = r'C:\Windows\Fonts'
SANSB = ['segoeuib.ttf', 'arialbd.ttf']
CINZEL = os.path.join(ROOT, 'scripts', 'fonts', 'Cinzel-Bold.woff')
SANS = ['segoeui.ttf', 'arial.ttf']

TEAL, DEEP, CORAL, MINT = (50, 56, 66), (14, 16, 20), (255, 107, 122), (255, 154, 166)


def font(names, size):
    if names == 'cinzel':
        return ImageFont.truetype(CINZEL, size)
    for n in names:
        p = os.path.join(FONTS, n)
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def gradient(size, c1, c2):
    w, h = size
    img = Image.new('RGB', size)
    px = img.load()
    for y in range(h):
        for x in range(w):
            t = (x / w + y / h) / 2
            px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return img


def icon(px):
    """The PE logo mark on a rounded gradient square, drawn at 4x then downsampled."""
    S = px * 4
    img = gradient((S, S), TEAL, DEEP).convert('RGBA')
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * 0.27), fill=255)
    d = ImageDraw.Draw(img)
    w = int(S * 0.062)
    pts = [(S * 0.18, S * 0.45), (S * 0.5, S * 0.18), (S * 0.82, S * 0.45)]
    d.line(pts, fill=CORAL, width=w, joint='curve')
    for p in (pts[0], pts[2]):
        d.ellipse((p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2), fill=CORAL)
    d.text((S * 0.5, S * 0.69), 'PE', font=font('cinzel', int(S * 0.33)), fill='white', anchor='mm')
    d.rounded_rectangle((S * 0.26, S * 0.86, S * 0.74, S * 0.895), radius=int(S * 0.02), fill=CORAL)
    img.putalpha(mask)
    return img.resize((px, px), Image.LANCZOS)


big = icon(512)
big.save(os.path.join(PUB, 'icon-512.png'))
icon(192).save(os.path.join(PUB, 'icon-192.png'))
icon(32).save(os.path.join(PUB, 'favicon-32.png'))
a = Image.new('RGB', (180, 180), DEEP)  # apple touch icons must be opaque
i180 = icon(180)
a.paste(i180, (0, 0), i180)
a.save(os.path.join(PUB, 'apple-touch-icon.png'))
big.save(os.path.join(PUB, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])

# Social share image 1200x630 built from the project's own skyline photo
W, H = 1200, 630
bg = Image.open(os.path.join(PUB, 'images', 'home tour', 'Skyline view.jpg')).convert('RGB')
k = max(W / bg.width, H / bg.height)
bg = bg.resize((int(bg.width * k), int(bg.height * k)), Image.LANCZOS)
x0, y0 = (bg.width - W) // 2, (bg.height - H) // 2
bg = bg.crop((x0, y0, x0 + W, y0 + H))
overlay = Image.new('RGBA', (W, H))
od = ImageDraw.Draw(overlay)
for x in range(W):
    od.line((x, 0, x, H), fill=(6, 36, 26, int(225 - 150 * (x / W))))
bg = Image.alpha_composite(bg.convert('RGBA'), overlay)
d = ImageDraw.Draw(bg)
logo = icon(120)
bg.paste(logo, (70, 64), logo)
d.text((210, 98), 'PANDIT', font=font('cinzel', 50), fill='white', anchor='lm')
d.text((212, 144), 'E S T A T E', font=font(SANSB, 20), fill=CORAL, anchor='lm')
d.text((70, 300), 'PANDIT ESTATE', font=font('cinzel', 78), fill='white', anchor='ls')
d.text((70, 372), 'Your Trusted Dwarka', font=font(SANSB, 48), fill='white', anchor='ls')
d.text((70, 432), 'Property Partner', font=font(SANSB, 48), fill=MINT, anchor='ls')
d.text((70, 490), 'DDA Flats · Society Flats · Plots · L-Zone Land · Rentals', font=font(SANS, 28), fill=(225, 245, 241), anchor='ls')
d.rounded_rectangle((70, 520, 560, 586), radius=14, fill=(200, 16, 46))
d.text((315, 553), 'Call +91 98110 93769', font=font(SANSB, 30), fill='white', anchor='mm')
bg.convert('RGB').save(os.path.join(PUB, 'og-default.jpg'), quality=86, optimize=True)
print('assets written')

"""Builds the site logo, favicons, office photo and share image from the originals in source-images/.
Needs Pillow:  pip install pillow      Run:  python scripts/make-icons.py
Expected originals (any size):  Official logo estate.png, pandit favicon.png, office front.png
"""
from PIL import Image, ImageChops, ImageDraw, ImageFont
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'source-images')
PUB = os.path.join(ROOT, 'public')
IMG = os.path.join(PUB, 'images')
os.makedirs(IMG, exist_ok=True)


def content_box(im, pad=0, thresh=14):
    """Bounding box of everything that is not (near) white."""
    bg = Image.new('RGB', im.size, (255, 255, 255))
    diff = ImageChops.difference(im.convert('RGB'), bg).convert('L').point(lambda v: 255 if v > thresh else 0)
    b = diff.getbbox() or (0, 0) + im.size
    return (max(0, b[0] - pad), max(0, b[1] - pad), min(im.width, b[2] + pad), min(im.height, b[3] + pad))


# 1) wide logo, cropped tight, web size
logo = Image.open(os.path.join(SRC, 'Official logo estate.png')).convert('RGB')
logo = logo.crop(content_box(logo, 10))
logo.thumbnail((640, 640), Image.LANCZOS)
logo.save(os.path.join(IMG, 'logo.png'), optimize=True)
print('logo', logo.size, os.path.getsize(os.path.join(IMG, 'logo.png')) // 1024, 'KB')

# 2) round favicon -> transparent corners
fav = Image.open(os.path.join(SRC, 'pandit favicon.png')).convert('RGB')
fav = fav.crop(content_box(fav, 4))
side = max(fav.size)
sq = Image.new('RGB', (side, side), (255, 255, 255))
sq.paste(fav, ((side - fav.width) // 2, (side - fav.height) // 2))


def circle(img, px):
    big = img.resize((px * 4, px * 4), Image.LANCZOS).convert('RGBA')
    mask = Image.new('L', big.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, big.width - 1, big.height - 1), fill=255)
    big.putalpha(mask)
    return big.resize((px, px), Image.LANCZOS)


circle(sq, 512).save(os.path.join(PUB, 'icon-512.png'), optimize=True)
circle(sq, 192).save(os.path.join(PUB, 'icon-192.png'), optimize=True)
circle(sq, 32).save(os.path.join(PUB, 'favicon-32.png'), optimize=True)
ap = Image.new('RGB', (180, 180), (255, 255, 255))
inner = sq.resize((164, 164), Image.LANCZOS)
ap.paste(inner, (8, 8))
ap.save(os.path.join(PUB, 'apple-touch-icon.png'), optimize=True)
circle(sq, 256).save(os.path.join(PUB, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# 3) office front photo
off = Image.open(os.path.join(SRC, 'office front.png')).convert('RGB')
off.thumbnail((1000, 1400), Image.LANCZOS)
off.save(os.path.join(IMG, 'office.jpg'), quality=84, optimize=True, progressive=True)
print('office', off.size, os.path.getsize(os.path.join(IMG, 'office.jpg')) // 1024, 'KB')

# 4) share image 1200x630: logo on white
W, H = 1200, 630
og = Image.new('RGB', (W, H), (255, 255, 255))
lg = logo.copy()
lg.thumbnail((1000, 380), Image.LANCZOS)
og.paste(lg, ((W - lg.width) // 2, 70))
d = ImageDraw.Draw(og)
try:
    f1 = ImageFont.truetype(r'C:\Windows\Fonts\segoeuib.ttf', 40)
    f2 = ImageFont.truetype(r'C:\Windows\Fonts\segoeui.ttf', 30)
except OSError:
    f1 = f2 = ImageFont.load_default()
d.text((W / 2, 500), 'DDA Flats · Society Flats · Plots · L-Zone Land · Rentals', font=f2, fill=(60, 66, 77), anchor='mm')
d.text((W / 2, 560), 'Dwarka, New Delhi  |  +91 98110 93769', font=f1, fill=(200, 16, 46), anchor='mm')
og.save(os.path.join(PUB, 'og-default.jpg'), quality=88, optimize=True)
print('assets written')

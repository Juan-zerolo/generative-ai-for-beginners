"""Genera src/common/icon.png: rejilla de fichas con el 2048 destacado."""
from PIL import Image, ImageDraw, ImageFont

S, OUT = 512, 128
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.ellipse([0, 0, S - 1, S - 1], fill=(28, 26, 24, 255))
d.ellipse([5, 5, S - 6, S - 6], outline=(90, 82, 70, 255), width=7)

# Cuatro fichas: la grande delante, con el numero.
tiles = [
    ((118, 118, 210, 210), (60, 56, 50)),
    ((228, 118, 320, 210), (86, 78, 66)),
    ((118, 228, 210, 320), (86, 78, 66)),
]
for box, color in tiles:
    d.rounded_rectangle(box, radius=18, fill=color + (255,))

d.rounded_rectangle((212, 212, 372, 372), radius=26, fill=(230, 160, 40, 255))
try:
    f = ImageFont.truetype(FONT, 58)
except Exception:
    f = ImageFont.load_default()
text = '2048'
l, t, r, b = d.textbbox((0, 0), text, font=f)
d.text((292 - (r - l) / 2, 292 - (b - t) / 2 - t), text, font=f, fill=(40, 32, 20, 255))

img.resize((OUT, OUT), Image.LANCZOS).save('src/common/icon.png')
print('icono generado')

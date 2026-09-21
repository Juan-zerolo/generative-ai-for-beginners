"""Genera src/common/icon.png: circulo verde con la serpiente y la manzana.

Se dibuja a 512 px y se reduce a 128 para que los bordes queden suaves. El
fondo fuera del circulo es transparente, para que en el lanzador de la banda
se vea redondo como los iconos del sistema.
"""
from PIL import Image, ImageDraw

S, OUT = 512, 128
img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

d.ellipse([0, 0, S - 1, S - 1], fill=(8, 32, 18, 255))
d.ellipse([5, 5, S - 6, S - 6], outline=(40, 115, 64, 255), width=7)

GRID = 5
CELL = S // GRID
OFF = (S - CELL * GRID) // 2
PAD = 12


def box(cx, cy, pad=PAD):
    x0 = OFF + CELL * cx + pad
    y0 = OFF + CELL * cy + pad
    return [x0, y0, x0 + CELL - 2 * pad, y0 + CELL - 2 * pad]


body = [(1, 3), (2, 3), (3, 3), (3, 2)]
shades = [(46, 125, 50), (60, 150, 66), (76, 175, 80), (105, 240, 174)]
for (cx, cy), color in zip(body, shades):
    d.rounded_rectangle(box(cx, cy), radius=CELL // 4, fill=color + (255,))

hx0, hy0, hx1, hy1 = box(3, 2)
e = (hx1 - hx0) // 6
d.ellipse([hx0 + e * 3, hy0 + e, hx0 + e * 4 + e // 2, hy0 + e * 2 + e // 2], fill=(5, 28, 14, 255))

d.ellipse(box(1, 1, pad=16), fill=(255, 82, 82, 255))

img.resize((OUT, OUT), Image.LANCZOS).save('src/common/icon.png')
print('icono generado en src/common/icon.png')

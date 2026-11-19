import sys
from PIL import Image, ImageDraw
# Usage: inspect_cutout.py <cutout.png> <out.jpg> — the cut-out on cream, cacao and checkerboard, side by side.
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA")
H = 700
im = im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
def bg(color):
    b = Image.new("RGBA", im.size, color); b.alpha_composite(im); return b.convert("RGB")
chk = Image.new("RGB", im.size, (255, 255, 255)); d = ImageDraw.Draw(chk)
for y in range(0, im.height, 20):
    for x in range(0, im.width, 20):
        if (x // 20 + y // 20) % 2: d.rectangle([x, y, x + 19, y + 19], fill=(200, 200, 200))
chk = chk.convert("RGBA"); chk.alpha_composite(im); chk = chk.convert("RGB")
panels = [bg((251, 245, 238, 255)), bg((42, 23, 16, 255)), chk]
sheet = Image.new("RGB", (sum(p.width for p in panels) + 40, H + 20), (120, 120, 120))
x = 10
for p in panels:
    sheet.paste(p, (x, 10)); x += p.width + 10
sheet.save(out, quality=88); print(out, sheet.size)

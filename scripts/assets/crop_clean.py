import sys
from PIL import Image, ImageOps
# Usage: crop_clean.py <src> <out.jpg> <top> <left> <height> <width>
src, out, top, left, h, w = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:7])
im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
W, H = im.size
box = (max(0, left), max(0, top), min(W, left + w), min(H, top + h))
# Saved WITHOUT exif: no GPS, no camera metadata leaves this machine.
im.crop(box).save(out, "JPEG", quality=95, subsampling=0)
chk = Image.open(out)
print(f"{out.rsplit('/',1)[-1]}: {chk.size[0]}x{chk.size[1]}  exif={len(chk.info.get('exif', b''))}B  gps={34853 in chk.getexif()}")

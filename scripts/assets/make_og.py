import sys
from PIL import Image, ImageOps
src, out, top = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
W, H = im.size
target = 1200 / 630
crop_h = round(W / target)
top = max(0, min(top, H - crop_h))
im = im.crop((0, top, W, top + crop_h)).resize((1200, 630), Image.LANCZOS)
# Saved WITHOUT the exif argument: no EXIF/GPS is written to the output.
im.save(out, "JPEG", quality=84, optimize=True, progressive=True)
check = Image.open(out)
print(out, check.size, "exif bytes:", len(check.info.get("exif", b"")), "| GPS tag present:", 34853 in check.getexif())

"""
Clean a background-removed cut-out WITHOUT repainting the dessert.

Operations only touch alpha outside the subject, or desaturate background seen
through clear plastic:
  erase        polygons whose alpha is set to 0 (stray objects, other cups)
  keep_largest keep only the largest connected shape (drops loose props)
  fade         linear alpha fade between two y values (clear feet/stems that
               carried the board or counter through the plastic)
  glass        regions where LOW-saturation pixels (background seen through
               empty glass) are desaturated and made more transparent;
               saturated pixels (food) are untouched
  trim         crop to visible pixels + padding

Usage: clean_cutout.py <config.json> <name> <in.png> <out.png>
"""
import json
import sys
from collections import deque

from PIL import Image, ImageChops, ImageDraw, ImageFilter

cfg_path, name, src, out = sys.argv[1:5]
cfg = json.load(open(cfg_path))[name]
im = Image.open(src).convert("RGBA")
W, H = im.size
r, g, b, a = im.split()

# 1. Erase polygons.
if cfg.get("erase"):
    m = Image.new("L", (W, H), 255)
    d = ImageDraw.Draw(m)
    for poly in cfg["erase"]:
        d.polygon([tuple(p) for p in poly], fill=0)
    a = ImageChops.multiply(a, m.filter(ImageFilter.GaussianBlur(1.5)))

# 2. Keep the largest connected component (found on a 1/4 grid for speed).
if cfg.get("keep_largest"):
    s = 4
    small = a.resize((W // s, H // s), Image.BILINEAR)
    w, h = small.size
    px = small.load()
    thr = cfg.get("component_threshold", 96)
    seen = bytearray(w * h)
    best = []
    for y0 in range(h):
        for x0 in range(w):
            i0 = y0 * w + x0
            if seen[i0] or px[x0, y0] < thr:
                continue
            comp, q = [], deque([(x0, y0)])
            seen[i0] = 1
            while q:
                x, y = q.popleft()
                comp.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h:
                        j = ny * w + nx
                        if not seen[j] and px[nx, ny] >= thr:
                            seen[j] = 1
                            q.append((nx, ny))
            if len(comp) > len(best):
                best = comp
    keep = Image.new("L", (w, h), 0)
    kp = keep.load()
    for x, y in best:
        kp[x, y] = 255
    # Grow slightly so soft plastic edges next to the subject survive.
    keep = keep.filter(ImageFilter.MaxFilter(5)).resize((W, H), Image.BILINEAR)
    keep = keep.filter(ImageFilter.GaussianBlur(2))
    a = ImageChops.multiply(a, keep)

# 3. Fade (y_start fully visible → y_end fully transparent).
if cfg.get("fade"):
    y1, y2 = cfg["fade"]
    m = Image.new("L", (W, H), 255)
    d = ImageDraw.Draw(m)
    for y in range(y1, H):
        v = 0 if y >= y2 else round(255 * (1 - (y - y1) / max(1, y2 - y1)))
        d.line([(0, y), (W, y)], fill=v)
    a = ImageChops.multiply(a, m)

# 4. Glass: desaturate + thin out low-saturation background seen through plastic.
rgb = Image.merge("RGB", (r, g, b))
for reg in cfg.get("glass", []):
    x1, y1, x2, y2 = reg["box"]
    sat_max, alpha_k = reg.get("sat_max", 40), reg.get("alpha", 0.35)
    hsv = rgb.convert("HSV")
    pr, pa, ph = rgb.load(), a.load(), hsv.load()
    for y in range(max(0, y1), min(H, y2)):
        for x in range(max(0, x1), min(W, x2)):
            if ph[x, y][1] <= sat_max and pa[x, y] > 0:
                R, G, B = pr[x, y]
                L = int(0.299 * R + 0.587 * G + 0.114 * B)
                L = min(255, L + 25)  # read as clean, light plastic
                pr[x, y] = (L, L, L)
                pa[x, y] = int(pa[x, y] * alpha_k)
    r, g, b = rgb.split()

res = Image.merge("RGBA", (*rgb.split(), a))

# 5. Trim.
pad = cfg.get("pad", 24)
bbox = res.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
if bbox:
    x1, y1, x2, y2 = bbox
    res = res.crop((max(0, x1 - pad), max(0, y1 - pad), min(W, x2 + pad), min(H, y2 + pad)))
res.save(out)
print(f"{name}: {res.size[0]}x{res.size[1]}")

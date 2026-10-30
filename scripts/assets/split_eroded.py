import sys
from collections import deque
from PIL import Image, ImageFilter, ImageChops
# Usage: split_eroded.py <in.png> <out_prefix> <erode_px> <min_area> <max_pieces>
# Separate touching objects: erode the mask, label components, then grow each back inside the original mask.
src, prefix, er, min_area, max_n = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
im = Image.open(src).convert("RGBA"); W, H = im.size
full = im.getchannel("A").point(lambda v: 255 if v >= 110 else 0)
ero = full.filter(ImageFilter.MinFilter(2 * er + 1))
e = ero.load(); seen = bytearray(W * H); comps = []
for y0 in range(H):
    for x0 in range(W):
        if seen[y0*W+x0] or e[x0, y0] == 0: continue
        q = deque([(x0, y0)]); seen[y0*W+x0] = 1; pts = []
        while q:
            x, y = q.popleft(); pts.append((x, y))
            for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
                if 0 <= nx < W and 0 <= ny < H and not seen[ny*W+nx] and e[nx, ny]:
                    seen[ny*W+nx] = 1; q.append((nx, ny))
        if len(pts) >= min_area: comps.append(pts)
comps.sort(key=len, reverse=True)
kept = 0
for pts in comps:
    if kept >= max_n: break
    seed = Image.new("L", (W, H), 0); sp = seed.load()
    for x, y in pts: sp[x, y] = 255
    grown = ImageChops.multiply(seed.filter(ImageFilter.MaxFilter(2 * er + 3)), full)
    bb = grown.getbbox()
    if not bb: continue
    x1, y1, x2, y2 = bb
    if x1 <= 2 or y1 <= 2 or x2 >= W - 2 or y2 >= H - 2:  # cut off by the crop edge
        continue
    alpha = ImageChops.multiply(im.getchannel("A"), grown.filter(ImageFilter.GaussianBlur(1.2)))
    piece = Image.merge("RGBA", (*im.convert("RGB").split(), alpha)).crop((max(0, x1-10), max(0, y1-10), min(W, x2+10), min(H, y2+10)))
    kept += 1; piece.save(f"{prefix}-{kept:02d}.png")
print(f"{src.rsplit('/',1)[-1]}: {len(comps)} seeds, kept {kept} whole pieces")

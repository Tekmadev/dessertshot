# Asset pipeline

Turns the owner's phone photos into faithful cut-outs. Nothing here redraws the dessert: every step either crops, removes the background (Higgsfield, 1 credit), or edits only what surrounds the cup.

1. `crop_clean.py <src> <out.jpg> <top> <left> <height> <width>`: tight crop, **re-encoded without EXIF** (the originals carry GPS). Boxes are in `crops.json`.
2. Upload the crop to Higgsfield and run `remove_background` (log it in `ASSETS.md`). Raw results: job IDs in `ASSETS.md`.
3. `clean_cutout.py cleanup.json <name> <raw.png> <out.png>`: erase stray objects, keep the largest shape, fade clear feet, neutralise background seen through glass. Settings per cup in `cleanup.json`.
4. `split_eroded.py`: split touching floaters into single pieces.
5. `inspect_cutout.py`: preview a cut-out on cream, cacao and a checkerboard before approving it.
6. `make_og.py <src> <out.jpg> <top>`: 1200×630 share image, EXIF-free.

Masters awaiting the owner's approval live in `assets/review/` (not served). Approved ones are upscaled and exported to `public/media/cutouts/{slug}.webp` at 1600 px.

Run the Python scripts with `python3 -I` (needs Pillow). Source photos are in `source-photos/`, which is gitignored.

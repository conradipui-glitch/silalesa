#!/usr/bin/env python3
"""Convert three *shipped* JPEGs to WebP only when quality and size improve.

python -m pip install Pillow==11.3.0
python scripts/convert-shipped-jpegs.py          # dry-run, no changes
python scripts/convert-shipped-jpegs.py --apply  # create WebP and switch imports

The original JPEG remains as a source in Git, but Vite no longer publishes it
once the import is changed. No image substitution or synthetic photos.
"""
from __future__ import annotations

import argparse
import io
import math
from pathlib import Path
from PIL import Image, ImageChops, ImageOps, ImageStat

ROOT = Path(__file__).resolve().parents[1]
PRODUCTS = ROOT / "src/data/products.ts"
JPEG_FILES = (
    "interior-parnaya.jpg",
    "interior-otdyh.jpg",
    "winter.jpg",
)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--apply", action="store_true")
    args = p.parse_args()
    imports = PRODUCTS.read_text()
    saved = changed = 0
    for name in JPEG_FILES:
        source = ROOT / "src/assets/img" / name
        target = source.with_suffix(".webp")
        before = source.read_bytes()
        if target.exists():
            print(f"SKIP already converted: {target}")
            continue
        with Image.open(io.BytesIO(before)) as photo:
            original = ImageOps.exif_transpose(photo).convert("RGB")
            out = io.BytesIO()
            original.save(out, format="WEBP", quality=80, method=6)
            encoded = out.getvalue()
            with Image.open(io.BytesIO(encoded)) as decoded:
                rms = ImageStat.Stat(ImageChops.difference(original, decoded.convert("RGB"))).rms
                mse = sum(x*x for x in rms)/3
                psnr = float("inf") if mse == 0 else 10*math.log10(255*255/mse)
        reduction = 1 - len(encoded)/len(before)
        good = reduction >= .15 and psnr >= 34
        print(f"{'CONVERT' if good else 'SKIP quality/size'} {name} {len(before)} -> {len(encoded)} bytes ({reduction:.1%} saved), original pixels {original.size}, PSNR {psnr:.1f} dB")
        if good and args.apply:
            original_import = f'../assets/img/{name}'
            assert imports.count(original_import) == 1, f'Missing exactly one original import for {name}'
            imports = imports.replace(original_import, f'../assets/img/{target.name}')
            target.write_bytes(encoded)
            saved += len(before) - len(encoded)
            changed += 1
    if args.apply and changed:
        PRODUCTS.write_text(imports)
    print(f"JPEG_TO_WEBP changed={changed} saved={saved} bytes apply={args.apply}")


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Optimize real, shipped photographs without swapping or fabricating the original scenes.

One-time use: python -m pip install Pillow==11.3.0
              python scripts/optimize-images.py           # inspect only
              python scripts/optimize-images.py --apply   # write optimized originals

Only assets listed here are candidates. Excludes tiny demo/placeholder assets and
unused JPG originals. A fixed byte budget prevents recompressing an edited file on
subsequent runs. Keep backups in git; review photos visually before release.
"""

from __future__ import annotations

import argparse
import io
import math
from pathlib import Path
from PIL import Image, ImageChops, ImageOps, ImageStat

ROOT = Path(__file__).resolve().parents[1]
# Every name below is part of the production Vite bundle (not an unused source).
LIMITS = {
    "src/assets/img/iteration-5-1/hero-home.webp": 185_000,
    "src/assets/img/iteration-5-1/drilling-before.webp": 190_000,
    "src/assets/img/iteration-5-1/drilling-after.webp": 190_000,
    "src/assets/img/iteration-5-1/plaster-before.webp": 190_000,
    "src/assets/img/iteration-5-1/screed-before.webp": 170_000,
    "src/assets/img/interior-otdyh.jpg": 190_000,
    "src/assets/img/interior-parnaya.jpg": 175_000,
    "src/assets/img/winter.jpg": 185_000,
    "src/assets/img/kvadro-2x2.webp": 170_000,
    "src/assets/img/kvadro-4x2.webp": 160_000,
}


def optimize(path: Path) -> tuple[bytes, tuple[int, int], tuple[int, int], float]:
    with Image.open(path) as im:
        source = ImageOps.exif_transpose(im).convert("RGB")
        original_size = source.size
        target = source.copy()
        target.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        out = io.BytesIO()
        if path.suffix == ".webp":
            target.save(out, format="WEBP", quality=78, method=6)
        else:
            target.save(out, format="JPEG", quality=79, optimize=True, progressive=True, subsampling=0)
        result = out.getvalue()
        with Image.open(io.BytesIO(result)) as decoded:
            # Measure recompression distortion against the original at identical size.
            reference = source.resize(target.size, Image.Resampling.LANCZOS)
            delta = ImageChops.difference(reference, decoded.convert("RGB"))
            rms = ImageStat.Stat(delta).rms
            mse = sum(c * c for c in rms) / len(rms)
            psnr = float("inf") if mse == 0 else 10 * math.log10(255 * 255 / mse)
        return result, original_size, target.size, psnr


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="write only suitably smaller files")
    args = parser.parse_args()
    before = after = edited = 0
    for relative, ceiling in LIMITS.items():
        path = ROOT / relative
        original = path.read_bytes()
        before += len(original)
        if len(original) <= ceiling:
            after += len(original)
            print(f"SKIP budget {len(original):>7} <= {ceiling:>7} {relative}")
            continue
        result, dimensions, new_dimensions, psnr = optimize(path)
        improvement = 100 * (1 - len(result) / len(original))
        safe = improvement >= 10 and psnr >= 32
        status = "WRITE" if safe and args.apply else "CANDIDATE" if safe else "SKIP quality/size"
        if safe and args.apply:
            path.write_bytes(result)
            edited += 1
        after += len(result) if safe and args.apply else len(original)
        print(f"{status} {len(original):>7} -> {len(result):>7} B ({improvement:5.1f}% saved), {dimensions} -> {new_dimensions}, PSNR={psnr:.1f} dB {relative}")
    print(f"IMAGE_OPTIMIZATION before={before} after={after} saved={before-after} changed={edited} apply={args.apply}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

from PIL import Image


FORMATS = {
    "mobile": (1080, 1920),
    "horizontal": (1920, 1080),
    "16:9": (1920, 1080),
    "9:16": (1080, 1920),
}


def ease(t: float) -> float:
    t = min(1.0, max(0.0, t))
    return t * t * (3 - 2 * t)


def frame_from_page(page: Image.Image, y: int, width: int, height: int) -> Image.Image:
    return page.crop((0, y, width, y + height))


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a clean scroll recording from a full-page screenshot.")
    parser.add_argument("--input", required=True, help="Full-page PNG/JPG screenshot.")
    parser.add_argument("--output", required=True, help="Output MP4 path.")
    parser.add_argument("--format", default="mobile", choices=sorted(FORMATS), help="mobile/9:16 or horizontal/16:9.")
    parser.add_argument("--duration", type=float, default=30.0, help="Video duration in seconds.")
    parser.add_argument("--fps", type=int, default=30, help="Frames per second.")
    parser.add_argument("--start-hold", type=float, default=2.0, help="Seconds to hold at the top.")
    parser.add_argument("--end-hold", type=float, default=1.5, help="Seconds to hold at the bottom.")
    parser.add_argument("--zoom", type=float, default=1.0, help="Scale the page before scrolling. Use >1 for closer crop.")
    args = parser.parse_args()

    width, height = FORMATS[args.format]
    page = Image.open(args.input).convert("RGB")
    scale = (width / page.width) * args.zoom
    page = page.resize((int(page.width * scale), int(page.height * scale)), Image.Resampling.LANCZOS)

    if page.width < width:
        canvas = Image.new("RGB", (width, page.height), "white")
        canvas.paste(page, ((width - page.width) // 2, 0))
        page = canvas
    elif page.width > width:
        x = (page.width - width) // 2
        page = page.crop((x, 0, x + width, page.height))

    if page.height < height:
        canvas = Image.new("RGB", (width, height), "white")
        canvas.paste(page, (0, 0))
        page = canvas

    max_y = max(0, page.height - height)
    total = max(1, int(args.duration * args.fps))
    scroll_duration = max(0.1, args.duration - args.start_hold - args.end_hold)

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg",
        "-y",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{width}x{height}",
        "-r",
        str(args.fps),
        "-i",
        "-",
        "-an",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(out),
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    assert proc.stdin is not None

    for i in range(total):
        sec = i / args.fps
        if sec < args.start_hold:
            y = 0
        elif sec > args.duration - args.end_hold:
            y = max_y
        else:
            t = (sec - args.start_hold) / scroll_duration
            y = int(max_y * ease(t))
        proc.stdin.write(frame_from_page(page, y, width, height).tobytes())

    proc.stdin.close()
    raise_code = proc.wait()
    if raise_code:
        raise SystemExit(raise_code)
    print(out)


if __name__ == "__main__":
    main()

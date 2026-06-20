#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path


def slugify(text: str, max_len: int = 48) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = text.strip("-")
    return text[:max_len].strip("-") or "segmento"


def normalize_words(text: str) -> list[str]:
    return re.findall(r"\S+", text.strip())


def make_segments(text: str, words_per_segment: int) -> list[dict[str, str]]:
    words = normalize_words(text)
    segments = []
    for idx, start in enumerate(range(0, len(words), words_per_segment), start=1):
        chunk = words[start : start + words_per_segment]
        excerpt = " ".join(chunk)
        segments.append(
            {
                "segment_id": f"{idx:03d}",
                "start_word": str(start + 1),
                "end_word": str(start + len(chunk)),
                "excerpt": excerpt,
                "slug": f"{idx:03d}-{slugify(excerpt)}",
                "visual_intent": "",
                "search_query": "",
                "asset_type": "",
                "source_url": "",
                "local_file": "",
                "notes": "",
            }
        )
    return segments


def main() -> None:
    parser = argparse.ArgumentParser(description="Segment a video script into short visual insertion chunks.")
    parser.add_argument("input", nargs="?", help="Path to a UTF-8 text file containing the script.")
    parser.add_argument("--text", help="Script text. Used when no input file is provided.")
    parser.add_argument("--words", type=int, default=5, help="Words per segment. Default: 5.")
    parser.add_argument("--out", required=True, help="Output CSV path.")
    args = parser.parse_args()

    if args.input:
        text = Path(args.input).read_text(encoding="utf-8")
    elif args.text:
        text = args.text
    else:
        raise SystemExit("Provide an input file or --text.")

    if args.words < 1:
        raise SystemExit("--words must be >= 1.")

    segments = make_segments(text, args.words)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(segments[0].keys()) if segments else ["segment_id"])
        writer.writeheader()
        writer.writerows(segments)

    print(f"Wrote {len(segments)} segments to {out}")


if __name__ == "__main__":
    main()

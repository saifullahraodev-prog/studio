"""Make a contact sheet (grid of evenly spaced frames) from a video with FFmpeg.

Usage: python tools/contact_sheet.py <video> [out.png] [--cols 5] [--rows 2]
"""
import argparse
import json
import subprocess
from pathlib import Path


def duration(video: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(video)],
        capture_output=True, text=True, check=True,
    ).stdout
    return float(json.loads(out)["format"]["duration"])


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("video")
    p.add_argument("out", nargs="?")
    p.add_argument("--cols", type=int, default=5)
    p.add_argument("--rows", type=int, default=2)
    p.add_argument("--width", type=int, default=270, help="width of each thumbnail")
    a = p.parse_args()
    video = Path(a.video)
    out = Path(a.out) if a.out else video.with_name(video.stem + "-contact.png")
    n = a.cols * a.rows
    fps = n / max(duration(video), 0.1)
    vf = f"fps={fps:.5f},scale={a.width}:-2,tile={a.cols}x{a.rows}:padding=6:margin=6:color=0x222222"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(video), "-vf", vf, "-frames:v", "1", str(out)],
        check=True,
    )
    print(out)


if __name__ == "__main__":
    main()

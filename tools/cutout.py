"""Cut a drawn character out of a plain light background -> transparent PNG.

Flood-fills from the image border through pixels close to the background colour, so the
white head/helmet inside the black outline stays opaque. Soft edge from colour distance.
Usage: python -I tools/cutout.py <in.jpg> <out.png>   (needs ffmpeg + numpy)
"""
import subprocess
import sys

import numpy as np


def load(path):
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
         "-of", "csv=p=0", path], capture_output=True, text=True, check=True).stdout.strip()
    w, h = map(int, probe.split(",")[:2])
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3).astype(np.float32)


def save(rgba, path):
    h, w, _ = rgba.shape
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{w}x{h}",
                    "-i", "-", "-frames:v", "1", path], input=rgba.astype(np.uint8).tobytes(), check=True)


def label(mask):
    """4-connected component labels (0 = not in mask), pure Python BFS (no scipy)."""
    from collections import deque
    h, w = mask.shape
    lab = np.zeros((h, w), np.int32)
    flat = mask.ravel(); out = lab.ravel()
    n = 0
    for start in np.flatnonzero(flat):
        if out[start]:
            continue
        n += 1
        out[start] = n
        q = deque([start])
        while q:
            p = q.popleft()
            y, x = divmod(p, w)
            for nb, ok in ((p - w, y > 0), (p + w, y < h - 1), (p - 1, x > 0), (p + 1, x < w - 1)):
                if ok and flat[nb] and not out[nb]:
                    out[nb] = n
                    q.append(nb)
    return lab


def main(src, dst):
    img = load(src)
    h, w, _ = img.shape
    border = np.concatenate([img[0], img[-1], img[:, 0], img[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.sqrt(((img - bg) ** 2).sum(-1))
    passable = dist < 38
    # flood fill from the border: grow until stable (4-neighbour dilation inside `passable`)
    reach = np.zeros_like(passable)
    reach[0, :] = passable[0, :]; reach[-1, :] = passable[-1, :]
    reach[:, 0] = passable[:, 0]; reach[:, -1] = passable[:, -1]
    while True:
        g = reach.copy()
        g[1:] |= reach[:-1]; g[:-1] |= reach[1:]; g[:, 1:] |= reach[:, :-1]; g[:, :-1] |= reach[:, 1:]
        g &= passable
        if (g == reach).all():
            break
        reach = g
    # enclosed background gaps (between arm and body, between legs): same colour as the
    # background (tight match, so white heads/eyes stay), big enough to not be a highlight
    # Heads/helmets are big near-white areas: skip any hole brighter than the background
    # or bigger than ~3% of the frame.
    tight = (dist < 12) & ~reach
    lab = label(tight)
    bright = img.mean(-1)
    bgb = bg.mean()
    for i in range(1, lab.max() + 1):
        r = lab == i
        n = int(r.sum())
        if n < 1500 or n > 0.03 * h * w:
            continue
        if bright[r].mean() > bgb + 2:
            continue
        reach |= r
    # keep only the biggest opaque piece (drops stray objects at the frame edge)
    solid = label(~reach)
    if solid.max() > 1:
        sizes = np.bincount(solid.ravel()); sizes[0] = 0
        reach |= (solid != sizes.argmax())
    alpha = np.where(reach, 0.0, 255.0)
    # soft edge: pixels touching the background get alpha from colour distance
    edge = np.zeros_like(reach)
    edge[1:] |= reach[:-1]; edge[:-1] |= reach[1:]; edge[:, 1:] |= reach[:, :-1]; edge[:, :-1] |= reach[:, 1:]
    edge &= ~reach
    alpha[edge] = np.clip(dist[edge] / 120 * 255, 60, 255)
    # crop to content with a margin
    ys, xs = np.where(alpha > 0)
    m = 12
    y0, y1 = max(ys.min() - m, 0), min(ys.max() + m, h)
    x0, x1 = max(xs.min() - m, 0), min(xs.max() + m, w)
    rgba = np.dstack([img, alpha])[y0:y1, x0:x1]
    save(rgba, dst)
    print(f"{dst}: {x1 - x0}x{y1 - y0}, bg={bg.round()}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

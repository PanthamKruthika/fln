"""Crop a question's bounding box out of a page image.

Coordinates are in PDF points (1/72 inch). When we render the PDF at
DPI=d, the page image is (page_w * d/72, page_h * d/72) pixels.
We convert bbox points → pixel coords before slicing the array.
"""
from __future__ import annotations

import numpy as np
from PIL import Image

from schemas import BBox


def points_to_pixels(bbox: BBox, page_w_pt: float, page_h_pt: float, dpi: int) -> tuple[int, int, int, int]:
    scale = dpi / 72.0
    x = int(round(bbox.x * scale))
    y = int(round(bbox.y * scale))
    w = int(round(bbox.width * scale))
    h = int(round(bbox.height * scale))

    img_w = int(round(page_w_pt * scale))
    img_h = int(round(page_h_pt * scale))

    # Clamp to image bounds
    x = max(0, min(x, img_w - 1))
    y = max(0, min(y, img_h - 1))
    w = max(1, min(w, img_w - x))
    h = max(1, min(h, img_h - y))
    return x, y, w, h


def crop_bbox(image: Image.Image | np.ndarray, bbox: BBox, page_w_pt: float, page_h_pt: float, dpi: int) -> np.ndarray:
    if isinstance(image, Image.Image):
        arr = np.asarray(image.convert("RGB"))
    else:
        arr = image

    x, y, w, h = points_to_pixels(bbox, page_w_pt, page_h_pt, dpi)
    return arr[y:y + h, x:x + w].copy()


def crop_region(image: Image.Image | np.ndarray, region_bbox: BBox, parent_bbox: BBox, page_w_pt: float, page_h_pt: float, dpi: int) -> np.ndarray:
    """Crop a labelled sub-region (e.g. one MCQ bubble) whose coordinates
    are given relative to the page. Used by circle/matching/tick extractors.
    """
    return crop_bbox(image, region_bbox, page_w_pt, page_h_pt, dpi)
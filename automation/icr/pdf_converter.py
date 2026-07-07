"""Convert a scanned PDF into per-page images.

Production note: requires the `poppler` system binary (`brew install
poppler` on macOS). On Linux: `apt-get install poppler-utils`.
The pdf2image package is a thin wrapper around pdftoppm / pdftocairo.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from pdf2image import convert_from_path
from PIL import Image


def pdf_to_images(pdf_path: str | Path, dpi: int = 200) -> list[Image.Image]:
    """Convert each PDF page to a PIL Image at the given DPI.

    DPI 200 is a good balance for handwriting OCR — high enough to
    read digits, low enough to keep files small.
    """
    return convert_from_path(str(pdf_path), dpi=dpi)


def pil_to_cv(image: Image.Image) -> np.ndarray:
    """PIL → OpenCV (RGB→BGR)."""
    arr = np.asarray(image.convert("RGB"))
    return arr[:, :, ::-1].copy()


def cv_to_pil(arr: np.ndarray) -> Image.Image:
    """OpenCV → PIL (BGR→RGB)."""
    return Image.fromarray(arr[:, :, ::-1])
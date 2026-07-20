"""Face embedding helpers built on top of the InsightFace model."""

import numpy as np
from numpy import dot
from numpy.linalg import norm
from PIL import Image

from models.model import get_model


def get_embedding(image_path: str) -> list[float] | None:
    """Return the embedding of the first detected face, or None if none found."""
    img = np.array(Image.open(image_path).convert("RGB"))
    faces = get_model().get(img)
    if not faces:
        return None
    return faces[0].embedding.tolist()


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(dot(a, b) / (norm(a) * norm(b)))

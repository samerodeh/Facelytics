"""Face-analysis model loader.

The InsightFace model is large and slow to initialize, so it is loaded lazily
on first use and cached for the lifetime of the process. Importing this module
has no side effects.
"""

import logging

from config import settings

logger = logging.getLogger(__name__)

_model = None


def get_model():
    """Return the shared FaceAnalysis instance, loading it on first call."""
    global _model
    if _model is None:
        from insightface.app import FaceAnalysis

        logger.info("Loading face analysis model '%s'...", settings.face_model_name)
        _model = FaceAnalysis(
            name=settings.face_model_name,
            providers=["CPUExecutionProvider"],
        )
        _model.prepare(ctx_id=0)
        logger.info("Face analysis model loaded.")
    return _model

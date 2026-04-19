from sentence_transformers import SentenceTransformer
from app.core.config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

_model: Optional[SentenceTransformer] = None


def get_embedding_model() -> SentenceTransformer:
    """Lazy-load the embedding model (singleton)."""
    global _model
    if _model is None:
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _model


def embed_text(text: str) -> list:
    """Generate a single embedding vector for a text string."""
    model = get_embedding_model()
    vector = model.encode(text, convert_to_numpy=True)
    return vector.tolist()


def embed_texts(texts: list) -> list:
    """Generate embedding vectors for a list of texts."""
    model = get_embedding_model()
    vectors = model.encode(texts, convert_to_numpy=True)
    return [v.tolist() for v in vectors]

import hashlib
import logging
import math
import re
from collections import Counter
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# Fallback embedding dimension (matches all-MiniLM-L6-v2: 384 dims)
EMBED_DIM = 384

_model: Optional[object] = None


def get_embedding_model():
    """Lazy-load the embedding model (singleton).

    Uses sentence-transformers when installed (local/dev), otherwise returns
    None so hashed embeddings are used (serverless, keeps bundle small).
    """
    global _model
    if _model is not None:
        return _model
    try:
        from sentence_transformers import SentenceTransformer

        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
    except Exception as e:
        logger.warning(
            f"sentence-transformers unavailable ({e}); using hashed embeddings"
        )
        _model = None
    return _model


def _tokenize(text: str) -> list:
    """Lowercase alphanumeric tokens, matching typical embedding preprocessing."""
    return re.findall(r"[a-z0-9]+", text.lower())


def _hash_feature(token: str, dim: int) -> int:
    h = int(hashlib.md5(token.encode("utf-8")).hexdigest()[:8], 16)
    return h % dim


def _cosine_norm(vec: list) -> list:
    norm = math.sqrt(sum(v * v for v in vec))
    if norm > 0:
        return [v / norm for v in vec]
    return vec


def _hashed_embeddings(texts: list) -> list:
    """Deterministic TF-normalised hashed bag-of-words embeddings.

    Pure stdlib implementation so the serverless bundle stays tiny while the
    full semantic model can still be used locally via sentence-transformers.
    """
    result = []
    for text in texts:
        counts = Counter(_tokenize(text))
        vec = [0.0] * EMBED_DIM
        for token, freq in counts.items():
            vec[_hash_feature(token, EMBED_DIM)] += freq
        result.append(_cosine_norm(vec))
    return result


def embed_text(text: str) -> list:
    """Generate a single embedding vector for a text string."""
    if get_embedding_model() is not None:
        try:
            model = get_embedding_model()
            vector = model.encode(text, convert_to_numpy=True)
            return vector.tolist()
        except Exception as e:
            logger.warning(f"Model embedding failed ({e}); falling back to hashed")
    return _hashed_embeddings([text])[0]


def embed_texts(texts: list) -> list:
    """Generate embedding vectors for a list of texts."""
    if get_embedding_model() is not None and texts:
        try:
            model = get_embedding_model()
            vectors = model.encode(texts, convert_to_numpy=True)
            return [v.tolist() for v in vectors]
        except Exception as e:
            logger.warning(f"Model embedding failed ({e}); falling back to hashed")
    return _hashed_embeddings(texts)

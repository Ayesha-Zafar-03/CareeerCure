import logging
import math
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# Collection names
COLLECTION_CVS = "cvs"
COLLECTION_JOBS = "internships"
COLLECTION_COURSES = "courses"
COLLECTION_FAQS = "career_faqs"

_client: Optional[object] = None


def _cosine_similarity(a: list, b: list) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a)) or 1.0
    nb = math.sqrt(sum(y * y for y in b)) or 1.0
    return dot / (na * nb)


class _MemoryCollection:
    """Minimal in-memory collection that mirrors the ChromaDB API subset used here."""

    def __init__(self, name: str):
        self.name = name
        self._docs = []  # list of dicts: id, embedding, document, metadata

    def upsert(self, ids, embeddings, documents, metadatas):
        existing = {d["id"]: d for d in self._docs}
        for i, doc_id in enumerate(ids):
            existing[doc_id] = {
                "id": doc_id,
                "embedding": embeddings[i] if embeddings else None,
                "document": documents[i] if documents else "",
                "metadata": metadatas[i] if metadatas else {},
            }
        self._docs = list(existing.values())

    def count(self) -> int:
        return len(self._docs)

    def query(self, query_embeddings, n_results, include=None):
        qe = query_embeddings[0] if query_embeddings else None
        scored = sorted(
            (
                (_cosine_similarity(qe, d["embedding"]), d)
                for d in self._docs
                if d["embedding"] is not None
            ),
            key=lambda x: x[0],
            reverse=True,
        )[:n_results]
        return {
            "documents": [[d["document"] for _, d in scored]],
            "metadatas": [[d["metadata"] for _, d in scored]],
            "distances": [[1 - s for s, _ in scored]],
        }


class _MemoryClient:
    """In-memory ChromaDB client stand-in for serverless deployments."""

    def __init__(self):
        self._collections = {}

    def get_or_create_collection(self, name, metadata=None):
        if name not in self._collections:
            self._collections[name] = _MemoryCollection(name)
        return self._collections[name]


def _try_create_real_client():
    """Return a real ChromaDB PersistentClient if the package is installed."""
    try:
        import chromadb
        from chromadb.config import Settings as ChromaSettings

        return chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    except Exception as e:
        logger.warning(f"ChromaDB unavailable ({e}); using in-memory vector store")
        return None


def get_chroma_client():
    """Return a ChromaDB client (real when installed, in-memory otherwise)."""
    global _client
    if _client is None:
        _client = _try_create_real_client() or _MemoryClient()
    return _client


def get_or_create_collection(name: str):
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"},
    )


# ── CV helpers ────────────────────────────────────────────────────────────────

def upsert_cv(user_id: int, cv_text: str, embedding: list) -> None:
    col = get_or_create_collection(COLLECTION_CVS)
    col.upsert(
        ids=[str(user_id)],
        embeddings=[embedding],
        documents=[cv_text],
        metadatas=[{"user_id": user_id}],
    )


# ── Internship helpers ────────────────────────────────────────────────────────

def upsert_internship(internship_id: int, description: str, embedding: list) -> None:
    col = get_or_create_collection(COLLECTION_JOBS)
    col.upsert(
        ids=[str(internship_id)],
        embeddings=[embedding],
        documents=[description],
        metadatas=[{"internship_id": internship_id}],
    )


def search_similar_internships(cv_embedding: list, top_k: int = 5) -> list:
    col = get_or_create_collection(COLLECTION_JOBS)
    n = col.count()
    if n == 0:
        return []
    results = col.query(
        query_embeddings=[cv_embedding],
        n_results=min(top_k, n),
        include=["documents", "metadatas", "distances"],
    )
    matches = []
    for i, meta in enumerate(results["metadatas"][0]):
        matches.append(
            {
                "internship_id": meta["internship_id"],
                "score": round(1 - results["distances"][0][i], 4),  # cosine similarity
                "snippet": results["documents"][0][i][:200],
            }
        )
    return matches


# ── Course helpers ────────────────────────────────────────────────────────────

def upsert_course(course_id: int, description: str, embedding: list, skills_gained: list = None) -> None:
    col = get_or_create_collection(COLLECTION_COURSES)
    # Convert skills_gained list to comma-separated string for ChromaDB metadata
    skills_str = ",".join(skills_gained) if skills_gained else ""
    col.upsert(
        ids=[str(course_id)],
        embeddings=[embedding],
        documents=[description],
        metadatas=[{"course_id": course_id, "skills_gained": skills_str}],
    )


def search_similar_courses(cv_embedding: list, top_k: int = 5) -> list:
    col = get_or_create_collection(COLLECTION_COURSES)
    count = col.count()
    if count == 0:
        return []
    results = col.query(
        query_embeddings=[cv_embedding],
        n_results=min(top_k, count),
        include=["documents", "metadatas", "distances"],
    )
    matches = []
    for i, meta in enumerate(results["metadatas"][0]):
        matches.append(
            {
                "course_id": meta["course_id"],
                "score": round(1 - results["distances"][0][i], 4),  # cosine similarity
                "snippet": results["documents"][0][i][:200],
                "skills_gained": meta.get("skills_gained", "").split(",") if meta.get("skills_gained") else [],
            }
        )
    return matches


# ── FAQ / RAG helpers ─────────────────────────────────────────────────────────

def upsert_faq(faq_id: str, text: str, embedding: list) -> None:
    col = get_or_create_collection(COLLECTION_FAQS)
    col.upsert(
        ids=[faq_id],
        embeddings=[embedding],
        documents=[text],
        metadatas=[{"id": faq_id}],
    )


def search_faqs(query_embedding: list, top_k: int = 3) -> list:
    col = get_or_create_collection(COLLECTION_FAQS)
    count = col.count()
    if count == 0:
        return []
    results = col.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, count),
        include=["documents"],
    )
    return results["documents"][0]

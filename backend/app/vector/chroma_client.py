import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

_client: Optional[chromadb.Client] = None

# Collection names
COLLECTION_CVS = "cvs"
COLLECTION_JOBS = "internships"
COLLECTION_FAQS = "career_faqs"


def get_chroma_client() -> chromadb.Client:
    """Return a persistent ChromaDB client (singleton)."""
    global _client
    if _client is None:
        logger.info(f"Connecting to ChromaDB at {settings.CHROMA_PERSIST_DIR}")
        _client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _client


def get_or_create_collection(name: str) -> chromadb.Collection:
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
    results = col.query(
        query_embeddings=[cv_embedding],
        n_results=min(top_k, col.count() or 1),
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

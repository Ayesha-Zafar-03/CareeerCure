import logging
from groq import Groq
from app.core.config import settings
from app.vector.embedding_service import embed_text
from app.vector.chroma_client import search_faqs

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a career assistant at CareerCure. You talk like a knowledgeable friend, not a formal AI.

Keep replies short and direct — 2-4 sentences max unless the user asks for detail.
No bullet points unless listing steps. No "Certainly!" or "Great question!" openers.
Just answer naturally, like texting a smart friend who knows careers well.

You help with: CV writing, interview prep, skill advice, internship hunting, career decisions.
If you don't know something, say so simply and suggest where to look."""


def chat(user_message: str, conversation_history: list) -> str:
    """
    RAG-powered chatbot:
    1. Embed user message
    2. Retrieve relevant FAQ context from ChromaDB
    3. Send to Groq LLM with context + history
    4. Return assistant reply
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    # Retrieve relevant context
    query_embedding = embed_text(user_message)
    context_docs = search_faqs(query_embedding, top_k=3)
    context_str = "\n\n".join(context_docs) if context_docs else ""

    # Build messages
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if context_str:
        messages.append(
            {
                "role": "system",
                "content": f"Relevant career knowledge base context:\n{context_str}",
            }
        )

    # Add conversation history (last 10 turns to stay within token limits)
    messages.extend(conversation_history[-10:])
    messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=1024,
    )

    return response.choices[0].message.content.strip()

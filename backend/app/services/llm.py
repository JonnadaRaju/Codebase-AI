from groq import Groq
from app.config import settings

groq_client = Groq(api_key=settings.GROQ_API_KEY)


def generate_response(system_prompt: str, context: str, user_query: str) -> dict:
    """
    Generate a response from Groq LLM using the system prompt, retrieved context, and user query.
    Returns the answer text and token usage.
    """
    user_message = f"""Here is the relevant code from the project:

{context}

---

User Question: {user_query}"""

    response = groq_client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0.3,
        max_tokens=2048,
    )

    return {
        "answer": response.choices[0].message.content,
        "tokens_used": response.usage.total_tokens
    }
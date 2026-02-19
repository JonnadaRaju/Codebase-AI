# from groq import Groq
import google.generativeai as genai
from app.config import settings

# roq_client = Groq(api_key=settings.GROQ_API_KEY)

genai.configure(api_key=settings.GEMINI_API_KEY)


model = genai.GenerativeModel(
    model_name=settings.GEMINI_MODEL,
    generation_config=genai.types.GenerationConfig(
        temperature=0.2,
        max_output_tokens=4096,
    )
)


def generate_response(system_prompt: str, context: str, user_query: str) -> dict:
    full_prompt = f"""{system_prompt}

---

Here is the relevant code from the project:

{context}

---

User Question: {user_query}

Provide a detailed, accurate answer based strictly on the actual code shown above.
Reference specific file names, function names, and line logic from the code."""

    response = model.generate_content(full_prompt)

    # Approximate token count
    tokens_used = len(full_prompt.split()) + len(response.text.split())

    return {
        "answer": response.text,
        "tokens_used": tokens_used
    }

# def generate_response(system_prompt: str, context: str, user_query: str) -> dict:
#     user_message = f"""Here is the relevant code from the project:

# {context}

# ---

# User Question: {user_query}"""

#     response = groq_client.chat.completions.create(
#         model=settings.GROQ_MODEL,
#         messages=[
#             {"role": "system", "content": system_prompt},
#             {"role": "user", "content": user_message}
#         ],
#         temperature=0.3,
#         max_tokens=1024,
#     )

#     return {
#         "answer": response.choices[0].message.content,
#         "tokens_used": response.usage.total_tokens
#     }
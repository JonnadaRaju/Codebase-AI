import requests
from app.config import settings


FREE_MODELS = [
    "openrouter/free",   
]


def generate_response(system_prompt: str, context: str, user_query: str) -> dict:
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://codebaseai.app",
        "X-Title": "Codebase AI"
    }

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"""Here is the relevant code from the project:

{context}

---

User Question: {user_query}

Provide a detailed accurate answer based strictly on the actual code shown above.
Reference specific file names, function names, and line logic from the code."""}
    ]

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json={
            "model": "openrouter/free",
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 2048,
        },
        timeout=60
    )

    data = response.json()

    if response.status_code != 200:
        raise Exception(data.get("error", {}).get("message", "Unknown error"))

    answer = data["choices"][0]["message"]["content"]
    tokens_used = data.get("usage", {}).get("total_tokens", 0)
    
    # Show which model was actually used
    model_used = data.get("model", "unknown")
    print(f"✅ Model used: {model_used}")
    
    return {"answer": answer, "tokens_used": tokens_used}
import requests
import json
from app.config import settings

# ── OpenRouter free models (fallback order) ───────────────────────────────────
FREE_MODELS = [
    "meta-llama/llama-3.1-8b-instruct:free",
    "qwen/qwen-2-7b-instruct:free",
]


# ── Ollama (local) ────────────────────────────────────────────────────────────
def _call_ollama(system_prompt: str, user_message: str, stream: bool = False):
    try:
        response = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/chat",
            json={
                "model":    settings.OLLAMA_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_message},
                ],
                "stream": stream,
                "options": {
                    "temperature":   0.1,   # lower = more focused, less hallucination
                    "num_predict":   2048,
                    "top_p":         0.9,
                    "repeat_penalty": 1.1,  # reduces repetition
                    "num_ctx":       8192,  # larger context window — sees more code
                }
            },
            timeout=180 if not stream else 300,
            stream=stream
        )
        response.raise_for_status()

        if stream:
            def generate():
                chunk_num = 0
                for line in response.iter_lines():
                    if line:
                        data = line.decode('utf-8')
                        if data.startswith('data: '):
                            data = data[6:]
                        if data.strip() == '[DONE]':
                            break
                        try:
                            json_data = json.loads(data)
                            content = json_data.get('message', {}).get('content', '')
                            if content:
                                chunk_num += 1
                                yield content
                        except:
                            continue
                print(f"DEBUG: Ollama streamed {chunk_num} chunks")
            
            return generate()
        else:
            data = response.json()
            answer = data.get("message", {}).get("content", "")
            tokens = data.get("eval_count", 0) + data.get("prompt_eval_count", 0)

            print(f"✅ Ollama model used: {settings.OLLAMA_MODEL}")
            return {
                "answer":      answer,
                "tokens_used": tokens,
            }

    except requests.exceptions.ConnectionError:
        raise Exception(
            f"❌ Ollama not reachable at {settings.OLLAMA_BASE_URL}\n"
            f"   Make sure Ollama is running — it should auto-start on Windows."
        )
    except requests.exceptions.Timeout:
        raise Exception(
            f"❌ Ollama timed out — model is too slow for this query.\n"
            f"   Try a smaller model: OLLAMA_MODEL=llama3.2:latest"
        )
    except Exception as e:
        raise Exception(f"❌ Ollama error: {e}")


# ── OpenRouter (cloud) ────────────────────────────────────────────────────────
def _call_openrouter(system_prompt: str, user_message: str) -> dict:
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type":  "application/json",
        "HTTP-Referer":  "https://codebaseai.app",
        "X-Title":       "Codebase AI"
    }
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": user_message},
    ]

    last_error = None
    for model in FREE_MODELS:
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json={
                    "model":       model,
                    "messages":    messages,
                    "temperature": 0.2,
                    "max_tokens":  2048,
                },
                timeout=60
            )
            data = response.json()

            if response.status_code == 429:
                print(f"⚠️  Rate limited on {model}, trying next...")
                last_error = data.get("error", {}).get("message", "Rate limited")
                continue

            if response.status_code != 200:
                raise Exception(data.get("error", {}).get("message", "Unknown error"))

            answer     = data["choices"][0]["message"]["content"]
            tokens     = data.get("usage", {}).get("total_tokens", 0)
            model_used = data.get("model", model)

            print(f"✅ OpenRouter model used: {model_used}")
            return {
                "answer":      answer,
                "tokens_used": tokens,
            }

        except Exception as e:
            last_error = e
            if "429" in str(e) or "rate" in str(e).lower():
                continue
            raise e

    raise Exception(f"❌ All OpenRouter models failed. Last error: {last_error}")


# ── Main entry point ──────────────────────────────────────────────────────────
def generate_response(system_prompt: str, context: str, user_query: str, stream: bool = False):
    """
    Routes to Ollama or OpenRouter based on LLM_PROVIDER in .env

        LLM_PROVIDER=ollama      → local, free, offline
        LLM_PROVIDER=openrouter  → cloud, free tier, production
    """
    user_message = f"""CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:
1. Only use information EXPLICITLY visible in the "RETRIEVED SOURCE CODE" section
2. If a function name, method name, or variable is NOT in the code, you MUST write: "[NOT FOUND IN CODE]"
3. NEVER invent, guess, or infer function names that are not shown
4. When describing code flow, only mention functions/variables that appear EXACTLY as written
5. Bad answer: "The startTracing() method calls switchToInputScreen()" (you invented these!)
6. Correct answer: "I could not find startTracing() in the retrieved code"

=== RETRIEVED SOURCE CODE ===
{context}
=== END OF CODE ===

Question: {user_query}

Answer:"""

    provider = settings.LLM_PROVIDER.lower()
    print(f"🔀 Provider: {provider} | Model: {settings.OLLAMA_MODEL if provider == 'ollama' else 'openrouter'}")

    if provider == "ollama":
        return _call_ollama(system_prompt, user_message, stream=stream)
    else:
        if stream:
            raise Exception("Streaming not supported for OpenRouter")
        return _call_openrouter(system_prompt, user_message)
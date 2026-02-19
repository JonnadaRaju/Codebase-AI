from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal, Optional, List
from app.services.retriever import retrieve_context, format_context_for_llm, get_relevant_filenames
from app.services.llm import generate_response
from app.modes.prompts import (
    EXPLAIN_PROMPT, INTERVIEW_PROMPT, REVIEW_PROMPT,
    DEBUG_PROMPT, ARCHITECTURE_PROMPT
)

router = APIRouter()


class QueryRequest(BaseModel):
    project_id: str
    mode: Literal["explain", "interview", "review", "debug", "architecture"]
    question: str
    error_message: Optional[str] = None   
    num_questions: Optional[int] = 5      


class QueryResponse(BaseModel):
    answer: str
    mode: str
    relevant_files: List[str]
    tokens_used: int


def get_system_prompt(mode: str, num_questions: int = 5) -> str:
    prompts = {
        "explain": EXPLAIN_PROMPT,
        "interview": INTERVIEW_PROMPT.replace("{num_questions}", str(num_questions)),
        "review": REVIEW_PROMPT,
        "debug": DEBUG_PROMPT,
        "architecture": ARCHITECTURE_PROMPT,
    }
    return prompts.get(mode, EXPLAIN_PROMPT)


@router.post("/query", response_model=QueryResponse)
async def query_project(request: QueryRequest):
    user_query = request.question
    if request.mode == "debug" and request.error_message:
        user_query = f"Error/Issue: {request.error_message}\n\nContext: {request.question}"

    try:
        chunks = retrieve_context(request.project_id, user_query)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Project not found or retrieval failed: {str(e)}")

    if not chunks:
        raise HTTPException(status_code=404, detail="No relevant code found for this query.")

    context = format_context_for_llm(chunks)
    relevant_files = get_relevant_filenames(chunks)

    system_prompt = get_system_prompt(request.mode, request.num_questions or 5)

    try:
        result = generate_response(system_prompt, context, user_query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM generation failed: {str(e)}")

    return QueryResponse(
        answer=result["answer"],
        mode=request.mode,
        relevant_files=relevant_files,
        tokens_used=result["tokens_used"]
    )
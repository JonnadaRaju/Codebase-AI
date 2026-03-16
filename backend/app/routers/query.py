from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Literal, Optional, List
from sqlalchemy.orm import Session
from app.db.database import get_db, Project
from app.routers.auth import get_current_user
from app.services.retriever import retrieve_context, format_context_for_llm, get_relevant_filenames
from app.services.llm import generate_response
from app.modes.prompts import (
    EXPLAIN_PROMPT, INTERVIEW_PROMPT, REVIEW_PROMPT,
    DEBUG_PROMPT, ARCHITECTURE_PROMPT
)
import json

router = APIRouter()


def ensure_project_access(project_id: str, db: Session, current_user):
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == current_user.id)
        .first()
    )
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project


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
async def query_project(
    request: QueryRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    ensure_project_access(request.project_id, db, current_user)
    print(f"DEBUG: mode={request.mode}, question={request.question[:50] if request.question else 'None'}")
    
    # Interview mode needs broad retrieval query
    if request.mode == "interview":
        print("DEBUG: Entering interview mode - retrieving code")
        
        # Use a better query to find actual code chunks
        retrieval_query = (
            "function class method implementation "
            "logic code structure algorithm"
        )
        
        try:
            chunks = retrieve_context(request.project_id, retrieval_query, top_k=15)
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Project not found: {str(e)}")
        
        # Format with filenames
        context = ""
        for chunk in chunks:
            filename = chunk.get('filename', 'unknown')
            context += f"\n=== FILE: {filename} ===\n"
            context += chunk.get('text', '')
            context += "\n"
        
        relevant_files = list(set([
            chunk.get('filename', '')
            for chunk in chunks
            if chunk.get('filename')
        ]))
        
        system_prompt = get_system_prompt(request.mode, request.num_questions or 5)
        user_query = request.question or "Generate interview questions and answers based on this code"
        
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

    print("DEBUG: Not interview mode - will retrieve code")

    user_query = request.question
    if request.mode == "debug" and request.error_message:
        user_query = f"Error/Issue: {request.error_message}\n\nContext: {request.question}"

    # For architecture mode — focus query on code structure
    if request.mode == "architecture":
        user_query = f"source code files routes models database schemas functions classes {request.question}"

    try:
        chunks = retrieve_context(request.project_id, user_query, top_k=25)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Project not found: {str(e)}")

    # For architecture mode — filter out README/docs, keep only source code
    if request.mode == "architecture":
        code_chunks = [c for c in chunks if not any(
            c["filename"].lower().endswith(ext)
            for ext in ['.md', '.txt', '.rst', 'readme', 'specification']
        )]
        # Only use filtered chunks if we found code files, otherwise use all
        if code_chunks:
            chunks = code_chunks

    if not chunks:
        raise HTTPException(status_code=404, detail="No relevant code found.")

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


async def generate_stream(request: QueryRequest):
    # Interview mode needs broad retrieval query
    if request.mode == "interview":
        print("DEBUG: Interview mode - retrieving code")
        
        # Use a better query to find actual code chunks
        retrieval_query = (
            "function class method implementation "
            "logic code structure algorithm"
        )
        
        try:
            chunks = retrieve_context(request.project_id, retrieval_query, top_k=15)
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return
        
        # Format with filenames
        context = ""
        for chunk in chunks:
            filename = chunk.get('filename', 'unknown')
            context += f"\n=== FILE: {filename} ===\n"
            context += chunk.get('text', '')
            context += "\n"
        
        relevant_files = list(set([
            chunk.get('filename', '')
            for chunk in chunks
            if chunk.get('filename')
        ]))
        
        system_prompt = get_system_prompt(request.mode, request.num_questions or 5)
        user_query = request.question or "Generate interview questions and answers based on this code"
        
        result = generate_response(system_prompt, context, user_query, stream=True)
        
        for chunk in result:
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        
        yield f"data: {json.dumps({'done': True, 'relevant_files': relevant_files, 'mode': request.mode})}\n\n"
        return

    user_query = request.question
    if request.mode == "debug" and request.error_message:
        user_query = f"Error/Issue: {request.error_message}\n\nContext: {request.question}"

    if request.mode == "architecture":
        user_query = f"source code files routes models database schemas functions classes {request.question}"

    try:
        chunks = retrieve_context(request.project_id, user_query, top_k=25)
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
        return

    if request.mode == "architecture":
        code_chunks = [c for c in chunks if not any(
            c["filename"].lower().endswith(ext)
            for ext in ['.md', '.txt', '.rst', 'readme', 'specification']
        )]
        if code_chunks:
            chunks = code_chunks

    if not chunks:
        yield f"data: {json.dumps({'error': 'No relevant code found'})}\n\n"
        return

    context = format_context_for_llm(chunks)
    relevant_files = get_relevant_filenames(chunks)
    system_prompt = get_system_prompt(request.mode, request.num_questions or 5)
    
    print(f"DEBUG: Retrieved {len(chunks)} chunks, {len(relevant_files)} files")
    print(f"DEBUG: Context length = {len(context)} chars")

    try:
        result = generate_response(system_prompt, context, user_query, stream=True)
        
        chunk_count = 0
        for chunk in result:
            chunk_count += 1
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        
        print(f"DEBUG: Streamed {chunk_count} chunks")
        
        yield f"data: {json.dumps({'done': True, 'relevant_files': relevant_files, 'mode': request.mode})}\n\n"
    except Exception as e:
        print(f"DEBUG: Stream error: {e}")
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


@router.post("/query/stream")
async def query_project_stream(
    request: QueryRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    ensure_project_access(request.project_id, db, current_user)
    return StreamingResponse(generate_stream(request), media_type="text/event-stream")

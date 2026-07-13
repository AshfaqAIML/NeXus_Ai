from fastapi import FastAPI, Depends, Header, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
import httpx

from core.rtk_engine import RTKCompressionEngine
from core.smart_route import SmartRouter
from core.provider_service import ModelProviderService

app = FastAPI(title="Nexus Chat Service")

rtk_engine = RTKCompressionEngine()
smart_router = SmartRouter()

class MessageCreate(BaseModel):
    chat_id: str
    content: str
    use_knowledge_base: bool = False
    preferred_model: Optional[str] = None

async def get_memories(prompt: str, user_id: str, workspace_id: str) -> List[str]:
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "http://localhost:8004/memories/retrieve",
                params={"prompt": prompt},
                headers={"X-User-Id": user_id, "X-Workspace-Id": workspace_id},
                timeout=5.0,
            )
            if resp.status_code == 200:
                return resp.json().get("memories", [])
    except Exception:
        pass
    return []

async def get_chat_history(db: AsyncSession, chat_id: str, limit: int = 20) -> List[dict]:
    return []

async def get_chat_settings(db: AsyncSession, chat_id: str) -> dict:
    return {"rtk_enabled": True}

async def get_db():
    yield None

@app.post("/messages/stream")
async def create_and_stream_message(
    msg: MessageCreate,
    x_user_id: str = Header(...),
    x_workspace_id: str = Header(...),
    db: AsyncSession = Depends(get_db),
):
    memories = await get_memories(msg.content, x_user_id, x_workspace_id)

    rag_contexts = []
    if msg.use_knowledge_base:
        async with httpx.AsyncClient() as client:
            rag_resp = await client.post(
                "http://localhost:8003/knowledge/retrieve",
                json={"query": msg.content, "workspace_id": x_workspace_id, "top_k": 5},
                timeout=10.0,
            )
            if rag_resp.status_code == 200:
                rag_contexts = rag_resp.json().get("contexts", [])

    memory_block = "\n".join([f"- {m}" for m in memories])
    rag_block = "\n\n".join([f"[Source: {c['source']}]\n{c['text']}" for c in rag_contexts])

    system_prompt = {
        "role": "system",
        "content": f"""You are Nexus AI.

# Relevant User Memories
{memory_block}

# Knowledge Base Context (RAG)
{rag_block}
""",
    }

    previous_messages = await get_chat_history(db, msg.chat_id, limit=20)

    chat_settings = await get_chat_settings(db, msg.chat_id)
    rtk_enabled = chat_settings.get("rtk_enabled", True)

    compressed_context, orig_tokens, comp_tokens = await rtk_engine.compress(
        new_message=msg.content,
        history=[system_prompt] + previous_messages,
        rtk_enabled=rtk_enabled,
    )

    routing_decision = await smart_router.route(
        messages=compressed_context,
        user_preferred_model=msg.preferred_model,
    )

    async def event_generator():
        yield f'data: {{"type": "rtk_stats", "original": {orig_tokens}, "compressed": {comp_tokens}}}\n\n'
        yield f'data: {{"type": "routing", "model": "{routing_decision.model_id}", "reason": "{routing_decision.reasoning}"}}\n\n'
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, List
import json

from core.rtk_engine import RTKCompressionEngine
from core.smart_route import SmartRouter
from core.provider_service import ModelProviderService

app = FastAPI(title="Nexus Chat Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rtk_engine = RTKCompressionEngine()
smart_router = SmartRouter()
provider_service = ModelProviderService()

# In-memory chat histories (per chat_id)
chat_histories: Dict[str, List[dict]] = {}

NEXUS_SYSTEM_PROMPT = (
    "You are Nexus AI, a powerful multi-model AI assistant. "
    "You are designed to help users with a wide variety of tasks including coding, writing, analysis, math, research, and creative work. "
    "You should provide accurate, thorough, and well-structured answers. "
    "Use markdown formatting including code blocks, headers, lists, and bold/italic text when appropriate. "
    "When you don't know something, say so clearly. "
    "Be concise but comprehensive — avoid unnecessary filler or repetition."
)


class MessageCreate(BaseModel):
    content: str
    chat_id: str = "default"
    use_knowledge_base: bool = False
    preferred_model: Optional[str] = None
    system_hint: Optional[str] = None
    rtk_enabled: bool = True


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/messages/stream")
async def create_and_stream_message(
    msg: MessageCreate,
    x_user_id: str = Header(default="anonymous"),
    x_workspace_id: str = Header(default="default"),
):
    # Get or create chat history
    if msg.chat_id not in chat_histories:
        chat_histories[msg.chat_id] = []
    history = chat_histories[msg.chat_id]

    system_content = NEXUS_SYSTEM_PROMPT
    if msg.system_hint:
        system_content = msg.system_hint + "\n\n" + system_content

    system_msg = {"role": "system", "content": system_content}
    full_history = [system_msg] + history

    compressed_context, orig_tokens, comp_tokens = await rtk_engine.compress(
        new_message=msg.content,
        history=full_history,
        rtk_enabled=msg.rtk_enabled,
    )

    # Save user message to history
    history.append({"role": "user", "content": msg.content})
    # Cap history at 20 messages
    if len(history) > 20:
        chat_histories[msg.chat_id] = history[-20:]

    routing_decision = await smart_router.route(
        messages=compressed_context,
        user_preferred_model=msg.preferred_model,
    )

    async def event_generator():
        yield f"data: {json.dumps({'type': 'rtk_stats', 'original': orig_tokens, 'compressed': comp_tokens})}\n\n"
        yield f"data: {json.dumps({'type': 'routing', 'model': routing_decision.model_id, 'reason': routing_decision.reasoning})}\n\n"

        assistant_content = ""
        async for chunk in provider_service.stream_completion(
            model_id=routing_decision.model_id,
            messages=compressed_context,
        ):
            assistant_content += chunk
            yield f"data: {json.dumps({'type': 'content', 'text': chunk})}\n\n"

        # Save assistant response to history
        history.append({"role": "assistant", "content": assistant_content})

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

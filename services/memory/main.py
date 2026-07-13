from fastapi import FastAPI, Depends, Header, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
import uuid
import os

from packages.python_sdk.nexus_db.database import get_db
from packages.python_sdk.nexus_db.models import Memory
from qdrant_client import QdrantClient
from qdrant_client.models import SearchRequest, PointStruct
import litellm

app = FastAPI(title="Nexus Memory Service")

# Qdrant Client
qdrant = QdrantClient(url=os.getenv("QDRANT_URL", "http://localhost:6333"))
COLLECTION_NAME = "nexus_memory"

class MemoryExtractRequest(BaseModel):
    chat_id: uuid.UUID
    user_id: uuid.UUID
    workspace_id: Optional[uuid.UUID] = None
    messages: List[dict]

@app.post("/memories/retrieve")
async def retrieve_memories(
    prompt: str, 
    x_user_id: str = Header(...), 
    x_workspace_id: str = Header(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the top 5 most relevant memories for the current prompt.
    """
    # 1. Embed the user's prompt
    embedding_response = await litellm.aembedding(
        model="openai/text-embedding-3-small",
        input=prompt,
        api_key=os.getenv("OPENAI_API_KEY")
    )
    prompt_vector = embedding_response.data[0]['embedding']
    
    # 2. Search Qdrant for relevant memories
    search_results = qdrant.search(
        collection_name=COLLECTION_NAME,
        query_vector=prompt_vector,
        query_filter={
            "must": [
                {"key": "user_id", "match": {"value": x_user_id}},
                {"key": "workspace_id", "match": {"value": x_workspace_id}}
            ]
        },
        limit=5,
        with_payload=True
    )
    
    # 3. Format and return memories
    memories = [hit.payload['memory_text'] for hit in search_results if hit.score > 0.75]
    return {"memories": memories}

@app.post("/memories/extract")
async def extract_memories(request: MemoryExtractRequest, background_tasks: BackgroundTasks):
    """
    Triggers background extraction of memories from a completed chat.
    """
    background_tasks.add_task(process_and_store_memories, request)
    return {"status": "Memory extraction queued"}

async def process_and_store_memories(request: MemoryExtractRequest):
    """
    Uses a cheap LLM to extract factual memories from the conversation.
    """
    extraction_prompt = f"""
    Analyze the following conversation. Extract concise, factual memories that would be useful for future interactions.
    Focus on user preferences, project context, and explicit instructions.
    
    Conversation:
    {request.messages}
    
    Output a JSON array of strings. Example: ["User prefers Python over Node.js", "Project uses FastAPI"]
    If no memories, output [].
    """
    
    try:
        response = await litellm.acompletion(
            model="openai/gpt-4o-mini", # Use cheap model for extraction
            messages=[{"role": "user", "content": extraction_prompt}],
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        import json
        memories = json.loads(response.choices[0].message.content)
        
        # Store each memory in Postgres and Qdrant
        for mem_text in memories:
            # 1. Save to Postgres
            # (Assume db session is available via context or injected dependency)
            # 2. Embed and save to Qdrant
            embedding_resp = await litellm.aembedding(
                model="openai/text-embedding-3-small",
                input=mem_text,
                api_key=os.getenv("OPENAI_API_KEY")
            )
            vector = embedding_resp.data[0]['embedding']
            
            qdrant.upsert(
                collection_name=COLLECTION_NAME,
                points=[PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector,
                    payload={
                        "user_id": str(request.user_id),
                        "workspace_id": str(request.workspace_id),
                        "memory_text": mem_text,
                        "importance_score": 0.7
                    }
                )]
            )
    except Exception as e:
        print(f"Memory extraction failed: {e}")
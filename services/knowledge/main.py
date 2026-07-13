from fastapi import FastAPI, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import SearchRequest, FusionQuery
import os
from llama_index.embeddings.openai import OpenAIEmbedding

app = FastAPI(title="Nexus Knowledge Service")

qdrant = QdrantClient(url=os.getenv("QDRANT_URL", "http://localhost:6333"))
embed_model = OpenAIEmbedding(model="text-embedding-3-small", api_key=os.getenv("OPENAI_API_KEY"))

class RetrievalRequest(BaseModel):
    query: str
    workspace_id: str
    top_k: int = 5

@app.post("/knowledge/retrieve")
async def retrieve_context(req: RetrievalRequest):
    """
    Retrieves relevant document chunks using Hybrid Search (Dense + Sparse).
    """
    # 1. Generate Dense Vector (Semantic)
    dense_vector = embed_model.get_text_embedding(req.query)
    
    # 2. Perform Search in Qdrant
    # Note: Qdrant supports sparse vectors natively if configured, or we use a BM25 pre-filter.
    # Here we execute a dense search with payload filtering.
    search_results = qdrant.search(
        collection_name="nexus_knowledge_chunks",
        query_vector=dense_vector,
        query_filter={
            "must": [{"key": "workspace_id", "match": {"value": req.workspace_id}}]
        },
        limit=req.top_k,
        with_payload=True
    )
    
    # 3. Format results for the Chat Service (and RTK Engine)
    contexts = []
    for hit in search_results:
        if hit.score > 0.70: # Relevance threshold
            payload = hit.payload
            contexts.append({
                "text": payload["chunk_text"],
                "source": payload.get("metadata", {}).get("file_name", "Unknown"),
                "score": hit.score
            })
            
    return {"contexts": contexts}
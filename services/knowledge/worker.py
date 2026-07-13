import asyncio
from celery import Celery
import os
from llama_index.core import SimpleDirectoryReader, Document
from llama_index.core.node_parser import SemanticSplitterNodeParser
from llama_index.embeddings.openai import OpenAIEmbedding
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct
import uuid

# Celery Config
app = Celery('nexus_knowledge', broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"))
qdrant = QdrantClient(url=os.getenv("QDRANT_URL", "http://localhost:6333"))

# LlamaIndex Config
embed_model = OpenAIEmbedding(model="text-embedding-3-small", api_key=os.getenv("OPENAI_API_KEY"))
splitter = SemanticSplitterNodeParser(embed_model=embed_model, buffer_size=512)

@app.task(name="process_document")
def process_document(file_path: str, document_id: str, workspace_id: str, source_type: str):
    """
    Celery task to parse, chunk, embed, and store a document.
    """
    try:
        # 1. Load Data
        if source_type == "web":
            # Mock: In prod, use llama_index.readers.web.SimpleWebPageReader
            docs = [Document(text="Fetched web content...")]
        else:
            reader = SimpleDirectoryReader(input_files=[file_path])
            docs = reader.load_data()
            
        # 2. Semantic Chunking
        nodes = splitter.get_nodes_from_documents(docs, show_progress=False)
        
        # 3. Embed and Prepare for Qdrant
        points = []
        for i, node in enumerate(nodes):
            # Generate embedding
            embedding = embed_model.get_text_embedding(node.text)
            
            # Construct payload
            payload = {
                "document_id": document_id,
                "workspace_id": workspace_id,
                "chunk_text": node.text,
                "chunk_index": i,
                "source_type": source_type,
                "metadata": node.metadata
            }
            
            points.append(PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload=payload
            ))
            
        # 4. Upsert to Qdrant
        qdrant.upsert(
            collection_name="nexus_knowledge_chunks",
            points=points
        )
        
        # 5. Update Document Status in Postgres (mocked here)
        # await db.execute("UPDATE documents SET status='ready' WHERE id=:id", {"id": document_id})
        
        return {"status": "success", "chunks_created": len(points)}
        
    except Exception as e:
        # Update Document status to 'failed'
        print(f"Error processing {document_id}: {e}")
        return {"status": "failed", "error": str(e)}
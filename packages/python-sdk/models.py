import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
from sqlalchemy.dialects.postgresql import UUID, JSONB

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="user") # user, admin
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    api_keys: Mapped[List["ApiKey"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class Workspace(Base):
    __tablename__ = "workspaces"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    name: Mapped[str] = mapped_column(String(100))
    settings: Mapped[dict] = mapped_column(JSONB, default=dict) # Default models, routing rules, etc.
    
    chats: Mapped[List["Chat"]] = relationship(back_populates="workspace")

class Chat(Base):
    __tablename__ = "chats"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255), default="New Chat")
    
    # Smart Router configuration
    routing_config: Mapped[dict] = mapped_column(JSONB, default=lambda: {"auto_route": True, "preferred_model": None})
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    workspace: Mapped["Workspace"] = relationship(back_populates="chats")
    messages: Mapped[List["Message"]] = relationship(back_populates="chat", cascade="all, delete-orphan", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("chats.id"))
    role: Mapped[str] = mapped_column(String(50)) # user, assistant, system, tool
    
    # Content is stored as Text, but could be JSON for complex multimodal blocks
    content: Mapped[str] = mapped_column(Text)
    
    # RTK Token Optimization Metrics
    original_tokens: Mapped[int] = mapped_column(Integer, default=0)
    compressed_tokens: Mapped[int] = mapped_column(Integer, default=0)
    cost_usd: Mapped[float] = mapped_column(Float, default=0.0)
    
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    chat: Mapped["Chat"] = relationship(back_populates="messages")

class ApiKey(Base):
    """Allows users to Bring Your Own Key (BYOK)"""
    __tablename__ = "api_keys"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    provider: Mapped[str] = mapped_column(String(50)) # openai, anthropic, openrouter
    encrypted_key: Mapped[str] = mapped_column(Text) # AES-256 encrypted
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    user: Mapped["User"] = relationship(back_populates="api_keys")

class Agent(Base):
    __tablename__ = "agents"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"))
    name: Mapped[str] = mapped_column(String(100))
    system_prompt: Mapped[str] = mapped_column(Text)
    
    # JSON array of tools, e.g., ["python_exec", "web_search", "github_read"]
    tools_config: Mapped[list] = mapped_column(JSONB, default=list)
    
    # Agent specific memory decay settings
    memory_decay_hours: Mapped[int] = mapped_column(Integer, default=168) # 1 week default
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"))
    name: Mapped[str] = mapped_column(String(100))
    embedding_model: Mapped[str] = mapped_column(String(100), default="text-embedding-3-small")
    
    documents: Mapped[List["Document"]] = relationship(back_populates="kb", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kb_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("knowledge_bases.id"))
    file_name: Mapped[str] = mapped_column(String(255))
    source_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # pending, parsing, chunking, embedding, ready, failed
    status: Mapped[str] = mapped_column(String(50), default="pending")
    
    # Metadata for filtering (e.g., {"author": "John", "date": "2023-01-01"})
    metadata: Mapped[dict] = mapped_column(JSONB, default=dict)
    
    kb: Mapped["KnowledgeBase"] = relationship(back_populates="documents")
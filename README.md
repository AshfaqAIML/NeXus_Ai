# NeXus AI

One Platform. Every AI Model. Smarter Context. Lower Cost.

A production-grade, multi-model AI operating system with an integrated **RTK Engine** (Reduction of Tokens Kit) that automatically compresses prompts before sending them to AI providers — reducing cost by 40-60% while preserving quality.

---

## Features

### Multi-Model Ecosystem
- **30+ models** across 3 tiers: Free, Premium, and Local
- **20+ providers** including OpenAI, Anthropic, Google, DeepSeek, Groq, Together, Ollama, and more
- **Smart routing** with Free / Auto / Premium mode toggle
- Real-time **benchmark dashboard** comparing models on reasoning, coding, math, speed, and cost

### RTK Engine
- Automatic prompt compression before API calls
- Context window optimization
- Token savings tracking with live metrics
- 40-60% cost reduction on average

### Self-Hosted AI Hub
- Download and run models locally via **Ollama**, **LM Studio**, or **llama.cpp**
- GPU/RAM requirement indicators
- Download progress tracking
- Local model management (install, run, delete)

### API Key Management
- Add, store, and manage keys for 15+ providers
- Encrypted storage
- Usage tracking per provider
- Easy key rotation

### Poe-Style Chat Interface
- Dark theme with sidebar navigation
- Streaming responses with word-by-word rendering
- Model selector per conversation
- Suggestion chips for quick prompts
- Chat history with multiple bots
- Command palette (Ctrl+K)

---

## Architecture

```
NeXus_Ai/
├── apps/
│   ├── web/                  # Next.js 14 frontend (Poe-style UI)
│   │   ├── components/
│   │   │   ├── chat/         # ChatInterface, ChatMessage, PromptInput, ModelSelector
│   │   │   ├── sidebar/      # BotSidebar (bots, history, user)
│   │   │   ├── models/       # ModeToggle, ModelCard, ModelManager, ApiKeyManager,
│   │   │   │                 # LocalModelHub, BenchmarkDashboard
│   │   │   └── context/      # RtkDashboardWidget
│   │   ├── store/            # Zustand state (chatStore)
│   │   ├── types/            # TypeScript types
│   │   └── lib/              # Utilities
│   └── gateway/              # Express.js API gateway
├── services/
│   ├── chat/                 # FastAPI chat service (port 8002)
│   │   ├── core/
│   │   │   ├── rtk_engine.py         # RTK compression engine
│   │   │   ├── smart_route.py        # Smart router (Free/Auto/Premium)
│   │   │   ├── provider_service.py   # LiteLLM provider abstraction
│   │   │   ├── model_registry.py     # 30+ model catalog with metadata
│   │   │   └── model_api.py          # Model/Provider REST endpoints
│   │   └── main.py
│   ├── agents/               # LangGraph multi-agent system
│   ├── memory/               # Memory & context management
│   └── knowledge/            # RAG & document processing
├── packages/
│   └── python-sdk/           # Shared Python models & DB layer
│       └── nexus_db/         # SQLAlchemy models (User, Chat, Document, etc.)
└── tools/                    # Hermes tool definitions (web, file, code, memory)
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Install Dependencies

```bash
# Frontend
cd apps/web && npm install

# Backend
pip install fastapi uvicorn sqlalchemy tiktoken pydantic litellm httpx cryptography
```

### Run

```bash
# Frontend (port 3000)
cd apps/web && npx next dev

# Backend (port 8002)
cd services/chat && python -m uvicorn main:app --port 8002
```

Frontend: http://localhost:3000
Backend: http://localhost:8002

---

## Pages

| Page | Description |
|---|---|
| **Chat** | Main AI chat interface with streaming responses and model selector |
| **Models** | Browse 30+ models with search, filter by tier/provider/tags, sort by scores |
| **API Keys** | Add and manage API keys for 15+ AI providers |
| **Local AI** | Download and run local models with GPU/RAM info and progress tracking |
| **Benchmarks** | Compare models side-by-side on reasoning, coding, math, speed, cost, latency |

---

## Model Tiers

### Free Models (17)
DeepSeek V3, DeepSeek R1, Qwen 2.5 72B, Llama 3.1 70B, Gemma 2 27B, Phi-3.5, Mistral Large, Yi Lightning, InternLM, OpenChat, Dolphin, Nous Hermes, Code Llama, StarCoder2, TinyLlama, and more.

### Premium Models (10)
GPT-4o, GPT-4o Mini, o1, o3-mini, Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku, Gemini 1.5 Pro, Gemini 2.0 Flash, Grok-2, Command R+.

### Local Models (8)
Llama 3.1 8B, Qwen 2.5 7B, DeepSeek Coder V2, Mistral 7B, Gemma 2 9B, Phi-3.5 Mini, Code Llama 13B, StarCoder2 15B.

---

## Tech Stack

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand

**Backend:** FastAPI, Python, SQLAlchemy, LiteLLM, LangGraph

**Infrastructure:** Turborepo, Express.js gateway, Celery workers

---

## License

MIT

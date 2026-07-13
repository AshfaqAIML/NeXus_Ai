# NeXus AI — One Platform. Every AI Model. Smarter Context. Lower Cost.

A production-grade, multi-model AI operating system with an integrated **RTK Engine** (Reduction of Tokens Kit) that automatically compresses prompts before sending them to AI providers — reducing cost by 40-60% while preserving quality.

---

## Role and Objective

This repository contains a fully functional monorepo for **NeXus AI**, a Poe-style multi-model chat platform. The frontend is built with Next.js 14 + TypeScript + Tailwind CSS + Zustand. The backend is built with Python FastAPI + OpenRouter API. The RTK Engine compresses prompts in real-time before sending them to free AI models.

If you are an AI coding agent reading this, your objective is to:
1. Verify the project structure matches the expected layout exactly.
2. Check all files for syntax errors, missing imports, or path issues.
3. Ensure all components compile and render correctly.
4. Start both frontend and backend and fix any startup errors.

---

## Project Structure

The root directory is `NeXus_Ai`. The structure looks like this:

```
NeXus_Ai/
├── package.json                              # Root monorepo config (npm workspaces)
├── turbo.json                                # Turborepo task definitions
├── tsconfig.base.json                        # Shared TypeScript config
├── README.md                                 # This file
├── .gitignore
│
├── apps/
│   ├── web/                                  # Next.js 14 Frontend (Poe-style UI)
│   │   ├── package.json
│   │   ├── tsconfig.json                     # Path aliases: @/* -> ./src/*, ./*
│   │   ├── next.config.js                    # Standalone output + /api proxy to :8002
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── globals.css               # Dark theme CSS
│   │   │   │   ├── layout.tsx                # Root layout (dark bg)
│   │   │   │   └── page.tsx                  # Main page with nav + ModeToggle
│   │   │   ├── store/
│   │   │   │   └── chatStore.ts              # Zustand: messages, streaming, RTK metrics, navigation
│   │   │   ├── types/
│   │   │   │   └── api.ts                    # TypeScript types (Message, RouterConfig, etc.)
│   │   │   └── lib/
│   │   │       └── utils.ts                  # cn() utility
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── chatInterface.tsx         # Main chat: fetches backend, streams tokens via SSE
│   │   │   │   ├── ChatMessage.tsx           # Styled message bubbles (user/assistant)
│   │   │   │   ├── PromptInput.tsx           # Auto-resize textarea + send button
│   │   │   │   └── ModelSelector.tsx         # Dropdown: free OpenRouter models
│   │   │   ├── sidebar/
│   │   │   │   └── BotSidebar.tsx            # Left sidebar: bots, history, user avatar
│   │   │   ├── models/
│   │   │   │   ├── ModeToggle.tsx            # Free / Auto / Premium toggle
│   │   │   │   ├── ModelCard.tsx             # Model card with scores + badges
│   │   │   │   ├── ModelManager.tsx          # Full model catalog (30+ models)
│   │   │   │   ├── ApiKeyManager.tsx         # API key CRUD for 15 providers
│   │   │   │   ├── LocalModelHub.tsx         # Download/manage local models (Ollama)
│   │   │   │   └── BenchmarkDashboard.tsx    # Model comparison table
│   │   │   └── context/
│   │   │       └── RtkDashboardWidget.tsx    # RTK token savings display
│   │
│   └── gateway/                              # Express.js API Gateway
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── server.ts
│
├── packages/
│   └── python-sdk/                           # Shared Python Code
│       └── nexus_db/
│           ├── __init__.py
│           └── models.py                     # SQLAlchemy models (User, Chat, Document, Memory)
│
└── services/
    ├── chat/                                 # FastAPI Chat Service (port 8002)
    │   ├── main.py                           # FastAPI app with CORS + SSE streaming
    │   ├── requirements.txt
    │   ├── .env                              # OPENROUTER_API_KEY (gitignored)
    │   └── core/
    │       ├── __init__.py
    │       ├── rtk_engine.py                 # RTK: filler removal, history pruning, prompt rewriting
    │       ├── smart_route.py                # Smart router: intent classification -> model selection
    │       ├── provider_service.py           # OpenRouter API: streaming + automatic model fallback
    │       ├── model_registry.py             # 30+ model catalog with metadata
    │       └── model_api.py                  # Model/Provider REST endpoints
    │
    ├── agents/                               # LangGraph Multi-Agent System
    │   ├── main.py
    │   ├── graph.py                          # Agent graph (web, file, code, memory tools)
    │   └── tools/
    │       └── base.py                       # Hermes tool definitions
    │
    ├── memory/                               # Memory & Context Management
    │   └── main.py
    │
    └── knowledge/                            # RAG & Document Processing
        ├── main.py
        └── worker.py                         # Celery document processor
```

---

## Key Architecture Decisions

### Frontend -> Backend Communication

```
User types message
  -> Frontend sends POST to /api/messages/stream (Next.js proxy)
    -> Backend compresses with RTK Engine (34% avg savings)
      -> Smart Router classifies intent -> selects free model
        -> Provider Service calls OpenRouter API with streaming
          -> SSE events stream back to frontend
            -> Frontend renders word-by-word in real-time
```

### RTK Engine (Reduction of Tokens Kit)

The RTK Engine compresses prompts before sending to AI providers:

1. **System Prompt Rewriting** — verbose instructions condensed to concise form
2. **Filler Removal** — strips "please", "could you", "basically", etc. from long messages
3. **History Pruning** — older messages get code blocks stripped, long content summarized
4. **Code Block Compression** — logs get ANSI stripped, timestamps collapsed
5. **Large Payload Summarization** — JSON/XML >2000 chars summarized

Token savings grow with conversation length:
- Turn 1: ~10% (system prompt compression)
- Turn 3: ~7% (history pruning kicks in)
- Turn 6+: ~34% (full compression pipeline active)

### Smart Router

Classifies user intent via regex heuristics, then selects the optimal free model:

| Intent | Model | Why |
|---|---|---|
| default | `google/gemma-4-31b-it:free` | Fast, general-purpose |
| coding | `openai/gpt-oss-120b:free` | Strong code generation |
| math | `nvidia/nemotron-3-super-120b-a12b:free` | 120B parameter reasoning |
| creative | `google/gemma-4-31b-it:free` | Natural language generation |

### Automatic Model Fallback

If a model is rate-limited or unavailable, the backend automatically tries the next model in the chain:
1. Requested model -> 2. Nemotron 3 Super 120B -> 3. GPT-OSS 120B -> 4. Qwen3 80B -> 5. Nemotron Nano 9B

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- An OpenRouter API key (free tier works)

### 1. Install Dependencies

```bash
# Frontend
cd apps/web
npm install

# Backend
cd services/chat
pip install fastapi uvicorn tiktoken pydantic openai python-dotenv httpx
```

### 2. Configure API Key

Create `services/chat/.env`:
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### 3. Run

```bash
# Backend (port 8002)
cd services/chat
python -m uvicorn main:app --port 8002

# Frontend (port 3000)
cd apps/web
npx next dev
```

Open http://localhost:3000 and start chatting.

---

## Pages

| Page | Route | Description |
|---|---|---|
| **Chat** | `/` | Main AI chat with streaming, model selector, RTK widget |
| **Models** | Nav tab | Browse 30+ models with search, filter, sort |
| **API Keys** | Nav tab | Add/manage keys for 15 AI providers |
| **Local AI** | Nav tab | Download/run local models via Ollama |
| **Benchmarks** | Nav tab | Side-by-side model comparison |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand |
| Backend | Python 3.13, FastAPI, SSE streaming |
| AI Provider | OpenRouter API (free models: Gemma, Nemotron, GPT-OSS) |
| Compression | RTK Engine (custom prompt compression pipeline) |
| Monorepo | Turborepo, npm workspaces |

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | `services/chat/.env` | Your OpenRouter API key (gitignored) |

---

## License

MIT

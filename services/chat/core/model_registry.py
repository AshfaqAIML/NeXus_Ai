from typing import Dict, List, Optional
from pydantic import BaseModel
from enum import Enum


class ModelTier(str, Enum):
    FREE = "free"
    PREMIUM = "premium"
    LOCAL = "local"


class ModelCapability(str, Enum):
    CODING = "coding"
    REASONING = "reasoning"
    MATH = "math"
    CREATIVE = "creative"
    VISION = "vision"
    IMAGE_GEN = "image_generation"
    VIDEO_GEN = "video_generation"
    SPEECH = "speech"
    TRANSLATION = "translation"
    LONG_CONTEXT = "long_context"
    FAST_INFERENCE = "fast_inference"


class ProviderType(str, Enum):
    CLOUD_API = "cloud_api"
    FREE_API = "free_api"
    LOCAL_RUNTIME = "local_runtime"
    SELF_HOSTED = "self_hosted"


class ProviderInfo(BaseModel):
    id: str
    name: str
    type: ProviderType
    logo: str
    website: str
    requires_api_key: bool
    has_free_tier: bool
    description: str


class ModelInfo(BaseModel):
    id: str
    name: str
    provider: str
    tier: ModelTier
    version: str = "latest"
    context_window: int
    parameters: Optional[str] = None
    license: str = "proprietary"
    open_source: bool = False
    capabilities: List[ModelCapability] = []
    reasoning_score: float = 0.0
    coding_score: float = 0.0
    math_score: float = 0.0
    vision: bool = False
    cost_per_1m_input: float = 0.0
    cost_per_1m_output: float = 0.0
    latency_ms: Optional[int] = None
    speed_tokens_per_sec: Optional[int] = None
    gpu_requirement: Optional[str] = None
    ram_requirement: Optional[str] = None
    download_size: Optional[str] = None
    description: str = ""
    tags: List[str] = []
    available: bool = True


PROVIDERS: Dict[str, ProviderInfo] = {
    "openai": ProviderInfo(
        id="openai", name="OpenAI", type=ProviderType.CLOUD_API,
        logo="🟢", website="https://openai.com", requires_api_key=True,
        has_free_tier=False, description="GPT series models"
    ),
    "anthropic": ProviderInfo(
        id="anthropic", name="Anthropic", type=ProviderType.CLOUD_API,
        logo="🟣", website="https://anthropic.com", requires_api_key=True,
        has_free_tier=False, description="Claude series models"
    ),
    "google": ProviderInfo(
        id="google", name="Google", type=ProviderType.CLOUD_API,
        logo="🔴", website="https://ai.google.dev", requires_api_key=True,
        has_free_tier=True, description="Gemini series models"
    ),
    "deepseek": ProviderInfo(
        id="deepseek", name="DeepSeek", type=ProviderType.FREE_API,
        logo="🐋", website="https://deepseek.com", requires_api_key=True,
        has_free_tier=True, description="DeepSeek Chat & Reasoner"
    ),
    "openrouter": ProviderInfo(
        id="openrouter", name="OpenRouter", type=ProviderType.FREE_API,
        logo="🔀", website="https://openrouter.ai", requires_api_key=True,
        has_free_tier=True, description="Multi-model gateway with free tiers"
    ),
    "groq": ProviderInfo(
        id="groq", name="Groq", type=ProviderType.FREE_API,
        logo="⚡", website="https://groq.com", requires_api_key=True,
        has_free_tier=True, description="Ultra-fast inference on LPU"
    ),
    "together": ProviderInfo(
        id="together", name="Together AI", type=ProviderType.FREE_API,
        logo="🤝", website="https://together.ai", requires_api_key=True,
        has_free_tier=True, description="Open-source model inference"
    ),
    "fireworks": ProviderInfo(
        id="fireworks", name="Fireworks AI", type=ProviderType.FREE_API,
        logo="🎆", website="https://fireworks.ai", requires_api_key=True,
        has_free_tier=True, description="Fast open-source inference"
    ),
    "cerebras": ProviderInfo(
        id="cerebras", name="Cerebras", type=ProviderType.FREE_API,
        logo="🧠", website="https://cerebras.ai", requires_api_key=True,
        has_free_tier=True, description="Wafer-scale inference"
    ),
    "huggingface": ProviderInfo(
        id="huggingface", name="Hugging Face", type=ProviderType.FREE_API,
        logo="🤗", website="https://huggingface.co", requires_api_key=True,
        has_free_tier=True, description="Open-source model hub"
    ),
    "cloudflare": ProviderInfo(
        id="cloudflare", name="Cloudflare Workers AI", type=ProviderType.FREE_API,
        logo="☁️", website="https://workers.cloudflare.com", requires_api_key=True,
        has_free_tier=True, description="Edge AI inference"
    ),
    "ollama": ProviderInfo(
        id="ollama", name="Ollama", type=ProviderType.LOCAL_RUNTIME,
        logo="🦙", website="https://ollama.ai", requires_api_key=False,
        has_free_tier=True, description="Run LLMs locally"
    ),
    "lmstudio": ProviderInfo(
        id="lmstudio", name="LM Studio", type=ProviderType.LOCAL_RUNTIME,
        logo="🖥️", website="https://lmstudio.ai", requires_api_key=False,
        has_free_tier=True, description="Local model inference GUI"
    ),
    "mistral": ProviderInfo(
        id="mistral", name="Mistral AI", type=ProviderType.CLOUD_API,
        logo="🌊", website="https://mistral.ai", requires_api_key=True,
        has_free_tier=False, description="Mistral series models"
    ),
    "xai": ProviderInfo(
        id="xai", name="xAI", type=ProviderType.CLOUD_API,
        logo="✖️", website="https://x.ai", requires_api_key=True,
        has_free_tier=False, description="Grok models"
    ),
    "cohere": ProviderInfo(
        id="cohere", name="Cohere", type=ProviderType.CLOUD_API,
        logo="💎", website="https://cohere.com", requires_api_key=True,
        has_free_tier=False, description="Command series models"
    ),
    "azure": ProviderInfo(
        id="azure", name="Azure OpenAI", type=ProviderType.CLOUD_API,
        logo="☁️", website="https://azure.microsoft.com/ai", requires_api_key=True,
        has_free_tier=False, description="Enterprise OpenAI models"
    ),
    "bedrock": ProviderInfo(
        id="bedrock", name="Amazon Bedrock", type=ProviderType.CLOUD_API,
        logo="📦", website="https://aws.amazon.com/bedrock", requires_api_key=True,
        has_free_tier=False, description="AWS multi-model hub"
    ),
    "zhipu": ProviderInfo(
        id="zhipu", name="Z.AI (Zhipu)", type=ProviderType.FREE_API,
        logo="🔵", website="https://zhipuai.cn", requires_api_key=True,
        has_free_tier=True, description="GLM series models"
    ),
    "qwen": ProviderInfo(
        id="qwen", name="Qwen (Alibaba)", type=ProviderType.FREE_API,
        logo="🟠", website="https://qwen.ai", requires_api_key=True,
        has_free_tier=True, description="Qwen series models"
    ),
}

MODELS: List[ModelInfo] = [
    # ── FREE CLOUD MODELS ──
    ModelInfo(id="deepseek-chat", name="DeepSeek Chat V3", provider="deepseek", tier=ModelTier.FREE,
              context_window=128000, parameters="671B MoE", license="MIT", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.MATH, ModelCapability.CREATIVE],
              reasoning_score=0.88, coding_score=0.92, math_score=0.90,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=800,
              speed_tokens_per_sec=60, description="DeepSeek V3 - top-tier free model", tags=["free", "coding", "reasoning"]),
    ModelInfo(id="deepseek-reasoner", name="DeepSeek R1", provider="deepseek", tier=ModelTier.FREE,
              context_window=128000, parameters="671B MoE", license="MIT", open_source=True,
              capabilities=[ModelCapability.REASONING, ModelCapability.MATH, ModelCapability.CODING],
              reasoning_score=0.95, coding_score=0.90, math_score=0.95,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=5000,
              speed_tokens_per_sec=30, description="DeepSeek R1 - advanced reasoning", tags=["free", "reasoning", "math"]),
    ModelInfo(id="qwen-2.5-72b", name="Qwen 2.5 72B", provider="openrouter", tier=ModelTier.FREE,
              context_window=128000, parameters="72B", license="Apache 2.0", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.MATH, ModelCapability.VISION],
              reasoning_score=0.85, coding_score=0.88, math_score=0.87, vision=True,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=600,
              speed_tokens_per_sec=50, description="Qwen 2.5 72B - strong multilingual model", tags=["free", "coding", "vision"]),
    ModelInfo(id="llama-3.1-70b", name="Llama 3.1 70B", provider="groq", tier=ModelTier.FREE,
              context_window=128000, parameters="70B", license="Llama 3.1 Community", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.MATH],
              reasoning_score=0.82, coding_score=0.84, math_score=0.80,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=300,
              speed_tokens_per_sec=180, description="Llama 3.1 70B on Groq - blazing fast", tags=["free", "fast", "coding"]),
    ModelInfo(id="llama-3.1-8b", name="Llama 3.1 8B", provider="groq", tier=ModelTier.FREE,
              context_window=128000, parameters="8B", license="Llama 3.1 Community", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING],
              reasoning_score=0.65, coding_score=0.68, math_score=0.62,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=150,
              speed_tokens_per_sec=350, description="Llama 3.1 8B on Groq - fastest free model", tags=["free", "fast"]),
    ModelInfo(id="mistral-large", name="Mistral Large", provider="openrouter", tier=ModelTier.FREE,
              context_window=128000, parameters="123B", license="Apache 2.0", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.MATH],
              reasoning_score=0.84, coding_score=0.86, math_score=0.82,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=700,
              speed_tokens_per_sec=45, description="Mistral Large - strong open model", tags=["free", "coding"]),
    ModelInfo(id="gemma-2-27b", name="Gemma 2 27B", provider="openrouter", tier=ModelTier.FREE,
              context_window=8192, parameters="27B", license="Gemma Terms", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING],
              reasoning_score=0.78, coding_score=0.80, math_score=0.75,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=400,
              speed_tokens_per_sec=100, description="Google Gemma 2 27B", tags=["free", "coding"]),
    ModelInfo(id="phi-3.5", name="Phi-3.5 MoE", provider="openrouter", tier=ModelTier.FREE,
              context_window=128000, parameters="42B MoE", license="MIT", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.VISION],
              reasoning_score=0.80, coding_score=0.82, math_score=0.78, vision=True,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=350,
              speed_tokens_per_sec=120, description="Microsoft Phi-3.5 MoE", tags=["free", "vision"]),
    ModelInfo(id="yi-lightning", name="Yi Lightning", provider="openrouter", tier=ModelTier.FREE,
              context_window=1000000, parameters="MoE", license="Proprietary", open_source=False,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.LONG_CONTEXT],
              reasoning_score=0.82, coding_score=0.80, math_score=0.78,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=500,
              speed_tokens_per_sec=80, description="Yi Lightning - 1M context", tags=["free", "long_context"]),
    ModelInfo(id="internlm-2.5", name="InternLM 2.5", provider="openrouter", tier=ModelTier.FREE,
              context_window=1000000, parameters="20B", license="Apache 2.0", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.LONG_CONTEXT],
              reasoning_score=0.76, coding_score=0.78, math_score=0.74,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=400,
              speed_tokens_per_sec=90, description="InternLM 2.5 - long context", tags=["free", "long_context"]),
    ModelInfo(id="openchat-3.5", name="OpenChat 3.5", provider="openrouter", tier=ModelTier.FREE,
              context_window=8192, parameters="7B", license="OpenRAIL-M", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.CREATIVE],
              reasoning_score=0.68, coding_score=0.72, math_score=0.60,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=200,
              speed_tokens_per_sec=200, description="OpenChat 3.5 - chat-optimized", tags=["free", "fast"]),
    ModelInfo(id="dolphin-llama", name="Dolphin Llama 3", provider="openrouter", tier=ModelTier.FREE,
              context_window=8192, parameters="70B", license="Apache 2.0", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.CREATIVE],
              reasoning_score=0.78, coding_score=0.80, math_score=0.70,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=600,
              speed_tokens_per_sec=50, description="Dolphin - uncensored model", tags=["free", "creative"]),
    ModelInfo(id="nous-hermes-2", name="Nous Hermes 2", provider="openrouter", tier=ModelTier.FREE,
              context_window=32768, parameters="8x7B MoE", license="Apache 2.0", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.CREATIVE],
              reasoning_score=0.75, coding_score=0.77, math_score=0.70,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=500,
              speed_tokens_per_sec=60, description="Nous Hermes 2 - function calling", tags=["free", "agents"]),
    ModelInfo(id="codellama-70b", name="Code Llama 70B", provider="openrouter", tier=ModelTier.FREE,
              context_window=16384, parameters="70B", license="Llama 2 Community", open_source=True,
              capabilities=[ModelCapability.CODING],
              reasoning_score=0.70, coding_score=0.90, math_score=0.65,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=600,
              speed_tokens_per_sec=50, description="Code Llama - code specialist", tags=["free", "coding"]),
    ModelInfo(id="starcoder2-15b", name="StarCoder2 15B", provider="openrouter", tier=ModelTier.FREE,
              context_window=16384, parameters="15B", license="BigCode OpenRAIL-M", open_source=True,
              capabilities=[ModelCapability.CODING],
              reasoning_score=0.55, coding_score=0.85, math_score=0.40,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=250,
              speed_tokens_per_sec=150, description="StarCoder2 - code generation", tags=["free", "coding"]),
    ModelInfo(id="tinyllama-1.1b", name="TinyLlama 1.1B", provider="ollama", tier=ModelTier.FREE,
              context_window=2048, parameters="1.1B", license="Apache 2.0", open_source=True,
              capabilities=[ModelCapability.REASONING],
              reasoning_score=0.35, coding_score=0.30, math_score=0.25,
              cost_per_1m_input=0.0, cost_per_1m_output=0.0, latency_ms=50,
              speed_tokens_per_sec=500, description="TinyLlama - ultra lightweight", tags=["free", "fast", "local"]),

    # ── FREE LOCAL MODELS ──
    ModelInfo(id="local-llama-3.1-8b", name="Llama 3.1 8B (Local)", provider="ollama", tier=ModelTier.LOCAL,
              context_window=128000, parameters="8B", license="Llama 3.1 Community", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING],
              reasoning_score=0.65, coding_score=0.68, math_score=0.62,
              gpu_requirement="4GB VRAM", ram_requirement="8GB RAM", download_size="4.7GB",
              description="Run Llama 3.1 8B locally via Ollama", tags=["local", "offline"]),
    ModelInfo(id="local-qwen-2.5-7b", name="Qwen 2.5 7B (Local)", provider="ollama", tier=ModelTier.LOCAL,
              context_window=128000, parameters="7B", license="Apache 2.0", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.VISION],
              reasoning_score=0.70, coding_score=0.73, math_score=0.68, vision=True,
              gpu_requirement="4GB VRAM", ram_requirement="8GB RAM", download_size="4.4GB",
              description="Run Qwen 2.5 7B locally via Ollama", tags=["local", "offline", "vision"]),
    ModelInfo(id="local-deepseek-coder", name="DeepSeek Coder V2 (Local)", provider="ollama", tier=ModelTier.LOCAL,
              context_window=128000, parameters="16B", license="MIT", open_source=True,
              capabilities=[ModelCapability.CODING],
              reasoning_score=0.72, coding_score=0.88, math_score=0.70,
              gpu_requirement="8GB VRAM", ram_requirement="16GB RAM", download_size="8.9GB",
              description="DeepSeek Coder V2 local", tags=["local", "coding"]),
    ModelInfo(id="local-mistral-7b", name="Mistral 7B (Local)", provider="ollama", tier=ModelTier.LOCAL,
              context_window=32768, parameters="7B", license="Apache 2.0", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING],
              reasoning_score=0.68, coding_score=0.70, math_score=0.62,
              gpu_requirement="4GB VRAM", ram_requirement="8GB RAM", download_size="4.1GB",
              description="Mistral 7B local via Ollama", tags=["local", "offline"]),
    ModelInfo(id="local-gemma-2-9b", name="Gemma 2 9B (Local)", provider="ollama", tier=ModelTier.LOCAL,
              context_window=8192, parameters="9B", license="Gemma Terms", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.VISION],
              reasoning_score=0.72, coding_score=0.74, math_score=0.70, vision=True,
              gpu_requirement="4GB VRAM", ram_requirement="8GB RAM", download_size="5.4GB",
              description="Gemma 2 9B local via Ollama", tags=["local", "vision"]),
    ModelInfo(id="local-phi-3.5-mini", name="Phi-3.5 Mini (Local)", provider="ollama", tier=ModelTier.LOCAL,
              context_window=128000, parameters="3.8B", license="MIT", open_source=True,
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING],
              reasoning_score=0.62, coding_score=0.65, math_score=0.60,
              gpu_requirement="2GB VRAM", ram_requirement="4GB RAM", download_size="2.2GB",
              description="Phi-3.5 Mini - tiny but capable", tags=["local", "fast"]),
    ModelInfo(id="local-codellama-13b", name="Code Llama 13B (Local)", provider="ollama", tier=ModelTier.LOCAL,
              context_window=16384, parameters="13B", license="Llama 2 Community", open_source=True,
              capabilities=[ModelCapability.CODING],
              reasoning_score=0.65, coding_score=0.85, math_score=0.55,
              gpu_requirement="6GB VRAM", ram_requirement="12GB RAM", download_size="7.4GB",
              description="Code Llama 13B local", tags=["local", "coding"]),
    ModelInfo(id="local-starcoder2-15b", name="StarCoder2 15B (Local)", provider="ollama", tier=ModelTier.LOCAL,
              context_window=16384, parameters="15B", license="BigCode OpenRAIL-M", open_source=True,
              capabilities=[ModelCapability.CODING],
              reasoning_score=0.55, coding_score=0.85, math_score=0.40,
              gpu_requirement="8GB VRAM", ram_requirement="16GB RAM", download_size="8.5GB",
              description="StarCoder2 15B local", tags=["local", "coding"]),

    # ── PREMIUM MODELS ──
    ModelInfo(id="gpt-4o", name="GPT-4o", provider="openai", tier=ModelTier.PREMIUM,
              context_window=128000, parameters="Unknown", license="Proprietary",
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.MATH, ModelCapability.VISION, ModelCapability.CREATIVE],
              reasoning_score=0.92, coding_score=0.90, math_score=0.92, vision=True,
              cost_per_1m_input=2.50, cost_per_1m_output=10.00, latency_ms=500,
              speed_tokens_per_sec=80, description="GPT-4o - OpenAI flagship", tags=["premium", "all"]),
    ModelInfo(id="gpt-4o-mini", name="GPT-4o Mini", provider="openai", tier=ModelTier.PREMIUM,
              context_window=128000, parameters="Unknown", license="Proprietary",
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.MATH, ModelCapability.VISION],
              reasoning_score=0.80, coding_score=0.82, math_score=0.80, vision=True,
              cost_per_1m_input=0.15, cost_per_1m_output=0.60, latency_ms=300,
              speed_tokens_per_sec=120, description="GPT-4o Mini - fast & cheap", tags=["premium", "cheap"]),
    ModelInfo(id="o1", name="o1", provider="openai", tier=ModelTier.PREMIUM,
              context_window=200000, parameters="Unknown", license="Proprietary",
              capabilities=[ModelCapability.REASONING, ModelCapability.MATH, ModelCapability.CODING],
              reasoning_score=0.98, coding_score=0.93, math_score=0.98,
              cost_per_1m_input=15.00, cost_per_1m_output=60.00, latency_ms=10000,
              speed_tokens_per_sec=30, description="o1 - reasoning model", tags=["premium", "reasoning"]),
    ModelInfo(id="o3-mini", name="o3-mini", provider="openai", tier=ModelTier.PREMIUM,
              context_window=200000, parameters="Unknown", license="Proprietary",
              capabilities=[ModelCapability.REASONING, ModelCapability.MATH, ModelCapability.CODING],
              reasoning_score=0.95, coding_score=0.92, math_score=0.96,
              cost_per_1m_input=1.10, cost_per_1m_output=4.40, latency_ms=5000,
              speed_tokens_per_sec=50, description="o3-mini - efficient reasoning", tags=["premium", "reasoning"]),
    ModelInfo(id="claude-3.5-sonnet", name="Claude 3.5 Sonnet", provider="anthropic", tier=ModelTier.PREMIUM,
              context_window=200000, parameters="Unknown", license="Proprietary",
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.MATH, ModelCapability.VISION, ModelCapability.CREATIVE],
              reasoning_score=0.92, coding_score=0.95, math_score=0.88, vision=True,
              cost_per_1m_input=3.00, cost_per_1m_output=15.00, latency_ms=600,
              speed_tokens_per_sec=70, description="Claude 3.5 Sonnet - best for coding", tags=["premium", "coding"]),
    ModelInfo(id="claude-3-opus", name="Claude 3 Opus", provider="anthropic", tier=ModelTier.PREMIUM,
              context_window=200000, parameters="Unknown", license="Proprietary",
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.MATH, ModelCapability.VISION, ModelCapability.CREATIVE],
              reasoning_score=0.94, coding_score=0.93, math_score=0.90, vision=True,
              cost_per_1m_input=15.00, cost_per_1m_output=75.00, latency_ms=1500,
              speed_tokens_per_sec=40, description="Claude 3 Opus - most capable", tags=["premium", "creative"]),
    ModelInfo(id="claude-3-haiku", name="Claude 3 Haiku", provider="anthropic", tier=ModelTier.PREMIUM,
              context_window=200000, parameters="Unknown", license="Proprietary",
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.VISION],
              reasoning_score=0.75, coding_score=0.78, math_score=0.72, vision=True,
              cost_per_1m_input=0.25, cost_per_1m_output=1.25, latency_ms=300,
              speed_tokens_per_sec=150, description="Claude 3 Haiku - fast & cheap", tags=["premium", "fast"]),
    ModelInfo(id="gemini-1.5-pro", name="Gemini 1.5 Pro", provider="google", tier=ModelTier.PREMIUM,
              context_window=2000000, parameters="Unknown", license="Proprietary",
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.MATH, ModelCapability.VISION, ModelCapability.LONG_CONTEXT],
              reasoning_score=0.90, coding_score=0.88, math_score=0.88, vision=True,
              cost_per_1m_input=1.25, cost_per_1m_output=5.00, latency_ms=700,
              speed_tokens_per_sec=60, description="Gemini 1.5 Pro - 2M context", tags=["premium", "long_context"]),
    ModelInfo(id="gemini-1.5-flash", name="Gemini 1.5 Flash", provider="google", tier=ModelTier.PREMIUM,
              context_window=1000000, parameters="Unknown", license="Proprietary",
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.VISION, ModelCapability.LONG_CONTEXT],
              reasoning_score=0.82, coding_score=0.80, math_score=0.80, vision=True,
              cost_per_1m_input=0.075, cost_per_1m_output=0.30, latency_ms=300,
              speed_tokens_per_sec=200, description="Gemini 1.5 Flash - fast & long", tags=["premium", "fast"]),
    ModelInfo(id="gemini-2.0-flash", name="Gemini 2.0 Flash", provider="google", tier=ModelTier.PREMIUM,
              context_window=1000000, parameters="Unknown", license="Proprietary",
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.VISION, ModelCapability.IMAGE_GEN],
              reasoning_score=0.85, coding_score=0.83, math_score=0.82, vision=True,
              cost_per_1m_input=0.10, cost_per_1m_output=0.40, latency_ms=250,
              speed_tokens_per_sec=250, description="Gemini 2.0 Flash - latest", tags=["premium", "fast"]),
    ModelInfo(id="grok-2", name="Grok-2", provider="xai", tier=ModelTier.PREMIUM,
              context_window=131072, parameters="Unknown", license="Proprietary",
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.VISION],
              reasoning_score=0.85, coding_score=0.83, math_score=0.82, vision=True,
              cost_per_1m_input=2.00, cost_per_1m_output=10.00, latency_ms=600,
              speed_tokens_per_sec=60, description="Grok-2 from xAI", tags=["premium"]),
    ModelInfo(id="mistral-large-2", name="Mistral Large 2", provider="mistral", tier=ModelTier.PREMIUM,
              context_window=128000, parameters="123B", license="Proprietary",
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.MATH],
              reasoning_score=0.86, coding_score=0.85, math_score=0.84,
              cost_per_1m_input=2.00, cost_per_1m_output=6.00, latency_ms=700,
              speed_tokens_per_sec=45, description="Mistral Large 2 - enterprise", tags=["premium"]),
    ModelInfo(id="command-r-plus", name="Command R+", provider="cohere", tier=ModelTier.PREMIUM,
              context_window=128000, parameters="104B", license="Proprietary",
              capabilities=[ModelCapability.CODING, ModelCapability.REASONING, ModelCapability.CREATIVE],
              reasoning_score=0.82, coding_score=0.80, math_score=0.78,
              cost_per_1m_input=2.50, cost_per_1m_output=10.00, latency_ms=600,
              speed_tokens_per_sec=50, description="Command R+ - Cohere flagship", tags=["premium"]),
]


def get_all_models() -> List[ModelInfo]:
    return MODELS


def get_models_by_tier(tier: ModelTier) -> List[ModelInfo]:
    return [m for m in MODELS if m.tier == tier]


def get_models_by_provider(provider_id: str) -> List[ModelInfo]:
    return [m for m in MODELS if m.provider == provider_id]


def get_models_by_capability(cap: ModelCapability) -> List[ModelInfo]:
    return [m for m in MODELS if cap in m.capabilities]


def search_models(query: str) -> List[ModelInfo]:
    q = query.lower()
    return [m for m in MODELS if q in m.name.lower() or q in m.description.lower() or q in m.id.lower() or any(q in t for t in m.tags)]


def get_provider(provider_id: str) -> Optional[ProviderInfo]:
    return PROVIDERS.get(provider_id)


def get_all_providers() -> List[ProviderInfo]:
    return list(PROVIDERS.values())

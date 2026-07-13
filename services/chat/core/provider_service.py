import os
from typing import List, Dict, AsyncGenerator
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

FALLBACK_MODELS = [
    "nvidia/nemotron-3-super-120b-a12b:free",
    "openai/gpt-oss-120b:free",
    "google/gemma-4-31b-it:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "nvidia/nemotron-nano-9b-v2:free",
]


class ModelProviderService:
    def __init__(self):
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY not set. Check services/chat/.env")
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1",
        )

    async def _try_completion(
        self,
        model_id: str,
        messages: List[Dict],
    ) -> AsyncGenerator[str, None]:
        response = await self.client.chat.completions.create(
            model=model_id,
            messages=messages,
            stream=True,
            temperature=0.7,
            max_tokens=4096,
        )
        async for chunk in response:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield delta.content

    async def stream_completion(
        self,
        model_id: str,
        messages: List[Dict],
    ) -> AsyncGenerator[str, None]:
        # Build fallback list: requested model first, then others
        models_to_try = [model_id] + [m for m in FALLBACK_MODELS if m != model_id]

        last_error = None
        for model in models_to_try:
            try:
                async for chunk in self._try_completion(model, messages):
                    yield chunk
                return  # Success, done
            except Exception as e:
                last_error = e
                continue  # Try next model

        # All models failed
        yield f"[All models failed. Last error: {last_error}]"

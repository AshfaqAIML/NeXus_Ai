import os
from typing import List, Dict, AsyncGenerator
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))


class ModelProviderService:
    def __init__(self):
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY not set. Check services/chat/.env")
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1",
        )

    async def stream_completion(
        self,
        model_id: str,
        messages: List[Dict],
    ) -> AsyncGenerator[str, None]:
        try:
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
        except Exception as e:
            yield f"[Error: {str(e)}]"

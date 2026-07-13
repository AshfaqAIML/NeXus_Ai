import asyncio
from typing import List, Dict, AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'packages', 'python-sdk'))
from nexus_db.models import ApiKey
from cryptography.fernet import Fernet
import litellm
import os

class ModelProviderService:
    def __init__(self, encryption_key: str):
        # Used to decrypt user API keys from DB
        self.cipher_suite = Fernet(encryption_key.encode())
        
        # Configure LiteLLM to drop sensitive info from logs
        litellm.drop_params = True 
        litellm.set_verbose = False

    async def _get_user_api_key(self, db: AsyncSession, user_id: str, provider: str) -> str:
        """Fetches and decrypts the user's API key for the selected provider."""
        # Note: In a real high-load system, this is cached in Redis for 5 minutes.
        result = await db.execute(
            "SELECT encrypted_key FROM api_keys WHERE user_id = :user_id AND provider = :provider",
            {"user_id": user_id, "provider": provider}
        )
        row = result.fetchone()
        if row:
            return self.cipher_suite.decrypt(row[0].encode()).decode()
        return None

    async def stream_completion(
        self,
        model_id: str,
        messages: List[Dict],
        db: AsyncSession,
        user_id: str
    ) -> AsyncGenerator[str, None]:
        """
        Streams chunks from the LLM provider using LiteLLM.
        """
        # Extract provider from model_id (e.g., "anthropic/claude-3.5-sonnet" -> "anthropic")
        provider = model_id.split("/")[0] if "/" in model_id else "openai"
        
        # 1. Get User API Key (BYOK) or fallback to platform default env vars
        user_api_key = await self._get_user_api_key(db, user_id, provider)
        
        api_key_to_use = user_api_key or os.getenv(f"{provider.upper()}_API_KEY")
        if not api_key_to_use:
            raise ValueError(f"No API key available for provider: {provider}")

        try:
            # 2. Execute LiteLLM async streaming call
            response = await litellm.acompletion(
                model=model_id,
                messages=messages,
                api_key=api_key_to_use,
                stream=True,
                temperature=0.7,
            )
            
            # 3. Yield chunks as they arrive
            async for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
                    
        except litellm.exceptions.RateLimitError:
            # Fallback logic could be implemented here (e.g., retry with a different model)
            yield "[Rate limit reached. Please try again in a moment.]"
        except Exception as e:
            yield f"[Error communicating with AI provider: {str(e)}]"
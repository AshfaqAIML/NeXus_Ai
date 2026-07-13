import re
from typing import List, Dict, Optional
from pydantic import BaseModel
import tiktoken


class RoutingDecision(BaseModel):
    model_id: str
    reasoning: str
    estimated_context_length: int


class SmartRouter:
    def __init__(self):
        self.model_map = {
            "coding": "openai/gpt-oss-120b:free",
            "math": "nvidia/nemotron-3-super-120b-a12b:free",
            "creative": "google/gemma-4-31b-it:free",
            "long_context": "nvidia/nemotron-3-super-120b-a12b:free",
            "default": "google/gemma-4-31b-it:free",
        }
        self.encoder = tiktoken.get_encoding("cl100k_base")

    def _estimate_tokens(self, messages: List[Dict]) -> int:
        return sum(len(self.encoder.encode(str(m.get("content", "")))) for m in messages)

    def _classify_intent(self, prompt: str) -> str:
        p = prompt.lower()
        if re.search(r'\b(def |class |import |public |void |func |function |const |let |var |#include)\b', p) or '```' in p:
            return "coding"
        if re.search(r'\b(integral|derivative|solve|equation|theorem|prove|calculate)\b', p):
            return "math"
        if re.search(r'\b(write a story|poem|creative|screenplay|novel|fiction)\b', p):
            return "creative"
        return "default"

    async def route(
        self,
        messages: List[Dict],
        user_preferred_model: Optional[str] = None,
    ) -> RoutingDecision:
        if user_preferred_model and user_preferred_model != "auto":
            return RoutingDecision(
                model_id=user_preferred_model,
                reasoning="User explicitly selected model.",
                estimated_context_length=self._estimate_tokens(messages),
            )

        prompt = messages[-1].get("content", "") if messages else ""
        intent = self._classify_intent(prompt)
        token_count = self._estimate_tokens(messages)

        selected_model = self.model_map.get(intent, self.model_map["default"])
        reasoning = f"Intent: '{intent}'. Routed to {selected_model}."

        return RoutingDecision(
            model_id=selected_model,
            reasoning=reasoning,
            estimated_context_length=token_count,
        )

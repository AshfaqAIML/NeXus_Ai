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
        # Mapping of capabilities to specific LiteLLM model strings
        self.model_map = {
            "coding": "anthropic/claude-3.5-sonnet",
            "reasoning": "openai/gpt-4o",
            "long_context": "gemini/gemini-1.5-pro",
            "creative": "anthropic/claude-3-opus",
            "math": "openai/gpt-4o",
            "default": "openai/gpt-4o-mini" # Cost-effective default
        }
        self.encoder = tiktoken.get_encoding("cl100k_base")
        
    def _estimate_tokens(self, messages: List[Dict]) -> int:
        # Fast estimation of token count for context routing
        total = sum(len(self.encoder.encode(str(m.get("content", "")))) for m in messages)
        return total

    def _classify_intent(self, prompt: str) -> str:
        prompt_lower = prompt.lower()
        
        # 1. Fast Heuristics (Regex)
        if re.search(r'\b(def |class |import |public |void |func )\b', prompt_lower) or '```' in prompt:
            return "coding"
        if re.search(r'\b(integral|derivative|solve for|equation|theorem)\b', prompt_lower):
            return "math"
        if re.search(r'\b(write a story|poem|creative|screenplay)\b', prompt_lower):
            return "creative"
            
        # 2. Fallback to default (In production, could use a cheap LLM call here)
        return "default"

    async def route(
        self, 
        messages: List[Dict], 
        user_preferred_model: Optional[str] = None
    ) -> RoutingDecision:
        """
        Analyzes the prompt and context to select the optimal model.
        """
        # If user explicitly overrides auto-routing, respect that
        if user_preferred_model:
            return RoutingDecision(
                model_id=user_preferred_model,
                reasoning="User explicitly selected model.",
                estimated_context_length=self._estimate_tokens(messages)
            )

        # The last message is the user's prompt
        prompt = messages[-1].get("content", "") if messages else ""
        intent = self._classify_intent(prompt)
        token_count = self._estimate_tokens(messages)

        # Route to long context model if history is huge (e.g., > 120k tokens)
        if token_count > 120000:
            selected_model = self.model_map["long_context"]
            reasoning = f"Context length ({token_count} tokens) exceeds 120k. Routed to Gemini 1.5 Pro."
        else:
            selected_model = self.model_map.get(intent, self.model_map["default"])
            reasoning = f"Intent classified as '{intent}'. Routed to {selected_model}."

        return RoutingDecision(
            model_id=selected_model,
            reasoning=reasoning,
            estimated_context_length=token_count
        )
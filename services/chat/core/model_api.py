from fastapi import FastAPI, Query
from typing import Optional
from core.model_registry import (
    get_all_models, get_models_by_tier, get_models_by_provider,
    get_models_by_capability, search_models, get_all_providers,
    get_provider, ModelTier, ModelCapability, ProviderInfo, ModelInfo,
)

app = FastAPI(title="Nexus Model Registry API")

@app.get("/models")
async def list_models(
    tier: Optional[str] = None,
    provider: Optional[str] = None,
    capability: Optional[str] = None,
    search: Optional[str] = None,
    tags: Optional[str] = None,
):
    models = get_all_models()
    if tier:
        models = [m for m in models if m.tier.value == tier]
    if provider:
        models = [m for m in models if m.provider == provider]
    if capability:
        models = [m for m in models if capability in [c.value for c in m.capabilities]]
    if search:
        models = search_models(search)
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        models = [m for m in models if any(t in m.tags for t in tag_list)]
    return {"models": [m.model_dump() for m in models], "count": len(models)}

@app.get("/models/{model_id}")
async def get_model(model_id: str):
    models = get_all_models()
    for m in models:
        if m.id == model_id:
            return m.model_dump()
    return {"error": "Model not found"}

@app.get("/providers")
async def list_providers():
    return {"providers": [p.model_dump() for p in get_all_providers()]}

@app.get("/providers/{provider_id}")
async def get_provider_detail(provider_id: str):
    p = get_provider(provider_id)
    if p:
        return p.model_dump()
    return {"error": "Provider not found"}

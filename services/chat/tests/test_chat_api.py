import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch
from main import app

@pytest.mark.asyncio
@patch("core.provider_service.ModelProviderService.stream_completion")
@patch("main.get_chat_history", new_callable=AsyncMock)
@patch("main.get_chat_settings", new_callable=AsyncMock)
async def test_stream_chat_endpoint(mock_settings, mock_history, mock_llm_stream):
    # 1. Mock DB responses
    mock_history.return_value = [] # No previous messages
    mock_settings.return_value = {"rtk_enabled": True}
    
    # 2. Mock the LLM stream (Yields a few chunks)
    async def mock_stream(*args, **kwargs):
        yield "Hello "
        yield "from "
        yield "Nexus AI."
        
    mock_llm_stream.return_value = mock_stream()
    
    # 3. Call the API
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/messages/stream",
            json={"chat_id": "123e4567-e89b-12d3-a456-426614174000", "content": "Hi"},
            headers={"X-User-Id": "user-123", "X-Workspace-Id": "ws-123"}
        )
        
    # 4. Assertions
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    
    # Verify SSE chunks
    response_text = response.text
    assert "data: Hello " in response_text
    assert "data: from " in response_text
    assert "data: [DONE]" in response_text
    
    # Verify RTK stats were emitted
    assert '"type": "rtk_stats"' in response_text
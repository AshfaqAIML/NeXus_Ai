import pytest
from core.rtk_engine import RTKCompressionEngine

@pytest.fixture
def rtk_engine():
    return RTKCompressionEngine()

@pytest.mark.asyncio
async def test_rtk_compresses_terminal_logs(rtk_engine):
    # Raw log with ANSI colors and timestamps
    raw_log = """
    ```bash
    2023-10-25T10:00:00.123Z INFO Server started on port 8080
    2023-10-25T10:00:01.456Z DEBUG Config loaded
    \x1b[32mSuccess\x1b[0m
    ```
    """
    
    # Run compression
    compressed_context, orig_tokens, comp_tokens = await rtk_engine.compress(
        new_message=raw_log,
        history=[],
        rtk_enabled=True
    )
    
    compressed_text = compressed_context[0]["content"]
    
    # Assertions
    assert orig_tokens > comp_tokens, "Compressed tokens should be less than original"
    assert "\x1b[32m" not in compressed_text, "ANSI escape codes must be stripped"
    assert "2023-10-25T10:00:00.123Z" not in compressed_text, "Timestamps must be normalized"
    assert "[TIMESTAMP]" in compressed_text, "Timestamps should be replaced with placeholder"
    assert "DEBUG" not in compressed_text, "Redundant log levels should be stripped"

@pytest.mark.asyncio
async def test_rtk_disabled_passes_through(rtk_engine):
    raw_text = "Hello world"
    context, orig, comp = await rtk_engine.compress(raw_text, [], rtk_enabled=False)
    
    assert context[0]["content"] == "Hello world"
    assert orig == comp, "Tokens should match if RTK is disabled"
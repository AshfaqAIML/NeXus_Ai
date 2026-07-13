from pydantic import BaseModel, Field
from typing import List, Type, Callable, Any
import json
import subprocess
import tempfile

# --- Tool Definitions ---

class PythonExecInput(BaseModel):
    code: str = Field(..., description="The Python code to execute.")
    
def execute_python(code: str) -> str:
    """Executes Python code in a sandbox and returns stdout/stderr."""
    # NOTE: In production, this runs inside an isolated Docker container/Firecracker VM.
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            f.flush()
            result = subprocess.run(['python3', f.name], capture_output=True, text=True, timeout=10)
            output = result.stdout + result.stderr
            return output[:2000] if len(output) > 2000 else output # Hard truncation for safety
    except Exception as e:
        return str(e)

class WebSearchInput(BaseModel):
    query: str = Field(..., description="The search query.")

def web_search(query: str) -> str:
    """Searches the web for real-time information."""
    # Mock implementation (Tavily/DuckDuckGo API in prod)
    return f"Search results for: {query}. Found 3 articles about {query}."

# --- Tool Registry ---
TOOL_REGISTRY = {
    "execute_python": (PythonExecInput, execute_python),
    "web_search": (WebSearchInput, web_search)
}

def get_hermes_tool_schemas() -> List[dict]:
    """Returns the JSON schema formatted for Hermes system prompts."""
    schemas = []
    for name, (input_model, func) in TOOL_REGISTRY.items():
        schemas.append({
            "name": name,
            "description": func.__doc__,
            "parameters": input_model.model_json_schema()["properties"]
        })
    return schemas
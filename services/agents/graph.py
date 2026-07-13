from typing import TypedDict, List, Dict, Any, Annotated
from langgraph.graph import StateGraph, END
import litellm
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from tools.base import TOOL_REGISTRY, get_hermes_tool_schemas

# 1. Define Agent State
class AgentState(TypedDict):
    messages: Annotated[List[dict], lambda x, y: x + y] # Append only
    tool_outputs: Annotated[List[dict], lambda x, y: x + y]
    final_answer: str

# 2. Hermes Prompt Formatter
def format_hermes_system_prompt(tools: List[dict]) -> str:
    tools_str = json.dumps(tools, indent=2)
    return f"""You are a helpful assistant. You have access to the following tools:
{tools_str}

To use a tool, respond with a JSON object in this exact format:
{{"name": "tool_name", "parameters": {{...}}}}

If you have enough information to answer the user, respond normally without JSON."""

# 3. Hermes Execution Node
async def hermes_execution_node(state: AgentState):
    """Calls the LLM with Hermes formatting and parses the tool call."""
    system_prompt = format_hermes_system_prompt(get_hermes_tool_schemas())
    
    messages = [{"role": "system", "content": system_prompt}] + state["messages"]
    
    # Use LiteLLM to support both OpenAI and local Hermes models via Ollama
    # model = "ollama/hermes-3-llama-3.1-8b" # For local
    model = "openai/gpt-4o" # For reliable fallback in this example
    
    response = await litellm.acompletion(
        model=model,
        messages=messages,
        api_key=os.getenv("OPENAI_API_KEY"),
        temperature=0.1
    )
    
    llm_output = response.choices[0].message.content
    
    try:
        # Attempt to parse Hermes JSON tool call
        # Hermes models often wrap JSON in <tool_call> tags or output raw JSON
        clean_output = llm_output.strip().replace("<tool_call>", "").replace("</tool_call>", "").strip()
        tool_call = json.loads(clean_output)
        
        if "name" in tool_call and "parameters" in tool_call:
            return {"messages": [{"role": "assistant", "content": llm_output}], "tool_outputs": [tool_call]}
    except json.JSONDecodeError:
        # Not a JSON tool call, assume it's the final answer
        pass
        
    return {"messages": [{"role": "assistant", "content": llm_output}], "final_answer": llm_output}

# 4. Tool Execution Node (with RTK Integration)
async def tool_execution_node(state: AgentState):
    """Executes the tool requested by the LLM and compresses the output."""
    last_tool_call = state["tool_outputs"][-1]
    tool_name = last_tool_call["name"]
    tool_params = last_tool_call["parameters"]
    
    if tool_name in TOOL_REGISTRY:
        input_model, func = TOOL_REGISTRY[tool_name]
        try:
            validated_params = input_model(**tool_params)
            raw_output = func(**validated_params.dict())
            
            # RTK Integration: Compress tool output before feeding back to LLM
            # In production, this calls the RTK Engine service
            compressed_output = f"[RTK Compressed Tool Output]: {raw_output[:500]}..." if len(raw_output) > 500 else raw_output
            
            observation = {
                "role": "tool",
                "name": tool_name,
                "content": compressed_output
            }
            return {"messages": [observation], "tool_outputs": []} # Clear tool call
        except Exception as e:
            error_msg = {"role": "tool", "content": f"Error executing {tool_name}: {str(e)}"}
            return {"messages": [error_msg], "tool_outputs": []}
    
    return {"messages": [{"role": "tool", "content": "Tool not found."}], "tool_outputs": []}

# 5. Routing Logic
def should_continue(state: AgentState):
    if state.get("final_answer"):
        return END
    if state["tool_outputs"]:
        return "execute_tools"
    return END

# 6. Build the Graph
def build_agent_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("hermes_llm", hermes_execution_node)
    workflow.add_node("execute_tools", tool_execution_node)
    
    workflow.set_entry_point("hermes_llm")
    workflow.add_conditional_edges("hermes_llm", should_continue, {
        "execute_tools": "execute_tools",
        END: END
    })
    workflow.add_edge("execute_tools", "hermes_llm") # Loop back after tool use
    
    return workflow.compile()
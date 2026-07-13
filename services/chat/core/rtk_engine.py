import re
import json
from typing import List, Dict, Tuple, Optional
import tiktoken

class RTKCompressionEngine:
    def __init__(self):
        self.encoder = tiktoken.get_encoding("cl100k_base")
        
        # Regex patterns for terminal/log filtering
        self.ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
        self.log_timestamp = re.compile(r'\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\b')
        self.log_level_info = re.compile(r'\b(INFO|DEBUG|TRACE)\b', re.IGNORECASE)

    def _count_tokens(self, messages: List[Dict]) -> int:
        return sum(len(self.encoder.encode(str(m.get("content", "")))) for m in messages)

    async def compress(
        self, 
        new_message: str, 
        history: List[Dict], 
        rtk_enabled: bool = True,
        attach_files: Optional[List[str]] = None
    ) -> Tuple[List[Dict], int, int]:
        """
        Returns: (compressed_messages, original_tokens, compressed_tokens)
        """
        # Build the raw context
        raw_context = history + [{"role": "user", "content": new_message}]
        
        if not rtk_enabled:
            orig = self._count_tokens(raw_context)
            return raw_context, orig, orig

        # --- RTK PIPELINE STARTS ---
        original_tokens = self._count_tokens(raw_context)
        
        # 1. Compress new message & files (Logs, Code, JSON)
        compressed_new_msg = self._compress_text_payload(new_message)
        
        # 2. Prune & compress history
        compressed_history = self._prune_history(history)
        
        # 3. Assemble final context
        final_context = compressed_history + [{"role": "user", "content": compressed_new_msg}]
        
        compressed_tokens = self._count_tokens(final_context)
        return final_context, original_tokens, compressed_tokens

    def _compress_text_payload(self, text: str) -> str:
        """Applies specific compression rules to code blocks and logs."""
        
        # Handle Markdown Code Blocks
        def compress_block(match):
            lang, code = match.group(1), match.group(2)
            
            # If it's a terminal log, strip ANSI and redundant timestamps
            if lang in ['bash', 'shell', 'sh', 'log', '']:
                code = self.ansi_escape.sub('', code)
                code = self.log_timestamp.sub('[TIMESTAMP]', code)
                # Collapse repeated INFO/DEBUG lines
                code = self.log_level_info.sub('', code)
                code = re.sub(r'\n\s*\n', '\n', code).strip()
                
            # If it's a massive JSON, summarize it (Mock logic for illustration)
            if lang in ['json', 'xml'] and len(code) > 2000:
                return f"```{lang}\n[RTK: Large {lang} payload summarized. Showing structure only.]\n{code[:500]}...\n[...truncated {len(code)-1000} chars...]\n{code[-500:]}\n```"
                
            return f"```{lang}\n{code}\n```"

        # Find all markdown code blocks
        text = re.sub(r'```(\w+)?\n(.*?)\n```', compress_block, text, flags=re.DOTALL)
        
        # Collapse repeated empty lines globally
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text

    def _prune_history(self, history: List[Dict]) -> List[Dict]:
        """
        Smart history pruning:
        - Keeps the last 3 messages fully intact.
        - Compresses older messages by removing tool outputs and code blocks.
        """
        if len(history) <= 3:
            return history
            
        pruned = []
        for i, msg in enumerate(history):
            if i >= len(history) - 3:
                pruned.append(msg) # Keep recent context raw
            else:
                content = msg.get("content", "")
                # Strip out old code blocks and tool outputs to save tokens
                content = re.sub(r'```[\s\S]*?\n```', '[Previous Code Block Omitted]', content)
                if "<tool_output>" in content:
                    content = re.sub(r'<tool_output>[\s\S]*?</tool_output>', '[Previous Tool Output Omitted]', content)
                
                pruned.append({"role": msg["role"], "content": content})
                
        return pruned
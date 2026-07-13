import re
from typing import List, Dict, Tuple, Optional
import tiktoken


class RTKCompressionEngine:
    def __init__(self):
        self.encoder = tiktoken.get_encoding("cl100k_base")
        self.ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
        self.log_timestamp = re.compile(r'\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\b')
        self.log_level = re.compile(r'\b(INFO|DEBUG|TRACE|WARN|NOTICE)\b', re.IGNORECASE)

        # Filler words and phrases that can be removed without changing meaning
        self.filler_phrases = re.compile(
            r'\b(please|kindly|could you|would you|I would like you to|I want you to|'
            r'can you|I need you to|I was wondering if you could|would it be possible to|'
            r'it would be great if you|I appreciate it if you|do me a favor and|'
            r'if you don\'t mind|when you get a chance|at your earliest convenience|'
            r'just|basically|actually|honestly|literally|really|very|quite|'
            r'absolutely|definitely|certainly|of course|sure thing)\b',
            re.IGNORECASE,
        )

        # Verbose → concise mappings for system prompts
        self.verbose_replacements = [
            (r'You are a helpful, harmless, and honest AI assistant\.', 'You are a helpful AI assistant.'),
            (r'Please ensure that your responses are always accurate, comprehensive, and well-structured\.', 'Be accurate and thorough.'),
            (r'When answering questions, please provide detailed explanations with relevant examples where appropriate\.', 'Give detailed answers with examples.'),
            (r'I would like you to help me with the following task:', 'Task:'),
            (r'Could you please help me understand', 'Explain'),
            (r'Can you explain to me', 'Explain'),
            (r'I would like to know more about', 'Tell me about'),
            (r'What is the meaning of', 'Define'),
            (r'In this task, you are required to', 'You must'),
            (r'It is important to note that', 'Note:'),
            (r'In order to', 'To'),
            (r'Due to the fact that', 'Because'),
            (r'At this point in time', 'Now'),
            (r'In the event that', 'If'),
            (r'For the purpose of', 'For'),
            (r'In the near future', 'Soon'),
            (r'On a daily basis', 'Daily'),
            (r'In the vicinity of', 'Near'),
        ]

    def _count_tokens(self, messages: List[Dict]) -> int:
        return sum(len(self.encoder.encode(str(m.get("content", "")))) for m in messages)

    async def compress(
        self,
        new_message: str,
        history: List[Dict],
        rtk_enabled: bool = True,
        attach_files: Optional[List[str]] = None,
    ) -> Tuple[List[Dict], int, int]:
        raw_context = history + [{"role": "user", "content": new_message}]

        if not rtk_enabled:
            orig = self._count_tokens(raw_context)
            return raw_context, orig, orig

        original_tokens = self._count_tokens(raw_context)

        # Step 1: Rewrite system prompts to be concise
        compressed_history = self._rewrite_system_prompts(history)

        # Step 2: Prune old history
        compressed_history = self._prune_history(compressed_history)

        # Step 3: Compress the new message (strip filler, code blocks, logs)
        compressed_new_msg = self._compress_text_payload(new_message)
        compressed_new_msg = self._strip_fillers(compressed_new_msg)

        # Step 4: Compress any attached files
        if attach_files:
            for f in attach_files:
                compressed_new_msg += f"\n\n[File: {f}]"

        # Assemble
        final_context = compressed_history + [{"role": "user", "content": compressed_new_msg}]
        compressed_tokens = self._count_tokens(final_context)

        return final_context, original_tokens, compressed_tokens

    def _rewrite_system_prompts(self, history: List[Dict]) -> List[Dict]:
        rewritten = []
        for msg in history:
            if msg.get("role") == "system":
                content = msg.get("content", "")
                for pattern, replacement in self.verbose_replacements:
                    content = re.sub(pattern, replacement, content)
                # Collapse multiple newlines
                content = re.sub(r'\n{3,}', '\n\n', content)
                rewritten.append({"role": "system", "content": content})
            else:
                rewritten.append(msg)
        return rewritten

    def _strip_fillers(self, text: str) -> str:
        # Only strip fillers from longer messages (>50 chars) to avoid breaking short prompts
        if len(text) < 50:
            return text
        cleaned = self.filler_phrases.sub('', text)
        # Collapse multiple spaces
        cleaned = re.sub(r'  +', ' ', cleaned)
        # Clean up leading/trailing whitespace
        cleaned = cleaned.strip()
        return cleaned if cleaned else text

    def _compress_text_payload(self, text: str) -> str:
        def compress_block(match):
            lang, code = match.group(1), match.group(2)
            if lang in ['bash', 'shell', 'sh', 'log', '']:
                code = self.ansi_escape.sub('', code)
                code = self.log_timestamp.sub('[TS]', code)
                code = self.log_level.sub('', code)
                code = re.sub(r'\n\s*\n', '\n', code).strip()
            if lang in ['json', 'xml'] and len(code) > 2000:
                return f"```{lang}\n[RTK: Large {lang} payload summarized.]\n{code[:500]}...\n[...truncated {len(code) - 1000} chars...]\n{code[-500:]}\n```"
            return f"```{lang}\n{code}\n```"

        text = re.sub(r'```(\w+)?\n(.*?)\n```', compress_block, text, flags=re.DOTALL)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text

    def _prune_history(self, history: List[Dict]) -> List[Dict]:
        if len(history) <= 3:
            return history

        pruned = []
        for i, msg in enumerate(history):
            if i >= len(history) - 3:
                pruned.append(msg)
            else:
                content = msg.get("content", "")
                # For old messages: summarize long content, strip code blocks
                if len(content) > 500:
                    content = content[:200] + f"\n[RTK: {len(content) - 400} chars summarized]\n" + content[-200:]
                content = re.sub(r'```[\s\S]*?\n```', '[code]', content)
                if "<tool_output>" in content:
                    content = re.sub(r'<tool_output>[\s\S]*?</tool_output>', '[tool output]', content)
                pruned.append({"role": msg["role"], "content": content})

        return pruned

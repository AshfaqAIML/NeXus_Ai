export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
}

export interface RouterConfig {
  autoRoute: boolean;
  preferredModel: string | null;
}

export interface RoutingDecision {
  model_id: string;
  reasoning: string;
  estimated_context_length: number;
}

export interface RtkStats {
  original: number;
  compressed: number;
}

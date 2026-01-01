
export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Chunk {
  text: string;
  score: number;
}

export interface RagContext {
  content: string;
  chunks: string[];
}


export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

/**
 * Interface representing a chunk of text with its relevance score for keyword-based ranking.
 */
export interface Chunk {
  text: string;
  score: number;
}

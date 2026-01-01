
import { Chunk } from '../types';

/**
 * Splits text into manageable chunks for the prompt context.
 */
export const createChunks = (text: string, chunkSize: number = 800): string[] => {
  const paragraphs = text.split(/\n\s*\n/);
  let chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk + para).length < chunkSize) {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = para;
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  
  return chunks;
};

/**
 * Simple keyword-based ranking for RAG retrieval.
 * In a real-world scenario, we'd use embeddings, but this is a lightweight 
 * implementation suitable for a local SPA.
 */
export const retrieveRelevantChunks = (query: string, chunks: string[], topK: number = 3): string[] => {
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  
  const ranked: Chunk[] = chunks.map(chunk => {
    let score = 0;
    const lowerChunk = chunk.toLowerCase();
    for (const word of queryWords) {
      if (lowerChunk.includes(word)) {
        score += 1;
      }
    }
    return { text: chunk, score };
  });

  return ranked
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(c => c.text);
};


import { Chunk } from '../types';

const STOP_WORDS = new Set(['what', 'where', 'when', 'how', 'who', 'the', 'and', 'for', 'about', 'with', 'from', 'near', 'this', 'that', 'your', 'have', 'does', 'university', 'admission', 'please', 'tell', 'info', 'information']);

/**
 * Splits text into chunks with overlapping windows to prevent loss of context at boundaries.
 */
export const createChunks = (text: string, chunkSize: number = 1000, overlap: number = 200): string[] => {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    
    // If not at the end, try to find a natural break (period or newline)
    if (endIndex < text.length) {
      const nextNewline = text.indexOf('\n', endIndex - 50);
      const nextPeriod = text.indexOf('.', endIndex - 50);
      
      if (nextNewline !== -1 && nextNewline < endIndex + 100) {
        endIndex = nextNewline + 1;
      } else if (nextPeriod !== -1 && nextPeriod < endIndex + 100) {
        endIndex = nextPeriod + 1;
      }
    }

    chunks.push(text.substring(startIndex, endIndex).trim());
    startIndex = endIndex - overlap;
    
    // Prevent infinite loops if progress isn't made
    if (startIndex >= endIndex) startIndex = endIndex;
  }
  
  return chunks.filter(c => c.length > 50);
};

/**
 * Keyword-based ranking with distinct word scoring.
 */
export const retrieveRelevantChunks = (query: string, chunks: string[], topK: number = 6): string[] => {
  const queryWords = query.toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  
  if (queryWords.length === 0) return chunks.slice(0, 3); // Return some context if no keywords

  const ranked: Chunk[] = chunks.map(chunk => {
    let score = 0;
    const lowerChunk = chunk.toLowerCase();
    
    queryWords.forEach(word => {
      const count = (lowerChunk.match(new RegExp(word, 'gi')) || []).length;
      if (count > 0) {
        // Boost for distinct matches + frequency
        score += 5 + (count * 2);
      }
    });

    return { text: chunk, score };
  });

  return ranked
    .sort((a, b) => b.score - a.score)
    .filter(c => c.score > 0)
    .slice(0, topK)
    .map(c => c.text);
};

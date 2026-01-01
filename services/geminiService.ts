
import { GoogleGenAI } from "@google/genai";
import { retrieveRelevantChunks } from "./ragEngine";

const MODEL_NAME = 'gemini-3-flash-preview';

export const generateRagResponse = async (
  query: string, 
  allChunks: string[], 
  chatHistory: { role: 'user' | 'model', text: string }[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  // RAG: Retrieve the most relevant chunks based on user query
  const contextChunks = retrieveRelevantChunks(query, allChunks, 5);
  const contextText = contextChunks.join("\n---\n");

  const systemInstruction = `
    You are the official Admission Support Assistant for Iqra University. 
    Your goal is to provide accurate, helpful, and polite information about admissions, programs, fees, and campus life based strictly on the provided context.
    
    RULES:
    1. Only use the provided context to answer. If the information is not in the context, politely inform the student that they should contact the admission office directly at admissions@iqra.edu.pk.
    2. Maintain a professional yet welcoming tone.
    3. If asked about Fee structure, Admission dates, or Eligibility, look specifically for those sections in the context.
    4. Keep answers concise and well-formatted using markdown.
    
    CONTEXT DATA:
    ${contextText}
  `;

  // Format chat history for Gemini contents
  const contents = chatHistory.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));
  
  // Add the current user query
  contents.push({
    role: 'user',
    parts: [{ text: query }]
  });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents,
    config: {
      systemInstruction,
      temperature: 0.3, // Lower temperature for more factual RAG responses
      topP: 0.8,
      topK: 40
    }
  });

  return response.text || "I'm sorry, I couldn't process that request.";
};

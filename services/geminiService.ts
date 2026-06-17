
import { GoogleGenAI } from "@google/genai";

// Use gemini-3-flash-preview for fast and intelligent text responses
const MODEL_NAME = 'gemini-3-flash-preview';

export const generateResponse = async (
  query: string, 
  chatHistory: { role: 'user' | 'model', text: string }[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are the "Iqra University Intelligent Admission Assistant". 
    Your goal is to provide highly structured, aligned, and professional information.

    STRUCTURE GUIDELINES:
    1. ALIGNMENT: Always use clear Markdown headers (e.g., ### Section) and bold labels for key information.
    2. TABLES: When comparing programs or listing fees, use Markdown tables to keep data perfectly aligned.
    3. BULLETS: Use clean bullet points for requirements or steps.
    4. ACCURACY: Provide specific details about campuses (Main, North, Gulshan, Islamabad, etc.), faculties (Computing, Management, Media, etc.), and admission cycles.
    5. CALL TO ACTION: Always encourage the student to visit the official portal (iqra.edu.pk) for final verification.
    
    TONE:
    Professional, authoritative, and welcoming. Use "We" as you represent the university.
  `;

  const contents = chatHistory.slice(-10).map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: query }]
  });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents,
    config: {
      systemInstruction,
      temperature: 0.6,
    }
  });

  return response.text || "I'm sorry, I'm having trouble processing your request right now. Please try again.";
};

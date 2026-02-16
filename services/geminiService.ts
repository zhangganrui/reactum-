import { GoogleGenAI, Type } from "@google/genai";
import { ActionItem } from '../types';

// Initialize the AI client
// NOTE: In a real production app, you should handle key retrieval more securely or via backend proxy.
// Here we assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateActionsFromNote = async (noteContent: string, bookTitle: string): Promise<Omit<ActionItem, 'id' | 'isCompleted' | 'createdAt' | 'sourceNoteId'>[]> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found. Returning mock response.");
    return [
      {
        title: "Review API Key",
        description: "Please add your Gemini API Key to the environment to generate real actions.",
        duration: 5
      }
    ];
  }

  try {
    const prompt = `
      Analyze the following book excerpt from "${bookTitle}".
      Excerpt: "${noteContent}"
      
      Identify the core intent and generate exactly 3 distinct, concrete, and actionable "micro-actions" that the reader can perform to apply this knowledge.
      
      Constraints:
      1. Each action must be performable in under 15 minutes.
      2. Actions must be practically applicable to daily life.
      3. Avoid vague advice like "Think about X". Use active verbs like "List", "Draft", "Message", "Meditate for 5 min".
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short punchy title (max 5 words)" },
              description: { type: Type.STRING, description: "Specific instruction on what to do" },
              duration: { type: Type.INTEGER, description: "Estimated minutes (max 15)" }
            },
            required: ["title", "description", "duration"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const actions = JSON.parse(text);
    return actions;

  } catch (error) {
    console.error("Error generating actions:", error);
    return [];
  }
};

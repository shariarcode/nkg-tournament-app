import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';
import { AI_SYSTEM_INSTRUCTION } from '../constants';

const apiKey = (import.meta as any).env.VITE_API_KEY;

if (!apiKey) {
  console.warn("VITE_API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "API_KEY_NOT_SET" });

export const getAIStream = async (history: ChatMessage[], newMessage: string) => {
  const chatHistory = history.map(msg => ({
    role: msg.sender === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: msg.text }]
  }));

  // Start a new chat session for each stream request to apply history correctly
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: AI_SYSTEM_INSTRUCTION,
    },
    history: chatHistory
  });

  try {
    const result = await chat.sendMessageStream({ message: newMessage });
    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get response from AI assistant.");
  }
};
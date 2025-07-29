
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';
import { AI_SYSTEM_INSTRUCTION } from '../constants';

if (!process.env.API_KEY) {
  // In a real app, this would be a fatal error.
  // For this environment, we'll proceed but the API will fail.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "API_KEY_NOT_SET" });

const model = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    systemInstruction: AI_SYSTEM_INSTRUCTION,
  },
});

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
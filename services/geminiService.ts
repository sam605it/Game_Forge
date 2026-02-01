
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { INITIAL_SYSTEM_INSTRUCTION } from "../constants";

export interface ForgeResponse {
  text: string;
  code: string | null;
}

export class GameForgeService {
  private ai: GoogleGenAI;
  private chat: Chat;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    this.chat = this.ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
        temperature: 0.9,
        topP: 0.95,
      },
    });
  }

  async sendMessage(message: string): Promise<ForgeResponse> {
    const response: GenerateContentResponse = await this.chat.sendMessage({ message });
    const rawText = response.text || "";
    
    // Extract HTML code block
    let code: string | null = null;
    const markdownRegex = /```(?:html)?\s*([\s\S]*?)\s*```/gi;
    const matches = [...rawText.matchAll(markdownRegex)];
    
    if (matches.length > 0) {
      // Get the last block as it's usually the final/correct one
      code = matches[matches.length - 1][1];
    } else if (rawText.includes('<html') || rawText.includes('<!DOCTYPE')) {
      const htmlMatch = rawText.match(/([\s\S]*<!DOCTYPE html>[\s\S]*<\/html>)/i);
      code = htmlMatch ? htmlMatch[0] : null;
    }

    const cleanText = rawText.replace(/```(?:html)?[\s\S]*?```/gi, "").trim();

    return {
      text: cleanText || "Forging complete! Check the preview.",
      code
    };
  }
}

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from "../types";

// Lazy initialization of AI client to prevent errors when API key is not set
let ai: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI | null => {
  if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) {
    return null;
  }
  
  if (!ai) {
    ai = new GoogleGenAI({ 
      apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY 
    });
  }
  
  return ai;
};

export const generateIcebreakers = async (topic: string): Promise<string[]> => {
  const aiClient = getAIClient();
  
  if (!aiClient) {
    return ["Please set your Gemini API key to enable AI-powered icebreaker suggestions."];
  }
  
  try {
    const response: GenerateContentResponse = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of 3 creative and engaging icebreaker questions for a live audio room discussion about "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            icebreakers: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              }
            }
          }
        },
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result.icebreakers || [];

  } catch (error) {
    console.error("Error generating icebreakers:", error);
    return ["An error occurred while generating suggestions."];
  }
};


export const generateAvatarImage = async (): Promise<string | null> => {
  const aiClient = getAIClient();
  
  if (!aiClient) {
    console.log("Gemini API key not set - avatar generation unavailable");
    return null;
  }
  
  try {
    const response = await aiClient.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: 'A vibrant, abstract, geometric profile picture, minimalist, colorful, high-quality.',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating avatar image:", error);
    return null;
  }
};

export const summarizeChat = async (messages: ChatMessage[]): Promise<string> => {
  if (messages.length < 2) {
    return "There aren't enough messages to generate a meaningful summary yet.";
  }

  // Format messages for the prompt
  const formattedChat = messages
    .map(msg => `${msg.user.name}: ${msg.text || '[Audio/Video Note]'}`)
    .join('\n');

  const aiClient = getAIClient();
  
  if (!aiClient) {
    return "Please set your Gemini API key to enable AI-powered chat summaries.";
  }
  
  try {
    const response: GenerateContentResponse = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Please provide a concise summary of the key points and overall sentiment from the following chat conversation:\n\n${formattedChat}`,
      config: {
        temperature: 0.3,
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error summarizing chat:", error);
    return "An error occurred while generating the summary.";
  }
};
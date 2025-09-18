import { GoogleGenAI, Type } from "@google/genai";
import { GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY not found in environment variables. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateIcebreakers = async (topic: string): Promise<string[]> => {
  if (!API_KEY) {
    return Promise.resolve([
      "API Key not configured. Please set up your API_KEY.",
      "What is your favorite color?",
      "If you could have any superpower, what would it be?",
    ]);
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
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
  if (!API_KEY) {
    console.warn("API_KEY not found. Image generation is disabled.");
    return null;
  }
  try {
    const response = await ai.models.generateImages({
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
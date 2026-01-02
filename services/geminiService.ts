
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Item } from "../types";

/**
 * Creates a fresh GoogleGenAI instance using the current process.env.API_KEY.
 * Guidelines require using process.env.API_KEY directly and creating fresh instances
 * to ensure latest key from user dialog is used.
 */
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

/**
 * Generates a short fun fact for children about a specific item.
 */
export const getFunFact = async (itemName: string, categoryName: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Give me a very short, fun, and simple fact about a ${itemName} (from the ${categoryName} category) for a 5-year-old child.`,
    });
    return response.text || "Learning is fun!";
  } catch (error) {
    console.error("Fun Fact Error:", error);
    throw error; // Let the caller handle the error (e.g., prompt for key)
  }
};

/**
 * Uses Gemini to generate 10 more items for a category.
 */
export const expandCategoryItems = async (categoryName: string, existingItems: Item[]): Promise<Item[]> => {
  try {
    const ai = getAI();
    const existingNames = existingItems.map(i => i.name).join(", ");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 10 new unique educational items for the category "${categoryName}" for kids. 
      The current items are: [${existingNames}]. Return a JSON array of objects with keys: name (English), persianName (Farsi), emoji.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              persianName: { type: Type.STRING },
              emoji: { type: Type.STRING }
            },
            required: ["name", "persianName", "emoji"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((it: any, index: number) => ({
      id: `dynamic-${categoryName}-${Date.now()}-${index}`,
      name: it.name,
      persianName: it.persianName,
      emoji: it.emoji,
      color: "bg-white"
    }));
  } catch (e) {
    console.error("AI Error:", e);
    throw e;
  }
};

/**
 * Generates high-quality speech for a given text.
 */
export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: 'Kore' } 
          } 
        }
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Speech Gen Error:", error);
    throw error;
  }
};

/**
 * Generates a colorful 3D-style image for an item.
 */
export const generateItemImage = async (itemName: string, categoryName: string): Promise<string | undefined> => {
  try {
    const ai = getAI();
    const prompt = `A single colorful, cheerful 3D cartoon object of a ${itemName} for a children's learning app. Category: ${categoryName}. Pure white background, high quality, vibrant colors.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

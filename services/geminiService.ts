import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Item } from "../types";

export const getFunFact = async (itemName: string, categoryName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Give me a very short (max 10 words), cheerful fact about a ${itemName} for a 5-year-old child to learn.`,
  });
  return response.text || "Learning is fun!";
};

export const expandCategoryItems = async (categoryName: string, existingItems: Item[]): Promise<Item[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const existingNames = existingItems.map(i => i.name).join(", ");
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a helpful educational assistant. Generate exactly 10 new unique vocabulary items for the category "${categoryName}". 
    Do not include these items which are already in the list: [${existingNames}].
    Return ONLY a valid JSON array of objects with keys: "name" (English), "persianName" (Farsi), "emoji".`,
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
    id: `dyn-${categoryName}-${Date.now()}-${index}`,
    name: it.name,
    persianName: it.persianName,
    emoji: it.emoji,
    color: "bg-white"
  }));
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { 
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } 
      }
    }
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const generateItemImage = async (itemName: string, categoryName: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const prompt = `A clean, bright, cute 3D cartoon style illustration of a ${itemName} on a solid white background. High quality, vibrant colors, child-friendly design.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { 
      imageConfig: { aspectRatio: "1:1" }
    }
  });

  if (!response.candidates?.[0]?.content?.parts) return undefined;

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return undefined;
};

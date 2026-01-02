import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Item } from "../types";

// ایجاد اینستنس جدید در هر فراخوانی برای اطمینان از داشتن آخرین کلید از process.env
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const getFunFact = async (itemName: string, categoryName: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tell me a very short, simple, and fun fact for a child about "${itemName}" in category "${categoryName}".`,
    });
    return response.text || "Learning is fun!";
  } catch (e) {
    throw e;
  }
};

export const expandCategoryItems = async (categoryName: string, existingItems: Item[]): Promise<Item[]> => {
  const ai = getClient();
  const existingNames = existingItems.map(i => i.name).join(", ");
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 10 new English vocabulary items for children in the category "${categoryName}".
    Avoid: [${existingNames}].
    Return ONLY a raw JSON array of objects: [{"name": "English", "persianName": "Farsi", "emoji": "🍎"}].`,
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

  const text = response.text || "[]";
  const data = JSON.parse(text);
  
  return data.map((it: any, index: number) => ({
    id: `dyn-${categoryName}-${Date.now()}-${index}`,
    name: it.name,
    persianName: it.persianName,
    emoji: it.emoji,
    color: "bg-white"
  }));
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  const ai = getClient();
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
  const ai = getClient();
  const prompt = `A clean, cute 3D cartoon illustration of a ${itemName} on white background. High quality, vibrant style for kids.`;
  
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

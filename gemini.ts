
import { GoogleGenAI } from "@google/genai";

export const transformToResumePhoto = async (
  base64Image: string, 
  mimeType: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Nano Banana model as requested
  const modelName = 'gemini-2.5-flash-image';
  
  const prompt = `
    TASK: HIGH-END STARTUP PROFILE TRANSFORMATION
    
    1. FACE FIDELITY: Maintain the user's face, features, identity, and facial expression with absolute precision. DO NOT change the person's identity.
    2. BACKGROUND: Replace the current background with a 'Sleek, modern IT startup office'. Use shallow depth of field (bokeh). Include elements like glass partitions, warm indoor lighting, minimal wooden desks, and green plants in the distance.
    3. ATTIRE: Replace the current clothing with 'Clean Business Casual'. Preferred: a high-quality knit sweater, a modern unstructured blazer, or a crisp minimal oxford shirt. The fit should look professional yet approachable.
    4. VIBE: Professional photography style, soft natural indoor lighting, 4k quality, sharp details on the person.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    let transformedBase64 = "";
    
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          transformedBase64 = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!transformedBase64) {
      throw new Error("The AI didn't return an image part. Please try again.");
    }

    return transformedBase64;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

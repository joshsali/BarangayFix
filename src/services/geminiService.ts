import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AIAnalysis {
  category: string;
  urgency: "Low" | "Medium" | "High";
  reasoning: string;
}

export async function analyzeReport(title: string, description: string): Promise<AIAnalysis> {
  const model = "gemini-3-flash-preview";
  const prompt = `Analyze this community report and suggest a category and urgency level.
  Title: ${title}
  Description: ${description}
  
  Categories should be one of: Road/Pothole, Street Light, Waste/Garbage, Water/Drainage, Public Safety, or Other.
  Urgency should be: Low, Medium, or High.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          urgency: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          reasoning: { type: Type.STRING }
        },
        required: ["category", "urgency", "reasoning"]
      }
    }
  });

  return JSON.parse(response.text.trim());
}

export async function adminChat(query: string, reportsData: any[]): Promise<string> {
  const model = "gemini-3-flash-preview";
  const prompt = `You are an AI assistant for Barangay Officials. 
  Answer the user's question based on the following reports data:
  ${JSON.stringify(reportsData)}
  
  Question: ${query}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text || "I'm sorry, I couldn't process that request.";
}

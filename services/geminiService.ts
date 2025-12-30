import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
// Note: In a real app, handle missing API key gracefully in UI
const ai = new GoogleGenAI({ apiKey });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short, clear title for the scanned item (e.g., Product Name, Website Title)" },
    category: { type: Type.STRING, description: "Category of the item (e.g., Food, Electronics, Website, Plain Text)" },
    description: { type: Type.STRING, description: "A helpful summary or description of the content." },
    priceEstimate: { type: Type.STRING, description: "Estimated price range if it is a product, otherwise null." },
    actionableType: { 
      type: Type.STRING, 
      enum: ['PRODUCT', 'URL', 'TEXT', 'WIFI', 'UNKNOWN'],
      description: "The type of content to determine best UI action."
    },
    safetyRating: { type: Type.STRING, description: "Brief safety assessment (Safe, Suspicious, Unknown)." }
  },
  required: ["title", "category", "description", "actionableType"]
};

export const analyzeScannedData = async (rawValue: string, format: string): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    return {
      title: "API Key Missing",
      category: "System",
      description: "Please provide a valid Gemini API Key to analyze this code.",
      actionableType: "TEXT",
    };
  }

  try {
    const prompt = `
      Analyze the following barcode/QR code data.
      Format: ${format}
      Data: "${rawValue}"

      1. If it looks like a UPC/EAN (numbers), identify the product details (Name, Category, Description).
      2. If it is a URL, infer the website's purpose from the domain and structure.
      3. If it is raw text, summarize it.
      4. If it is WiFi config (starts with WIFI:), describe the network name.
      
      Provide a helpful, concise analysis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an intelligent scanner assistant. Your job is to decode obscure barcode data into human-readable, useful information.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      title: "Analysis Failed",
      category: "Error",
      description: "Could not analyze the scanned data at this time.",
      actionableType: "UNKNOWN",
    };
  }
};
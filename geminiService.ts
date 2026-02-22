import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "./constants";

// Correctly initialize GoogleGenAI using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getFlavorRecommendation = async (userInput: string) => {
  // Group products by category to help the AI organize its thoughts and ensure it picks multiple items
  const productsByCategory = PRODUCTS.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(`${p.name}: ${p.description}`);
    return acc;
  }, {} as Record<string, string[]>);

  const productListStr = Object.entries(productsByCategory)
    .map(([cat, items]) => `Category [${cat}]:\n${items.map(i => `- ${i}`).join('\n')}`)
    .join('\n\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are the "AI Flavor Assistant" for Amie's Homemade, a premium brand of handcrafted Indian treats. 
    
Your goal is to help users find the perfect snack, mukhwas, or sweet from our menu.

### OUR MENU:
${productListStr}

### YOUR INSTRUCTIONS:
1. MANDATORY: You MUST recommend AT LEAST 3 specific products in every response. 
2. If the user asks for a specific category (e.g., "Mukhwas" or "Snacks"), you MUST provide at least 3 different items from that exact category.
3. If the user is being general or asking for a "gift" or "something tasty", suggest a curated list of 3-5 diverse items across different categories.
4. Keep the tone warm, welcoming, and artisanal—like a friendly conversation with Ami Shah herself.
5. For each recommendation, briefly explain why it's a great choice based on the user's request.
6. Use bullet points or clear spacing for readability.
7. Only recommend products that exist in the menu provided above.

User request: "${userInput}"`,
    config: {
      temperature: 0.8,
      maxOutputTokens: 800,
    }
  });

  return response.text;
};
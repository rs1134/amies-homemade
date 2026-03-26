import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "./constants";

const getApiKey = () => {
  try {
    const g = globalThis as any;
    return g.process?.env?.GEMINI_API_KEY || "";
  } catch (e) {
    return "";
  }
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const getFlavorRecommendation = async (userInput: string, history: ChatMessage[] = []) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return "I'm sorry, I can't provide recommendations right now as the API key is missing.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const productsByCategory = PRODUCTS.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(`${p.name}: ${p.description}`);
    return acc;
  }, {} as Record<string, string[]>);

  const productListStr = Object.entries(productsByCategory)
    .map(([cat, items]) => `[${cat}]\n${items.map(i => `- ${i}`).join('\n')}`)
    .join('\n\n');

  const historyStr = history.length > 0
    ? '\n\n### CONVERSATION SO FAR:\n' + history.map(m => `${m.role === 'user' ? 'Customer' : 'You'}: ${m.text}`).join('\n')
    : '';

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `You are the friendly "Flavor Assistant" for Amie's Homemade — a premium brand of handcrafted Indian mukhwas, snacks, sweets and gift hampers made fresh in Ahmedabad.

### OUR MENU:
${productListStr}
${historyStr}

### YOUR RULES:
1. ALWAYS recommend AT LEAST 3 specific products per response — use their exact names as listed in the menu.
2. When recommending products, put their EXACT name in **bold** like **Chatpati Mango** so the app can detect and link them.
3. Be warm, conversational and enthusiastic — like Ami herself recommending her favourites.
4. If the user asks a follow-up, remember the conversation and build on it.
5. Keep responses concise — max 120 words. Use short bullet points.
6. Never recommend products not in the menu.
7. End with a short enthusiastic line encouraging them to try something.

Customer's message: "${userInput}"`,
    config: {
      temperature: 0.75,
      maxOutputTokens: 400,
    }
  });

  return response.text;
};

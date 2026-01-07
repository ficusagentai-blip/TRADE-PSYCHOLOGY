
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export type AIModelMode = 'fast' | 'thinking';

export const askSecurityAssistant = async (prompt: string, lang: 'mr' | 'hi' | 'en' = 'mr', mode: AIModelMode = 'fast') => {
  const ai = getAI();
  const model = mode === 'thinking' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = {
    systemInstruction: `You are the "Ficus Trading Psychologist". Your role is to guide traders through their emotional ups and downs. 
    Focus on:
    1. Trading Discipline (Risk management, sticking to plans).
    2. Emotion Control (Dealing with FOMO, Revenge Trading, Greed).
    3. Rule Enforcement: Remind them of rules used by legendary traders like Mark Minervini, Paul Tudor Jones, and Jesse Livermore.
    Respond in the language the user is using (Marathi, Hindi, or English).
    Keep your responses empathetic, firm about rules, and highly professional. 
    If they mention a loss, analyze their psychology and suggest ways to regain discipline.`,
    temperature: 0.8,
  };

  if (mode === 'thinking') {
    config.thinkingConfig = { thinkingBudget: 15000 };
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });
    
    // Safety check for empty results
    if (response && response.text) {
      return response.text;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("AI Coach error:", error);
    const errorMessages = {
      mr: "क्षमस्व, मला जोडणी करताना तांत्रिक अडचण आली. पण लक्षात ठेवा, शिस्त हीच नफ्याची गुरुकिल्ली आहे.",
      hi: "क्षमा करें, मुझे कनेक्ट करने में तकनीकी समस्या हुई। याद रखें, अनुशासन ही मुनाफे की कुंजी है।",
      en: "Sorry, I encountered a technical issue. Remember, discipline is the key to profitability."
    };
    return errorMessages[lang] || errorMessages.en;
  }
};

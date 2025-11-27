import { GoogleGenAI, Type } from "@google/genai";
import { Language, GuessResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

// Generate a random target word
export const generateTargetWord = async (lang: Language): Promise<string> => {
  const prompt = lang === 'TH' 
    ? "ขอคำนามทั่วไป 1 คำ ที่คนทั่วไปรู้จัก ใช้ในชีวิตประจำวัน ไม่ใช่คำเฉพาะ ไม่เอาคำทับศัพท์ พิมพ์มาแค่คำนั้นคำเดียว ไม่มีเครื่องหมายอื่น"
    : "Generate a single, common, everyday noun in English. Return ONLY the word, no punctuation.";

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 1.2, // High variety
      }
    });
    return response.text?.trim().toLowerCase() || (lang === 'TH' ? 'แมว' : 'cat');
  } catch (error) {
    console.error("Error generating word:", error);
    return lang === 'TH' ? 'ความสุข' : 'happiness'; // Fallback
  }
};

// Evaluate the guess similarity
export const evaluateGuess = async (target: string, guess: string, lang: Language): Promise<GuessResult> => {
  // Use JSON schema for strict output
  const schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER, description: "Similarity score from 0 to 100" },
      isValid: { type: Type.BOOLEAN, description: "True if the guess is a valid word with meaning" },
      emoji: { type: Type.STRING, description: "A single emoji representing the guessed word" },
      feedback: { type: Type.STRING, description: "Short encouragement or observation" }
    },
    required: ["score", "isValid", "emoji"]
  };

  const prompt = `
    Target Word: "${target}"
    Guessed Word: "${guess}"
    Language: ${lang}

    Task:
    1. Check if "${guess}" is a valid word in ${lang}. If it is gibberish or misspelt, isValid is false.
    2. If valid, rate the SEMANTIC similarity (meaning) between the Target and the Guess on a scale of 0 to 100.
       - 100 = Exact match or synonym.
       - 75-99 = Very close concept (e.g., Cat vs Kitten).
       - 50-74 = Related field (e.g., Cat vs Animal).
       - 25-49 = Loosely related.
       - 0-24 = Completely different.
    3. Pick a cute emoji representing the "${guess}".
    4. Provide very short feedback (max 5 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const json = JSON.parse(response.text || "{}");
    return {
      word: guess,
      score: json.score || 0,
      isValid: json.isValid,
      emoji: json.emoji || '❓',
      feedback: json.feedback
    };
  } catch (error) {
    console.error("Error evaluating guess:", error);
    return { word: guess, score: 0, isValid: false, emoji: '❌' };
  }
};

// Generate a hint
export const generateHint = async (target: string, lang: Language, level: number): Promise<string> => {
  const prompt = lang === 'TH'
    ? `คำปริศนาคือ "${target}". ขอคำใบ้ระดับที่ ${level} (จาก 3 ระดับ). ระดับ 1 ใบ้กว้างๆ, ระดับ 3 ใบ้ชัดเจน. ขอประโยคสั้นๆ น่ารักๆ`
    : `The secret word is "${target}". Give me hint #${level} (out of 3). Level 1 is vague, Level 3 is obvious. Keep it short and cute.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return response.text?.trim() || "No hint available.";
  } catch (error) {
    return "Hint machine broken 🤖";
  }
};
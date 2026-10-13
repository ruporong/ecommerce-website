import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { name, category, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const systemInstruction = `You are an expert e-commerce SEO specialist. Write a highly optimized Meta Title and Meta Description for a product. Output ONLY a valid JSON object with two fields: "meta_title" (string, max 60 chars), "meta_description" (string, max 160 chars), and "meta_keywords" (string, comma-separated list of 5-8 relevant keywords). Do not wrap the JSON in markdown blocks.`;
    
    let promptText = `Product Name: ${name}\nCategory: ${category || 'general'}`;
    if (description) {
      const plainDesc = description.replace(/<[^>]*>?/gm, '').substring(0, 500);
      promptText += `\nDescription: ${plainDesc}`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.5,
            responseMimeType: "application/json",
        }
    });

    const responseText = response.text || '{}';
    let data = { meta_title: "", meta_description: "", meta_keywords: "" };
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse AI SEO response", e);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Generate SEO API Error:', error);
    return NextResponse.json({ error: 'Failed to generate SEO data' }, { status: 500 });
  }
}

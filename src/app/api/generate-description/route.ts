import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { name, category } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const systemInstruction = `You are an expert e-commerce copywriter. Write a compelling product description for a product named "${name}" in the "${category || 'general'}" category. Output ONLY a valid JSON object with two fields: "description" (containing the intro and features in clean HTML format with <p> and <ul> tags, no markdown) and "faqs" (an array of objects, each with "question" and "answer" string fields). Do not wrap the JSON in markdown blocks.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [{ role: 'user', parts: [{ text: `Write description for ${name}` }] }],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            responseMimeType: "application/json",
        }
    });

    const responseText = response.text || '{}';
    let data = { description: "", faqs: [] };
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data.description = responseText;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Generate Description API Error:', error);
    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
  }
}

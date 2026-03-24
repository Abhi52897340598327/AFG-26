import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages } = body;

    const geminiRequest = {
      contents: messages.map((msg: any) => ({
        parts: [{ text: msg.content }],
        role: msg.role === 'assistant' ? 'model' : 'user'
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048, // Increased from 1000 to prevent cutoffs
      },
      systemInstruction: {
        parts: [{
          text: "When responding to mathematical or scientific questions, use LaTeX format for equations and formulas. Enclose inline math with $...$ and display math with $$...$$. Provide complete, detailed responses without cutting off explanations. Always finish your thoughts completely."
        }]
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequest),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Response:', errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      return NextResponse.json({
        response: data.candidates[0].content.parts[0].text
      });
    } else {
      return NextResponse.json(
        { error: 'No response from Gemini API' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

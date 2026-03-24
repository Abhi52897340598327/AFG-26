const API_KEY = 'AIzaSyAzsKHM6TADTiPFsaY55gFGwbJHnKtQTdc';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GeminiContent {
  parts: {
    text: string;
  }[];
  role?: string;
}

export interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
  };
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export const sendMessageToAPI = async (messages: ChatMessage[]): Promise<string> => {
  try {
    // Extract system message separately
    const systemMessage = messages.find(msg => msg.role === 'system')?.content;
    
    // Convert messages to Gemini format
    const geminiContents: GeminiContent[] = messages
      .filter(msg => msg.role !== 'system') // Remove system messages
      .map(msg => ({
        parts: [{ text: msg.content }],
        role: msg.role === 'assistant' ? 'model' : 'user'
      }));

    // If there's a system message, add it as the first user message
    if (systemMessage) {
      geminiContents.unshift({
        parts: [{ text: systemMessage }],
        role: 'user'
      });
    }

    const requestBody: GeminiRequest = {
      contents: geminiContents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    };

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No response from Gemini API');
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

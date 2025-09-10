import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_ROOT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for the streamed response
export interface StreamedResponse {
  text: string;
}

export interface ParsedStreamData {
  reasoning: string;
  answer: string;
  fabric_json: unknown;
}

export interface AIGenerateResponse {
  success: boolean;
  data: {
    fabricJSON: unknown; // Can be object or array
    description: string;
    generatedAt: string;
  };
}

export const aiAPI = {
  generateDesign: async (prompt: string): Promise<AIGenerateResponse> => {
    const response = await apiClient.post<AIGenerateResponse>('/ai/generate-design', {
      description: prompt,
    });
    return response.data;
  },

  // New streaming API call
  generateDesignStream: async (
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    onChunk: (chunk: string) => void,
    onComplete: (data: ParsedStreamData) => void,
    onError: (error: Error) => void
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_ROOT}/groq/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let completeResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          try {
            // Handle potential data: prefix from SSE
            const cleanLine = line.startsWith('data: ') ? line.slice(6) : line;
            if (cleanLine === '[DONE]') continue;
            
            const parsed: StreamedResponse = JSON.parse(cleanLine);
            
            // Accumulate the complete response for final parsing
            completeResponse += parsed.text;
            
            // Stream only the text content for real-time display
            onChunk(parsed.text);
          } catch (parseError) {
            console.warn('Failed to parse chunk:', line, parseError);
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const cleanLine = buffer.startsWith('data: ') ? buffer.slice(6) : buffer;
          if (cleanLine !== '[DONE]') {
            const parsed: StreamedResponse = JSON.parse(cleanLine);
            completeResponse += parsed.text;
            onChunk(parsed.text);
          }
        } catch (parseError) {
          console.warn('Failed to parse final chunk:', buffer, parseError);
        }
      }

      // Parse the complete accumulated response
      try {
        if (!completeResponse.trim()) {
          throw new Error('No response data received');
        }
        
        const finalData: ParsedStreamData = JSON.parse(completeResponse);
        
        // Validate that we have the required fields
        if (!finalData.answer) {
          throw new Error('Invalid response format: missing answer');
        }
        
        onComplete(finalData);
      } catch (parseError) {
        console.error('Failed to parse final response:', parseError);
        console.error('Complete response was:', completeResponse);
        onError(new Error('Failed to parse final response'));
      }

    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  },
};
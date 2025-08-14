import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_ROOT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AIGenerateResponse {
  success: boolean;
  data: {
    fabricJSON: any; // Can be object or array
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
};
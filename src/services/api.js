// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for long-running analysis
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Competitor Analysis APIs
export const competitorAPI = {
  analyze: async (companyName, companyUrl) => {
    return apiClient.post('/api/competitor/analyze', {
      company_name: companyName,
      company_url: companyUrl,
    });
  },
  
  export: async (format, data) => {
    return apiClient.post('/api/competitor/export', {
      format,
      data,
    }, {
      responseType: 'blob',
    });
  },
};

// Video Pitch Analyzer APIs
export const videoAPI = {
  analyzeYouTube: async (youtubeUrl) => {
    return apiClient.post('/api/video-pitch/analyze', {
      youtube_url: youtubeUrl,
    });
  },
  
  uploadVideo: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post('/api/video-pitch/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(percentCompleted);
      },
    });
  },
  
  exportSummary: async (data, format = 'pdf') => {
    return apiClient.post('/api/video-pitch/export', {
      data,
      format,
    }, {
      responseType: 'blob',
    });
  },
};

// AI Analyzer APIs
export const aiAnalyzerAPI = {
  analyze: async (userInput, context) => {
    return apiClient.post('/api/ai-analyzer/analyze', {
      user_input: userInput,
      context,
    });
  },
  
  chat: async (messages) => {
    return apiClient.post('/api/ai-analyzer/chat', {
      messages,
    });
  },
};

export default apiClient;

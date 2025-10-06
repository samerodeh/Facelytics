import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interfaces
export interface UserRegister {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user?: any;
}

// Face embedding interfaces
export interface EmbeddingResponse {
  success: boolean;
  embedding?: number[];
  message: string;
  error?: string;
}

export interface EmbeddingListResponse {
  success: boolean;
  embeddings?: { id: number; person_name: string }[];
  error?: string;
}

export interface ComparisonResponse {
  match: boolean;
  similarity?: number;
  message?: string;
}

// Auth API functions
export const authAPI = {
  register: (userData: UserRegister): Promise<AuthResponse> =>
    api.post('/auth/register', userData).then(res => res.data),
  
  login: (userData: UserLogin): Promise<AuthResponse> =>
    api.post('/auth/login', userData).then(res => res.data),
};

// Face embedding API functions
export const embeddingAPI = {
  createEmbedding: (file: File, name: string): Promise<EmbeddingResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    
    return api.post('/create-embedding', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },

  deleteEmbedding: (personName: string): Promise<EmbeddingResponse> =>
    api.delete('/delete-embedding', { params: { person_name: personName } })
      .then(res => res.data),

  updateEmbedding: (personName: string, newPersonName: string): Promise<EmbeddingResponse> =>
    api.put('/update-embedding', null, { 
      params: { person_name: personName, new_person_name: newPersonName } 
    }).then(res => res.data),

  compareFaces: (file1: File, file2: File): Promise<ComparisonResponse> => {
    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);
    
    return api.post('/compare-faces', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },

  listEmbeddings: (): Promise<EmbeddingListResponse> =>
    api.get('/embeddings').then(res => res.data),
};

export default api;

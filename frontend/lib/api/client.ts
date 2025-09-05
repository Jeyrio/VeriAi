import { APP_CONFIG } from '../config';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface VerificationRequest {
  prompt: string;
  model: string;
  userAddress: string;
  output: string;
  outputHash?: string;
  signature?: string;
  message?: string;
}

export interface VerificationResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestId: string;
  userAddress: string;
  prompt: string;
  model: string;
  output: string;
  verified?: boolean;
  confidence?: number;
  fdcAttestationId?: string;
  blockNumber?: number;
  transactionHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIGenerationRequest {
  prompt: string;
  model: string;
  userAddress: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIGenerationResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  model: string;
  output?: string;
  metadata?: {
    tokens: number;
    cost: number;
    processingTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Base API client
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = APP_CONFIG.api.baseUrl;
    this.timeout = APP_CONFIG.api.timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<APIResponse<T>> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;
    
    return this.request<T>(url);
  }

  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

const apiClient = new ApiClient();

// AI Generation API - matches backend /api/v1/ai routes
export const aiApi = {
  async generateContent(request: AIGenerationRequest): Promise<APIResponse<AIGenerationResult>> {
    return apiClient.post<AIGenerationResult>('/api/v1/ai/generate', request);
  },

  async getGeneration(requestId: string): Promise<APIResponse<AIGenerationResult>> {
    return apiClient.get<AIGenerationResult>(`/api/v1/ai/generation/${requestId}`);
  },

  async getModels(): Promise<APIResponse<{models: any[], total: number}>> {
    return apiClient.get<{models: any[], total: number}>('/api/v1/ai/models');
  },

  async validateOutput(data: {
    prompt: string;
    output: string;
    model: string;
    expectedHash: string;
  }): Promise<APIResponse<any>> {
    return apiClient.post('/api/v1/ai/validate', data);
  },

  async getGenerations(address: string, options?: {
    page?: number;
    limit?: number;
  }): Promise<APIResponse<{ generations: any[]; total: number; page: number; totalPages: number }>> {
    const params: Record<string, string> = {};
    if (options?.page) params.page = options.page.toString();
    if (options?.limit) params.limit = options.limit.toString();

    return apiClient.get(`/api/v1/ai/user/${address}/generations`, params);
  },
};

// Verification API - matches backend /api/v1/verification routes
export const verificationApi = {
  async requestVerification(request: VerificationRequest): Promise<APIResponse<VerificationResult>> {
    return apiClient.post<VerificationResult>('/api/v1/verification/request', request);
  },

  async verifyContent(request: { content: string; userAddress: string; prompt?: string; model?: string }): Promise<APIResponse<VerificationResult>> {
    // For content verification, we need to extract prompt and output from content
    return apiClient.post<VerificationResult>('/api/v1/verification/request', {
      prompt: request.prompt || 'Verify this content',
      model: request.model || 'gemini-1.5-flash',
      userAddress: request.userAddress,
      output: request.content,
    });
  },

  async getVerification(requestId: string): Promise<APIResponse<VerificationResult>> {
    return apiClient.get<VerificationResult>(`/api/v1/verification/${requestId}`);
  },

  async getUserVerifications(
    address: string,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<APIResponse<{ verifications: VerificationResult[]; total: number; page: number; limit: number }>> {
    const params: Record<string, string> = {};
    if (options?.page) params.page = options.page.toString();
    if (options?.limit) params.limit = options.limit.toString();
    if (options?.status) params.status = options.status;

    return apiClient.get(`/api/v1/verification/user/${address}`, params);
  },

  async retryVerification(requestId: string): Promise<APIResponse<VerificationResult>> {
    return apiClient.post<VerificationResult>(`/api/v1/verification/${requestId}/retry`);
  },

  async getStats(): Promise<APIResponse<any>> {
    return apiClient.get('/api/v1/verification/stats');
  },

  // Alias for backward compatibility
  async getVerifications(address: string, options?: { page?: number; limit?: number; status?: string }): Promise<APIResponse<{ verifications: VerificationResult[]; total: number; page: number; limit: number }>> {
    return this.getUserVerifications(address, options);
  },
};

// NFT API - matches backend /api/v1/nft routes
export const nftApi = {
  async mintNFT(data: {
    verificationId: string;
    userAddress: string;
    metadataUri: string;
  }): Promise<APIResponse<any>> {
    return apiClient.post('/api/v1/nft/mint', data);
  },

  async getNFTMetadata(tokenId: string): Promise<APIResponse<any>> {
    return apiClient.get(`/api/v1/nft/metadata/${tokenId}`);
  },

  async getUserNFTs(address: string): Promise<APIResponse<any[]>> {
    return apiClient.get<any[]>(`/api/v1/nft/user/${address}`);
  },
};

// FDC API - matches backend /api/v1/fdc routes
export const fdcApi = {
  async requestData(request: {
    attestationType: string;
    sourceId: string;
    requestBody: any;
  }): Promise<APIResponse<any>> {
    return apiClient.post('/api/v1/fdc/request', request);
  },

  async getProof(attestationId: string): Promise<APIResponse<any>> {
    return apiClient.get(`/api/v1/fdc/proof/${attestationId}`);
  },
};

// Auth API - matches backend /api/v1/auth routes
export const authApi = {
  async generateNonce(address: string): Promise<APIResponse<{ nonce: string; message: string }>> {
    return apiClient.post(`/api/v1/auth/nonce/${address}`, {});
  },

  async login(data: {
    address: string;
    signature: string;
    message: string;
  }): Promise<APIResponse<{ token: string; user: any }>> {
    return apiClient.post('/api/v1/auth/login', data);
  },

  async logout(): Promise<APIResponse<any>> {
    return apiClient.post('/api/v1/auth/logout');
  },

  async getProfile(address: string): Promise<APIResponse<any>> {
    return apiClient.get(`/api/v1/auth/profile/${address}`);
  },

  async refreshToken(): Promise<APIResponse<{ token: string }>> {
    return apiClient.post('/api/v1/auth/refresh');
  },

  async verifyToken(token: string): Promise<APIResponse<{ address: string; valid: boolean }>> {
    return apiClient.post('/api/v1/auth/verify', { token });
  },
};

// User API - matches backend /api/v1/user routes
export const userApi = {
  async getGenerations(address: string, options?: {
    page?: number;
    limit?: number;
  }): Promise<APIResponse<{ generations: any[]; total: number; page: number; totalPages: number }>> {
    const params: Record<string, string> = {};
    if (options?.page) params.page = options.page.toString();
    if (options?.limit) params.limit = options.limit.toString();

    return apiClient.get(`/api/v1/user/${address}/generations`, params);
  },

  async getVerifications(address: string, options?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<APIResponse<{ verifications: any[]; total: number; page: number; totalPages: number }>> {
    const params: Record<string, string> = {};
    if (options?.page) params.page = options.page.toString();
    if (options?.limit) params.limit = options.limit.toString();
    if (options?.status) params.status = options.status;

    return apiClient.get(`/api/v1/user/${address}/verifications`, params);
  },

  async getNFTs(address: string, options?: {
    page?: number;
    limit?: number;
  }): Promise<APIResponse<{ nfts: any[]; total: number; page: number; totalPages: number }>> {
    const params: Record<string, string> = {};
    if (options?.page) params.page = options.page.toString();
    if (options?.limit) params.limit = options.limit.toString();

    return apiClient.get(`/api/v1/user/${address}/nfts`, params);
  },

  async getStats(address: string): Promise<APIResponse<{
    totalGenerations: number;
    totalVerifications: number;
    totalNFTs: number;
    successRate: number;
    activeToday: number;
    lastActivity: string;
    verificationsChange: number;
    successRateChange: number;
    nftsChange: number;
    activeChange: number;
  }>> {
    return apiClient.get(`/api/v1/user/${address}/stats`);
  },
};

// Export default client
export default apiClient;

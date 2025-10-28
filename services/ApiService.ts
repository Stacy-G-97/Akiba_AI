/**
 * ApiService.ts
 * 
 * Production-ready API service for Akiba AI backend integration
 * Handles all HTTP requests with proper error handling and authentication
 * 
 * API NOTE: Provides secure communication with backend services
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EncryptionService } from './EncryptionService';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * PRODUCTION API EXPLANATION:
 * This service handles all API communication with proper authentication,
 * error handling, retry logic, and security measures
 */
export class ApiService {
  
  private static readonly DEFAULT_CONFIG: ApiConfig = {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.akiba-ai.com',
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
  };
  
  private static config: ApiConfig = { ...this.DEFAULT_CONFIG };
  
  /**
   * Configure API service
   * API: Sets up base URL and other configuration
   */
  static configure(config: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Make authenticated API request
   * API: Handles authentication and request/response processing
   */
  static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const token = await this.getAuthToken();
      
      const requestOptions: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        timeout: this.config.timeout,
      };
      
      const response = await this.makeRequest(url, requestOptions);
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        };
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * GET request
   * API: Makes GET request to specified endpoint
   */
  static async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  /**
   * POST request
   * API: Makes POST request with data
   */
  static async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  /**
   * PUT request
   * API: Makes PUT request with data
   */
  static async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  /**
   * DELETE request
   * API: Makes DELETE request
   */
  static async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
  
  /**
   * Make HTTP request with retry logic
   * API: Implements retry mechanism for failed requests
   */
  private static async makeRequest(url: string, options: RequestInit): Promise<Response> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.config.retryAttempts) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
  
  /**
   * Get authentication token
   * API: Retrieves stored auth token
   */
  private static async getAuthToken(): Promise<string | null> {
    try {
      const tokenData = await EncryptionService.getSecureData('auth_token');
      if (!tokenData) return null;
      
      const token: AuthToken = JSON.parse(tokenData);
      
      // Check if token is expired
      if (Date.now() > token.expiresAt) {
        // Try to refresh token
        const refreshed = await this.refreshAuthToken(token.refreshToken);
        if (refreshed) {
          return await this.getAuthToken();
        }
        return null;
      }
      
      return token.accessToken;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }
  
  /**
   * Refresh authentication token
   * API: Gets new token using refresh token
   */
  private static async refreshAuthToken(refreshToken: string): Promise<boolean> {
    try {
      const response = await this.request<AuthToken>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      
      if (response.success && response.data) {
        await EncryptionService.storeSecureData('auth_token', JSON.stringify(response.data));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing auth token:', error);
      return false;
    }
  }
  
  /**
   * Login user
   * API: Authenticates user and stores tokens
   */
  static async login(email: string, password: string): Promise<ApiResponse<AuthToken>> {
    const response = await this.post<AuthToken>('/auth/login', {
      email,
      password,
    });
    
    if (response.success && response.data) {
      await EncryptionService.storeSecureData('auth_token', JSON.stringify(response.data));
    }
    
    return response;
  }
  
  /**
   * Logout user
   * API: Clears authentication tokens
   */
  static async logout(): Promise<ApiResponse> {
    try {
      await this.post('/auth/logout');
    } finally {
      await EncryptionService.removeSecureData('auth_token');
    }
    
    return { success: true };
  }
  
  /**
   * Get inventory data
   * API: Fetches inventory from backend
   */
  static async getInventory(): Promise<ApiResponse<any[]>> {
    return this.get('/inventory');
  }
  
  /**
   * Update inventory item
   * API: Updates inventory item on backend
   */
  static async updateInventoryItem(itemId: string, data: any): Promise<ApiResponse> {
    return this.put(`/inventory/${itemId}`, data);
  }
  
  /**
   * Add inventory item
   * API: Adds new inventory item
   */
  static async addInventoryItem(data: any): Promise<ApiResponse> {
    return this.post('/inventory', data);
  }
  
  /**
   * Delete inventory item
   * API: Removes inventory item
   */
  static async deleteInventoryItem(itemId: string): Promise<ApiResponse> {
    return this.delete(`/inventory/${itemId}`);
  }
  
  /**
   * Get predictions
   * API: Fetches AI predictions from backend
   */
  static async getPredictions(): Promise<ApiResponse<any[]>> {
    return this.get('/predictions');
  }
  
  /**
   * Generate new prediction
   * API: Triggers AI prediction generation
   */
  static async generatePrediction(itemId: string): Promise<ApiResponse<any>> {
    return this.post(`/predictions/generate`, { itemId });
  }
  
  /**
   * Get analytics data
   * API: Fetches analytics from backend
   */
  static async getAnalytics(period: string = '30d'): Promise<ApiResponse<any>> {
    return this.get(`/analytics?period=${period}`);
  }
  
  /**
   * Get community posts
   * API: Fetches community sharing posts
   */
  static async getCommunityPosts(): Promise<ApiResponse<any[]>> {
    return this.get('/community/posts');
  }
  
  /**
   * Create community post
   * API: Creates new community sharing post
   */
  static async createCommunityPost(data: any): Promise<ApiResponse> {
    return this.post('/community/posts', data);
  }
  
  /**
   * Get user subscription
   * API: Fetches user subscription details
   */
  static async getUserSubscription(): Promise<ApiResponse<any>> {
    return this.get('/subscription');
  }
  
  /**
   * Update subscription
   * API: Updates user subscription
   */
  static async updateSubscription(planId: string): Promise<ApiResponse> {
    return this.post('/subscription/update', { planId });
  }
  
  /**
   * Upload file
   * API: Uploads files to backend
   */
  static async uploadFile(file: any, endpoint: string = '/upload'): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        return {
          success: false,
          error: `Upload failed: ${response.statusText}`,
          statusCode: response.status,
        };
      }
      
      const data = await response.json();
      return {
        success: true,
        data,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }
}

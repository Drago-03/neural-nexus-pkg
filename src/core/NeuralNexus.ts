import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';

import { 
  NeuralNexusConfig, 
  NeuralNexusError,
  NeuralNexusEvent,
  ApiResponse,
  ApiKeyType
} from '../types';
import { SdkManager } from '../managers/SdkManager';

/**
 * The main client class for interacting with the Neural Nexus platform.
 * This is the entry point for using the Neural Nexus package.
 */
export class NeuralNexus extends EventEmitter {
  private config: NeuralNexusConfig;
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  
  // Manager instances
  public sdk: SdkManager;

  /**
   * Creates a new NeuralNexus client instance.
   * @param config Configuration options for the client
   */
  constructor(config: NeuralNexusConfig) {
    super();
    
    // Validate the configuration
    if (!config.apiKey) {
      throw new NeuralNexusError(
        'API key is required to initialize the Neural Nexus client',
        'INVALID_CONFIG'
      );
    }

    if (!config.environment) {
      throw new NeuralNexusError(
        'Environment (production or development) must be specified',
        'INVALID_CONFIG'
      );
    }

    // Set default values
    this.config = {
      ...config,
      apiUrl: config.apiUrl || this.getDefaultApiUrl(config.environment),
      timeout: config.timeout || 30000,
      storageProvider: config.storageProvider || 'google',
    };

    // Initialize axios instance
    this.axiosInstance = axios.create({
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    // Add response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Extract error details from response
        const errorMessage = error.response?.data?.error?.message || 
                            error.response?.data?.message || 
                            error.message || 
                            'Unknown error occurred';
        
        const errorCode = error.response?.data?.error?.code || 
                          error.response?.data?.code || 
                          'API_ERROR';
        
        const errorDetails = error.response?.data?.error?.details || 
                            error.response?.data?.details || 
                            {
                              status: error.response?.status,
                              request_id: error.response?.headers?.['x-request-id']
                            };

        // Create Neural Nexus error
        const neuralNexusError = new NeuralNexusError(
          errorMessage,
          errorCode,
          errorDetails
        );

        this.emit(NeuralNexusEvent.ERROR, neuralNexusError);
        return Promise.reject(neuralNexusError);
      }
    );

    // Check API key format and validate
    this.validateApiKey(this.config.apiKey);

    // Initialize managers
    this.sdk = new SdkManager(this);
    
    // Emit connected event
    this.emit(NeuralNexusEvent.CONNECTED);
  }

  /**
   * Validates the API key format and type
   * @param apiKey The API key to validate
   * @private
   */
  private validateApiKey(apiKey: string): void {
    const keyPrefixes: Record<string, ApiKeyType> = {
      'nxt_': 'test',
      'nnd_': 'development',
      'ntr_': 'training',
      'ndp_': 'deployment',
      'npr_': 'production'
    };

    // Check if the key has a valid prefix
    const prefix = apiKey.substring(0, 4);
    const keyType = keyPrefixes[prefix];

    if (!keyType) {
      // Don't throw error, just warn and continue
      console.warn(`Warning: API key format doesn't match expected pattern. This may cause authentication issues.`);
      return;
    }

    // Set key type in config for reference
    this.config.keyType = keyType;
  }

  /**
   * Get the default API URL based on the environment
   * @private
   */
  private getDefaultApiUrl(environment: string): string {
    return environment === 'production'
      ? 'https://api.neuralnexus.ai/v1'
      : 'https://api.dev.neuralnexus.ai/v1';
  }

  /**
   * Sets the authentication token for API requests
   * @param token The authentication token
   */
  setToken(token: string): void {
    this.token = token;
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clears the authentication token
   */
  clearToken(): void {
    this.token = null;
    // Restore original API key authentication
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.config.apiKey}`;
  }

  /**
   * Gets the current API configuration
   */
  getConfig(): NeuralNexusConfig {
    return { ...this.config };
  }

  /**
   * Gets the HTTP client instance
   * @internal
   */
  getHttpClient(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Makes a GET request to the API
   * @param endpoint The API endpoint
   * @param params Query parameters
   */
  async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<T>>(endpoint, { params });
      return response.data;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to fetch data from ${endpoint}`,
        'API_REQUEST_FAILED',
        error
      );
    }
  }

  /**
   * Makes a POST request to the API
   * @param endpoint The API endpoint
   * @param data Request body
   */
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(endpoint, data);
      return response.data;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to post data to ${endpoint}`,
        'API_REQUEST_FAILED',
        error
      );
    }
  }

  /**
   * Makes a PUT request to the API
   * @param endpoint The API endpoint
   * @param data Request body
   */
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(endpoint, data);
      return response.data;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to update data at ${endpoint}`,
        'API_REQUEST_FAILED',
        error
      );
    }
  }

  /**
   * Makes a DELETE request to the API
   * @param endpoint The API endpoint
   * @param params Query parameters
   */
  async delete<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(endpoint, { params });
      return response.data;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to delete data at ${endpoint}`,
        'API_REQUEST_FAILED',
        error
      );
    }
  }

  /**
   * Makes a multipart/form-data POST request to the API
   * @param endpoint The API endpoint
   * @param formData The form data to upload
   * @param onProgress Optional progress callback
   */
  async upload<T>(endpoint: string, formData: FormData, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to upload data to ${endpoint}`,
        'API_REQUEST_FAILED',
        error
      );
    }
  }

  /**
   * Makes a streaming request to the API
   * @param endpoint The API endpoint
   * @param data Request body
   * @param onChunk Callback function for each chunk of data
   */
  async stream<T>(endpoint: string, data: any, onChunk: (chunk: T) => void): Promise<void> {
    try {
      const response = await this.axiosInstance.post(endpoint, data, {
        responseType: 'stream',
      });

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          try {
            const lines = chunk
              .toString()
              .split('\n')
              .filter((line) => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.substring(6);
                if (jsonStr === '[DONE]') {
                  resolve();
                  return;
                }
                
                try {
                  const parsedData = JSON.parse(jsonStr);
                  onChunk(parsedData);
                } catch (e) {
                  // Ignore invalid JSON
                }
              }
            }
          } catch (e) {
            reject(new NeuralNexusError(
              'Error parsing stream data',
              'STREAM_PARSE_ERROR',
              e
            ));
          }
        });

        response.data.on('end', () => {
          resolve();
        });

        response.data.on('error', (err: Error) => {
          reject(new NeuralNexusError(
            'Stream error',
            'STREAM_ERROR',
            err
          ));
        });
      });
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to stream data from ${endpoint}`,
        'API_REQUEST_FAILED',
        error
      );
    }
  }

  /**
   * Closes the client connection and cleans up resources
   */
  close(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.emit(NeuralNexusEvent.DISCONNECTED);
    this.removeAllListeners();
  }
} 
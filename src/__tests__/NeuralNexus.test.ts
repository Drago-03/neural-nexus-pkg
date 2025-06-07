import { NeuralNexus } from '../core/NeuralNexus';
import { NeuralNexusError, NeuralNexusEvent } from '../types';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NeuralNexus Core', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up axios mock with complete interceptors structure
    mockedAxios.create.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: { success: true } }),
      post: jest.fn().mockResolvedValue({ data: { success: true } }),
      put: jest.fn().mockResolvedValue({ data: { success: true } }),
      delete: jest.fn().mockResolvedValue({ data: { success: true } }),
      interceptors: {
        request: { 
          use: jest.fn() 
        },
        response: { 
          use: jest.fn() 
        }
      },
      defaults: { 
        headers: { 
          common: {} 
        } 
      }
    } as any);
  });

  describe('Constructor', () => {
    it('should create an instance with default values', () => {
      const client = new NeuralNexus({ apiKey: 'test-key', environment: 'development' });
      expect(client).toBeInstanceOf(NeuralNexus);
    });

    it('should throw error when apiKey is missing', () => {
      expect(() => {
        // @ts-expect-error - Testing invalid input
        new NeuralNexus({ environment: 'development' });
      }).toThrow(NeuralNexusError);
    });

    // Note: Our mocked environment validator doesn't validate the environment value
    // so we'll skip this test
    it('should require an environment value', () => {
      expect(() => {
        // @ts-expect-error - Testing invalid input
        new NeuralNexus({ apiKey: 'test-key' });
      }).toThrow(NeuralNexusError);
    });

    it('should set dev API URL when in development environment', () => {
      const client = new NeuralNexus({ apiKey: 'test-key', environment: 'development' });
      const config = client.getConfig();
      expect(config.apiUrl).toBe('https://api.dev.neuralnexus.ai/v1');
    });

    it('should set production API URL when in production environment', () => {
      const client = new NeuralNexus({ apiKey: 'test-key', environment: 'production' });
      const config = client.getConfig();
      expect(config.apiUrl).toBe('https://api.neuralnexus.ai/v1');
    });

    it('should set custom API URL when provided', () => {
      const customUrl = 'https://custom-api.example.com/v1';
      const client = new NeuralNexus({ 
        apiKey: 'test-key', 
        environment: 'development',
        apiUrl: customUrl 
      });
      const config = client.getConfig();
      expect(config.apiUrl).toBe(customUrl);
    });
  });

  describe('API Methods', () => {
    let client: NeuralNexus;
    let mockGet: jest.Mock;
    let mockPost: jest.Mock;
    let mockPut: jest.Mock;
    let mockDelete: jest.Mock;

    beforeEach(() => {
      // Create mock functions
      mockGet = jest.fn().mockResolvedValue({ data: { success: true }});
      mockPost = jest.fn().mockResolvedValue({ data: { success: true }});
      mockPut = jest.fn().mockResolvedValue({ data: { success: true }});
      mockDelete = jest.fn().mockResolvedValue({ data: { success: true }});
      
      // Mock axios create to return a mocked instance
      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
        put: mockPut,
        delete: mockDelete,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        },
        defaults: { headers: { common: {} }}
      };
      
      mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
      
      // Create the client after mocking
      client = new NeuralNexus({ apiKey: 'test-key', environment: 'development' });
      
      // Clear the mock call count
      mockGet.mockClear();
      mockPost.mockClear();
      mockPut.mockClear();
      mockDelete.mockClear();
    });

    it('should make GET request with correct parameters', async () => {
      const httpClient = client.getHttpClient();
      await client.get('/test', { param: 'value' });
      
      expect(httpClient.get).toHaveBeenCalledWith('/test', { 
        params: { param: 'value' }
      });
    });

    it('should make POST request with correct parameters', async () => {
      const httpClient = client.getHttpClient();
      await client.post('/test', { data: 'value' });
      
      expect(httpClient.post).toHaveBeenCalledWith('/test', { data: 'value' });
    });

    it('should make PUT request with correct parameters', async () => {
      const httpClient = client.getHttpClient();
      await client.put('/test', { data: 'value' });
      
      expect(httpClient.put).toHaveBeenCalledWith('/test', { data: 'value' });
    });

    it('should make DELETE request with correct parameters', async () => {
      const httpClient = client.getHttpClient();
      await client.delete('/test');
      
      expect(httpClient.delete).toHaveBeenCalledWith('/test', { params: undefined });
    });

    it('should handle errors in HTTP requests', async () => {
      const errorMessage = 'Network Error';
      mockGet.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(client.get('/test')).rejects.toThrow(NeuralNexusError);
    });
  });

  describe('Token Management', () => {
    let client: NeuralNexus;

    beforeEach(() => {
      client = new NeuralNexus({ apiKey: 'test-key', environment: 'development' });
    });

    it('should set auth token in the HTTP client', () => {
      client.setToken('test-token');
      const httpClient = client.getHttpClient();
      expect(httpClient.defaults.headers.common.Authorization).toBe('Bearer test-token');
    });

    it('should clear auth token from the HTTP client', () => {
      client.setToken('test-token');
      client.clearToken();
      const httpClient = client.getHttpClient();
      expect(httpClient.defaults.headers.common.Authorization).toBe('Bearer test-key');
    });
  });

  describe('Event Handling', () => {
    let client: NeuralNexus;
    let mockCallback: jest.Mock;

    beforeEach(() => {
      client = new NeuralNexus({ apiKey: 'test-key', environment: 'development' });
      mockCallback = jest.fn();
    });

    it('should emit events to registered listeners', () => {
      client.on(NeuralNexusEvent.CONNECTED, mockCallback);
      client.emit(NeuralNexusEvent.CONNECTED);
      
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should remove event listeners when off is called', () => {
      client.on(NeuralNexusEvent.CONNECTED, mockCallback);
      client.off(NeuralNexusEvent.CONNECTED, mockCallback);
      client.emit(NeuralNexusEvent.CONNECTED);
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should remove all event listeners when close is called', () => {
      // Test with a single event to avoid unhandled error
      client.on(NeuralNexusEvent.CONNECTED, mockCallback);
      
      client.close();
      
      client.emit(NeuralNexusEvent.CONNECTED);
      
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
}); 
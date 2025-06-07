import { NeuralNexus } from '../core/NeuralNexus';
import { 
  Model, 
  ModelUploadOptions, 
  ModelSearchOptions, 
  ModelDownloadOptions,
  NeuralNexusError,
  NeuralNexusEvent,
  ApiResponse
} from '../types';
import { isNodeEnvironment } from '../utils/environment';

/**
 * Manages AI model operations such as uploading, downloading, and searching.
 */
export class ModelManager {
  private client: NeuralNexus;

  /**
   * Creates a new ModelManager instance
   * @param client The NeuralNexus client instance
   */
  constructor(client: NeuralNexus) {
    this.client = client;
  }

  /**
   * Uploads a model to the Neural Nexus platform
   * @param options Model upload options
   * @returns The uploaded model information
   */
  async uploadModel(options: ModelUploadOptions): Promise<Model> {
    if (!options.name || !options.description || !options.files) {
      throw new NeuralNexusError(
        'Model name, description, and files are required',
        'INVALID_MODEL_DATA'
      );
    }

    // Create form data for file upload
    const formData = new FormData();
    formData.append('name', options.name);
    formData.append('description', options.description);
    
    if (options.tags && options.tags.length > 0) {
      formData.append('tags', JSON.stringify(options.tags));
    }
    
    formData.append('isPublic', String(options.isPublic !== undefined ? options.isPublic : false));
    
    if (options.price !== undefined) {
      formData.append('price', String(options.price));
      formData.append('currency', options.currency || 'USD');
    }

    // Append files to form data
    const httpClient = this.client.getHttpClient();
    
    // Handle files differently based on environment (Node.js vs Browser)
    if (isNodeEnvironment() && typeof options.files[0] === 'string') {
      // In Node.js, files are likely paths
      const fs = require('fs');
      const path = require('path');
      
      for (const filePath of options.files as string[]) {
        const fileName = path.basename(filePath);
        const fileContent = fs.readFileSync(filePath);
        formData.append('files', new Blob([fileContent]), fileName);
      }
    } else {
      // In browser, files are likely File objects
      for (const file of options.files as File[]) {
        formData.append('files', file);
      }
    }

    try {
      const response = await httpClient.post<ApiResponse<Model>>('/models/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const model = response.data.data as Model;
      this.client.emit(NeuralNexusEvent.MODEL_UPLOADED, model);
      return model;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to upload model',
        'MODEL_UPLOAD_FAILED',
        error
      );
    }
  }

  /**
   * Gets a model by its ID
   * @param modelId The model ID
   * @returns The model information
   */
  async getModel(modelId: string): Promise<Model> {
    if (!modelId) {
      throw new NeuralNexusError(
        'Model ID is required',
        'INVALID_MODEL_ID'
      );
    }

    try {
      const response = await this.client.get<Model>(`/models/${modelId}`);
      return response.data as Model;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to get model with ID ${modelId}`,
        'MODEL_NOT_FOUND',
        error
      );
    }
  }

  /**
   * Searches for models based on criteria
   * @param options Search options
   * @returns List of models matching the criteria
   */
  async searchModels(options: ModelSearchOptions = {}): Promise<Model[]> {
    try {
      const response = await this.client.get<Model[]>('/models/search', options);
      return response.data as Model[];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to search models',
        'MODEL_SEARCH_FAILED',
        error
      );
    }
  }

  /**
   * Downloads a model
   * @param options Download options
   * @returns Path to the downloaded model or Blob in browser
   */
  async downloadModel(options: ModelDownloadOptions): Promise<string | Blob> {
    if (!options.modelId) {
      throw new NeuralNexusError(
        'Model ID is required',
        'INVALID_MODEL_ID'
      );
    }

    const httpClient = this.client.getHttpClient();
    
    try {
      const response = await httpClient.get(`/models/${options.modelId}/download`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (options.onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            options.onProgress(progress);
          }
        },
      });

      const blob = new Blob([response.data]);
      
      // Handle differently based on environment
      if (isNodeEnvironment() && options.destination) {
        // In Node.js, save to file
        const fs = require('fs');
        const path = require('path');
        const filePath = path.resolve(options.destination);
        
        fs.writeFileSync(filePath, Buffer.from(await blob.arrayBuffer()));
        this.client.emit(NeuralNexusEvent.MODEL_DOWNLOADED, { modelId: options.modelId, path: filePath });
        return filePath;
      } else {
        // In browser, return blob
        this.client.emit(NeuralNexusEvent.MODEL_DOWNLOADED, { modelId: options.modelId, blob });
        return blob;
      }
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to download model with ID ${options.modelId}`,
        'MODEL_DOWNLOAD_FAILED',
        error
      );
    }
  }

  /**
   * Updates a model's metadata
   * @param modelId The model ID
   * @param updates The updates to apply
   * @returns The updated model
   */
  async updateModel(modelId: string, updates: Partial<Omit<Model, 'id' | 'owner' | 'createdAt' | 'updatedAt'>>): Promise<Model> {
    if (!modelId) {
      throw new NeuralNexusError(
        'Model ID is required',
        'INVALID_MODEL_ID'
      );
    }

    try {
      const response = await this.client.put<Model>(`/models/${modelId}`, updates);
      return response.data as Model;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to update model with ID ${modelId}`,
        'MODEL_UPDATE_FAILED',
        error
      );
    }
  }

  /**
   * Deletes a model
   * @param modelId The model ID
   * @returns Success status
   */
  async deleteModel(modelId: string): Promise<boolean> {
    if (!modelId) {
      throw new NeuralNexusError(
        'Model ID is required',
        'INVALID_MODEL_ID'
      );
    }

    try {
      const response = await this.client.delete<{ success: boolean }>(`/models/${modelId}`);
      return response.success ?? true;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to delete model with ID ${modelId}`,
        'MODEL_DELETE_FAILED',
        error
      );
    }
  }

  /**
   * Gets the download URL for a model
   * @param modelId The model ID
   * @returns The download URL
   */
  async getModelDownloadUrl(modelId: string): Promise<string> {
    if (!modelId) {
      throw new NeuralNexusError(
        'Model ID is required',
        'INVALID_MODEL_ID'
      );
    }

    try {
      const response = await this.client.get<{ url: string }>(`/models/${modelId}/download-url`);
      return response.data!.url;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to get download URL for model with ID ${modelId}`,
        'MODEL_URL_GENERATION_FAILED',
        error
      );
    }
  }
} 
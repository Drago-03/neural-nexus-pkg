import { NeuralNexus } from '../core/NeuralNexus';
import { NeuralNexusError, StorageConfig } from '../types';
import { isNodeEnvironment } from '../utils/environment';

/**
 * File metadata information
 */
export interface FileMetadata {
  name: string;
  size: number;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
  url: string;
  path: string;
  isPublic: boolean;
}

/**
 * Upload progress event
 */
export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
  fileName: string;
}

/**
 * File upload options
 */
export interface FileUploadOptions {
  file: File | string;
  path?: string;
  fileName?: string;
  isPublic?: boolean;
  contentType?: string;
  onProgress?: (event: UploadProgressEvent) => void;
}

/**
 * Manages file storage operations on the Neural Nexus platform
 */
export class StorageManager {
  private client: NeuralNexus;

  /**
   * Creates a new StorageManager instance
   * @param client The NeuralNexus client instance
   */
  constructor(client: NeuralNexus) {
    this.client = client;
  }

  /**
   * Uploads a file to storage
   * @param options File upload options
   * @returns File metadata
   */
  async uploadFile(options: FileUploadOptions): Promise<FileMetadata> {
    if (!options.file) {
      throw new NeuralNexusError(
        'File is required',
        'INVALID_FILE'
      );
    }

    // Create form data for file upload
    const formData = new FormData();
    
    if (options.path) {
      formData.append('path', options.path);
    }
    
    if (options.isPublic !== undefined) {
      formData.append('isPublic', String(options.isPublic));
    }
    
    // Handle file differently based on environment (Node.js vs Browser)
    if (isNodeEnvironment() && typeof options.file === 'string') {
      // In Node.js, file is likely a path
      const fs = require('fs');
      const path = require('path');
      
      const filePath = options.file as string;
      const fileName = options.fileName || path.basename(filePath);
      const fileContent = fs.readFileSync(filePath);
      const contentType = options.contentType || this.getMimeType(fileName);
      
      formData.append('file', new Blob([fileContent], { type: contentType }), fileName);
    } else {
      // In browser, file is likely a File object
      const file = options.file as File;
      const fileName = options.fileName || file.name;
      formData.append('file', file, fileName);
    }

    try {
      const httpClient = this.client.getHttpClient();
      
      const response = await httpClient.post('/storage/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (options.onProgress && progressEvent.total) {
            const fileName = typeof options.file === 'string' 
              ? options.fileName || options.file.split('/').pop() || 'file'
              : (options.file as File).name;
              
            options.onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
              fileName,
            });
          }
        },
      });

      return response.data.data as FileMetadata;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to upload file',
        'FILE_UPLOAD_ERROR',
        error
      );
    }
  }

  /**
   * Gets file metadata
   * @param filePath The file path
   * @returns File metadata
   */
  async getFileMetadata(filePath: string): Promise<FileMetadata> {
    if (!filePath) {
      throw new NeuralNexusError(
        'File path is required',
        'INVALID_FILE_PATH'
      );
    }

    try {
      const response = await this.client.get<FileMetadata>(`/storage/metadata?path=${encodeURIComponent(filePath)}`);
      return response.data as FileMetadata;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to get metadata for file at ${filePath}`,
        'FILE_METADATA_ERROR',
        error
      );
    }
  }

  /**
   * Deletes a file
   * @param filePath The file path
   * @returns Success status
   */
  async deleteFile(filePath: string): Promise<boolean> {
    if (!filePath) {
      throw new NeuralNexusError(
        'File path is required',
        'INVALID_FILE_PATH'
      );
    }

    try {
      const response = await this.client.delete<{ success: boolean }>(`/storage/file?path=${encodeURIComponent(filePath)}`);
      return response.success ?? true;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to delete file at ${filePath}`,
        'FILE_DELETE_ERROR',
        error
      );
    }
  }

  /**
   * Lists files in a directory
   * @param directory The directory path
   * @returns Array of file metadata
   */
  async listFiles(directory: string): Promise<FileMetadata[]> {
    try {
      const response = await this.client.get<FileMetadata[]>(`/storage/list?directory=${encodeURIComponent(directory)}`);
      return response.data as FileMetadata[];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to list files in directory ${directory}`,
        'FILE_LIST_ERROR',
        error
      );
    }
  }

  /**
   * Gets a download URL for a file
   * @param filePath The file path
   * @param expirationMinutes Minutes until the URL expires (default: 60)
   * @returns Download URL
   */
  async getDownloadUrl(filePath: string, expirationMinutes: number = 60): Promise<string> {
    if (!filePath) {
      throw new NeuralNexusError(
        'File path is required',
        'INVALID_FILE_PATH'
      );
    }

    try {
      const response = await this.client.get<{ url: string }>(
        `/storage/download-url?path=${encodeURIComponent(filePath)}&expirationMinutes=${expirationMinutes}`
      );
      
      if (!response.data || !response.data.url) {
        throw new NeuralNexusError(
          'Failed to generate download URL',
          'URL_GENERATION_ERROR'
        );
      }

      return response.data.url;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to get download URL for file at ${filePath}`,
        'URL_GENERATION_ERROR',
        error
      );
    }
  }

  /**
   * Creates a public URL for a file
   * @param filePath The file path
   * @returns Public URL
   */
  async makeFilePublic(filePath: string): Promise<string> {
    if (!filePath) {
      throw new NeuralNexusError(
        'File path is required',
        'INVALID_FILE_PATH'
      );
    }

    try {
      const response = await this.client.post<{ url: string }>(
        '/storage/make-public',
        { path: filePath }
      );
      
      if (!response.data || !response.data.url) {
        throw new NeuralNexusError(
          'Failed to make file public',
          'FILE_VISIBILITY_ERROR'
        );
      }

      return response.data.url;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to make file public at ${filePath}`,
        'FILE_VISIBILITY_ERROR',
        error
      );
    }
  }

  /**
   * Makes a file private
   * @param filePath The file path
   * @returns Success status
   */
  async makeFilePrivate(filePath: string): Promise<boolean> {
    if (!filePath) {
      throw new NeuralNexusError(
        'File path is required',
        'INVALID_FILE_PATH'
      );
    }

    try {
      const response = await this.client.post<{ success: boolean }>(
        '/storage/make-private',
        { path: filePath }
      );
      
      return response.data?.success || false;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to make file private at ${filePath}`,
        'FILE_VISIBILITY_ERROR',
        error
      );
    }
  }

  /**
   * Determines the MIME type based on file extension
   * @private
   * @param fileName The file name
   * @returns MIME type string
   */
  private getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'json': 'application/json',
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'ts': 'text/typescript',
      'csv': 'text/csv',
      'xml': 'application/xml',
      'zip': 'application/zip',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'onnx': 'application/octet-stream',
      'pt': 'application/octet-stream',
      'pth': 'application/octet-stream',
      'h5': 'application/octet-stream',
      'pb': 'application/octet-stream',
      'tflite': 'application/octet-stream',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }
} 
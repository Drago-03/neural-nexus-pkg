// Type definitions for Neural Nexus Package

// API key types
export type ApiKeyType = 'test' | 'development' | 'training' | 'deployment' | 'production';

// Config options for initializing the NeuralNexus client
export interface NeuralNexusConfig {
  apiKey: string;
  environment: 'production' | 'development';
  apiUrl?: string;
  timeout?: number;
  storageProvider?: 'google' | 'local' | 'custom';
  storageConfig?: StorageConfig;
  authConfig?: AuthConfig;
  keyType?: ApiKeyType;
}

// Storage configuration options
export interface StorageConfig {
  projectId?: string;
  bucketName?: string;
  accessKey?: string;
  secretKey?: string;
  region?: string;
  customEndpoint?: string;
}

// Authentication configuration
export interface AuthConfig {
  provider?: 'firebase' | 'supabase' | 'custom';
  tokenRefreshInterval?: number;
  authDomain?: string;
}

// Model related types
export type ModelType = 
  | 'text-generation'
  | 'image-generation'
  | 'text-embedding'
  | 'text-classification'
  | 'speech-to-text'
  | 'text-to-speech'
  | 'image-classification'
  | 'object-detection'
  | 'custom';

export interface Model {
  id: string;
  name: string;
  description: string;
  version: string;
  type: ModelType;
  creator: string;
  parameters?: Record<string, any>;
  pricing?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  isPublic?: boolean;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  size?: number;
  downloads?: number;
  rating?: number;
  price?: number;
  currency?: string;
  owner?: string;
}

export interface ModelUploadOptions {
  name: string;
  description: string;
  files: File[] | string[];
  tags?: string[];
  isPublic?: boolean;
  price?: number;
  currency?: string;
}

export interface ModelSearchOptions {
  tag?: string | string[];
  owner?: string;
  query?: string;
  isPublic?: boolean;
  minRating?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'rating' | 'downloads' | 'createdAt' | 'price';
  sortDirection?: 'asc' | 'desc';
}

export interface ModelDownloadOptions {
  modelId: string;
  destination?: string;
  onProgress?: (progress: number) => void;
}

// Text generation options
export interface TextGenerationOptions {
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  stream?: boolean;
}

// Image generation options
export interface ImageGenerationOptions {
  prompt: string;
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024' | '2048x2048';
  response_format?: 'url' | 'b64_json';
}

// Fine-tuning related types
export interface FineTuningOptions {
  model: string;
  training_file: string;
  validation_file?: string;
  hyperparameters?: {
    epochs?: number;
    batch_size?: number;
    learning_rate?: number;
  };
}

export interface FineTuningJob {
  id: string;
  object: string;
  model: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  created_at: number;
  finished_at?: number;
  fine_tuned_model?: string;
  organization_id?: string;
}

// User profile related types
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    [key: string]: string | undefined;
  };
  createdAt: Date;
  lastLogin?: Date;
  models?: string[];
  purchases?: string[];
}

export interface ProfileUpdateOptions {
  name?: string;
  bio?: string;
  avatar?: File | string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    [key: string]: string | undefined;
  };
}

// Marketplace related types
export interface MarketplaceOptions {
  category?: string | string[];
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  sortBy?: 'popularity' | 'price' | 'rating' | 'newest';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Payment related types
export interface PaymentMethod {
  type: 'stripe' | 'crypto' | 'bank';
  details?: any;
}

export interface PurchaseOptions {
  modelId: string;
  method: PaymentMethod;
  couponCode?: string;
}

export interface TransactionRecord {
  id: string;
  modelId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  completedAt?: Date;
  paymentMethod: string;
}

// API key management types
export interface ApiKey {
  id: string;
  key?: string;  // Only included when first created
  name: string;
  prefix: string;
  last_used?: string;
  created_at: string;
  active: boolean;
}

export interface ApiKeyCreateOptions {
  name: string;
  type: ApiKeyType;
}

// Usage statistics
export interface UsageStats {
  data: UsageDay[];
  object: string;
  total_requests: number;
  total_tokens: {
    input: number;
    output: number;
  };
}

export interface UsageDay {
  date: string;
  requests: number;
  tokens: {
    input: number;
    output: number;
  };
  models: Record<string, number>;
}

// API response types
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    type?: string;
    status?: number;
    request_id?: string;
  };
  meta?: {
    count?: number;
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

// Error types
export class NeuralNexusError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'NeuralNexusError';
    this.code = code;
    this.details = details;
  }
}

// Events
export enum NeuralNexusEvent {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  AUTH_STATE_CHANGED = 'authStateChanged',
  MODEL_UPLOADED = 'modelUploaded',
  MODEL_DOWNLOADED = 'modelDownloaded',
  PURCHASE_COMPLETED = 'purchaseCompleted',
  ERROR = 'error'
} 
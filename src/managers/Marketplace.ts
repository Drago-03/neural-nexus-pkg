import { NeuralNexus } from '../core/NeuralNexus';
import { Model, MarketplaceOptions, NeuralNexusError } from '../types';

/**
 * Category information in the marketplace
 */
export interface Category {
  id: string;
  name: string;
  description: string;
  modelCount: number;
  thumbnail?: string;
}

/**
 * Featured model with additional promotion information
 */
export interface FeaturedModel extends Model {
  featuredReason?: string;
  promotionEnds?: Date;
  discount?: number;
}

/**
 * Manages marketplace operations like browsing, searching, and filtering models.
 */
export class Marketplace {
  private client: NeuralNexus;

  /**
   * Creates a new Marketplace instance
   * @param client The NeuralNexus client instance
   */
  constructor(client: NeuralNexus) {
    this.client = client;
  }

  /**
   * Gets trending models from the marketplace
   * @param limit Maximum number of models to return
   * @returns Array of trending models
   */
  async getTrendingModels(limit: number = 10): Promise<Model[]> {
    try {
      const response = await this.client.get<Model[]>('/marketplace/trending', { limit });
      return response.data || [];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to fetch trending models',
        'MARKETPLACE_ERROR',
        error
      );
    }
  }

  /**
   * Gets featured models from the marketplace
   * @param limit Maximum number of models to return
   * @returns Array of featured models
   */
  async getFeaturedModels(limit: number = 5): Promise<FeaturedModel[]> {
    try {
      const response = await this.client.get<FeaturedModel[]>('/marketplace/featured', { limit });
      return response.data || [];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to fetch featured models',
        'MARKETPLACE_ERROR',
        error
      );
    }
  }

  /**
   * Gets new releases from the marketplace
   * @param limit Maximum number of models to return
   * @returns Array of new models
   */
  async getNewReleases(limit: number = 10): Promise<Model[]> {
    try {
      const response = await this.client.get<Model[]>('/marketplace/new-releases', { limit });
      return response.data || [];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to fetch new releases',
        'MARKETPLACE_ERROR',
        error
      );
    }
  }

  /**
   * Gets all available categories in the marketplace
   * @returns Array of categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.client.get<Category[]>('/marketplace/categories');
      return response.data || [];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to fetch categories',
        'MARKETPLACE_ERROR',
        error
      );
    }
  }

  /**
   * Gets models in a specific category
   * @param categoryId The category ID or name
   * @param options Optional parameters for filtering and pagination
   * @returns Array of models in the category
   */
  async getModelsByCategory(categoryId: string, options: Omit<MarketplaceOptions, 'category'> = {}): Promise<Model[]> {
    if (!categoryId) {
      throw new NeuralNexusError(
        'Category ID is required',
        'INVALID_CATEGORY'
      );
    }

    try {
      const response = await this.client.get<Model[]>(`/marketplace/categories/${categoryId}`, options);
      return response.data || [];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to fetch models for category ${categoryId}`,
        'MARKETPLACE_ERROR',
        error
      );
    }
  }

  /**
   * Searches models in the marketplace
   * @param options Marketplace options for filtering and pagination
   * @returns Array of matching models
   */
  async searchMarketplace(options: MarketplaceOptions = {}): Promise<Model[]> {
    try {
      const response = await this.client.get<Model[]>('/marketplace/search', options);
      return response.data || [];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to search marketplace',
        'MARKETPLACE_ERROR',
        error
      );
    }
  }

  /**
   * Gets top-rated models from the marketplace
   * @param limit Maximum number of models to return
   * @returns Array of top-rated models
   */
  async getTopRatedModels(limit: number = 10): Promise<Model[]> {
    try {
      const response = await this.client.get<Model[]>('/marketplace/top-rated', { limit });
      return response.data || [];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to fetch top-rated models',
        'MARKETPLACE_ERROR',
        error
      );
    }
  }

  /**
   * Gets models from a specific vendor/creator
   * @param vendorId The vendor's user ID
   * @param limit Maximum number of models to return
   * @returns Array of models by the vendor
   */
  async getModelsByVendor(vendorId: string, limit: number = 20): Promise<Model[]> {
    if (!vendorId) {
      throw new NeuralNexusError(
        'Vendor ID is required',
        'INVALID_VENDOR'
      );
    }

    try {
      const response = await this.client.get<Model[]>(`/marketplace/vendor/${vendorId}`, { limit });
      return response.data || [];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to fetch models for vendor ${vendorId}`,
        'MARKETPLACE_ERROR',
        error
      );
    }
  }

  /**
   * Gets free models from the marketplace
   * @param limit Maximum number of models to return
   * @returns Array of free models
   */
  async getFreeModels(limit: number = 20): Promise<Model[]> {
    try {
      const response = await this.client.get<Model[]>('/marketplace/free-models', { limit });
      return response.data || [];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to fetch free models',
        'MARKETPLACE_ERROR',
        error
      );
    }
  }
} 
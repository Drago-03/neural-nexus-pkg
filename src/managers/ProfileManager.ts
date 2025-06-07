import { NeuralNexus } from '../core/NeuralNexus';
import { 
  UserProfile, 
  ProfileUpdateOptions, 
  NeuralNexusError,
  Model
} from '../types';
import { isNodeEnvironment } from '../utils/environment';

/**
 * Manages user profiles on the Neural Nexus platform
 */
export class ProfileManager {
  private client: NeuralNexus;

  /**
   * Creates a new ProfileManager instance
   * @param client The NeuralNexus client instance
   */
  constructor(client: NeuralNexus) {
    this.client = client;
  }

  /**
   * Gets the current user's profile
   * @returns User profile information
   */
  async getMyProfile(): Promise<UserProfile> {
    try {
      const response = await this.client.get<UserProfile>('/profile/me');
      return response.data as UserProfile;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to fetch user profile',
        'PROFILE_FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Gets a user's profile by their ID
   * @param userId The user ID
   * @returns User profile information
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    if (!userId) {
      throw new NeuralNexusError(
        'User ID is required',
        'INVALID_USER_ID'
      );
    }

    try {
      const response = await this.client.get<UserProfile>(`/profile/${userId}`);
      return response.data as UserProfile;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to fetch profile for user with ID ${userId}`,
        'PROFILE_FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Updates the current user's profile
   * @param options Profile update options
   * @returns Updated user profile
   */
  async updateProfile(options: ProfileUpdateOptions): Promise<UserProfile> {
    // Create form data for profile update
    const formData = new FormData();
    
    if (options.name) {
      formData.append('name', options.name);
    }
    
    if (options.bio) {
      formData.append('bio', options.bio);
    }
    
    if (options.website) {
      formData.append('website', options.website);
    }
    
    if (options.socialLinks) {
      formData.append('socialLinks', JSON.stringify(options.socialLinks));
    }
    
    // Handle avatar upload
    if (options.avatar) {
      const httpClient = this.client.getHttpClient();
      
      // Handle files differently based on environment (Node.js vs Browser)
      if (isNodeEnvironment() && typeof options.avatar === 'string') {
        // In Node.js, avatar is likely a file path
        const fs = require('fs');
        const path = require('path');
        
        const fileName = path.basename(options.avatar);
        const fileContent = fs.readFileSync(options.avatar);
        formData.append('avatar', new Blob([fileContent]), fileName);
      } else {
        // In browser, avatar is likely a File object
        formData.append('avatar', options.avatar as File);
      }
    }

    try {
      const httpClient = this.client.getHttpClient();
      const response = await httpClient.post('/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data as UserProfile;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to update profile',
        'PROFILE_UPDATE_ERROR',
        error
      );
    }
  }

  /**
   * Gets models owned by a user
   * @param userId The user ID (optional, defaults to current user)
   * @returns Array of models owned by the user
   */
  async getUserModels(userId?: string): Promise<Model[]> {
    try {
      const endpoint = userId ? `/profile/${userId}/models` : '/profile/me/models';
      const response = await this.client.get<Model[]>(endpoint);
      return response.data as Model[];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to fetch user models',
        'MODEL_FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Gets models purchased by the current user
   * @returns Array of purchased models
   */
  async getPurchasedModels(): Promise<Model[]> {
    try {
      const response = await this.client.get<Model[]>('/profile/me/purchases');
      return response.data as Model[];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to fetch purchased models',
        'MODEL_FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Deletes the current user's avatar
   * @returns Success status
   */
  async deleteAvatar(): Promise<boolean> {
    try {
      const response = await this.client.delete<{ success: boolean }>('/profile/avatar');
      return response.success ?? true;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to delete avatar',
        'AVATAR_DELETE_ERROR',
        error
      );
    }
  }

  /**
   * Follows another user
   * @param userId The user ID to follow
   * @returns Success status
   */
  async followUser(userId: string): Promise<boolean> {
    if (!userId) {
      throw new NeuralNexusError(
        'User ID is required',
        'INVALID_USER_ID'
      );
    }

    try {
      const response = await this.client.post<{ success: boolean }>(`/profile/follow/${userId}`, {});
      return response.success ?? true;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to follow user with ID ${userId}`,
        'FOLLOW_ERROR',
        error
      );
    }
  }

  /**
   * Unfollows a user
   * @param userId The user ID to unfollow
   * @returns Success status
   */
  async unfollowUser(userId: string): Promise<boolean> {
    if (!userId) {
      throw new NeuralNexusError(
        'User ID is required',
        'INVALID_USER_ID'
      );
    }

    try {
      const response = await this.client.post<{ success: boolean }>(`/profile/unfollow/${userId}`, {});
      return response.success ?? true;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        `Failed to unfollow user with ID ${userId}`,
        'UNFOLLOW_ERROR',
        error
      );
    }
  }

  /**
   * Gets users followed by the current user
   * @returns Array of user profiles
   */
  async getFollowing(): Promise<UserProfile[]> {
    try {
      const response = await this.client.get<UserProfile[]>('/profile/me/following');
      return response.data as UserProfile[];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to fetch following users',
        'PROFILE_FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Gets users who follow the current user
   * @returns Array of user profiles
   */
  async getFollowers(): Promise<UserProfile[]> {
    try {
      const response = await this.client.get<UserProfile[]>('/profile/me/followers');
      return response.data as UserProfile[];
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Failed to fetch followers',
        'PROFILE_FETCH_ERROR',
        error
      );
    }
  }
} 
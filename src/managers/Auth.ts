import { NeuralNexus } from '../core/NeuralNexus';
import { NeuralNexusError, NeuralNexusEvent, ApiResponse } from '../types';

/**
 * User profile information returned after authentication
 */
export interface UserInfo {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
}

/**
 * Authentication manager for Neural Nexus
 */
export class Auth {
  private client: NeuralNexus;
  private currentUser: UserInfo | null = null;

  /**
   * Creates a new Auth instance
   * @param client The NeuralNexus client instance
   */
  constructor(client: NeuralNexus) {
    this.client = client;
  }

  /**
   * Logs in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns User information
   */
  async login(email: string, password: string): Promise<UserInfo> {
    if (!email || !password) {
      throw new NeuralNexusError(
        'Email and password are required',
        'INVALID_CREDENTIALS'
      );
    }

    try {
      const response = await this.client.post<{ token: string; user: UserInfo }>(
        '/auth/login',
        { email, password }
      );

      if (!response.data) {
        throw new NeuralNexusError(
          'Invalid response from authentication server',
          'AUTH_ERROR'
        );
      }

      const { token, user } = response.data;
      this.client.setToken(token);
      this.currentUser = user;
      this.client.emit(NeuralNexusEvent.AUTH_STATE_CHANGED, { user });
      
      return user;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Authentication failed',
        'AUTH_ERROR',
        error
      );
    }
  }

  /**
   * Registers a new user
   * @param email User's email
   * @param password User's password
   * @param username User's username
   * @returns User information
   */
  async register(email: string, password: string, username: string): Promise<UserInfo> {
    if (!email || !password || !username) {
      throw new NeuralNexusError(
        'Email, password, and username are required',
        'INVALID_REGISTRATION_DATA'
      );
    }

    try {
      const response = await this.client.post<{ token: string; user: UserInfo }>(
        '/auth/register',
        { email, password, username }
      );

      if (!response.data) {
        throw new NeuralNexusError(
          'Invalid response from registration server',
          'REGISTRATION_ERROR'
        );
      }

      const { token, user } = response.data;
      this.client.setToken(token);
      this.currentUser = user;
      this.client.emit(NeuralNexusEvent.AUTH_STATE_CHANGED, { user });
      
      return user;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Registration failed',
        'REGISTRATION_ERROR',
        error
      );
    }
  }

  /**
   * Logs out the current user
   */
  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout', {});
      this.client.clearToken();
      this.currentUser = null;
      this.client.emit(NeuralNexusEvent.AUTH_STATE_CHANGED, { user: null });
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Logout failed',
        'LOGOUT_ERROR',
        error
      );
    }
  }

  /**
   * Gets the currently logged in user
   * @returns User information or null if not logged in
   */
  async getCurrentUser(): Promise<UserInfo | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const response = await this.client.get<UserInfo>('/auth/me');
      
      if (!response.data) {
        return null;
      }

      this.currentUser = response.data;
      return this.currentUser;
    } catch (error) {
      return null;
    }
  }

  /**
   * Sends a password reset email
   * @param email User's email
   */
  async resetPassword(email: string): Promise<boolean> {
    if (!email) {
      throw new NeuralNexusError(
        'Email is required',
        'INVALID_EMAIL'
      );
    }

    try {
      const response = await this.client.post<{ success: boolean }>(
        '/auth/reset-password',
        { email }
      );
      
      return response.data?.success || false;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Password reset request failed',
        'PASSWORD_RESET_ERROR',
        error
      );
    }
  }

  /**
   * Verifies a user's email with a verification token
   * @param token Verification token
   */
  async verifyEmail(token: string): Promise<boolean> {
    if (!token) {
      throw new NeuralNexusError(
        'Verification token is required',
        'INVALID_TOKEN'
      );
    }

    try {
      const response = await this.client.post<{ success: boolean }>(
        '/auth/verify-email',
        { token }
      );
      
      return response.data?.success || false;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Email verification failed',
        'VERIFICATION_ERROR',
        error
      );
    }
  }

  /**
   * Changes a user's password
   * @param currentPassword Current password
   * @param newPassword New password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (!currentPassword || !newPassword) {
      throw new NeuralNexusError(
        'Current password and new password are required',
        'INVALID_PASSWORD_DATA'
      );
    }

    try {
      const response = await this.client.post<{ success: boolean }>(
        '/auth/change-password',
        { currentPassword, newPassword }
      );
      
      return response.data?.success || false;
    } catch (error) {
      if (error instanceof NeuralNexusError) {
        throw error;
      }
      throw new NeuralNexusError(
        'Password change failed',
        'PASSWORD_CHANGE_ERROR',
        error
      );
    }
  }

  /**
   * Checks if a user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
} 
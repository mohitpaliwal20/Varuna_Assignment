import { ApiClient } from './ApiClient';
import { IApiClient } from '../../../core/ports/outbound';

/**
 * Factory function to create a configured API client instance
 * Uses the base URL from environment variables via config
 */
export function createApiClient(): IApiClient {
  return new ApiClient();
}

/**
 * Singleton instance of the API client for use across the application
 */
export const apiClient = createApiClient();

// Shared types used across the application

export type Tab = 'routes' | 'compare' | 'banking' | 'pooling';

export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

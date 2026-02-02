/**
 * Toast Notification Utility
 * 
 * Wrapper around Sonner for consistent toast notifications across the app
 * Sonner is the industry-standard toast library with better accessibility and features
 */

import { toast as sonnerToast } from 'sonner'

/**
 * Toast utility using Sonner
 * Provides a consistent API for showing toast notifications
 */
export const toast = {
  /**
   * Show a success toast
   */
  success(title: string, description?: string): void {
    sonnerToast.success(title, {
      description,
      duration: 5000,
    })
  },

  /**
   * Show an error toast
   */
  error(title: string, description?: string): void {
    sonnerToast.error(title, {
      description,
      duration: 7000, // Errors stay longer
    })
  },

  /**
   * Show a warning toast
   */
  warning(title: string, description?: string): void {
    sonnerToast.warning(title, {
      description,
      duration: 6000,
    })
  },

  /**
   * Show an info toast
   */
  info(title: string, description?: string): void {
    sonnerToast.info(title, {
      description,
      duration: 5000,
    })
  },

  /**
   * Show a loading toast (useful for async operations)
   */
  loading(title: string, description?: string): string | number {
    return sonnerToast.loading(title, {
      description,
    })
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss(id: string | number): void {
    sonnerToast.dismiss(id)
  },
}

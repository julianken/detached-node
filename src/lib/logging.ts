/**
 * Centralized logging utilities for error tracking and debugging
 *
 * This module provides structured logging for different environments and
 * prepares for integration with error tracking services (Sentry, LogRocket, etc.)
 */

import type { ErrorId } from './error-ids'

export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
}

interface LogContext {
  [key: string]: unknown
}

/**
 * Debug logs - visible in development, suppressed in production
 * Use for development-time diagnostics that don't need production logging
 */
export function logForDebugging(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, context || '')
  }
}

/**
 * Error logs for production monitoring
 * Should be called for all production errors to enable debugging
 *
 * @param message - Human-readable error description
 * @param error - The error object or unknown value
 * @param context - Additional context (collection, operation, etc.)
 * @param errorId - Optional error ID for tracking (from error-ids.ts)
 */
export function logError(
  message: string,
  error: Error | unknown,
  context?: LogContext,
  errorId?: ErrorId
): void {
  const errorData = {
    message,
    errorId,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : String(error),
    context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  }

  console.error(`[ERROR]${errorId ? ` [${errorId}]` : ''} ${message}`, errorData)

  // TODO: Integrate with error tracking service
  // Example Sentry integration:
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, {
  //     tags: { errorId, ...context },
  //     extra: { message },
  //   });
  // }
}

/**
 * Analytics/metrics events for user behavior tracking
 * Use for non-error events like page views, feature usage, etc.
 *
 * @param eventName - Name of the event (e.g., 'post_viewed', 'search_performed')
 * @param properties - Event properties for analytics
 */
export function logEvent(eventName: string, properties?: LogContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EVENT] ${eventName}`, properties || '')
  }

  // TODO: Integrate with analytics service
  // Example PostHog integration:
  // if (typeof window !== 'undefined' && window.posthog) {
  //   window.posthog.capture(eventName, properties);
  // }
}

/**
 * Warning logs for non-critical issues that should be monitored
 * Use for degraded functionality, fallbacks, or concerning patterns
 */
export function logWarning(
  message: string,
  context?: LogContext,
  errorId?: ErrorId
): void {
  const warningData = {
    message,
    errorId,
    context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  }

  console.warn(`[WARNING]${errorId ? ` [${errorId}]` : ''} ${message}`, warningData)
}

/**
 * Logging Utility
 * 
 * Replaces console.log/error/warn with environment-aware logging
 * In production, logs are sent to a logging service (e.g., Sentry)
 * In development, logs to console
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isTest = process.env.NODE_ENV === 'test'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  info(message: string, context?: LogContext): void {
    if (this.isTest) return
    
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, context))
    } else {
      // TODO: Send to logging service (e.g., Sentry, LogRocket)
      // For now, only log in development
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.isTest) return
    
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, context))
    } else {
      // TODO: Send to logging service
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.isTest) return
    
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    }

    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message, errorContext))
    } else {
      // TODO: Send to logging service with full error details
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isTest) return
    
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context))
    }
    // Never log debug in production
  }
}

export const logger = new Logger()

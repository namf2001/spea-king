// Error reporting utility for centralized error handling
interface ErrorContext {
  userId?: string;
  sessionId?: string;
  feature?: string;
  level: 'error' | 'warning' | 'info';
  extra?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  digest?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  context: ErrorContext;
}

class ErrorReporter {
  private static instance: ErrorReporter;
  private reports: ErrorReport[] = [];
  private readonly endpoint = '/api/errors'; // API endpoint for error reporting

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  async reportError(error: Error, context: ErrorContext): Promise<void> {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      digest: (error as any).digest,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      context,
    };

    // Store locally for debugging
    this.reports.push(report);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Report');
      console.error('Error:', error.message);
      console.info('Context:', context);
      console.trace('Stack trace');
      console.groupEnd();
    }

    try {
      // Send to error tracking service (e.g., Sentry, LogRocket, etc.)
      if (typeof window !== 'undefined') {
        await this.sendToService(report);
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  private async sendToService(report: ErrorReport): Promise<void> {
    try {
      // Example: Send to your API endpoint
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      // Example: Send to Sentry (if configured)
      // if (window.Sentry) {
      //   window.Sentry.captureException(new Error(report.message), {
      //     tags: { feature: report.context.feature },
      //     extra: report.context.extra,
      //   });
      // }
    } catch (serviceError) {
      console.warn('Error reporting service unavailable:', serviceError);
      // Re-throw if critical, or handle gracefully
      throw serviceError;
    }
  }

  getReports(): ErrorReport[] {
    return [...this.reports];
  }

  clearReports(): void {
    this.reports = [];
  }
}

// Export singleton instance
export const errorReporter = ErrorReporter.getInstance();

// Convenience function for reporting errors
export function reportError(error: Error, context: ErrorContext): void {
  errorReporter.reportError(error, context);
}

// React hook for error reporting
import { useCallback } from 'react';

export function useErrorReporter() {
  const report = useCallback((error: Error, context: ErrorContext) => {
    reportError(error, context);
  }, []);

  return { reportError: report };
}
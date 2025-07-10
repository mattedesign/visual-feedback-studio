import { toast } from 'sonner';

interface ErrorContext {
  component: string;
  operation: string;
  analysisId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

class AnalysisErrorHandler {
  private activePromises = new Map<string, AbortController>();

  /**
   * Wrap promises with timeout and cancellation
   */
  withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number = 30000,
    operation: string = 'operation'
  ): Promise<T> {
    const controller = new AbortController();
    const promiseId = `${operation}-${Date.now()}`;
    
    this.activePromises.set(promiseId, controller);

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timeout = setTimeout(() => {
        controller.abort();
        this.activePromises.delete(promiseId);
        reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      controller.signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        this.activePromises.delete(promiseId);
      });
    });

    return Promise.race([
      promise.finally(() => {
        this.activePromises.delete(promiseId);
      }),
      timeoutPromise
    ]);
  }

  /**
   * Simple timeout wrapper without circuit breaking
   */
  async withSimpleTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = 30000,
    context: ErrorContext
  ): Promise<T> {
    return this.withTimeout(operation(), timeoutMs, `${context.component}.${context.operation}`);
  }

  /**
   * Simple retry with linear backoff
   */
  async withSimpleRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 2,
    delayMs: number = 1000,
    context: ErrorContext
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`⏳ Retrying ${context.operation} (attempt ${attempt}/${maxRetries}) after ${delayMs}ms`);
          await this.delay(delayMs);
        }
        
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries || this.isNonRetryableError(lastError)) {
          break;
        }
        
        console.warn(`⚠️ ${context.operation} failed (attempt ${attempt + 1}/${maxRetries + 1}):`, lastError.message);
      }
    }
    
    throw lastError;
  }

  /**
   * Handle and categorize errors - simplified
   */
  handleError(error: unknown, context: ErrorContext): never {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const categorizedError = this.categorizeError(errorObj);
    
    console.error(`❌ Error in ${context.component}.${context.operation}:`, {
      message: errorObj.message,
      category: categorizedError.category,
      severity: categorizedError.severity,
      context
    });

    // Show user-friendly error message
    const userMessage = this.getUserFriendlyMessage(categorizedError);
    toast.error(userMessage, {
      duration: categorizedError.severity === 'critical' ? 10000 : 5000
    });

    throw errorObj;
  }

  /**
   * Cancel all active operations
   */
  cancelAllOperations(): void {
    console.log(`🛑 Cancelling ${this.activePromises.size} active operations`);
    
    for (const [id, controller] of this.activePromises.entries()) {
      controller.abort();
      console.log(`❌ Cancelled operation: ${id}`);
    }
    
    this.activePromises.clear();
  }

  /**
   * Get simple status
   */
  getStatus(): { activePromises: number } {
    return {
      activePromises: this.activePromises.size
    };
  }


  private categorizeError(error: Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return { category: 'network', severity: 'medium' as const };
    }
    
    if (message.includes('timeout') || message.includes('aborted')) {
      return { category: 'timeout', severity: 'medium' as const };
    }
    
    if (message.includes('authentication') || message.includes('unauthorized')) {
      return { category: 'auth', severity: 'critical' as const };
    }
    
    if (message.includes('rate limit') || message.includes('429')) {
      return { category: 'rate_limit', severity: 'medium' as const };
    }
    
    if (message.includes('parse') || message.includes('json')) {
      return { category: 'parsing', severity: 'low' as const };
    }
    
    return { category: 'unknown', severity: 'medium' as const };
  }

  private getUserFriendlyMessage(error: { category: string; severity: string }): string {
    switch (error.category) {
      case 'network':
        return 'Network connection issue. Please check your internet and try again.';
      case 'timeout':
        return 'The operation took too long. Please try again with a smaller image.';
      case 'auth':
        return 'Authentication failed. Please sign in again.';
      case 'rate_limit':
        return 'Too many requests. Please wait a moment and try again.';
      case 'parsing':
        return 'Data processing error. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  private isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes('authentication') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('invalid') ||
      message.includes('malformed')
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const analysisErrorHandler = new AnalysisErrorHandler();
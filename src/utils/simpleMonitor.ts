// Simple monitoring utility to replace complex circuit breaker state management

interface MonitorEvent {
  timestamp: number;
  component: string;
  operation: string;
  status: 'success' | 'failure';
  duration?: number;
  metadata?: Record<string, any>;
}

class SimpleMonitor {
  private events: MonitorEvent[] = [];
  private readonly MAX_EVENTS = 100; // Keep only recent events

  logSuccess(component: string, operation: string, duration?: number, metadata?: Record<string, any>) {
    this.addEvent({
      timestamp: Date.now(),
      component,
      operation,
      status: 'success',
      duration,
      metadata
    });
    
    console.log(`✅ ${component}.${operation}${duration ? ` (${duration}ms)` : ''}`, metadata || '');
  }

  logFailure(component: string, operation: string, error: string, duration?: number, metadata?: Record<string, any>) {
    this.addEvent({
      timestamp: Date.now(),
      component,
      operation,
      status: 'failure',
      duration,
      metadata: { error, ...metadata }
    });
    
    console.error(`❌ ${component}.${operation}${duration ? ` (${duration}ms)` : ''}: ${error}`, metadata || '');
  }

  private addEvent(event: MonitorEvent) {
    this.events.push(event);
    
    // Keep only recent events to prevent memory bloat
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }
  }

  getRecentFailures(timeWindowMs: number = 300000): MonitorEvent[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.events.filter(e => e.timestamp > cutoff && e.status === 'failure');
  }

  getStats(): { totalEvents: number; recentFailures: number; recentSuccesses: number } {
    const recent = this.events.filter(e => Date.now() - e.timestamp < 300000); // Last 5 minutes
    return {
      totalEvents: this.events.length,
      recentFailures: recent.filter(e => e.status === 'failure').length,
      recentSuccesses: recent.filter(e => e.status === 'success').length
    };
  }

  clear() {
    this.events = [];
    console.log('🧹 Monitor events cleared');
  }
}

export const simpleMonitor = new SimpleMonitor();

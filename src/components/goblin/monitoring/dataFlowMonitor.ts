/**
 * DATA FLOW MONITORING SYSTEM
 * 
 * Tracks data transformations throughout the goblin analysis pipeline
 * Helps identify where data structure changes break the flow
 */

interface DataFlowEvent {
  id: string;
  timestamp: number;
  stage: string;
  operation: string;
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

interface DataFlowMetrics {
  totalEvents: number;
  successRate: number;
  failurePoints: string[];
  averageProcessingTime: number;
  lastEvent: DataFlowEvent | null;
}

class DataFlowMonitor {
  private events: DataFlowEvent[] = [];
  private maxEvents = 100; // Keep last 100 events

  /**
   * Track a data transformation event
   */
  track(
    stage: string,
    operation: string,
    success: boolean,
    data?: any,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    const event: DataFlowEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      stage,
      operation,
      success,
      data: this.sanitizeData(data),
      error,
      metadata
    };

    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log based on success/failure
    if (success) {
      console.log(`✅ [${stage}] ${operation}`, metadata);
    } else {
      console.error(`❌ [${stage}] ${operation}:`, error, metadata);
    }

    // Store in localStorage for debugging
    this.persistEvents();
  }

  /**
   * Track successful data transformation
   */
  trackSuccess(stage: string, operation: string, data?: any, metadata?: Record<string, any>): void {
    this.track(stage, operation, true, data, undefined, metadata);
  }

  /**
   * Track failed data transformation
   */
  trackFailure(stage: string, operation: string, error: string, data?: any, metadata?: Record<string, any>): void {
    this.track(stage, operation, false, data, error, metadata);
  }

  /**
   * Track persona data extraction - CRITICAL MONITORING POINT
   */
  trackPersonaExtraction(success: boolean, personaData: any, extractedContent?: string): void {
    const metadata = {
      hasAnalysis: Boolean(personaData?.analysis),
      hasSynthesis: Boolean(personaData?.synthesis_summary),
      hasPersonaFeedback: Boolean(personaData?.persona_feedback),
      contentLength: extractedContent?.length || 0,
      dataKeys: Object.keys(personaData || {})
    };

    if (success) {
      this.trackSuccess('persona-extraction', 'extract-analysis-content', extractedContent, metadata);
    } else {
      this.trackFailure('persona-extraction', 'extract-analysis-content', 'Failed to extract valid content', personaData, metadata);
    }
  }

  /**
   * Track chat message creation
   */
  trackChatMessage(success: boolean, messageData: any, error?: string): void {
    const metadata = {
      messageId: messageData?.id,
      role: messageData?.role,
      contentLength: messageData?.content?.length || 0,
      hasTimestamp: Boolean(messageData?.timestamp)
    };

    if (success) {
      this.trackSuccess('chat-message', 'create-message', messageData, metadata);
    } else {
      this.trackFailure('chat-message', 'create-message', error || 'Unknown error', messageData, metadata);
    }
  }

  /**
   * Track API calls
   */
  trackApiCall(endpoint: string, success: boolean, responseData?: any, error?: string): void {
    const metadata = {
      endpoint,
      responseSize: JSON.stringify(responseData || {}).length,
      hasData: Boolean(responseData)
    };

    if (success) {
      this.trackSuccess('api-call', endpoint, responseData, metadata);
    } else {
      this.trackFailure('api-call', endpoint, error || 'API call failed', responseData, metadata);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): DataFlowMetrics {
    const totalEvents = this.events.length;
    const successfulEvents = this.events.filter(e => e.success).length;
    const successRate = totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0;
    
    const failedEvents = this.events.filter(e => !e.success);
    const failurePoints = [...new Set(failedEvents.map(e => `${e.stage}:${e.operation}`))];
    
    const processingTimes = this.events
      .slice(-10)
      .map((event, index, arr) => {
        if (index === 0) return 0;
        return event.timestamp - arr[index - 1].timestamp;
      })
      .filter(time => time > 0);
    
    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
      : 0;

    return {
      totalEvents,
      successRate,
      failurePoints,
      averageProcessingTime,
      lastEvent: this.events[this.events.length - 1] || null
    };
  }

  /**
   * Get recent events for debugging
   */
  getRecentEvents(count = 10): DataFlowEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Get events by stage
   */
  getEventsByStage(stage: string): DataFlowEvent[] {
    return this.events.filter(e => e.stage === stage);
  }

  /**
   * Check for critical failures
   */
  hasCriticalFailures(): boolean {
    const recentEvents = this.getRecentEvents(5);
    const recentFailures = recentEvents.filter(e => !e.success);
    
    // Critical if more than 60% of recent events failed
    return recentFailures.length / recentEvents.length > 0.6;
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
    localStorage.removeItem('goblin-dataflow-events');
  }

  /**
   * Sanitize data for logging (remove sensitive info, limit size)
   */
  private sanitizeData(data: any): any {
    if (!data) return null;
    
    try {
      // Convert to string and limit size
      const stringified = JSON.stringify(data);
      if (stringified.length > 1000) {
        return { 
          __truncated: true, 
          size: stringified.length,
          preview: stringified.substring(0, 200) + '...'
        };
      }
      return data;
    } catch (error) {
      return { __error: 'Failed to serialize data' };
    }
  }

  /**
   * Persist events to localStorage for debugging
   */
  private persistEvents(): void {
    try {
      const recentEvents = this.events.slice(-20); // Only persist last 20 events
      localStorage.setItem('goblin-dataflow-events', JSON.stringify(recentEvents));
    } catch (error) {
      console.warn('Failed to persist dataflow events:', error);
    }
  }
}

// Global instance
export const dataFlowMonitor = new DataFlowMonitor();

// Convenience functions
export const trackPersonaExtraction = dataFlowMonitor.trackPersonaExtraction.bind(dataFlowMonitor);
export const trackChatMessage = dataFlowMonitor.trackChatMessage.bind(dataFlowMonitor);
export const trackApiCall = dataFlowMonitor.trackApiCall.bind(dataFlowMonitor);
export const trackSuccess = dataFlowMonitor.trackSuccess.bind(dataFlowMonitor);
export const trackFailure = dataFlowMonitor.trackFailure.bind(dataFlowMonitor);

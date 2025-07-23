
import { supabase } from '@/integrations/supabase/client';

interface PrototypeMetric {
  event: 'generation_started' | 'generation_completed' | 'generation_failed' | 'render_success' | 'render_failed' | 'download' | 'user_rating';
  analysisId: string;
  solutionType?: string;
  prototypeId?: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, any>;
}

class PrototypeMonitoring {
  private static instance: PrototypeMonitoring;
  private metrics: PrototypeMetric[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds

  static getInstance(): PrototypeMonitoring {
    if (!PrototypeMonitoring.instance) {
      PrototypeMonitoring.instance = new PrototypeMonitoring();
    }
    return PrototypeMonitoring.instance;
  }

  constructor() {
    // Auto-flush metrics periodically
    setInterval(() => this.flush(), this.flushInterval);
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
  }

  trackEvent(metric: PrototypeMetric) {
    console.log('📊 Tracking prototype event:', metric.event, metric);
    
    this.metrics.push({
      ...metric,
      timestamp: Date.now()
    });

    // Flush if batch is full
    if (this.metrics.length >= this.batchSize) {
      this.flush();
    }
  }

  trackGenerationStarted(analysisId: string, solutionType: string) {
    this.trackEvent({
      event: 'generation_started',
      analysisId,
      solutionType
    });
  }

  trackGenerationCompleted(analysisId: string, solutionType: string, prototypeId: string, duration: number) {
    this.trackEvent({
      event: 'generation_completed',
      analysisId,
      solutionType,
      prototypeId,
      duration
    });
  }

  trackGenerationFailed(analysisId: string, solutionType: string, error: string, duration?: number) {
    this.trackEvent({
      event: 'generation_failed',
      analysisId,
      solutionType,
      error,
      duration
    });
  }

  trackRenderSuccess(prototypeId: string, analysisId: string) {
    this.trackEvent({
      event: 'render_success',
      analysisId,
      prototypeId
    });
  }

  trackRenderFailed(prototypeId: string, analysisId: string, error: string) {
    this.trackEvent({
      event: 'render_failed',
      analysisId,
      prototypeId,
      error
    });
  }

  trackDownload(prototypeId: string, analysisId: string) {
    this.trackEvent({
      event: 'download',
      analysisId,
      prototypeId
    });
  }

  trackUserRating(prototypeId: string, analysisId: string, rating: number) {
    this.trackEvent({
      event: 'user_rating',
      analysisId,
      prototypeId,
      metadata: { rating }
    });
  }

  private async flush() {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      // Store metrics in Supabase
      const { error } = await supabase
        .from('figmant_prototype_metrics')
        .insert(metricsToFlush.map(metric => ({
          event_type: metric.event,
          analysis_id: metric.analysisId,
          solution_type: metric.solutionType,
          prototype_id: metric.prototypeId,
          duration_ms: metric.duration,
          error_message: metric.error,
          metadata: metric.metadata || {},
          created_at: new Date(metric.timestamp).toISOString()
        })));

      if (error) {
        console.error('Failed to flush prototype metrics:', error);
        // Re-add failed metrics to queue
        this.metrics.unshift(...metricsToFlush);
      } else {
        console.log(`📊 Flushed ${metricsToFlush.length} prototype metrics`);
      }
    } catch (error) {
      console.error('Error flushing metrics:', error);
      // Re-add failed metrics to queue
      this.metrics.unshift(...metricsToFlush);
    }
  }

  // Analytics methods
  async getGenerationSuccessRate(analysisId?: string): Promise<number> {
    try {
      const query = supabase
        .from('figmant_prototype_metrics')
        .select('event_type');

      if (analysisId) {
        query.eq('analysis_id', analysisId);
      }

      const { data, error } = await query
        .in('event_type', ['generation_completed', 'generation_failed'])
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24h

      if (error) throw error;

      const completed = data.filter(m => m.event_type === 'generation_completed').length;
      const total = data.length;

      return total > 0 ? (completed / total) * 100 : 0;
    } catch (error) {
      console.error('Failed to get success rate:', error);
      return 0;
    }
  }

  async getAverageGenerationTime(solutionType?: string): Promise<number> {
    try {
      const query = supabase
        .from('figmant_prototype_metrics')
        .select('duration_ms')
        .eq('event_type', 'generation_completed')
        .not('duration_ms', 'is', null);

      if (solutionType) {
        query.eq('solution_type', solutionType);
      }

      const { data, error } = await query
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      if (data.length === 0) return 0;

      const totalDuration = data.reduce((sum, m) => sum + (m.duration_ms || 0), 0);
      return totalDuration / data.length;
    } catch (error) {
      console.error('Failed to get average generation time:', error);
      return 0;
    }
  }

  async getRenderSuccessRate(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('figmant_prototype_metrics')
        .select('event_type')
        .in('event_type', ['render_success', 'render_failed'])
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const successful = data.filter(m => m.event_type === 'render_success').length;
      const total = data.length;

      return total > 0 ? (successful / total) * 100 : 0;
    } catch (error) {
      console.error('Failed to get render success rate:', error);
      return 0;
    }
  }
}

export const prototypeMonitoring = PrototypeMonitoring.getInstance();

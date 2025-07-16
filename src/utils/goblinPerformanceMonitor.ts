/**
 * Performance monitoring utility for Goblin UX Analysis
 * Tracks key metrics to ensure optimal user experience
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface AnalysisPerformance {
  sessionId: string;
  startTime: number;
  endTime?: number;
  imageCount: number;
  messageLength: number;
  analysisType: string;
  success: boolean;
  errorMessage?: string;
  metrics: PerformanceMetric[];
}

class GoblinPerformanceMonitor {
  private readonly metrics: PerformanceMetric[] = [];
  private readonly analysisPerformance: Map<string, AnalysisPerformance> = new Map();

  // Track a general performance metric
  trackMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      metadata
    };
    
    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory issues
    if (this.metrics.length > 100) {
      this.metrics.splice(0, this.metrics.length - 100);
    }
    
    console.log(`📊 Performance metric: ${name} = ${value}ms`, metadata);
  }

  // Start tracking an analysis session
  startAnalysis(sessionId: string, imageCount: number, messageLength: number, analysisType: string = 'chat') {
    const performance: AnalysisPerformance = {
      sessionId,
      startTime: Date.now(),
      imageCount,
      messageLength,
      analysisType,
      success: false,
      metrics: []
    };
    
    this.analysisPerformance.set(sessionId, performance);
    console.log(`🚀 Analysis started: ${sessionId}`, { imageCount, messageLength, analysisType });
  }

  // Add a metric to a specific analysis session
  addAnalysisMetric(sessionId: string, name: string, value: number, metadata?: Record<string, any>) {
    const analysis = this.analysisPerformance.get(sessionId);
    if (analysis) {
      const metric: PerformanceMetric = {
        name,
        value,
        timestamp: new Date(),
        metadata
      };
      analysis.metrics.push(metric);
    }
    
    this.trackMetric(`${sessionId}_${name}`, value, metadata);
  }

  // Complete an analysis session
  completeAnalysis(sessionId: string, success: boolean, errorMessage?: string) {
    const analysis = this.analysisPerformance.get(sessionId);
    if (analysis) {
      analysis.endTime = Date.now();
      analysis.success = success;
      analysis.errorMessage = errorMessage;
      
      const totalTime = analysis.endTime - analysis.startTime;
      this.trackMetric('analysis_total_time', totalTime, {
        sessionId,
        imageCount: analysis.imageCount,
        messageLength: analysis.messageLength,
        success,
        errorMessage
      });
      
      console.log(`✅ Analysis completed: ${sessionId}`, {
        totalTime,
        success,
        imageCount: analysis.imageCount,
        errorMessage
      });
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    const recentMetrics = this.metrics.slice(-20); // Last 20 metrics
    const analysisMetrics = recentMetrics.filter(m => m.name.includes('analysis_total_time'));
    
    const summary = {
      totalMetrics: this.metrics.length,
      recentAnalyses: analysisMetrics.length,
      averageAnalysisTime: analysisMetrics.length > 0 
        ? analysisMetrics.reduce((sum, m) => sum + m.value, 0) / analysisMetrics.length 
        : 0,
      successRate: analysisMetrics.length > 0
        ? analysisMetrics.filter(m => m.metadata?.success).length / analysisMetrics.length
        : 0,
      recentMetrics: recentMetrics.map(m => ({
        name: m.name,
        value: m.value,
        timestamp: m.timestamp
      }))
    };
    
    return summary;
  }

  // Check if performance is degrading
  isPerformanceDegrading(): boolean {
    const recentAnalyses = this.metrics
      .filter(m => m.name === 'analysis_total_time')
      .slice(-5); // Last 5 analyses
      
    if (recentAnalyses.length < 3) return false;
    
    const averageTime = recentAnalyses.reduce((sum, m) => sum + m.value, 0) / recentAnalyses.length;
    const threshold = 30000; // 30 seconds
    
    return averageTime > threshold;
  }

  // Get recommendations based on performance data
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const summary = this.getPerformanceSummary();
    
    if (summary.averageAnalysisTime > 30000) {
      recommendations.push('Consider using fewer images per analysis (3 or less recommended)');
    }
    
    if (summary.averageAnalysisTime > 20000) {
      recommendations.push('Try shorter analysis prompts for faster responses');
    }
    
    if (summary.successRate < 0.8) {
      recommendations.push('Check your internet connection - some analyses are failing');
    }
    
    if (this.isPerformanceDegrading()) {
      recommendations.push('Performance is degrading - consider refreshing the page');
    }
    
    return recommendations;
  }

  // Clear old data
  clearOldData() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    // Clear old metrics
    const recentMetrics = this.metrics.filter(m => m.timestamp.getTime() > cutoff);
    this.metrics.splice(0, this.metrics.length, ...recentMetrics);
    
    // Clear old analysis sessions
    for (const [sessionId, analysis] of this.analysisPerformance.entries()) {
      if (analysis.startTime < cutoff) {
        this.analysisPerformance.delete(sessionId);
      }
    }
    
    console.log('🧹 Cleared old performance data');
  }
}

// Create singleton instance
export const goblinPerformanceMonitor = new GoblinPerformanceMonitor();

// Auto-clear old data every hour
setInterval(() => {
  goblinPerformanceMonitor.clearOldData();
}, 60 * 60 * 1000);

export default goblinPerformanceMonitor;

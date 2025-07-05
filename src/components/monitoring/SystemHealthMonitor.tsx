import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalysisCancellation } from '@/hooks/analysis/useAnalysisCancellation';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  failedAnalyses: number;
  pendingAnalyses: number;
  completedAnalyses: number;
  avgProcessingTime: number;
  lastHourActivity: number;
  uptime: string;
}

interface EmergencyMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metadata: any;
  created_at: string;
}

export const SystemHealthMonitor = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [emergencyMetrics, setEmergencyMetrics] = useState<EmergencyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { resetStuckAnalyses } = useAnalysisCancellation();

  const fetchSystemHealth = async () => {
    try {
      // Get analysis health data
      const { data: analysisHealth } = await supabase
        .from('analysis_health')
        .select('*');

      // Get emergency metrics
      const { data: metrics } = await supabase
        .from('emergency_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (analysisHealth && analysisHealth.length > 0) {
        const failed = analysisHealth.find(h => h.status === 'failed');
        const pending = analysisHealth.find(h => h.status === 'pending');
        const completed = analysisHealth.find(h => h.status === 'completed');

        const failedCount = failed?.count || 0;
        const pendingCount = pending?.count || 0;
        const completedCount = completed?.count || 0;
        const totalCount = failedCount + pendingCount + completedCount;

        // Determine system status
        let status: SystemHealth['status'] = 'healthy';
        if (failedCount > 10 || (failedCount / Math.max(totalCount, 1)) > 0.3) {
          status = 'critical';
        } else if (failedCount > 5 || pendingCount > 5) {
          status = 'warning';
        }

        setHealth({
          status,
          failedAnalyses: failedCount,
          pendingAnalyses: pendingCount,
          completedAnalyses: completedCount,
          avgProcessingTime: completed?.avg_duration_seconds || 0,
          lastHourActivity: (completed?.last_hour_count || 0) + (failed?.last_hour_count || 0),
          uptime: 'Available'
        });
      }

      setEmergencyMetrics(metrics || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyCleanup = async () => {
    try {
      const resetCount = await resetStuckAnalyses();
      
      // Also run database cleanup
      const { data, error } = await supabase.rpc('emergency_cleanup_stuck_analyses');
      
      if (error) {
        console.error('Emergency cleanup error:', error);
      } else {
        console.log('Emergency cleanup completed:', data);
      }
      
      // Refresh health data
      await fetchSystemHealth();
    } catch (error) {
      console.error('Emergency cleanup failed:', error);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading System Health...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health Monitor</CardTitle>
          <CardDescription>Unable to load system health data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitor</h2>
          <p className="text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSystemHealth}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {health.status !== 'healthy' && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleEmergencyCleanup}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Emergency Cleanup
            </Button>
          )}
        </div>
      </div>

      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(health.status)}
              System Status
            </div>
            <Badge className={getStatusColor(health.status)}>
              {health.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{health.completedAnalyses}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{health.pendingAnalyses}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{health.failedAnalyses}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{health.lastHourActivity}</div>
              <div className="text-sm text-muted-foreground">Last Hour</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average Processing Time:</span>
              <span className="font-medium">
                {health.avgProcessingTime < 60 
                  ? `${Math.round(health.avgProcessingTime)}s` 
                  : `${Math.round(health.avgProcessingTime / 60)}m`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">System Uptime:</span>
              <span className="font-medium">{health.uptime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Success Rate:</span>
              <span className="font-medium">
                {Math.round((health.completedAnalyses / Math.max(health.completedAnalyses + health.failedAnalyses, 1)) * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Metrics */}
      {emergencyMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Emergency Metrics</CardTitle>
            <CardDescription>Recent system events and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {emergencyMetrics.slice(0, 5).map((metric) => (
                <div key={metric.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium">{metric.metric_name.replace(/_/g, ' ')}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(metric.created_at).toLocaleString()}
                    </span>
                  </div>
                  <Badge variant="outline">{metric.metric_value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Recommendations */}
      {health.status !== 'healthy' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.failedAnalyses > 10 && (
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <span className="text-sm">High failure rate detected. Consider running emergency cleanup.</span>
                </div>
              )}
              {health.pendingAnalyses > 5 && (
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <span className="text-sm">Multiple analyses pending. System may be under high load.</span>
                </div>
              )}
              {health.avgProcessingTime > 120 && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <span className="text-sm">Processing times are above normal. Check system resources.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
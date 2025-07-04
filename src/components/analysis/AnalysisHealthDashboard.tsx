import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalysisCancellation } from '@/hooks/analysis/useAnalysisCancellation';

interface AnalysisHealthData {
  status: string;
  count: number;
  avg_duration_seconds: number;
  latest_created: string;
  last_hour_count: number;
}

export const AnalysisHealthDashboard = () => {
  const [healthData, setHealthData] = useState<AnalysisHealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const { resetStuckAnalyses } = useAnalysisCancellation();

  const fetchHealthData = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_health')
        .select('*');
      
      if (error) throw error;
      setHealthData(data || []);
    } catch (error) {
      console.error('Failed to fetch analysis health data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'analyzing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'pending':
      case 'analyzing':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Analysis Health...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analysis Health Dashboard</h2>
          <p className="text-muted-foreground">Monitor analysis pipeline performance and status</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchHealthData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetStuckAnalyses}
            className="flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            Reset Stuck
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthData.map((item) => (
          <Card key={item.status}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="capitalize">{item.status}</span>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.count}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Duration:</span>
                <span className="font-medium">
                  {formatDuration(item.avg_duration_seconds)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Hour:</span>
                <span className="font-medium">{item.last_hour_count}</span>
              </div>
              {item.latest_created && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Latest:</span>
                  <span className="font-medium">
                    {new Date(item.latest_created).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {healthData.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No analysis data available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
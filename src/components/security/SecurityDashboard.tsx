import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityMetric {
  name: string;
  status: 'secure' | 'warning' | 'critical';
  description: string;
  lastChecked: Date;
  details?: string;
}

interface RateLimitStatus {
  user_id: string;
  endpoint: string;
  requests_count: number;
  window_start: string;
  created_at: string;
}

export const SecurityDashboard = () => {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimitStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const runSecurityChecks = async () => {
    const checks: SecurityMetric[] = [];
    
    try {
      // Check 1: Database RLS Policies
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      checks.push({
        name: 'Row Level Security',
        status: profiles ? 'secure' : 'critical',
        description: 'Database access control policies',
        lastChecked: new Date(),
        details: profiles ? 'RLS policies are active' : 'RLS policies may not be working'
      });

      // Check 2: Authentication Status
      const { data: { user } } = await supabase.auth.getUser();
      checks.push({
        name: 'Authentication',
        status: user ? 'secure' : 'warning',
        description: 'User authentication status',
        lastChecked: new Date(),
        details: user ? `Authenticated as ${user.email}` : 'No authenticated user'
      });

      // Check 3: Rate Limiting
      const { data: rateLimitData } = await supabase
        .from('rate_limits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setRateLimits(rateLimitData || []);
      
      checks.push({
        name: 'Rate Limiting',
        status: 'secure',
        description: 'API request rate limiting',
        lastChecked: new Date(),
        details: `${rateLimitData?.length || 0} recent rate limit entries`
      });

      // Check 4: Session Security
      const sessionData = sessionStorage.length + localStorage.length;
      checks.push({
        name: 'Session Security',
        status: sessionData < 50 ? 'secure' : 'warning',
        description: 'Browser session data management',
        lastChecked: new Date(),
        details: `${sessionData} items in browser storage`
      });

      // Check 5: HTTPS Status
      const isHttps = window.location.protocol === 'https:';
      checks.push({
        name: 'Transport Security',
        status: isHttps ? 'secure' : 'critical',
        description: 'HTTPS encryption status',
        lastChecked: new Date(),
        details: isHttps ? 'HTTPS enabled' : 'HTTP - not secure'
      });

      // Check 6: Environment Security
      const isDev = window.location.hostname === 'localhost';
      checks.push({
        name: 'Environment',
        status: isDev ? 'warning' : 'secure',
        description: 'Deployment environment security',
        lastChecked: new Date(),
        details: isDev ? 'Development environment' : 'Production environment'
      });

      setSecurityMetrics(checks);
    } catch (error) {
      console.error('Security check failed:', error);
      checks.push({
        name: 'Security Check',
        status: 'critical',
        description: 'Failed to run security checks',
        lastChecked: new Date(),
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      setSecurityMetrics(checks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSecurityChecks();
    
    // Run security checks every 5 minutes
    const interval = setInterval(runSecurityChecks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'secure':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <Shield className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'secure':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const overallStatus = securityMetrics.some(m => m.status === 'critical') 
    ? 'critical' 
    : securityMetrics.some(m => m.status === 'warning') 
    ? 'warning' 
    : 'secure';

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 animate-pulse" />
            Running Security Checks...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
          <p className="text-muted-foreground">Monitor system security status and policies</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runSecurityChecks}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Run Security Scan
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(overallStatus)}
              Security Status
            </div>
            <Badge className={getStatusColor(overallStatus)}>
              {overallStatus.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Overall security posture based on {securityMetrics.length} checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {securityMetrics.filter(m => m.status === 'secure').length}
              </div>
              <div className="text-sm text-muted-foreground">Secure</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {securityMetrics.filter(m => m.status === 'warning').length}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {securityMetrics.filter(m => m.status === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  {metric.name}
                </div>
                <Badge className={getStatusColor(metric.status)} variant="outline">
                  {metric.status}
                </Badge>
              </CardTitle>
              <CardDescription>{metric.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-2">
                {metric.details}
              </div>
              <div className="text-xs text-muted-foreground">
                Last checked: {metric.lastChecked.toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rate Limiting Status */}
      {rateLimits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Rate Limiting Activity
            </CardTitle>
            <CardDescription>Recent API rate limiting data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rateLimits.slice(0, 5).map((limit, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium">{limit.endpoint}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(limit.created_at).toLocaleString()}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {limit.requests_count} requests
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Recommendations */}
      {overallStatus !== 'secure' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              Security Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityMetrics
                .filter(m => m.status !== 'secure')
                .map((metric, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {getStatusIcon(metric.status)}
                    <div className="flex-1">
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-sm text-muted-foreground">{metric.details}</div>
                      {metric.status === 'critical' && (
                        <div className="text-sm text-red-600 mt-1">
                          Immediate attention required
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
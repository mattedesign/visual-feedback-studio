import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface UsageStats {
  totalUsers: number;
  activeUsers: number;
  totalAnalyses: number;
  averageUsage: number;
}

interface UserUsage {
  user_id: string;
  email: string;
  full_name: string;
  plan_type: string;
  analyses_used: number;
  analyses_limit: number;
  usage_percentage: number;
}

export const UsageTracking = () => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [userUsage, setUserUsage] = useState<UserUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      // Fetch usage statistics
      const { data: subscriptions, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*');

      if (subsError) throw subsError;

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Calculate statistics
      const totalUsers = profiles.length;
      const activeUsers = subscriptions?.filter(sub => sub.status === 'active').length || 0;
      const totalAnalyses = subscriptions?.reduce((sum, sub) => sum + (sub.analyses_used || 0), 0) || 0;
      const averageUsage = activeUsers > 0 ? totalAnalyses / activeUsers : 0;

      setStats({
        totalUsers,
        activeUsers,
        totalAnalyses,
        averageUsage: Math.round(averageUsage * 100) / 100,
      });

      // Prepare user usage data
      const usageData = profiles.map(profile => {
        const subscription = subscriptions?.find(sub => sub.user_id === profile.user_id);
        const used = subscription?.analyses_used || 0;
        const limit = subscription?.analyses_limit || 0;
        const percentage = limit > 0 ? Math.round((used / limit) * 100) : 0;

        return {
          user_id: profile.user_id,
          email: profile.email || 'No email',
          full_name: profile.full_name || 'No name',
          plan_type: subscription?.plan_type || 'No plan',
          analyses_used: used,
          analyses_limit: limit,
          usage_percentage: percentage,
        };
      });

      // Sort by usage percentage (highest first)
      usageData.sort((a, b) => b.usage_percentage - a.usage_percentage);
      setUserUsage(usageData);

    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading usage data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Total Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAnalyses || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageUsage || 0}</div>
            <p className="text-xs text-muted-foreground">per active user</p>
          </CardContent>
        </Card>
      </div>

      {/* User Usage Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            User Usage Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userUsage.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No usage data available.
              </div>
            ) : (
              userUsage.map(user => (
                <div key={user.user_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{user.full_name}</h3>
                        <Badge variant="outline">{user.plan_type}</Badge>
                        {user.usage_percentage >= 80 && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            High Usage
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {user.analyses_used} / {user.analyses_limit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.usage_percentage}% used
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress
                      value={user.usage_percentage}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Usage Progress</span>
                      <span>
                        {user.analyses_limit - user.analyses_used} remaining
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
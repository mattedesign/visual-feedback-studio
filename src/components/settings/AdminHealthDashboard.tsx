import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Shield, Monitor } from 'lucide-react';
import { AnalysisHealthDashboard } from '@/components/analysis/AnalysisHealthDashboard';
import { SystemHealthMonitor } from '@/components/monitoring/SystemHealthMonitor';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';

export const AdminHealthDashboard = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Monitor analysis performance, system health, and security metrics all in one place.
          </p>
          
          <Tabs defaultValue="analysis" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Analysis Health
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                System Monitor
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis">
              <AnalysisHealthDashboard />
            </TabsContent>

            <TabsContent value="system">
              <SystemHealthMonitor />
            </TabsContent>

            <TabsContent value="security">
              <SecurityDashboard />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
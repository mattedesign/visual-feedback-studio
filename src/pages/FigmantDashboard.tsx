import React from 'react';
import { TrendingUp, BarChart3, Code2, CheckCircle, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const FigmantDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="figmant-grid">
        <Card className="figmant-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                <ArrowUp className="w-4 h-4 text-background" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-1">Trends</h3>
            <p className="text-sm text-muted-foreground">2 new insights found</p>
          </CardContent>
        </Card>

        <Card className="figmant-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Code2 className="w-6 h-6 text-accent" />
              </div>
              <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                <Code2 className="w-4 h-4 text-background" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-1">Benchmark</h3>
            <p className="text-sm text-muted-foreground">See how you compare</p>
          </CardContent>
        </Card>

        <Card className="figmant-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-chart-1/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-chart-1" />
              </div>
              <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-background" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-1">Analyses Complete</h3>
            <p className="text-sm text-muted-foreground">12 analyses this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Patterns Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Days Calendar */}
        <Card className="figmant-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Active Days</CardTitle>
              <p className="text-sm text-muted-foreground">July 4 - July 18</p>
            </div>
            <Button variant="outline" size="sm">
              Weekly
            </Button>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center p-1">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 21 }, (_, i) => (
                  <div 
                    key={i} 
                    className={`aspect-square rounded-sm ${
                      i % 4 === 0 ? 'bg-chart-1' : 
                      i % 3 === 0 ? 'bg-chart-2' : 
                      i % 2 === 0 ? 'bg-chart-3' : 
                      'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Design Patterns */}
        <Card className="figmant-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Design Patterns</CardTitle>
              <p className="text-sm text-muted-foreground">May 7 - May 14</p>
            </div>
            <Button variant="outline" size="sm">
              Weekly
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-sidebar text-sidebar-foreground">Accessibility</Badge>
              <span className="text-sm font-medium">15%</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge className="bg-secondary text-secondary-foreground">Conversion Metrics</Badge>
              <span className="text-sm font-medium">54%</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge className="bg-chart-1 text-white">PPT</Badge>
              <span className="text-sm font-medium">50%</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge className="bg-foreground text-background">Others</Badge>
              <span className="text-sm font-medium">12%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Usage */}
      <Card className="figmant-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold">Credit Usage</CardTitle>
          <Button variant="outline" size="sm">
            Upgrade
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">120</span>
                <span className="text-sm text-muted-foreground">remaining</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>July 7 • 2 credits</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-chart-1 h-2 rounded-full" 
                  style={{ width: '50%' }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>260 used</span>
                <span>of 520</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
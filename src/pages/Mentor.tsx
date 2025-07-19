import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, BarChart3, Activity, Eye } from 'lucide-react';

export default function Mentor() {
  return (
    <div className="min-h-full bg-background/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Status Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 bg-card border border-border/40 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Trends</h3>
            <div className="text-2xl font-semibold text-foreground mb-1">2,142</div>
            <div className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12.5% from last month
            </div>
          </Card>
          
          <Card className="p-5 bg-card border border-border/40 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Benchmark</h3>
            <div className="text-2xl font-semibold text-foreground mb-1">1,628</div>
            <div className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +8.2% from last month
            </div>
          </Card>
          
          <Card className="p-5 bg-card border border-border/40 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Analyses</h3>
            <div className="text-2xl font-semibold text-foreground mb-1">934</div>
            <div className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +15.3% from last month
            </div>
          </Card>
        </div>

        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Active Days Chart */}
          <Card className="p-6 bg-card border border-border/40 shadow-sm">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-foreground mb-1">Active Days</h3>
              <p className="text-sm text-muted-foreground">Weekly activity overview</p>
            </div>
            <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Chart visualization would go here
              </div>
            </div>
          </Card>

          {/* Design Patterns Chart */}
          <Card className="p-6 bg-card border border-border/40 shadow-sm">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-foreground mb-1">Design Patterns</h3>
              <p className="text-sm text-muted-foreground">Pattern usage breakdown</p>
            </div>
            <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Chart visualization would go here
              </div>
            </div>
          </Card>

          {/* Credit Usage */}
          <Card className="p-6 bg-card border border-border/40 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Credit Usage</h3>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                Pro
              </Badge>
            </div>
            <div className="mb-4">
              <div className="text-2xl font-semibold text-foreground mb-1">750</div>
              <p className="text-sm text-muted-foreground">of 1,000 credits used</p>
            </div>
            <Progress value={75} className="mb-4 h-2" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Upgrade to unlock unlimited credits</p>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Upgrade Now
              </Button>
            </div>
          </Card>
        </div>

        {/* Mentor Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border border-border/40 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">UX Mentor Insights</h3>
                <p className="text-sm text-muted-foreground">AI-powered design guidance</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-foreground font-medium mb-1">Accessibility Score</p>
                <p className="text-xs text-muted-foreground">Your designs are 87% accessible. Consider improving color contrast.</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-foreground font-medium mb-1">User Flow Optimization</p>
                <p className="text-xs text-muted-foreground">Reduce user steps by 23% with simplified navigation patterns.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border border-border/40 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Team Performance</h3>
                <p className="text-sm text-muted-foreground">Collaboration metrics</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Design Reviews</span>
                <span className="text-sm text-muted-foreground">24 this week</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Feedback Response Time</span>
                <span className="text-sm text-muted-foreground">2.3 hours avg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Team Satisfaction</span>
                <span className="text-sm text-emerald-600">92%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
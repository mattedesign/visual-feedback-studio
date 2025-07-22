
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, History, Settings, FileText, Lightbulb, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';

export function QuickActions() {
  const navigate = useNavigate();
  const { subscription } = useSubscription();

  const actions = [
    {
      title: "New Analysis",
      description: "Upload designs and get AI-powered insights",
      icon: <Zap className="w-5 h-5" />,
      action: () => navigate('/analyze'),
      primary: true,
      badge: "👾 AI Powered"
    },
    {
      title: "View History",
      description: "Browse your previous analyses",
      icon: <History className="w-5 h-5" />,
      action: () => navigate('/history'),
      primary: false
    },
    {
      title: "Generate Report",
      description: "Create comprehensive UX report",
      icon: <FileText className="w-5 h-5" />,
      action: () => navigate('/reports'),
      primary: false,
      badge: "Pro"
    },
    {
      title: "Design Insights",
      description: "Discover UX patterns and trends",
      icon: <Lightbulb className="w-5 h-5" />,
      action: () => navigate('/insights'),
      primary: false
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
              action.primary ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${
                action.primary ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {action.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{action.title}</h3>
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
            <Button
              variant={action.primary ? "default" : "outline"}
              size="sm"
              onClick={action.action}
              disabled={action.title === "New Analysis" && !subscription?.canAnalyze}
            >
              {action.primary ? "Start" : "Open"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

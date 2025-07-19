
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Eye, Download, FileText } from 'lucide-react';

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      title: "E-commerce Homepage Analysis",
      status: "completed",
      score: 8.4,
      timestamp: "2 hours ago",
      insights: 12,
      recommendations: 8
    },
    {
      id: 2,
      title: "Mobile App Onboarding",
      status: "processing",
      timestamp: "1 hour ago",
      insights: 0,
      recommendations: 0
    },
    {
      id: 3,
      title: "Dashboard UI Review",
      status: "completed",
      score: 7.8,
      timestamp: "Yesterday",
      insights: 15,
      recommendations: 6
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{activity.title}</h3>
                <Badge className={getStatusColor(activity.status)}>
                  {activity.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{activity.timestamp}</span>
                {activity.status === 'completed' && (
                  <>
                    <span>Score: {activity.score}/10</span>
                    <span>{activity.insights} insights</span>
                    <span>{activity.recommendations} recommendations</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {activity.status === 'completed' && (
                <>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </>
              )}
              {activity.status === 'processing' && (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        ))}
        
        <Button variant="outline" className="w-full mt-4">
          <FileText className="w-4 h-4 mr-2" />
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Image, Clock, CheckCircle } from 'lucide-react';

export function AnalysisDetails() {
  const [activeTab, setActiveTab] = useState('summary');

  const analysisItems = [
    {
      title: '3 Images',
      status: '1 analysed',
      icon: Image,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: '3 Images', 
      status: 'Processing',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      title: '3 Images',
      status: '1 analyzed', 
      icon: CheckCircle,
      color: 'bg-blue-100 text-blue-600'
    }
  ];

  const integrations = [
    { name: 'SalesForce', description: 'Automate email communi...', color: 'bg-blue-500' },
    { name: 'Hubspot', description: 'Automate email communi...', color: 'bg-orange-500' },
    { name: 'Zapier', description: 'Automate email communi...', color: 'bg-orange-600' },
    { name: 'SendGrid', description: 'Automate email communi...', color: 'bg-blue-600' }
  ];

  return (
    <div className="w-80 bg-card border-l border-border p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold">Details</h2>
        <Button variant="outline" size="sm">Share</Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4 mt-4">
          {/* Analysis Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                Analysis Overview
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysisItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.status}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Integrations */}
          <div className="space-y-3">
            {integrations.map((integration, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${integration.color} flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">
                    {integration.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{integration.name}</div>
                  <div className="text-xs text-muted-foreground">{integration.description}</div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ideas" className="mt-4">
          <div className="text-sm text-muted-foreground">
            Ideas and suggestions will appear here after analysis is complete.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
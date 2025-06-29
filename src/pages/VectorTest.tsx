
import React from 'react';
import { VectorDatabaseTest } from '@/components/knowledgeBase/VectorDatabaseTest';
import { DirectRAGTestSimple } from '@/components/analysis/DirectRAGTestSimple';
import { DuplicateAnalyzer } from '@/components/knowledgeBase/DuplicateAnalyzer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, TestTube, Search, GitBranch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VectorTest() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Knowledge Base Management</h1>
          <p className="text-lg text-muted-foreground">
            Test and manage the vector database and RAG functionality
          </p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => navigate('/knowledge/population')}
                className="flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Populate Knowledge Base
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/knowledge/population')}
                className="flex items-center gap-2"
              >
                <GitBranch className="w-4 h-4" />
                Manage Batches
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="rag-test" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rag-test">RAG Analysis Test</TabsTrigger>
            <TabsTrigger value="vector-test">Vector Database Test</TabsTrigger>
            <TabsTrigger value="duplicates">Duplicate Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rag-test">
            <DirectRAGTestSimple />
          </TabsContent>
          
          <TabsContent value="vector-test">
            <VectorDatabaseTest />
          </TabsContent>

          <TabsContent value="duplicates">
            <DuplicateAnalyzer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

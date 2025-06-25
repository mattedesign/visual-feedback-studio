
import React from 'react';
import { VectorDatabaseTest } from '@/components/knowledgeBase/VectorDatabaseTest';
import { DirectRAGTestSimple } from '@/components/analysis/DirectRAGTestSimple';
import { DuplicateAnalyzer } from '@/components/knowledgeBase/DuplicateAnalyzer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VectorTest() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Knowledge Base Management</h1>
          <p className="text-lg text-muted-foreground">
            Test and manage the vector database and RAG functionality
          </p>
        </div>

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

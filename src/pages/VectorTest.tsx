
import React from 'react';
import { KnowledgeBaseTest } from '@/components/admin/KnowledgeBaseTest';
import { VectorDatabaseTest } from '@/components/knowledgeBase/VectorDatabaseTest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VectorTest = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <Tabs defaultValue="knowledge-test" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="knowledge-test">Knowledge Base Test</TabsTrigger>
            <TabsTrigger value="vector-test">Vector Database Test</TabsTrigger>
          </TabsList>
          
          <TabsContent value="knowledge-test">
            <KnowledgeBaseTest />
          </TabsContent>
          
          <TabsContent value="vector-test">
            <VectorDatabaseTest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VectorTest;

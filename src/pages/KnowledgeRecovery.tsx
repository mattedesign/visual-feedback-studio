
import React from 'react';
import { KnowledgeBaseTest } from '@/components/admin/KnowledgeBaseTest';

export default function KnowledgeRecovery() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Knowledge Base Recovery</h1>
          <p className="text-lg text-muted-foreground">
            Restore and manage your knowledge base data
          </p>
        </div>
        
        <KnowledgeBaseTest />
      </div>
    </div>
  );
}

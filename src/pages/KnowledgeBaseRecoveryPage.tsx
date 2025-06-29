
import React from 'react';
import { KnowledgeBaseRecovery } from '@/components/knowledgeBase/KnowledgeBaseRecovery';

const KnowledgeBaseRecoveryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Knowledge Base Recovery</h1>
          <p className="text-muted-foreground mt-2">
            Investigate, analyze, and restore missing knowledge base entries
          </p>
        </div>
        
        <KnowledgeBaseRecovery />
      </div>
    </div>
  );
};

export default KnowledgeBaseRecoveryPage;

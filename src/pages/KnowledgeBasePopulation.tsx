
import React from 'react';
import { KnowledgePopulationManager } from '@/components/knowledgeBase/KnowledgePopulationManager';

export default function KnowledgeBasePopulation() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Knowledge Base Population</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Populate the knowledge base with comprehensive UX patterns, design principles, 
            and industry-specific guidance across all 9 batches of content.
          </p>
        </div>
        
        <KnowledgePopulationManager />
      </div>
    </div>
  );
}

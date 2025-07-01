
import React from 'react';
import { KnowledgeBaseManager } from '@/components/admin/KnowledgeBaseManager';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function KnowledgeBaseManagerPage() {
  const hasAccess = useFeatureFlag('knowledge-manager');
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          <p className="text-muted-foreground mb-4">
            Knowledge Base Manager requires admin access.
          </p>
          <p className="text-sm text-muted-foreground">
            Add <code>?admin=true</code> to the URL to access this page.
          </p>
          <Button 
            className="mt-4"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <KnowledgeBaseManager />
        </div>
      </div>
    </ErrorBoundary>
  );
}

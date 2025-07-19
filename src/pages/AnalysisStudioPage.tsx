import React, { useState } from 'react';
import { AnalysisLayout } from '@/components/analysis/AnalysisLayout';
import { AnalysisToolbar } from '@/components/analysis/AnalysisToolbar';
import { AnalysisGrid } from '@/components/analysis/AnalysisGrid';
import { AnalysisDetails } from '@/components/analysis/AnalysisDetails';
import { AnalysisChat } from '@/components/analysis/AnalysisChat';
import { useAuth } from '@/hooks/useAuth';

export default function AnalysisStudioPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'menu' | 'chat'>('menu');

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-muted-foreground">You need to be authenticated to access the analysis studio.</p>
        </div>
      </div>
    );
  }

  return (
    <AnalysisLayout
      sidebar={activeTab === 'chat' ? <AnalysisChat /> : null}
      onTabChange={setActiveTab}
      activeTab={activeTab}
    >
      <div className="flex flex-col h-full">
        <AnalysisToolbar />
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            <AnalysisGrid />
          </div>
          <AnalysisDetails />
        </div>
      </div>
    </AnalysisLayout>
  );
}
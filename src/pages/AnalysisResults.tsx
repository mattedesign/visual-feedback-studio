
import React from 'react';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { ModularAnalysisInterface } from '../components/analysis/modules/ModularAnalysisInterface';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// Simplified existing interface for debugging
const ExistingAnalysisResults = () => {
  return (
    <div className="analysis-results min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Beta Testing Banner */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                🚀 Try our new modular analysis interface!
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Professional executive presentation with business impact metrics
              </p>
            </div>
            <Button 
              onClick={() => {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('beta', 'true');
                window.location.href = currentUrl.toString();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try New Interface
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Analysis Results
          </h2>
          <p className="text-slate-300 mb-6">
            Your UX analysis has been completed successfully.
          </p>
          <div className="space-y-4 text-sm text-slate-400">
            <p>• Analysis complete and ready for review</p>
            <p>• All annotations and insights available</p>
            <p>• Research-backed recommendations generated</p>
            <p>• Export and sharing options enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisResults = () => {
  // Temporarily disable feature flag logic for debugging
  const useModularInterface = false; // useFeatureFlag('modular-analysis');
  const urlParams = new URLSearchParams(window.location.search);
  const betaMode = urlParams.get('beta') === 'true';
  
  // Simplified mock data that matches expected structure
  const analysisData = {
    id: 'analysis-123',
    analysisStatus: 'completed' as const,
    siteName: 'Example Website',
    images: [
      { 
        url: '/placeholder.svg', 
        preview: '/placeholder.svg', 
        name: 'Homepage Screenshot' 
      }
    ],
    annotations: [
      {
        id: 'ann-1',
        x: 50,
        y: 30,
        severity: 'critical' as const,
        title: 'Main Navigation Issues',
        description: 'Primary navigation is difficult to locate and use effectively',
        researchBacking: ['Nielsen Norman Group: Navigation Usability Research'],
        confidence: 0.9,
        category: 'Navigation',
        feedback: 'The main navigation menu lacks clear visual hierarchy. Consider implementing a more prominent navigation structure.'
      },
      {
        id: 'ann-2',
        x: 25,
        y: 60,
        severity: 'suggested' as const,
        title: 'Color Contrast Improvements',
        description: 'Several text elements have insufficient color contrast ratios',
        researchBacking: ['WCAG 2.1 Accessibility Guidelines'],
        confidence: 0.85,
        category: 'Accessibility',
        feedback: 'Improving contrast will enhance readability for all users, especially those with visual impairments.'
      }
    ],
    analysisContext: 'Website usability audit focusing on navigation and accessibility',
    enhancedContext: {
      knowledgeSourcesUsed: 12,
      researchContext: 'Analysis based on established UX research and accessibility standards.',
      citations: [
        'Nielsen Norman Group: Navigation Usability',
        'WCAG 2.1 Accessibility Guidelines',
        'Baymard Institute: User Experience Research'
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // PRESERVE EXISTING FUNCTIONALITY AS DEFAULT
  if (!useModularInterface && !betaMode) {
    return (
      <ErrorBoundary>
        <ExistingAnalysisResults />
      </ErrorBoundary>
    );
  }
  
  // NEW INTERFACE ONLY WHEN BETA PARAMETER IS TRUE
  return (
    <ErrorBoundary>
      <ModularAnalysisInterface analysisData={analysisData} />
    </ErrorBoundary>
  );
};

export default AnalysisResults;

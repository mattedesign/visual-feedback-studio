
import React from 'react';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { ModularAnalysisInterface } from '../components/analysis/modules/ModularAnalysisInterface';
import { Button } from '@/components/ui/button';

// This is a placeholder - you'll need to replace this with your actual analysis results component
const ExistingAnalysisResults = () => {
  return (
    <div className="analysis-results min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ADD ONLY: Beta Testing Banner */}
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

        {/* Placeholder for existing analysis results */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Standard Analysis Results Interface
          </h2>
          <p className="text-slate-300 mb-6">
            This is where your existing analysis results would be displayed. 
            All current functionality is preserved exactly as it was.
          </p>
          <div className="text-sm text-slate-400">
            <p>• Current annotation display</p>
            <p>• Existing image viewer</p>
            <p>• All current features and functionality</p>
            <p>• No changes to existing workflow</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisResults = () => {
  const useModularInterface = useFeatureFlag('modular-analysis');
  
  // Get URL parameter for testing override
  const urlParams = new URLSearchParams(window.location.search);
  const betaMode = urlParams.get('beta') === 'true';
  
  // Mock analysis data - replace this with your actual data fetching logic
  const analysisData = {
    id: 'analysis-123',
    analysisStatus: 'completed' as const,
    images: [
      { url: '/placeholder.svg', preview: '/placeholder.svg', name: 'Homepage' }
    ],
    annotations: [
      {
        id: 'ann-1',
        x: 50,
        y: 30,
        severity: 'critical' as const,
        title: 'Navigation Issues',
        description: 'Main navigation is difficult to find and use',
        researchBacking: ['Nielsen Norman Group: Navigation Usability'],
        confidence: 0.9,
        category: 'Navigation',
        feedback: 'The main navigation menu lacks clear visual hierarchy and some key sections are buried too deep. Consider implementing a more prominent navigation structure with better visual cues.',
        implementationEffort: 'medium' as const,
        businessImpact: 'high' as const
      },
      {
        id: 'ann-2',
        x: 25,
        y: 60,
        severity: 'suggested' as const,
        title: 'Color Contrast',
        description: 'Some text has insufficient color contrast',
        researchBacking: ['WCAG 2.1 Guidelines'],
        confidence: 0.85,
        category: 'Accessibility',
        feedback: 'Several text elements do not meet WCAG AA contrast standards. Improving contrast will enhance readability for all users.',
        implementationEffort: 'low' as const,
        businessImpact: 'medium' as const
      }
    ],
    analysisContext: 'E-commerce checkout flow optimization',
    enhancedContext: {
      knowledgeSourcesUsed: 12,
      researchContext: 'Analysis focused on conversion optimization and accessibility improvements based on e-commerce best practices.',
      citations: [
        'Baymard Institute: Checkout Usability',
        'Nielsen Norman Group: E-commerce UX',
        'WCAG 2.1 Accessibility Guidelines'
      ]
    },
    createdAt: new Date().toISOString(),
    siteName: 'Example E-commerce Site'
  };
  
  // PRESERVE EXISTING FUNCTIONALITY AS DEFAULT
  if (!useModularInterface && !betaMode) {
    return <ExistingAnalysisResults />;
  }
  
  // NEW INTERFACE ONLY WHEN FLAG IS TRUE OR BETA PARAMETER
  return <ModularAnalysisInterface analysisData={analysisData} />;
};

export default AnalysisResults;


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useAIProviderConfig } from '@/hooks/analysis/useAIProviderConfig';
import { useAnalysisTest } from '@/hooks/analysis/useAnalysisTest';
import { ModelTestConfig } from './test/ModelTestConfig';
import { TestResults } from './test/TestResults';
import { APIKeyManagement } from './test/APIKeyManagement';
import { DebugInfo } from './test/DebugInfo';
import { TroubleshootingGuide } from './test/TroubleshootingGuide';

export const TestAnalysisButton = () => {
  const [showModelConfig, setShowModelConfig] = useState(false);
  
  const { 
    selectedConfig, 
    setSelectedConfig, 
    availableProviders, 
    getRequestConfig,
    getDisplayName 
  } = useAIProviderConfig();

  const { isTesting, testResult, executeTest } = useAnalysisTest();

  const handleTest = () => {
    executeTest(selectedConfig, getRequestConfig, getDisplayName);
  };

  return (
    <div className="space-y-4">
      <ModelTestConfig
        showModelConfig={showModelConfig}
        setShowModelConfig={setShowModelConfig}
        selectedConfig={selectedConfig}
        setSelectedConfig={setSelectedConfig}
        availableProviders={availableProviders}
        getDisplayName={getDisplayName}
      />

      <div className="flex items-center gap-4">
        <Button
          onClick={handleTest}
          disabled={isTesting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isTesting ? (
            <>
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Testing {getDisplayName()}...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Test AI Analysis
            </>
          )}
        </Button>

        <TestResults 
          testResult={testResult.status} 
          testMessage={testResult.message} 
        />
      </div>

      <TestResults 
        testResult={testResult.status} 
        testMessage={testResult.message} 
      />

      <APIKeyManagement
        testResult={testResult.status}
        testMessage={testResult.message}
        selectedConfig={selectedConfig}
      />

      <DebugInfo debugInfo={testResult.debugInfo} />

      <TroubleshootingGuide />
    </div>
  );
};

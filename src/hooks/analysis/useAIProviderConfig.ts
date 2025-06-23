
import { useState, useEffect } from 'react';
import { AIProvider, OpenAIModel, ClaudeModel } from '@/types/aiProvider';

export type ModelSelection = {
  provider: AIProvider | 'auto';
  model?: OpenAIModel | ClaudeModel;
  testMode?: boolean;
};

export const useAIProviderConfig = () => {
  const [selectedConfig, setSelectedConfig] = useState<ModelSelection>({
    provider: 'auto',
    testMode: false
  });
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedConfig = localStorage.getItem('ai-provider-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setSelectedConfig(parsed);
      } catch (error) {
        console.error('Failed to parse saved AI provider config:', error);
      }
    }

    // Set available providers (in a real implementation, you would check API key availability)
    const providers: AIProvider[] = ['openai', 'claude'];
    setAvailableProviders(providers);
  }, []);

  const updateConfig = (config: ModelSelection) => {
    setSelectedConfig(config);
    // Save to localStorage for persistence
    localStorage.setItem('ai-provider-config', JSON.stringify(config));
  };

  const getRequestConfig = () => {
    if (selectedConfig.provider === 'auto') {
      return {
        aiProvider: undefined, // Let backend auto-determine
        model: undefined,
        testMode: selectedConfig.testMode
      };
    }
    
    return {
      aiProvider: selectedConfig.provider,
      model: selectedConfig.model,
      testMode: selectedConfig.testMode
    };
  };

  const getDisplayName = () => {
    if (selectedConfig.provider === 'auto') {
      return 'Auto Selection (Smart)';
    }
    
    const providerName = selectedConfig.provider.charAt(0).toUpperCase() + selectedConfig.provider.slice(1);
    if (selectedConfig.model) {
      return `${providerName} - ${selectedConfig.model}`;
    }
    
    return `${providerName} (Default Model)`;
  };

  return {
    selectedConfig,
    setSelectedConfig: updateConfig,
    availableProviders,
    getRequestConfig,
    getDisplayName,
  };
};

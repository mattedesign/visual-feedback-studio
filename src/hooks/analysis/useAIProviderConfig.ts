
import { useState, useEffect } from 'react';
import { AIProvider } from '@/types/aiProvider';

export const useAIProviderConfig = () => {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | 'auto'>('auto');
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);

  useEffect(() => {
    // In a real implementation, you would check which API keys are configured
    // For now, we'll assume both are potentially available
    const providers: AIProvider[] = ['openai', 'claude'];
    setAvailableProviders(providers);
  }, []);

  const getProviderForRequest = (): AIProvider | undefined => {
    if (selectedProvider === 'auto') {
      return undefined; // Let the backend auto-determine
    }
    return selectedProvider;
  };

  return {
    selectedProvider,
    setSelectedProvider,
    availableProviders,
    getProviderForRequest,
  };
};

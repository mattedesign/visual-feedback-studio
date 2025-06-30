
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Sparkles, Zap, Search } from 'lucide-react';
import { useAIProviderConfig } from '@/hooks/analysis/useAIProviderConfig';
import { AIProvider, OPENAI_MODELS, CLAUDE_MODELS, GOOGLE_MODELS } from '@/types/aiProvider';

interface SimplifiedContextInputProps {
  analysisContext: string;
  onAnalysisContextChange: (context: string) => void;
  onAnalyze: () => void;
  canAnalyze: boolean;
  isAnalyzing: boolean;
  uploadedImageCount: number;
}

export const SimplifiedContextInput = ({
  analysisContext,
  onAnalysisContextChange,
  onAnalyze,
  canAnalyze,
  isAnalyzing,
  uploadedImageCount
}: SimplifiedContextInputProps) => {
  const { selectedConfig, setSelectedConfig, availableProviders, getDisplayName } = useAIProviderConfig();

  const providerIcons = {
    auto: <Sparkles className="w-4 h-4" />,
    openai: <Bot className="w-4 h-4" />,
    claude: <Zap className="w-4 h-4" />,
    google: <Search className="w-4 h-4" />
  };

  const getModelOptions = () => {
    const options = [
      { value: 'auto', label: 'Auto Select', icon: providerIcons.auto }
    ];

    if (availableProviders.includes('openai')) {
      options.push(
        { value: 'openai-default', label: 'OpenAI (Default)', icon: providerIcons.openai },
        ...Object.values(OPENAI_MODELS).map(model => ({
          value: `openai-${model.id}`,
          label: `OpenAI - ${model.name}`,
          icon: providerIcons.openai
        }))
      );
    }

    if (availableProviders.includes('claude')) {
      options.push(
        { value: 'claude-default', label: 'Claude (Default)', icon: providerIcons.claude },
        ...Object.values(CLAUDE_MODELS).map(model => ({
          value: `claude-${model.id}`,
          label: `Claude - ${model.name}`,
          icon: providerIcons.claude
        }))
      );
    }

    if (availableProviders.includes('google')) {
      options.push(
        { value: 'google-default', label: 'Google (Default)', icon: providerIcons.google },
        ...Object.values(GOOGLE_MODELS).map(model => ({
          value: `google-${model.id}`,
          label: `Google - ${model.name}`,
          icon: providerIcons.google
        }))
      );
    }

    return options;
  };

  const getCurrentValue = () => {
    if (selectedConfig.provider === 'auto') return 'auto';
    if (selectedConfig.model) {
      return `${selectedConfig.provider}-${selectedConfig.model}`;
    }
    return `${selectedConfig.provider}-default`;
  };

  const handleModelChange = (value: string) => {
    if (value === 'auto') {
      setSelectedConfig({ provider: 'auto', testMode: selectedConfig.testMode });
      return;
    }

    const [provider, ...modelParts] = value.split('-');
    const modelId = modelParts.join('-');

    if (modelId === 'default') {
      setSelectedConfig({ 
        provider: provider as AIProvider, 
        testMode: selectedConfig.testMode 
      });
    } else {
      setSelectedConfig({ 
        provider: provider as AIProvider, 
        model: modelId as any,
        testMode: selectedConfig.testMode 
      });
    }
  };

  const modelOptions = getModelOptions();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like me to analyze?
            </label>
            <Textarea
              value={analysisContext}
              onChange={(e) => onAnalysisContextChange(e.target.value)}
              placeholder="Describe what you'd like me to focus on (e.g., 'Check for accessibility issues', 'Analyze the checkout flow', 'Review mobile responsiveness')..."
              className="min-h-[100px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={isAnalyzing}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              {uploadedImageCount > 0 ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {uploadedImageCount} image{uploadedImageCount > 1 ? 's' : ''} ready for analysis
                </span>
              ) : (
                <span className="text-orange-600">Please upload images first</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Model:</label>
                <Select
                  value={getCurrentValue()}
                  onValueChange={handleModelChange}
                  disabled={isAnalyzing}
                >
                  <SelectTrigger className="w-[200px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={onAnalyze}
                disabled={!canAnalyze}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </div>

          {!canAnalyze && uploadedImageCount > 0 && !analysisContext.trim() && (
            <p className="text-sm text-orange-600 text-center">
              Please describe what you'd like me to analyze before proceeding.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

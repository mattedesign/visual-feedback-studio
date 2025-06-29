import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Bot, Sparkles, Zap, Search, ChevronDown, ChevronRight, Settings, Clock, Award } from 'lucide-react';
import { AIProvider, OpenAIModel, ClaudeModel, GoogleModel, OPENAI_MODELS, CLAUDE_MODELS, GOOGLE_MODELS, ModelInfo } from '@/types/aiProvider';

export type ModelSelection = {
  provider: AIProvider | 'auto';
  model?: OpenAIModel | ClaudeModel | GoogleModel;
  testMode?: boolean;
};

interface EnhancedModelSelectorProps {
  selectedConfig: ModelSelection;
  onConfigChange: (config: ModelSelection) => void;
  availableProviders: AIProvider[];
  showTestMode?: boolean;
}

export const EnhancedModelSelector = ({
  selectedConfig,
  onConfigChange,
  availableProviders,
  showTestMode = false,
}: EnhancedModelSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const providerInfo = {
    auto: {
      name: 'Auto Select (Smart)',
      description: 'Automatically choose the best provider and model',
      icon: <Sparkles className="w-5 h-5" />,
      badge: 'Smart',
      color: 'bg-gradient-to-r from-blue-500 to-purple-500'
    },
    openai: {
      name: 'OpenAI',
      description: 'Advanced GPT models with detailed analysis',
      icon: <Bot className="w-5 h-5" />,
      badge: 'Detailed',
      color: 'bg-gradient-to-r from-green-500 to-teal-500'
    },
    claude: {
      name: 'Anthropic Claude',
      description: 'Precise analysis with strong reasoning',
      icon: <Zap className="w-5 h-5" />,
      badge: 'Precise',
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    google: {
      name: 'Google Vision',
      description: 'Advanced multimodal analysis with Gemini',
      icon: <Search className="w-5 h-5" />,
      badge: 'Multimodal',
      color: 'bg-gradient-to-r from-red-500 to-pink-500'
    }
  };

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'fast': return <Clock className="w-4 h-4 text-green-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'slow': return <Clock className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'excellent': return <Badge variant="default" className="bg-purple-600">Excellent</Badge>;
      case 'very-high': return <Badge variant="default" className="bg-blue-600">Very High</Badge>;
      case 'high': return <Badge variant="secondary">High</Badge>;
      default: return <Badge variant="outline">Quality</Badge>;
    }
  };

  const renderModelOptions = (provider: AIProvider, models: Record<string, ModelInfo>) => (
    <div className="space-y-2 ml-6 mt-2">
      <RadioGroup
        value={selectedConfig.model || ''}
        onValueChange={(model) => onConfigChange({ 
          ...selectedConfig, 
          provider, 
          model: model as OpenAIModel | ClaudeModel | GoogleModel
        })}
      >
        {Object.values(models).map((model) => (
          <div key={model.id} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-slate-50">
            <RadioGroupItem value={model.id} id={model.id} />
            <Label htmlFor={model.id} className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    {model.recommended && <Award className="w-4 h-4 text-yellow-500" />}
                    {getSpeedIcon(model.speed)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{model.description}</div>
                  <div className="flex gap-1 mt-2">
                    {model.capabilities.map((cap) => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getQualityBadge(model.quality)}
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  const getCurrentSelection = () => {
    if (selectedConfig.provider === 'auto') {
      return `${providerInfo.auto.name}${selectedConfig.testMode ? ' (Test Mode)' : ''}`;
    }
    
    const providerName = providerInfo[selectedConfig.provider].name;
    let modelName = 'Default Model';
    
    if (selectedConfig.model) {
      if (selectedConfig.provider === 'openai') {
        modelName = OPENAI_MODELS[selectedConfig.model as OpenAIModel]?.name || 'Default Model';
      } else if (selectedConfig.provider === 'claude') {
        modelName = CLAUDE_MODELS[selectedConfig.model as ClaudeModel]?.name || 'Default Model';
      } else if (selectedConfig.provider === 'google') {
        modelName = GOOGLE_MODELS[selectedConfig.model as GoogleModel]?.name || 'Default Model';
      }
    }
    
    return `${providerName} - ${modelName}${selectedConfig.testMode ? ' (Test)' : ''}`;
  };

  return (
    <Card className="w-full">
      <CardHeader 
        className="cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {providerInfo[selectedConfig.provider].icon}
              AI Analysis Engine
            </CardTitle>
            <CardDescription>
              {getCurrentSelection()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {selectedConfig.testMode && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Test Mode
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className={`text-white ${providerInfo[selectedConfig.provider].color}`}
            >
              {providerInfo[selectedConfig.provider].badge}
            </Badge>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Provider Selection</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>

          <RadioGroup
            value={selectedConfig.provider}
            onValueChange={(provider) => onConfigChange({ 
              provider: provider as AIProvider | 'auto',
              testMode: selectedConfig.testMode 
            })}
            className="space-y-3"
          >
            {/* Auto Selection */}
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-slate-50">
              <RadioGroupItem value="auto" id="auto" />
              <Label htmlFor="auto" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {providerInfo.auto.icon}
                    <div>
                      <div className="font-medium">{providerInfo.auto.name}</div>
                      <div className="text-sm text-gray-600">{providerInfo.auto.description}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-white bg-gradient-to-r from-blue-500 to-purple-500">
                    Recommended
                  </Badge>
                </div>
              </Label>
            </div>

            {/* Provider-specific options */}
            {availableProviders.map((provider) => (
              <Collapsible key={provider} open={showAdvanced}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
                    <RadioGroupItem value={provider} id={provider} />
                    <Label htmlFor={provider} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {providerInfo[provider].icon}
                          <div>
                            <div className="font-medium">{providerInfo[provider].name}</div>
                            <div className="text-sm text-gray-600">{providerInfo[provider].description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-white ${providerInfo[provider].color}`}
                          >
                            {providerInfo[provider].badge}
                          </Badge>
                          {showAdvanced && <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </Label>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  {selectedConfig.provider === provider && (
                    provider === 'openai' 
                      ? renderModelOptions(provider, OPENAI_MODELS)
                      : provider === 'claude'
                      ? renderModelOptions(provider, CLAUDE_MODELS)
                      : renderModelOptions(provider, GOOGLE_MODELS)
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </RadioGroup>

          {/* Test Mode Option */}
          {showTestMode && (
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="testMode"
                  checked={selectedConfig.testMode || false}
                  onChange={(e) => onConfigChange({
                    ...selectedConfig,
                    testMode: e.target.checked
                  })}
                  className="rounded"
                />
                <Label htmlFor="testMode" className="text-sm">
                  Enable Test Mode (detailed logging and validation)
                </Label>
              </div>
            </div>
          )}

          {/* Selection Summary */}
          {selectedConfig.provider !== 'auto' && selectedConfig.model && (
            <div className="bg-slate-50 rounded-lg p-3 border-l-4 border-blue-500">
              <h5 className="font-medium text-sm">Selected Configuration:</h5>
              <p className="text-sm text-gray-600 mt-1">
                {getCurrentSelection()}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};


import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, Zap } from 'lucide-react';
import { AIProvider } from '@/types/aiProvider';

interface AIProviderSelectorProps {
  selectedProvider: AIProvider | 'auto';
  onProviderChange: (provider: AIProvider | 'auto') => void;
  availableProviders: AIProvider[];
}

export const AIProviderSelector = ({
  selectedProvider,
  onProviderChange,
  availableProviders,
}: AIProviderSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const providerInfo = {
    auto: {
      name: 'Auto Select (Recommended)',
      description: 'Automatically choose the best provider with smart fallback',
      icon: <Sparkles className="w-5 h-5" />,
      badge: 'Smart',
      color: 'bg-gradient-to-r from-blue-500 to-purple-500'
    },
    openai: {
      name: 'OpenAI GPT-4',
      description: 'Advanced vision model with detailed analysis',
      icon: <Bot className="w-5 h-5" />,
      badge: 'Detailed',
      color: 'bg-gradient-to-r from-green-500 to-teal-500'
    },
    claude: {
      name: 'Anthropic Claude',
      description: 'Precise analysis with strong reasoning capabilities',
      icon: <Zap className="w-5 h-5" />,
      badge: 'Precise',
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    }
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
              {providerInfo[selectedProvider].icon}
              AI Analysis Engine
            </CardTitle>
            <CardDescription>
              Currently using: {providerInfo[selectedProvider].name}
            </CardDescription>
          </div>
          <Badge variant="outline" className={`text-white ${providerInfo[selectedProvider].color}`}>
            {providerInfo[selectedProvider].badge}
          </Badge>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <RadioGroup
            value={selectedProvider}
            onValueChange={(value) => onProviderChange(value as AIProvider | 'auto')}
            className="space-y-3"
          >
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
                    Smart
                  </Badge>
                </div>
              </Label>
            </div>

            {availableProviders.includes('openai' as AIProvider) && (
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-slate-50">
                <RadioGroupItem value="openai" id="openai" />
                <Label htmlFor="openai" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {providerInfo.openai.icon}
                      <div>
                        <div className="font-medium">{providerInfo.openai.name}</div>
                        <div className="text-sm text-gray-600">{providerInfo.openai.description}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-white bg-gradient-to-r from-green-500 to-teal-500">
                      Detailed
                    </Badge>
                  </div>
                </Label>
              </div>
            )}

            {availableProviders.includes('claude' as AIProvider) && (
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-slate-50">
                <RadioGroupItem value="claude" id="claude" />
                <Label htmlFor="claude" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {providerInfo.claude.icon}
                      <div>
                        <div className="font-medium">{providerInfo.claude.name}</div>
                        <div className="text-sm text-gray-600">{providerInfo.claude.description}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-white bg-gradient-to-r from-orange-500 to-red-500">
                      Precise
                    </Badge>
                  </div>
                </Label>
              </div>
            )}
          </RadioGroup>
        </CardContent>
      )}
    </Card>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { EnhancedModelSelector } from '../workflow/components/EnhancedModelSelector';

interface ModelTestConfigProps {
  showModelConfig: boolean;
  setShowModelConfig: (show: boolean) => void;
  selectedConfig: any;
  setSelectedConfig: (config: any) => void;
  availableProviders: any[];
  getDisplayName: () => string;
}

export const ModelTestConfig = ({
  showModelConfig,
  setShowModelConfig,
  selectedConfig,
  setSelectedConfig,
  availableProviders,
  getDisplayName
}: ModelTestConfigProps) => {
  return (
    <Card>
      <Collapsible open={showModelConfig} onOpenChange={setShowModelConfig}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Test Configuration
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Current: {getDisplayName()}
                  {selectedConfig.testMode && ' (Test Mode)'}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                {showModelConfig ? 'Hide' : 'Configure'}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <EnhancedModelSelector
              selectedConfig={selectedConfig}
              onConfigChange={setSelectedConfig}
              availableProviders={availableProviders}
              showTestMode={true}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

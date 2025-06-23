
import { Button } from '@/components/ui/button';
import { Key, RefreshCw } from 'lucide-react';

interface APIKeyManagementProps {
  testResult: 'success' | 'error' | 'warning' | null;
  testMessage: string;
  selectedConfig: any;
}

export const APIKeyManagement = ({ testResult, testMessage, selectedConfig }: APIKeyManagementProps) => {
  if (testResult !== 'error' || !testMessage.includes('API key')) {
    return null;
  }

  return (
    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <Key className="w-4 h-4 text-blue-400" />
        <h4 className="text-sm font-medium text-slate-300">API Key Management</h4>
      </div>
      <p className="text-xs text-slate-400 mb-3">
        If your API key is invalid, you can update it in Supabase Edge Function Secrets.
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open('https://supabase.com/dashboard/project/mxxtvtwcoplfajvazpav/settings/functions', '_blank')}
          className="text-xs"
        >
          <Key className="w-3 h-3 mr-1" />
          Manage API Keys
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(
            selectedConfig.provider === 'claude' || (selectedConfig.provider === 'auto' && testMessage.includes('Claude'))
              ? 'https://console.anthropic.com/'
              : 'https://platform.openai.com/api-keys', 
            '_blank'
          )}
          className="text-xs"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Get API Key
        </Button>
      </div>
    </div>
  );
};

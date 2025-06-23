
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface DebugInfoProps {
  debugInfo: string;
}

export const DebugInfo = ({ debugInfo }: DebugInfoProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Debug info copied to clipboard');
  };

  if (!debugInfo) return null;

  return (
    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-slate-300">Technical Details</h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => copyToClipboard(debugInfo)}
          className="h-6 px-2 text-xs"
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy
        </Button>
      </div>
      <pre className="text-xs text-slate-400 overflow-auto max-h-48 whitespace-pre-wrap">
        {debugInfo}
      </pre>
    </div>
  );
};


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, CheckCircle, XCircle, AlertTriangle, Copy } from 'lucide-react';

export const TestAnalysisButton = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | 'warning' | null>(null);
  const [testMessage, setTestMessage] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Debug info copied to clipboard');
  };

  const testAnalysis = async () => {
    setIsTesting(true);
    setTestResult(null);
    setTestMessage('');
    setDebugInfo('');

    try {
      console.log('Testing AI analysis with demo image...');
      
      // Use a test image URL that we know exists
      const testImageUrl = 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop';
      
      console.log('Calling AI analysis function...');
      
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrl: testImageUrl,
          analysisId: 'test-' + Date.now(),
          analysisPrompt: 'This is a test analysis. Please provide a simple UX feedback annotation for this design.',
          designType: 'web'
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('AI analysis test failed:', error);
        setTestResult('error');
        
        // Collect debug information
        const debugData = {
          error: error,
          timestamp: new Date().toISOString(),
          testImageUrl,
          functionResponse: data
        };
        setDebugInfo(JSON.stringify(debugData, null, 2));
        
        if (error.message.includes('Invalid Anthropic API key') || 
            error.message.includes('authentication_error') ||
            error.message.includes('Invalid bearer token')) {
          setTestMessage('API key authentication failed. The Anthropic API key may be invalid, expired, or incorrectly formatted. Please check that your API key starts with "sk-ant-" and is active.');
          toast.error('Authentication failed - please verify your Anthropic API key');
        } else if (error.message.includes('ANTHROPIC_API_KEY is not configured')) {
          setTestMessage('API key not found. Please add your Anthropic API key to Supabase secrets.');
          toast.error('API key not configured');
        } else if (error.message.includes('Rate limit exceeded')) {
          setTestMessage('Rate limit exceeded. Please wait a moment and try again.');
          toast.error('Rate limit exceeded');
        } else if (error.message.includes('Network or API error')) {
          setTestMessage('Network connectivity issue. Please check your internet connection and try again.');
          toast.error('Network error');
        } else {
          setTestMessage(`Test failed: ${error.message}`);
          toast.error(`Test failed: ${error.message}`);
        }
        return;
      }

      console.log('AI analysis test completed:', data);

      if (data?.success && data?.annotations && data.annotations.length > 0) {
        setTestResult('success');
        setTestMessage(`Generated ${data.annotations.length} annotations successfully!`);
        toast.success(`Test successful! Generated ${data.annotations.length} annotations.`);
        console.log('Test annotations:', data.annotations);
        
        // Set success debug info
        setDebugInfo(JSON.stringify({
          success: true,
          annotationCount: data.annotations.length,
          annotations: data.annotations,
          timestamp: new Date().toISOString()
        }, null, 2));
      } else if (data?.error) {
        setTestResult('error');
        setTestMessage(data.details || data.error);
        toast.error(`Test failed: ${data.error}`);
        setDebugInfo(JSON.stringify(data, null, 2));
      } else {
        setTestResult('warning');
        setTestMessage('Function completed but returned unexpected format');
        toast.error('Test failed: No annotations returned');
        setDebugInfo(JSON.stringify(data || {}, null, 2));
      }

    } catch (error) {
      console.error('Test error:', error);
      setTestResult('error');
      setTestMessage(error.message);
      toast.error(`Test error: ${error.message}`);
      setDebugInfo(JSON.stringify({
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={testAnalysis}
          disabled={isTesting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isTesting ? (
            <>
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Testing AI Analysis...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Test AI Analysis
            </>
          )}
        </Button>

        {testResult && (
          <div className="flex items-center gap-2">
            {testResult === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">Test Passed!</span>
              </>
            ) : testResult === 'warning' ? (
              <>
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-600 font-medium">Test Warning</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-600 font-medium">Test Failed</span>
              </>
            )}
          </div>
        )}
      </div>

      {testMessage && (
        <div className={`p-3 rounded-lg text-sm ${
          testResult === 'success' 
            ? 'bg-green-900/20 text-green-300 border border-green-700/50'
            : testResult === 'warning'
            ? 'bg-yellow-900/20 text-yellow-300 border border-yellow-700/50'
            : 'bg-red-900/20 text-red-300 border border-red-700/50'
        }`}>
          {testMessage}
        </div>
      )}

      {debugInfo && (
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-300">Debug Information</h4>
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
      )}

      <div className="text-xs text-slate-500 space-y-1">
        <p><strong>Troubleshooting Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ensure your Anthropic API key starts with "sk-ant-" and is active</li>
          <li>Check that you have sufficient API credits in your Anthropic account</li>
          <li>Verify you haven't exceeded rate limits (try again in a few moments)</li>
          <li>Make sure your API key has access to Claude models</li>
        </ul>
      </div>
    </div>
  );
};

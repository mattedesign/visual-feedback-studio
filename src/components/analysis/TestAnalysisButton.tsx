import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, CheckCircle, XCircle, AlertTriangle, Copy, Key, RefreshCw, Settings } from 'lucide-react';
import { useAIProviderConfig } from '@/hooks/analysis/useAIProviderConfig';
import { EnhancedModelSelector } from './workflow/components/EnhancedModelSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const TestAnalysisButton = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | 'warning' | null>(null);
  const [testMessage, setTestMessage] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showModelConfig, setShowModelConfig] = useState(false);
  
  const { 
    selectedConfig, 
    setSelectedConfig, 
    availableProviders, 
    getRequestConfig,
    getDisplayName 
  } = useAIProviderConfig();

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
      console.log('=== Enhanced AI Analysis Test Started ===');
      console.log('Test configuration:', selectedConfig);
      
      // Use a test image URL that we know exists
      const testImageUrl = 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop';
      
      const requestConfig = getRequestConfig();
      console.log('Request configuration:', requestConfig);
      
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrl: testImageUrl,
          analysisId: 'test-' + Date.now(),
          analysisPrompt: `This is a comprehensive test of the AI analysis system using ${getDisplayName()}. Please provide detailed UX feedback annotations.`,
          designType: 'web',
          ...requestConfig
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('AI analysis test failed:', error);
        setTestResult('error');
        
        // Enhanced error categorization
        const debugData = {
          error: error,
          timestamp: new Date().toISOString(),
          testImageUrl,
          functionResponse: data,
          testConfiguration: selectedConfig,
          requestConfig,
          errorType: categorizeError(error.message)
        };
        setDebugInfo(JSON.stringify(debugData, null, 2));
        
        // Provide specific guidance based on error type
        if (error.message.includes('Incorrect API key') || 
            error.message.includes('authentication_error') ||
            error.message.includes('Authentication failed')) {
          setTestMessage(`❌ API Key Authentication Failed\n\nThe API key for ${selectedConfig.provider === 'auto' ? 'the selected provider' : selectedConfig.provider.toUpperCase()} appears to be invalid or expired.\n\n✅ Quick Fix: Re-enter your API key using the button below.`);
          toast.error('API key authentication failed - please update your key');
        } else if (error.message.includes('API key not configured')) {
          setTestMessage(`❌ API Key Missing\n\nNo API key found for ${selectedConfig.provider === 'auto' ? 'available providers' : selectedConfig.provider.toUpperCase()}.\n\n✅ Quick Fix: Add your API key using the button below.`);
          toast.error('API key not configured');
        } else if (error.message.includes('Rate limit exceeded')) {
          setTestMessage('⏳ Rate Limit Exceeded\n\nYou\'ve made too many requests. Please wait a moment before trying again.');
          toast.error('Rate limit exceeded - please wait');
        } else if (error.message.includes('Forbidden') || 
                   error.message.includes('may not have access')) {
          setTestMessage(`🚫 Access Denied\n\nYour API key doesn't have access to the required ${selectedConfig.provider === 'auto' ? '' : selectedConfig.provider.toUpperCase() + ' '}models.\n\n✅ Check: Ensure your account has sufficient credits and model access.`);
          toast.error('Model access denied');
        } else if (error.message.includes('Network or API error')) {
          setTestMessage('🌐 Network Error\n\nCould not connect to the AI API. This may be a temporary connectivity issue.\n\n✅ Try Again: Wait a moment and retry the test.');
          toast.error('Network connectivity issue');
        } else {
          setTestMessage(`❌ Analysis Failed\n\n${error.message}\n\n🔍 Check the debug info below for more details.`);
          toast.error(`Test failed: ${error.message}`);
        }
        return;
      }

      console.log('AI analysis test completed:', data);

      if (data?.success && data?.annotations && data.annotations.length > 0) {
        setTestResult('success');
        const providerUsed = data.providerUsed || selectedConfig.provider || 'auto-selected';
        const modelUsed = data.modelUsed || selectedConfig.model || 'default';
        
        setTestMessage(`✅ Test Successful!\n\nGenerated ${data.annotations.length} high-quality annotations using ${providerUsed.toUpperCase()}${modelUsed !== 'default' ? ` (${modelUsed})` : ''}.\n\n${selectedConfig.testMode ? '🧪 Test Mode: Enhanced logging and validation enabled.\n\n' : ''}🎉 Your AI analysis system is working perfectly with the selected configuration!`);
        toast.success(`Test successful! Generated ${data.annotations.length} annotations using ${providerUsed}.`);
        
        // Set success debug info
        setDebugInfo(JSON.stringify({
          success: true,
          annotationCount: data.annotations.length,
          providerUsed,
          modelUsed,
          testConfiguration: selectedConfig,
          sampleAnnotation: data.annotations[0],
          testCompleted: true,
          timestamp: new Date().toISOString()
        }, null, 2));
      } else if (data?.error) {
        setTestResult('error');
        setTestMessage(`❌ Function Error\n\n${data.details || data.error}\n\n🔍 This indicates an issue with the analysis processing.`);
        toast.error(`Test failed: ${data.error}`);
        setDebugInfo(JSON.stringify({...data, testConfiguration: selectedConfig}, null, 2));
      } else {
        setTestResult('warning');
        setTestMessage('⚠️ Unexpected Response\n\nFunction completed but returned an unexpected format. This may indicate a partial failure.');
        toast.error('Test failed: Unexpected response format');
        setDebugInfo(JSON.stringify({...data, testConfiguration: selectedConfig} || {}, null, 2));
      }

    } catch (error) {
      console.error('Test error:', error);
      setTestResult('error');
      setTestMessage(`❌ Test Error\n\n${error.message}\n\n🔍 This appears to be a client-side error.`);
      toast.error(`Test error: ${error.message}`);
      setDebugInfo(JSON.stringify({
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        testConfiguration: selectedConfig,
        errorType: 'client_error'
      }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  const categorizeError = (errorMessage: string): string => {
    if (errorMessage.includes('Incorrect API key') || errorMessage.includes('authentication')) {
      return 'auth_error';
    }
    if (errorMessage.includes('Rate limit')) {
      return 'rate_limit';
    }
    if (errorMessage.includes('Network')) {
      return 'network_error';
    }
    if (errorMessage.includes('Forbidden')) {
      return 'access_denied';
    }
    return 'unknown_error';
  };

  return (
    <div className="space-y-4">
      {/* AI Configuration Section */}
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

      {/* Test Button Section */}
      <div className="flex items-center gap-4">
        <Button
          onClick={testAnalysis}
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

        {testResult && (
          <div className="flex items-center gap-2">
            {testResult === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">System Working!</span>
              </>
            ) : testResult === 'warning' ? (
              <>
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-600 font-medium">Partial Success</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-600 font-medium">System Issue</span>
              </>
            )}
          </div>
        )}
      </div>

      {testMessage && (
        <div className={`p-4 rounded-lg text-sm whitespace-pre-line ${
          testResult === 'success' 
            ? 'bg-green-900/20 text-green-300 border border-green-700/50'
            : testResult === 'warning'
            ? 'bg-yellow-900/20 text-yellow-300 border border-yellow-700/50'
            : 'bg-red-900/20 text-red-300 border border-red-700/50'
        }`}>
          {testMessage}
        </div>
      )}

      {/* API Key Management Section */}
      {testResult === 'error' && testMessage.includes('API key') && (
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
      )}

      {debugInfo && (
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
      )}

      <div className="text-xs text-slate-500 space-y-2">
        <p><strong>💡 Quick Troubleshooting:</strong></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <p>🔑 <strong>API Key Issues:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600">
              <li>OpenAI keys start with "sk-"</li>
              <li>Claude keys start with "sk-ant-"</li>
              <li>Ensure keys are active and have credits</li>
              <li>Check for extra spaces or characters</li>
            </ul>
          </div>
          <div className="space-y-1">
            <p>⚡ <strong>Model-Specific:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600">
              <li>Test Mode provides detailed logs</li>
              <li>Auto selection uses fallback providers</li>
              <li>Specific models may need higher API limits</li>
              <li>Check provider model availability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

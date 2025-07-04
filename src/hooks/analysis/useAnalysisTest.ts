
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TestResult } from '@/types/testAnalysis.types';


export const useAnalysisTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>({
    status: null,
    message: '',
    debugInfo: ''
  });

  const categorizeError = (errorMessage: string): string => {
    if (errorMessage.includes('Incorrect API key') || errorMessage.includes('authentication')) {
      return 'auth_error';
    }
    if (errorMessage.includes('Rate limit')) {
      return 'rate_limit';
    }
    return 'unknown_error';
  };

  const getErrorGuidance = (error: any, selectedConfig: any): string => {
    if (error.message.includes('Incorrect API key') || 
        error.message.includes('authentication_error') ||
        error.message.includes('Authentication failed')) {
      return `❌ API Key Authentication Failed\n\nThe API key appears to be invalid or expired.\n\n✅ Quick Fix: Re-enter your API key.`;
    } else if (error.message.includes('API key not configured')) {
      return `❌ API Key Missing\n\nNo API key found.\n\n✅ Quick Fix: Add your API key.`;
    } else if (error.message.includes('Rate limit exceeded')) {
      return '⏳ Rate Limit Exceeded\n\nYou\'ve made too many requests. Please wait a moment before trying again.';
    } else {
      return `❌ Analysis Failed\n\n${error.message}\n\n🔍 Check the debug info below for more details.`;
    }
  };

  const executeTest = async (selectedConfig: any, getRequestConfig: () => any, getDisplayName: () => string) => {
    setIsTesting(true);
    setTestResult({
      status: null,
      message: '',
      debugInfo: ''
    });

    try {
      console.log('=== Enhanced AI Analysis Test Started ===');
      console.log('Test configuration:', selectedConfig);
      
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
        
        const debugData = {
          error: error,
          timestamp: new Date().toISOString(),
          testImageUrl,
          functionResponse: data,
          testConfiguration: selectedConfig,
          requestConfig,
          errorType: categorizeError(error.message)
        };

        const errorMessage = getErrorGuidance(error, selectedConfig);
        
        setTestResult({
          status: 'error',
          message: errorMessage,
          debugInfo: JSON.stringify(debugData, null, 2)
        });

        if (error.message.includes('Incorrect API key')) {
          toast.error('API key authentication failed - please update your key');
        } else if (error.message.includes('API key not configured')) {
          toast.error('API key not configured');
        } else if (error.message.includes('Rate limit exceeded')) {
          toast.error('Rate limit exceeded - please wait');
        } else {
          toast.error(`Test failed: ${error.message}`);
        }
        return;
      }

      console.log('AI analysis test completed:', data);

      if (data?.success && data?.annotations && data.annotations.length > 0) {
        const providerUsed = data.providerUsed || selectedConfig.provider || 'auto-selected';
        const modelUsed = data.modelUsed || selectedConfig.model || 'default';
        
        const successMessage = `✅ Test Successful!\n\nGenerated ${data.annotations.length} high-quality annotations using ${providerUsed.toUpperCase()}${modelUsed !== 'default' ? ` (${modelUsed})` : ''}.\n\n${selectedConfig.testMode ? '🧪 Test Mode: Enhanced logging and validation enabled.\n\n' : ''}🎉 Your AI analysis system is working perfectly with the selected configuration!`;
        
        setTestResult({
          status: 'success',
          message: successMessage,
          debugInfo: JSON.stringify({
            success: true,
            annotationCount: data.annotations.length,
            providerUsed,
            modelUsed,
            testConfiguration: selectedConfig,
            sampleAnnotation: data.annotations[0],
            testCompleted: true,
            timestamp: new Date().toISOString()
          }, null, 2)
        });

        toast.success(`Test successful! Generated ${data.annotations.length} annotations using ${providerUsed}.`);
      } else if (data?.error) {
        setTestResult({
          status: 'error',
          message: `❌ Function Error\n\n${data.details || data.error}\n\n🔍 This indicates an issue with the analysis processing.`,
          debugInfo: JSON.stringify({...data, testConfiguration: selectedConfig}, null, 2)
        });
        toast.error(`Test failed: ${data.error}`);
      } else {
        setTestResult({
          status: 'warning',
          message: '⚠️ Unexpected Response\n\nFunction completed but returned an unexpected format. This may indicate a partial failure.',
          debugInfo: JSON.stringify({...data, testConfiguration: selectedConfig}, null, 2)
        });
        toast.error('Test failed: Unexpected response format');
      }

    } catch (error) {
      console.error('Test error:', error);
      setTestResult({
        status: 'error',
        message: `❌ Test Error\n\n${error.message}\n\n🔍 This appears to be a client-side error.`,
        debugInfo: JSON.stringify({
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          testConfiguration: selectedConfig,
          errorType: 'client_error'
        }, null, 2)
      });
      toast.error(`Test error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return {
    isTesting,
    testResult,
    executeTest
  };
};

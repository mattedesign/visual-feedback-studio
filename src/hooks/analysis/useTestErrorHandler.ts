
import { ErrorCategory } from '@/types/testAnalysis.types';

export const useTestErrorHandler = () => {
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

  const getErrorGuidance = (error: any, selectedConfig: any): string => {
    if (error.message.includes('Incorrect API key') || 
        error.message.includes('authentication_error') ||
        error.message.includes('Authentication failed')) {
      return `❌ API Key Authentication Failed\n\nThe API key for ${selectedConfig.provider === 'auto' ? 'the selected provider' : selectedConfig.provider.toUpperCase()} appears to be invalid or expired.\n\n✅ Quick Fix: Re-enter your API key using the button below.`;
    } else if (error.message.includes('API key not configured')) {
      return `❌ API Key Missing\n\nNo API key found for ${selectedConfig.provider === 'auto' ? 'available providers' : selectedConfig.provider.toUpperCase()}.\n\n✅ Quick Fix: Add your API key using the button below.`;
    } else if (error.message.includes('Rate limit exceeded')) {
      return '⏳ Rate Limit Exceeded\n\nYou\'ve made too many requests. Please wait a moment before trying again.';
    } else if (error.message.includes('Forbidden') || 
               error.message.includes('may not have access')) {
      return `🚫 Access Denied\n\nYour API key doesn't have access to the required ${selectedConfig.provider === 'auto' ? '' : selectedConfig.provider.toUpperCase() + ' '}models.\n\n✅ Check: Ensure your account has sufficient credits and model access.`;
    } else if (error.message.includes('Network or API error')) {
      return '🌐 Network Error\n\nCould not connect to the AI API. This may be a temporary connectivity issue.\n\n✅ Try Again: Wait a moment and retry the test.';
    } else {
      return `❌ Analysis Failed\n\n${error.message}\n\n🔍 Check the debug info below for more details.`;
    }
  };

  return {
    categorizeError,
    getErrorGuidance
  };
};

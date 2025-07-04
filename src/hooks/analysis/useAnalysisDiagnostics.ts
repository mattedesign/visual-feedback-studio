import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiagnosticCheck {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'CHECKING';
  message: string;
  details?: any;
}

interface DiagnosticReport {
  timestamp: string;
  checks: DiagnosticCheck[];
  overallStatus: 'HEALTHY' | 'ISSUES' | 'CRITICAL';
  canProceed: boolean;
}

export const useAnalysisDiagnostics = () => {
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const runClientDiagnostics = useCallback(async (
    images: string[],
    analysisPrompt: string,
    analysisId?: string
  ): Promise<DiagnosticReport> => {
    console.log('🔍 CLIENT DIAGNOSTICS: Starting comprehensive analysis pre-check');
    setIsRunningDiagnostics(true);

    const checks: DiagnosticCheck[] = [];
    let criticalIssues = 0;
    let warnings = 0;

    // 1. Authentication Check
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        checks.push({
          name: 'User Authentication',
          status: 'FAIL',
          message: 'User not authenticated',
          details: { authError: authError?.message }
        });
        criticalIssues++;
      } else {
        checks.push({
          name: 'User Authentication',
          status: 'PASS',
          message: `Authenticated as ${user.email}`,
          details: { userId: user.id }
        });
      }
    } catch (error) {
      checks.push({
        name: 'User Authentication',
        status: 'FAIL',
        message: `Authentication check failed: ${error.message}`,
        details: { error: error.message }
      });
      criticalIssues++;
    }

    // 2. Image Validation
    if (!images || images.length === 0) {
      checks.push({
        name: 'Image Validation',
        status: 'FAIL',
        message: 'No images provided for analysis',
        details: { imageCount: 0 }
      });
      criticalIssues++;
    } else if (images.length > 10) {
      checks.push({
        name: 'Image Validation',
        status: 'WARNING',
        message: `High image count: ${images.length} (recommended: ≤ 10)`,
        details: { imageCount: images.length, recommended: 10 }
      });
      warnings++;
    } else {
      // Validate each image
      let validImages = 0;
      let invalidImages = 0;
      const imageDetails: any[] = [];

      images.forEach((image, index) => {
        if (typeof image !== 'string' || image.trim().length === 0) {
          invalidImages++;
          imageDetails.push({ index, status: 'invalid', reason: 'Empty or non-string' });
        } else if (image.startsWith('data:')) {
          // Base64 validation
          if (/^data:image\/(jpeg|jpg|png|webp|gif);base64,/.test(image)) {
            validImages++;
            imageDetails.push({ index, status: 'valid', type: 'base64', size: image.length });
          } else {
            invalidImages++;
            imageDetails.push({ index, status: 'invalid', reason: 'Invalid base64 format' });
          }
        } else if (image.startsWith('http')) {
          // URL validation
          try {
            new URL(image);
            validImages++;
            imageDetails.push({ index, status: 'valid', type: 'url' });
          } catch {
            invalidImages++;
            imageDetails.push({ index, status: 'invalid', reason: 'Invalid URL format' });
          }
        } else {
          invalidImages++;
          imageDetails.push({ index, status: 'invalid', reason: 'Must be URL or base64' });
        }
      });

      if (invalidImages > 0) {
        checks.push({
          name: 'Image Validation',
          status: invalidImages === images.length ? 'FAIL' : 'WARNING',
          message: `${invalidImages} invalid images out of ${images.length}`,
          details: { validImages, invalidImages, imageDetails }
        });
        if (invalidImages === images.length) {
          criticalIssues++;
        } else {
          warnings++;
        }
      } else {
        checks.push({
          name: 'Image Validation',
          status: 'PASS',
          message: `All ${validImages} images are valid`,
          details: { validImages, imageDetails }
        });
      }
    }

    // 3. Analysis Prompt Validation
    if (!analysisPrompt || typeof analysisPrompt !== 'string') {
      checks.push({
        name: 'Analysis Prompt',
        status: 'FAIL',
        message: 'Analysis prompt is missing or invalid',
        details: { promptType: typeof analysisPrompt }
      });
      criticalIssues++;
    } else if (analysisPrompt.trim().length < 10) {
      checks.push({
        name: 'Analysis Prompt',
        status: 'FAIL',
        message: `Analysis prompt too short: ${analysisPrompt.length} characters (minimum: 10)`,
        details: { length: analysisPrompt.length, minimum: 10 }
      });
      criticalIssues++;
    } else if (analysisPrompt.length > 2000) {
      checks.push({
        name: 'Analysis Prompt',
        status: 'WARNING',
        message: `Analysis prompt very long: ${analysisPrompt.length} characters (recommended: ≤ 2000)`,
        details: { length: analysisPrompt.length, recommended: 2000 }
      });
      warnings++;
    } else {
      checks.push({
        name: 'Analysis Prompt',
        status: 'PASS',
        message: `Valid analysis prompt: ${analysisPrompt.length} characters`,
        details: { length: analysisPrompt.length }
      });
    }

    // 4. Analysis ID Validation
    if (!analysisId) {
      checks.push({
        name: 'Analysis ID',
        status: 'FAIL',
        message: 'Analysis ID is missing',
        details: { provided: false }
      });
      criticalIssues++;
    } else {
      checks.push({
        name: 'Analysis ID',
        status: 'PASS',
        message: `Analysis ID present: ${analysisId}`,
        details: { analysisId }
      });
    }

    // 5. Subscription Limit Check
    try {
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('analyses_used, analyses_limit, status, plan_type')
        .single();

      if (subError) {
        checks.push({
          name: 'Subscription Check',
          status: 'WARNING',
          message: 'Could not verify subscription status',
          details: { error: subError.message }
        });
        warnings++;
      } else if (subscription.status !== 'active') {
        checks.push({
          name: 'Subscription Check',
          status: 'FAIL',
          message: `Subscription not active: ${subscription.status}`,
          details: subscription
        });
        criticalIssues++;
      } else if (subscription.analyses_used >= subscription.analyses_limit) {
        checks.push({
          name: 'Subscription Check',
          status: 'FAIL',
          message: `Analysis limit reached: ${subscription.analyses_used}/${subscription.analyses_limit}`,
          details: subscription
        });
        criticalIssues++;
      } else {
        checks.push({
          name: 'Subscription Check',
          status: 'PASS',
          message: `Subscription active: ${subscription.analyses_used}/${subscription.analyses_limit} used`,
          details: subscription
        });
      }
    } catch (error) {
      checks.push({
        name: 'Subscription Check',
        status: 'WARNING',
        message: `Subscription check failed: ${error.message}`,
        details: { error: error.message }
      });
      warnings++;
    }

    // 6. Supabase Connection Test
    try {
      const { error: connectionError } = await supabase
        .from('analyses')
        .select('id')
        .limit(1);

      if (connectionError) {
        checks.push({
          name: 'Database Connection',
          status: 'FAIL',
          message: `Database connection failed: ${connectionError.message}`,
          details: { error: connectionError.message }
        });
        criticalIssues++;
      } else {
        checks.push({
          name: 'Database Connection',
          status: 'PASS',
          message: 'Database connection successful',
          details: { connected: true }
        });
      }
    } catch (error) {
      checks.push({
        name: 'Database Connection',
        status: 'FAIL',
        message: `Database connection error: ${error.message}`,
        details: { error: error.message }
      });
      criticalIssues++;
    }

    // Generate overall status
    const overallStatus = criticalIssues > 0 ? 'CRITICAL' : 
                         warnings > 0 ? 'ISSUES' : 'HEALTHY';
    const canProceed = criticalIssues === 0;

    const report: DiagnosticReport = {
      timestamp: new Date().toISOString(),
      checks,
      overallStatus,
      canProceed
    };

    console.log('🔍 CLIENT DIAGNOSTICS COMPLETED:', {
      overallStatus,
      totalChecks: checks.length,
      passed: checks.filter(c => c.status === 'PASS').length,
      warnings,
      criticalIssues,
      canProceed
    });

    setDiagnosticReport(report);
    setIsRunningDiagnostics(false);

    // Show appropriate toasts
    if (criticalIssues > 0) {
      toast.error(`Analysis blocked: ${criticalIssues} critical issue(s) detected`);
    } else if (warnings > 0) {
      toast.warning(`Analysis can proceed but ${warnings} warning(s) detected`);
    } else {
      toast.success('All diagnostic checks passed');
    }

    return report;
  }, []);

  const testClaudeConnection = useCallback(async () => {
    console.log('🧪 Testing Claude API connection...');
    try {
      const { data, error } = await supabase.functions.invoke('test-claude-auth-v2');
      
      if (error) {
        console.error('❌ Claude connection test failed:', error);
        toast.error('Claude API connection test failed');
        return { success: false, error: error.message };
      }

      console.log('✅ Claude connection test result:', data);
      
      if (data.success) {
        toast.success('Claude API connection is working correctly');
      } else {
        toast.error(`Claude API issue: ${data.error}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Claude connection test error:', error);
      toast.error('Failed to test Claude API connection');
      return { success: false, error: error.message };
    }
  }, []);

  const clearDiagnostics = useCallback(() => {
    setDiagnosticReport(null);
  }, []);

  return {
    diagnosticReport,
    isRunningDiagnostics,
    runClientDiagnostics,
    testClaudeConnection,
    clearDiagnostics
  };
};
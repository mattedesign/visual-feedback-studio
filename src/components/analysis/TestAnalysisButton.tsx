
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';

export const TestAnalysisButton = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const testAnalysis = async () => {
    setIsTesting(true);
    setTestResult(null);

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

      if (error) {
        console.error('AI analysis test failed:', error);
        setTestResult('error');
        toast.error(`Test failed: ${error.message}`);
        return;
      }

      console.log('AI analysis test completed:', data);

      if (data?.success && data?.annotations && data.annotations.length > 0) {
        setTestResult('success');
        toast.success(`Test successful! Generated ${data.annotations.length} annotations.`);
        console.log('Test annotations:', data.annotations);
      } else {
        setTestResult('error');
        toast.error('Test failed: No annotations returned');
      }

    } catch (error) {
      console.error('Test error:', error);
      setTestResult('error');
      toast.error(`Test error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
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
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-600 font-medium">Test Failed</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

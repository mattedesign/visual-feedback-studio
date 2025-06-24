
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SimpleRAGTest = () => {
  const [isTestingRAG, setIsTestingRAG] = useState(false);

  const testRAGFunction = async () => {
    setIsTestingRAG(true);
    console.log('🔍 Testing build-rag-context function...');
    
    try {
      const testPayload = {
        userPrompt: "test button design",
        imageUrls: ['https://example.com/test-image.jpg'],
        imageAnnotations: [],
        analysisId: 'test-' + Date.now()
      };

      console.log('📤 Sending test payload:', testPayload);

      const { data, error } = await supabase.functions.invoke('build-rag-context', {
        body: testPayload
      });

      console.log('📥 RAG Function Response:');
      console.log('Success:', !error);
      console.log('Error:', error);
      console.log('Data:', data);

      if (error) {
        console.error('❌ RAG function error:', error);
        toast.error(`RAG test failed: ${error.message}`);
      } else {
        console.log('✅ RAG function response received');
        console.log('Knowledge entries found:', data?.totalEntriesFound || 0);
        console.log('Search terms used:', data?.searchTermsUsed || []);
        console.log('Citations generated:', data?.researchCitations?.length || 0);
        console.log('Industry context:', data?.industryContext);
        
        toast.success(`RAG test completed! Found ${data?.totalEntriesFound || 0} knowledge entries`);
      }

    } catch (error) {
      console.error('❌ Test failed with exception:', error);
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsTestingRAG(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-slate-50">
      <h3 className="font-semibold mb-2">RAG Function Debug Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        Test the build-rag-context function to see why it returns empty arrays. Check the browser console for detailed logs.
      </p>
      <Button 
        onClick={testRAGFunction}
        disabled={isTestingRAG}
        className="w-full"
      >
        {isTestingRAG ? 'Testing RAG Function...' : 'Test RAG Function'}
      </Button>
    </div>
  );
};

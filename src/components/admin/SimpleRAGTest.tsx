
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SimpleRAGTest = () => {
  const [isTestingRAG, setIsTestingRAG] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [isTestingDB, setIsTestingDB] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);
  const [dbTestResult, setDbTestResult] = useState<any>(null);

  const populateTestData = async () => {
    setIsPopulating(true);
    console.log('🔧 Populating test knowledge entries...');
    
    try {
      const { data, error } = await supabase.functions.invoke('populate-test-knowledge', {
        body: {}
      });

      if (error) {
        console.error('❌ Population failed:', error);
        toast.error(`Failed to populate test data: ${error.message}`);
      } else {
        console.log('✅ Test data populated:', data);
        toast.success(data?.message || 'Test knowledge entries populated successfully!');
      }
    } catch (error) {
      console.error('❌ Population failed with exception:', error);
      toast.error(`Population failed: ${error.message}`);
    } finally {
      setIsPopulating(false);
    }
  };

  const testDatabaseAccess = async () => {
    setIsTestingDB(true);
    setDbTestResult(null);
    console.log('🔍 Testing direct database access...');
    
    try {
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('id, title, category, tags')
        .limit(5);

      const result = {
        success: !error,
        error: error,
        data: data,
        timestamp: new Date().toISOString(),
        count: data?.length || 0
      };
      
      setDbTestResult(result);

      if (error) {
        console.error('❌ Database access failed:', error);
        toast.error(`Database test failed: ${error.message}`);
      } else {
        console.log('✅ Database access successful:', data);
        toast.success(`Database test passed! Found ${data?.length || 0} knowledge entries`);
      }
    } catch (error) {
      console.error('❌ Database test failed with exception:', error);
      const result = {
        success: false,
        error: { message: error.message },
        data: null,
        timestamp: new Date().toISOString(),
        count: 0
      };
      setDbTestResult(result);
      toast.error(`Database test failed: ${error.message}`);
    } finally {
      setIsTestingDB(false);
    }
  };

  const testRAGFunction = async () => {
    setIsTestingRAG(true);
    setLastTestResult(null);
    console.log('🔍 Testing build-rag-context function...');
    
    try {
      const testPayload = {
        userPrompt: "analyze button design best practices for accessibility",
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

      const result = {
        success: !error,
        error: error,
        data: data,
        timestamp: new Date().toISOString()
      };
      setLastTestResult(result);

      if (error) {
        console.error('❌ RAG function error:', error);
        toast.error(`RAG test failed: ${error.message}`);
      } else {
        console.log('✅ RAG function response received');
        console.log('Knowledge entries found:', data?.totalEntriesFound || 0);
        console.log('Search terms used:', data?.searchTermsUsed || []);
        console.log('Citations generated:', data?.researchCitations?.length || 0);
        console.log('Industry context:', data?.industryContext);
        
        toast.success(`RAG test completed! Found ${data?.totalEntriesFound || 0} knowledge entries with ${data?.searchTermsUsed?.length || 0} search terms processed`);
      }

    } catch (error) {
      console.error('❌ Test failed with exception:', error);
      const result = {
        success: false,
        error: { message: error.message },
        data: null,
        timestamp: new Date().toISOString()
      };
      setLastTestResult(result);
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsTestingRAG(false);
    }
  };

  const testEnvironmentVars = async () => {
    console.log('🔍 Testing environment variable access...');
    try {
      const { data, error } = await supabase.functions.invoke('build-rag-context', {
        body: {
          userPrompt: "test environment",
          imageUrls: [],
          imageAnnotations: [],
          analysisId: 'env-test-' + Date.now()
        }
      });

      if (error) {
        console.log('Environment test error:', error);
        if (error.message.includes('Missing required environment variables')) {
          toast.error('Environment variables are not properly configured');
        } else if (error.message.includes('OPENAI_API_KEY_RAG')) {
          toast.error('OpenAI API key is missing or invalid');
        } else {
          toast.error(`Environment test failed: ${error.message}`);
        }
      } else {
        toast.success('Environment variables are properly configured');
      }
    } catch (error) {
      console.error('Environment test failed:', error);
      toast.error(`Environment test failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
      <h3 className="font-semibold mb-2">Enhanced RAG Function Debug Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        Comprehensive testing suite for the RAG function with detailed debugging. Check the browser console for detailed logs.
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={populateTestData}
          disabled={isPopulating}
          variant="outline"
        >
          {isPopulating ? 'Populating...' : 'Populate Test Data'}
        </Button>
        
        <Button 
          onClick={testDatabaseAccess}
          disabled={isTestingDB}
          variant="outline"
        >
          {isTestingDB ? 'Testing DB...' : 'Test Database Access'}
        </Button>
        
        <Button 
          onClick={testEnvironmentVars}
          variant="outline"
        >
          Test Environment Variables
        </Button>
        
        <Button 
          onClick={testRAGFunction}
          disabled={isTestingRAG}
          className="col-span-2"
        >
          {isTestingRAG ? 'Testing RAG Function...' : 'Test RAG Function'}
        </Button>
      </div>

      {dbTestResult && (
        <div className="mt-4 p-3 border rounded-lg bg-white">
          <h4 className="font-medium mb-2">Database Test Result:</h4>
          <div className="text-sm space-y-1">
            <div>Status: <span className={dbTestResult.success ? 'text-green-600' : 'text-red-600'}>
              {dbTestResult.success ? 'SUCCESS' : 'FAILED'}
            </span></div>
            <div>Entries Found: {dbTestResult.count}</div>
            <div>Time: {new Date(dbTestResult.timestamp).toLocaleTimeString()}</div>
            {dbTestResult.error && (
              <div className="text-red-600">Error: {dbTestResult.error.message}</div>
            )}
            {dbTestResult.data && dbTestResult.data.length > 0 && (
              <div className="text-green-600">
                Sample entries: {dbTestResult.data.slice(0, 3).map((e: any) => e.title).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {lastTestResult && (
        <div className="mt-4 p-3 border rounded-lg bg-white">
          <h4 className="font-medium mb-2">RAG Function Test Result:</h4>
          <div className="text-sm space-y-1">
            <div>Status: <span className={lastTestResult.success ? 'text-green-600' : 'text-red-600'}>
              {lastTestResult.success ? 'SUCCESS' : 'FAILED'}
            </span></div>
            <div>Time: {new Date(lastTestResult.timestamp).toLocaleTimeString()}</div>
            {lastTestResult.error && (
              <div className="text-red-600">Error: {lastTestResult.error.message}</div>
            )}
            {lastTestResult.data && (
              <div className="text-green-600">
                <div>Entries Found: {lastTestResult.data.totalEntriesFound || 0}</div>
                <div>Search Terms: {lastTestResult.data.searchTermsUsed?.length || 0}</div>
                <div>Citations: {lastTestResult.data.researchCitations?.length || 0}</div>
                <div>Industry: {lastTestResult.data.industryContext || 'N/A'}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

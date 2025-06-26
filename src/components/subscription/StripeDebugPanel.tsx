
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { stripeService } from '@/services/stripeService';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export const StripeDebugPanel = () => {
  const { user } = useAuth();
  const { subscription, refetch } = useSubscription();
  const [testing, setTesting] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);

  const runStripeTest = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setTesting(true);
    const testResults: any = {
      timestamp: new Date().toISOString(),
      user: { id: user.id, email: user.email },
      config: {},
      tests: {}
    };

    try {
      // Test 1: Configuration validation
      const configValidation = stripeService.validateConfiguration();
      testResults.config = configValidation;
      testResults.tests.configValid = configValidation.isValid;

      // Test 2: Customer creation
      try {
        const customer = await stripeService.createStripeCustomer(user.email!, user.id);
        testResults.tests.customerCreation = !!customer;
        testResults.customer = customer;
      } catch (error) {
        testResults.tests.customerCreation = false;
        testResults.customerError = error instanceof Error ? error.message : String(error);
      }

      // Test 3: Subscription status
      try {
        await refetch();
        testResults.tests.subscriptionFetch = true;
        testResults.subscription = subscription;
      } catch (error) {
        testResults.tests.subscriptionFetch = false;
        testResults.subscriptionError = error instanceof Error ? error.message : String(error);
      }

      setDebugData(testResults);
      
      const allTestsPassed = Object.values(testResults.tests).every(test => test === true);
      if (allTestsPassed) {
        toast.success('All Stripe tests passed!');
      } else {
        toast.error('Some Stripe tests failed. Check debug panel for details.');
      }
    } catch (error) {
      console.error('Debug test error:', error);
      toast.error('Debug test failed');
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Stripe Integration Debug Panel
          <Button
            onClick={runStripeTest}
            disabled={testing}
            variant="outline"
            size="sm"
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              'Run Tests'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {debugData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(debugData.tests.configValid)}
                <span>Configuration Valid</span>
                <Badge variant={debugData.tests.configValid ? 'default' : 'destructive'}>
                  {debugData.tests.configValid ? 'Pass' : 'Fail'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon(debugData.tests.customerCreation)}
                <span>Customer Creation</span>
                <Badge variant={debugData.tests.customerCreation ? 'default' : 'destructive'}>
                  {debugData.tests.customerCreation ? 'Pass' : 'Fail'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon(debugData.tests.subscriptionFetch)}
                <span>Subscription Fetch</span>
                <Badge variant={debugData.tests.subscriptionFetch ? 'default' : 'destructive'}>
                  {debugData.tests.subscriptionFetch ? 'Pass' : 'Fail'}
                </Badge>
              </div>
            </div>

            {!debugData.config.isValid && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Configuration Issues:</h4>
                <ul className="list-disc list-inside text-red-700">
                  {debugData.config.missingKeys.map((key: string) => (
                    <li key={key}>Missing: {key}</li>
                  ))}
                </ul>
              </div>
            )}

            {debugData.customerError && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Customer Creation Error:</h4>
                <p className="text-red-700">{debugData.customerError}</p>
              </div>
            )}

            {debugData.subscriptionError && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Subscription Fetch Error:</h4>
                <p className="text-red-700">{debugData.subscriptionError}</p>
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer font-medium">Raw Debug Data</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

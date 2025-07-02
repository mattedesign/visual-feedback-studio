import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { executeDatabaseSeeding } from '@/scripts/seedProblemStatementData';
import type { SeedingResult } from '@/scripts/seedProblemStatementData';

export const DatabaseSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<SeedingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setError(null);
    setResult(null);

    try {
      console.log('🌱 Starting database seeding...');
      const seedingResult = await executeDatabaseSeeding();
      setResult(seedingResult);
      
      if (seedingResult.success) {
        console.log('✅ Database seeding completed successfully!');
      } else {
        console.error('❌ Database seeding failed:', seedingResult.errors);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('💥 Database seeding failed:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-blue-500" />
            Database Seeding Utility
          </CardTitle>
          <CardDescription>
            Populate the database with foundational problem statements, contextual solutions, and competitor patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              This will seed the following tables:
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>Problem Statements (5 core templates)</li>
                <li>Contextual Solutions (5 business-context solutions)</li>
                <li>Competitor Patterns (5 industry patterns)</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleSeedDatabase} 
              disabled={isSeeding}
              className="w-full sm:w-auto"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                'Seed Database'
              )}
            </Button>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-200">Seeding Failed</h4>
                    <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className={`border-2 ${result.success ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(result.success)}
                  Seeding Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {result.problemStatementsInserted}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Problem Statements
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {result.contextualSolutionsInserted}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Contextual Solutions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {result.competitorPatternsInserted}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Competitor Patterns
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Verification Results</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Problem Statements:</span>
                      <Badge variant={result.verificationResults.problemStatementCount >= 5 ? 'default' : 'destructive'}>
                        {result.verificationResults.problemStatementCount}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Solutions:</span>
                      <Badge variant={result.verificationResults.solutionCount >= 5 ? 'default' : 'destructive'}>
                        {result.verificationResults.solutionCount}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Patterns:</span>
                      <Badge variant={result.verificationResults.patternCount >= 3 ? 'default' : 'destructive'}>
                        {result.verificationResults.patternCount}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Relationships:</span>
                      <Badge variant={result.verificationResults.relationshipCount >= 5 ? 'default' : 'destructive'}>
                        {result.verificationResults.relationshipCount}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {getStatusIcon(result.verificationResults.dataIntegrityPassed)}
                    <span className="text-sm font-medium">
                      Data Integrity: {result.verificationResults.dataIntegrityPassed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Errors:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-700 dark:text-red-300">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.warnings.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Warnings:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {result.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
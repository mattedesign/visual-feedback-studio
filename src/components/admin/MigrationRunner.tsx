
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Play, CheckCircle, XCircle, Clock, Database } from 'lucide-react';
import { toast } from 'sonner';
import { runMigration } from '@/scripts/execute-migration';

interface MigrationResult {
  id: string;
  title: string;
  originalCategory: string;
  newPrimaryCategory: string;
  newSecondaryCategory: string;
  newIndustryTags: string[];
  newComplexityLevel: string;
  newUseCases: string[];
  success: boolean;
  error?: string;
}

interface MigrationSummary {
  totalEntries: number;
  successfulMigrations: number;
  failedMigrations: number;
  results: MigrationResult[];
}

export const MigrationRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [migrationResults, setMigrationResults] = useState<MigrationSummary | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const handleRunMigration = async () => {
    setIsRunning(true);
    setMigrationResults(null);
    
    try {
      toast.info('Starting category migration...', {
        description: 'This may take a few minutes to process all entries.'
      });

      const results = await runMigration();
      setMigrationResults(results);

      toast.success('Migration completed!', {
        description: `Successfully migrated ${results.successfulMigrations} out of ${results.totalEntries} entries.`
      });
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Migration failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Group results by primary category
  const categoryGroups = migrationResults?.results.reduce((acc, result) => {
    const key = result.newPrimaryCategory;
    if (!acc[key]) acc[key] = [];
    acc[key].push(result);
    return acc;
  }, {} as Record<string, MigrationResult[]>) || {};

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Knowledge Base Category Migration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This will migrate your existing knowledge entries to the new hierarchical category structure.
              Each entry will be analyzed and assigned proper primary/secondary categories, industry tags, 
              complexity levels, and use cases.
            </p>
            
            <Button
              onClick={handleRunMigration}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Running Migration...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Category Migration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {migrationResults && (
        <Card>
          <CardHeader>
            <CardTitle>Migration Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {migrationResults.totalEntries}
                </div>
                <div className="text-sm text-blue-600">Total Entries</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {migrationResults.successfulMigrations}
                </div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {migrationResults.failedMigrations}
                </div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(categoryGroups).map(([category, results]) => (
                <Collapsible key={category} className="space-y-2">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto"
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedCategories.has(category) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                        <span className="font-medium capitalize">
                          {category.replace('-', ' ')}
                        </span>
                        <Badge variant="secondary">
                          {results.length} entries
                        </Badge>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-3 pl-4">
                    {results.map((result) => (
                      <Card key={result.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <h4 className="font-medium truncate">{result.title}</h4>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Migration:</span>{' '}
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {result.originalCategory}
                            </span>
                            {' → '}
                            <span className="bg-blue-100 px-2 py-1 rounded text-xs">
                              {result.newPrimaryCategory}
                            </span>
                            {' > '}
                            <span className="bg-blue-50 px-2 py-1 rounded text-xs">
                              {result.newSecondaryCategory}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getComplexityColor(result.newComplexityLevel)}>
                              {result.newComplexityLevel}
                            </Badge>
                            {result.newIndustryTags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Use Cases:</span>{' '}
                            {result.newUseCases.join(', ')}
                          </div>
                          
                          {!result.success && result.error && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                              <span className="font-medium">Error:</span> {result.error}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

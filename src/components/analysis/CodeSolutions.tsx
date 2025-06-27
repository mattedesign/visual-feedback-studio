
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Code, Eye, Download, Clock, TrendingUp } from 'lucide-react';

interface CodeSolution {
  id: string;
  title: string;
  type: 'accessibility' | 'conversion' | 'mobile' | 'performance' | 'visual';
  issue: string;
  impact: string;
  beforeCode: string;
  afterCode: string;
  explanation: string;
  researchBacking: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  timestamp: Date;
}

interface CodeSolutionsProps {
  analysisInsights: string[];
  userContext: string;
  focusAreas: string[];
  designType: 'mobile' | 'desktop' | 'responsive';
}

export const CodeSolutions: React.FC<CodeSolutionsProps> = ({
  analysisInsights,
  userContext,
  focusAreas,
  designType
}) => {
  const [solutions, setSolutions] = useState<CodeSolution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('preview');

  const generateSolutions = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔧 Starting code solution generation...');
      
      const { codeSolutionService } = await import('@/services/design/codeSolutionService');
      
      const solutions = await codeSolutionService.generateCodeSolutions({
        analysisInsights,
        userContext,
        focusAreas,
        designType
      });
      
      if (solutions.length === 0) {
        setError('No code solutions could be generated. Please try again.');
      } else {
        setSolutions(solutions);
        console.log(`✅ Successfully generated ${solutions.length} code solutions`);
      }
      
    } catch (err) {
      console.error('❌ Code solution generation failed:', err);
      setError(err.message || 'Failed to generate code solutions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'accessibility': return 'bg-blue-500';
      case 'conversion': return 'bg-green-500';
      case 'mobile': return 'bg-purple-500';
      case 'performance': return 'bg-orange-500';
      case 'visual': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Interactive Code Solutions
          </span>
          <Button 
            onClick={generateSolutions}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating...
              </>
            ) : (
              'Generate Solutions'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {solutions.length > 0 && (
          <div className="space-y-6">
            {solutions.map((solution) => (
              <Card key={solution.id} className="bg-slate-700 border-slate-600">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getTypeColor(solution.type)} text-white`}>
                          {solution.type}
                        </Badge>
                        <Badge variant="outline" className={getDifficultyColor(solution.difficulty)}>
                          {solution.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {solution.estimatedTime}
                        </div>
                      </div>
                      <h3 className="font-semibold text-white">{solution.title}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">{solution.impact}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="code">Code</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="preview" className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Badge variant="destructive" className="mb-2">Before</Badge>
                          <div className="bg-slate-900 p-4 rounded border">
                            <div dangerouslySetInnerHTML={{ __html: solution.beforeCode }} />
                          </div>
                        </div>
                        <div>
                          <Badge className="bg-green-600 mb-2">After</Badge>
                          <div className="bg-slate-900 p-4 rounded border">
                            <div dangerouslySetInnerHTML={{ __html: solution.afterCode }} />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="code" className="mt-4">
                      <Tabs defaultValue="after">
                        <TabsList>
                          <TabsTrigger value="before">Before Code</TabsTrigger>
                          <TabsTrigger value="after">After Code</TabsTrigger>
                        </TabsList>
                        <TabsContent value="before">
                          <div className="relative">
                            <pre className="bg-slate-900 p-4 rounded text-sm overflow-x-auto text-slate-200">
                              <code>{solution.beforeCode}</code>
                            </pre>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(solution.beforeCode)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </TabsContent>
                        <TabsContent value="after">
                          <div className="relative">
                            <pre className="bg-slate-900 p-4 rounded text-sm overflow-x-auto text-slate-200">
                              <code>{solution.afterCode}</code>
                            </pre>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(solution.afterCode)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="mt-4">
                            <Button className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              Download Complete Solution
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                    
                    <TabsContent value="details" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-white mb-2">Issue Addressed</h4>
                          <p className="text-slate-300 text-sm">{solution.issue}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-white mb-2">Explanation</h4>
                          <p className="text-slate-300 text-sm">{solution.explanation}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-white mb-2">Research Backing</h4>
                          <p className="text-slate-300 text-sm">{solution.researchBacking}</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {solutions.length === 0 && !loading && !error && (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">Generate code solutions to see interactive before/after examples</p>
            <p className="text-xs text-slate-500">
              Based on your analysis insights: {analysisInsights.slice(0, 3).join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { HybridSolutionEngine, SolutionResult } from '@/services/solutions/hybridSolutionEngine';
import { Annotation } from '@/types/analysis';

export const HybridSolutionEngineTest = () => {
  const [problemStatement, setProblemStatement] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SolutionResult | null>(null);

  const mockAnnotations: Annotation[] = [
    {
      id: '1',
      x: 100,
      y: 100,
      severity: 'critical',
      title: 'Poor Button Contrast',
      description: 'Submit button lacks sufficient color contrast for accessibility',
      feedback: 'The submit button has poor color contrast that fails WCAG guidelines',
      category: 'accessibility',
      implementationEffort: 'low',
      businessImpact: 'medium'
    },
    {
      id: '2', 
      x: 200,
      y: 200,
      severity: 'suggested',
      title: 'Form Field Spacing',
      description: 'Form fields need better spacing for mobile devices',
      feedback: 'Form field spacing could be improved for better mobile experience',
      category: 'ux',
      implementationEffort: 'medium',
      businessImpact: 'low'
    }
  ];

  const handleTest = async () => {
    if (!problemStatement.trim()) return;
    
    setIsLoading(true);
    try {
      const engine = new HybridSolutionEngine();
      const solutionResult = await engine.findSolutions({
        annotations: mockAnnotations,
        userProblemStatement: problemStatement,
        analysisContext: 'Testing hybrid solution engine with sample UI analysis'
      });
      
      setResult(solutionResult);
    } catch (error) {
      console.error('Error testing hybrid engine:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getApproachColor = (approach: string) => {
    switch (approach) {
      case 'problem_statement': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-blue-100 text-blue-800';  
      case 'traditional': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSolutionSourceColor = (source: string) => {
    return source === 'contextual' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Hybrid Solution Engine Test
            <Badge variant="outline">Testing Mode</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe your business challenge:
            </label>
            <Textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="e.g. Our signup conversion dropped 40% after adding credit card requirements"
              className="min-h-[100px]"
            />
          </div>
          
          <Button 
            onClick={handleTest} 
            disabled={!problemStatement.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing Hybrid Engine...' : 'Test Problem Statement Matching'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Solution Results
              <Badge className={getApproachColor(result.approach)}>
                {result.approach.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {Math.round(result.confidence * 100)}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Testing Data */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Testing Analytics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Traditional Solutions:</span>
                  <span className="font-semibold ml-2">{result.testingData.traditionalCount}</span>
                </div>
                <div>
                  <span className="text-blue-700">Contextual Solutions:</span>
                  <span className="font-semibold ml-2">{result.testingData.contextualCount}</span>
                </div>
              </div>
              
              {result.testingData.matchingDetails && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <div className="text-sm">
                    <div><strong>Matched Template:</strong> {result.testingData.matchingDetails.matchedTemplate?.statement.substring(0, 60)}...</div>
                    <div><strong>Matching Confidence:</strong> {Math.round(result.testingData.matchingDetails.matchingConfidence * 100)}%</div>
                  </div>
                </div>
              )}
            </div>

            {/* Solutions */}
            <div className="space-y-3">
              <h4 className="font-semibold">Generated Solutions:</h4>
              {result.solutions.map((solution, index) => (
                <Card key={solution.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold">{solution.title}</h5>
                      <div className="flex gap-2">
                        <Badge className={getSolutionSourceColor(solution.source)}>
                          {solution.source}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(solution.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{solution.description}</p>
                    
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Impact: <strong>{solution.businessImpact}</strong></span>
                      <span>Effort: <strong>{solution.implementationEffort}</strong></span>
                      <span>Category: <strong>{solution.category}</strong></span>
                    </div>

                    {solution.stakeholder_communication && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        <strong>Executive Summary:</strong> {solution.stakeholder_communication.executive_summary}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* User Satisfaction Prompt */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Testing Feedback Prompt</h4>
              <p className="text-yellow-800 text-sm">{result.testingData.userSatisfactionPrompt}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
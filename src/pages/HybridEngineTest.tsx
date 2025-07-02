import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HybridSolutionEngineTest } from '@/components/analysis/workflow/components/HybridSolutionEngineTest';

const HybridEngineTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <TestTube className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Hybrid Solution Engine Test
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Test problem statement matching and solution generation
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">About This Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p>
                This test demonstrates the hybrid solution engine that combines traditional UX analysis 
                with business context-aware problem statement matching.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                    Problem Statement Mode
                  </h4>
                  <p className="text-green-700 dark:text-green-300 text-xs">
                    High confidence match (&gt;75%) with business context solutions
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                    Hybrid Mode
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300 text-xs">
                    Combines contextual solutions with traditional UX analysis
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    Traditional Mode
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-xs">
                    Falls back to standard UX analysis when no match found
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Component */}
        <HybridSolutionEngineTest />

        {/* Example Problem Statements */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Example Problem Statements to Try</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">Conversion Issues:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• "Our signup conversion dropped 40% after adding credit card requirements"</li>
                  <li>• "Users abandon our checkout process at the payment step"</li>
                  <li>• "Free trial to paid conversion is below industry average"</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">Competitive Pressure:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• "A competitor launched a feature our customers are asking for"</li>
                  <li>• "We're losing users to a simpler alternative"</li>
                  <li>• "Our interface looks outdated compared to competitors"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HybridEngineTest;
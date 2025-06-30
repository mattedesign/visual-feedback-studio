
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useSubscription } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, ArrowLeft, Sparkles, Zap, Brain } from 'lucide-react';

interface UploadStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadStep = ({ workflow }: UploadStepProps) => {
  const { getRemainingAnalyses } = useSubscription();
  const remaining = getRemainingAnalyses();

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white border-gray-300 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl text-center font-bold text-gray-900">
            Upload Your Design Images
          </CardTitle>
          <p className="text-gray-700 text-center text-lg leading-relaxed">
            Use the sidebar to upload 2-5 images for AI-powered design analysis
          </p>
          
          {remaining <= 2 && remaining > 0 && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                You have {remaining} analysis{remaining !== 1 ? 'es' : ''} remaining in your current plan.
              </AlertDescription>
            </Alert>
          )}

          {workflow.currentAnalysis && (
            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Analysis session ready: {workflow.currentAnalysis.id}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center space-y-6">
            {/* Enhanced Visual Design */}
            <div className="relative">
              {/* Background gradient circle */}
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center relative overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                
                {/* Main icon container */}
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center relative z-10">
                  <Upload className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
                
                {/* Floating accent icons */}
                <div className="absolute top-2 right-6 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div className="absolute bottom-4 left-4 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                  <Zap className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="absolute top-6 left-2 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                  <Brain className="w-2 h-2 text-white" />
                </div>
              </div>
            </div>
            
            {/* Enhanced Text Content */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Analyze Your Design?
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
                Upload your design files to get started with AI-powered insights backed by 272+ UX research studies
              </p>
            </div>
            
            {/* Enhanced Call-to-Action */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center justify-center space-x-3 text-blue-700 mb-2">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Use the upload area in the left sidebar</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Multiple images</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>URL uploads</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Drag & drop</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

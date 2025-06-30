
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Upload, ArrowLeft, Sparkles, Zap, Brain } from 'lucide-react';

interface UploadCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadCanvasState = ({ workflow }: UploadCanvasStateProps) => {
  return (
    <div className="flex items-center justify-center h-full bg-slate-900">
      <div className="text-center space-y-6 max-w-2xl px-8">
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
          <h2 className="text-2xl font-bold text-white mb-2">
            Ready to Analyze Your Design?
          </h2>
          <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
            Upload your design files to get started with AI-powered insights backed by 272+ UX research studies
          </p>
        </div>
      </div>
    </div>
  );
};

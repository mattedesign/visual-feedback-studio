
import { UploadSection } from '@/components/upload/UploadSection';
import { PreviousAnalyses } from './PreviousAnalyses';
import { AnalysisWithFiles } from '@/services/analysisDataService';
import { Sparkles, Target, TrendingUp } from 'lucide-react';

interface WelcomeSectionProps {
  onImageUpload: (uploadedImageUrl: string) => void;
  analyses: AnalysisWithFiles[];
  onLoadAnalysis: (analysisId: string) => void;
  isLoadingAnalyses: boolean;
}

export const WelcomeSection = ({ 
  onImageUpload, 
  analyses, 
  onLoadAnalysis, 
  isLoadingAnalyses 
}: WelcomeSectionProps) => {
  return (
    <div className="min-h-screen gradient-blue-cyan text-white relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
      
      {/* Content */}
      <div className="relative z-10 container-modern section-padding">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="fade-in">
              <h1 className="heading-xl mb-6">
                <span className="text-gradient-primary">AI-Powered Design</span>
                <br />
                <span className="text-white">Intelligence Platform</span>
              </h1>
              <p className="body-lg text-white/90 mb-8 max-w-3xl mx-auto">
                Transform your designs from pretty pictures into strategic business solutions. 
                Get AI-powered feedback on UX, accessibility, and conversion optimization.
              </p>
              
              {/* Value propositions */}
              <div className="flex flex-wrap justify-center gap-8 text-white/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <span className="body-md">AI-Enhanced Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span className="body-md">User-Focused Solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pink-400" />
                  <span className="body-md">Revenue Optimization</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-2 slide-up">
              <div className="glass-card-dark rounded-2xl p-8 border-white/10">
                <h2 className="heading-md text-white mb-6">Start Your Analysis</h2>
                <UploadSection onImageUpload={onImageUpload} />
              </div>
            </div>
            
            <div className="lg:col-span-1 slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="glass-card-dark rounded-2xl p-6 border-white/10 h-full">
                <PreviousAnalyses 
                  analyses={analyses}
                  onLoadAnalysis={onLoadAnalysis}
                  isLoading={isLoadingAnalyses}
                />
              </div>
            </div>
          </div>

          {/* Bottom Message */}
          <div className="text-center max-w-3xl mx-auto fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="body-lg text-white/70">
              Stop being a pixel pusher. Start being a solution architect. 
              <br />
              <span className="text-gradient-orange font-semibold">
                AI won't replace you, but someone who knows how to use it will.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-white/5 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-1/3 right-20 w-16 h-16 bg-white/5 rounded-lg animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-white/5 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
    </div>
  );
};

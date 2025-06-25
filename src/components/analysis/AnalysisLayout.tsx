import { DesignViewer } from '@/components/viewer/DesignViewer';
import { FeedbackPanel } from '@/components/feedback/FeedbackPanel';
import { Annotation } from '@/types/analysis';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';

interface AnalysisLayoutProps {
  imageUrl: string;
  annotations: Annotation[];
  onAreaClick: (coordinates: { x: number; y: number }) => void;
  onAnalyzeClick: () => void;
  isAnalyzing: boolean;
  activeAnnotation: string | null;
  onAnnotationClick: (id: string) => void;
  onNewAnalysis: () => void;
  onDeleteAnnotation?: (id: string) => void;
}

export const AnalysisLayout = ({ children }: AnalysisLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            {children}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <SubscriptionStatus />
            
            {/* Other sidebar content can go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

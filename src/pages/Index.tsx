
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { UploadSection } from '@/components/upload/UploadSection';
import { DesignViewer } from '@/components/viewer/DesignViewer';
import { FeedbackPanel } from '@/components/feedback/FeedbackPanel';
import { Annotation } from '@/types/analysis';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  const handleImageUpload = async (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleAreaClick = async (coordinates: { x: number; y: number }) => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    
    // Simulate AI feedback generation
    setTimeout(() => {
      const newAnnotation: Annotation = {
        id: `annotation-${Date.now()}`,
        x: coordinates.x,
        y: coordinates.y,
        feedback: generateMockFeedback(),
        category: ['ux', 'visual', 'accessibility', 'conversion'][Math.floor(Math.random() * 4)] as any,
        severity: ['critical', 'suggested', 'enhancement'][Math.floor(Math.random() * 3)] as any,
        implementationEffort: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        businessImpact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      };
      
      setAnnotations(prev => [...prev, newAnnotation]);
      setActiveAnnotation(newAnnotation.id);
      setIsAnalyzing(false);
    }, 1500);
  };

  const generateMockFeedback = () => {
    const feedbacks = [
      "Consider increasing the contrast ratio of this text element to improve accessibility. The current contrast may not meet WCAG AA standards.",
      "This call-to-action button could be more prominent. Try using a stronger accent color or increasing the size to improve conversion rates.",
      "The spacing between these elements feels cramped. Adding more whitespace would improve visual hierarchy and readability.",
      "This image could benefit from proper alt text for screen readers. Consider the context and purpose when writing descriptive text.",
      "The font size here might be too small for mobile users. Consider using a minimum of 16px for body text on mobile devices.",
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!uploadedImage ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI-Powered Design Feedback
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Upload your designs and get intelligent feedback with interactive annotations. 
                Click anywhere on your design to receive contextual AI insights.
              </p>
            </div>
            <UploadSection onImageUpload={handleImageUpload} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            <div className="lg:col-span-3">
              <DesignViewer
                imageUrl={uploadedImage}
                annotations={annotations}
                onAreaClick={handleAreaClick}
                isAnalyzing={isAnalyzing}
                activeAnnotation={activeAnnotation}
                onAnnotationClick={setActiveAnnotation}
              />
            </div>
            <div className="lg:col-span-1">
              <FeedbackPanel
                annotations={annotations}
                activeAnnotation={activeAnnotation}
                onAnnotationSelect={setActiveAnnotation}
                onNewAnalysis={() => {
                  setUploadedImage('');
                  setAnnotations([]);
                  setActiveAnnotation(null);
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

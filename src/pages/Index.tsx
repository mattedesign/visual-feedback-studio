import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { UploadSection } from '@/components/upload/UploadSection';
import { DesignViewer } from '@/components/viewer/DesignViewer';
import { FeedbackPanel } from '@/components/feedback/FeedbackPanel';
import { Annotation } from '@/types/analysis';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string>('/lovable-uploads/21223d81-f4f7-4209-8d6a-f2f8f703d1d1.png');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  const handleImageUpload = async (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setAnnotations([]);
    setActiveAnnotation(null);
  };

  const handleAreaClick = async (coordinates: { x: number; y: number }) => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    
    // Simulate AI feedback generation with contextual feedback
    setTimeout(() => {
      const newAnnotation = generateContextualFeedback(coordinates);
      
      setAnnotations(prev => [...prev, newAnnotation]);
      setActiveAnnotation(newAnnotation.id);
      setIsAnalyzing(false);
    }, 1800);
  };

  const handleAnalyzeClick = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    
    // Generate comprehensive analysis
    setTimeout(() => {
      const initialAnnotations = generateInitialAnnotations();
      setAnnotations(initialAnnotations);
      setIsAnalyzing(false);
    }, 2500);
  };

  const generateInitialAnnotations = (): Annotation[] => {
    return [
      {
        id: 'initial-1',
        x: 25,
        y: 45,
        feedback: "The 'Get on in here.' heading could be more descriptive and action-oriented. Consider something like 'Join our community' or 'Create your account' to better communicate the value proposition and increase conversion rates.",
        category: 'conversion',
        severity: 'suggested',
        implementationEffort: 'low',
        businessImpact: 'medium',
      },
      {
        id: 'initial-2',
        x: 25,
        y: 65,
        feedback: "The email input field lacks proper validation indicators and error states. Adding real-time validation with clear success/error states can reduce form abandonment by up to 25% and improve user experience significantly.",
        category: 'ux',
        severity: 'critical',
        implementationEffort: 'medium',
        businessImpact: 'high',
      },
      {
        id: 'initial-3',
        x: 25,
        y: 85,
        feedback: "The 'Create account' button could benefit from better visual hierarchy. Consider making it larger (min 44px height for mobile) and using a more prominent color to follow conversion best practices and improve click-through rates.",
        category: 'conversion',
        severity: 'suggested',
        implementationEffort: 'low',
        businessImpact: 'high',
      },
      {
        id: 'initial-4',
        x: 70,
        y: 50,
        feedback: "The decorative illustration is engaging but lacks proper alt text for screen readers. Adding descriptive alt text improves accessibility compliance and SEO while maintaining the visual appeal for all users.",
        category: 'accessibility',
        severity: 'suggested',
        implementationEffort: 'low',
        businessImpact: 'low',
      }
    ];
  };

  const generateContextualFeedback = (coordinates: { x: number; y: number }): Annotation => {
    // Generate contextual feedback based on click location for the Figmant design
    const feedbackExamples = [
      // Left side form area (x < 50)
      ...(coordinates.x < 50 ? [
        {
          feedback: "Consider adding social proof elements like 'Join 10,000+ users' near the form to build trust and increase conversion rates. Social proof can improve sign-up rates by 15-20%.",
          category: 'conversion' as const,
          severity: 'enhancement' as const,
          implementationEffort: 'low' as const,
          businessImpact: 'high' as const,
        },
        {
          feedback: "The form layout could benefit from better spacing. Use consistent 16px or 24px margins between form elements to create better visual rhythm and reduce cognitive load.",
          category: 'visual' as const,
          severity: 'suggested' as const,
          implementationEffort: 'low' as const,
          businessImpact: 'medium' as const,
        },
        {
          feedback: "Add a password strength indicator to help users create secure passwords. This reduces password-related support tickets and improves account security significantly.",
          category: 'ux' as const,
          severity: 'enhancement' as const,
          implementationEffort: 'medium' as const,
          businessImpact: 'medium' as const,
        }
      ] : []),
      
      // Right side illustration area (x >= 50)
      ...(coordinates.x >= 50 ? [
        {
          feedback: "The illustration style is modern and appealing but could be optimized for loading performance. Consider using SVG format or WebP to reduce file size by 30-50% without quality loss.",
          category: 'ux' as const,
          severity: 'enhancement' as const,
          implementationEffort: 'medium' as const,
          businessImpact: 'medium' as const,
        },
        {
          feedback: "The colorful illustration creates good brand personality but ensure sufficient contrast with any overlaid text. The current design maintains good readability standards.",
          category: 'accessibility' as const,
          severity: 'suggested' as const,
          implementationEffort: 'low' as const,
          businessImpact: 'low' as const,
        },
        {
          feedback: "Consider making the illustration interactive or animated to increase user engagement. Subtle animations can improve time-on-page and create a more memorable experience.",
          category: 'ux' as const,
          severity: 'enhancement' as const,
          implementationEffort: 'high' as const,
          businessImpact: 'medium' as const,
        }
      ] : []),
      
      // General feedback
      {
        feedback: "The overall layout follows good design principles with clear visual hierarchy. The two-column layout effectively balances form functionality with visual appeal for better user engagement.",
        category: 'visual' as const,
        severity: 'enhancement' as const,
        implementationEffort: 'low' as const,
        businessImpact: 'low' as const,
      },
      {
        feedback: "Consider adding a loading state for the form submission to provide better user feedback. Users expect immediate visual confirmation when they submit forms.",
        category: 'ux' as const,
        severity: 'suggested' as const,
        implementationEffort: 'low' as const,
        businessImpact: 'medium' as const,
      }
    ];

    const relevantFeedback = feedbackExamples.filter(Boolean);
    const selectedFeedback = relevantFeedback[Math.floor(Math.random() * relevantFeedback.length)];

    return {
      id: `annotation-${Date.now()}`,
      x: coordinates.x,
      y: coordinates.y,
      ...selectedFeedback,
    };
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
                onAnalyzeClick={handleAnalyzeClick}
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

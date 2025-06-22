
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
    
    // Simulate AI analysis with some initial annotations
    setTimeout(() => {
      const initialAnnotations = generateInitialAnnotations();
      setAnnotations(initialAnnotations);
      setIsAnalyzing(false);
    }, 2500);
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

  const generateInitialAnnotations = (): Annotation[] => {
    return [
      {
        id: 'initial-1',
        x: 75,
        y: 15,
        feedback: "The navigation menu lacks sufficient color contrast (2.8:1 ratio). WCAG AA requires at least 4.5:1 for normal text. Consider using a darker background or lighter text color to improve accessibility for users with visual impairments.",
        category: 'accessibility',
        severity: 'critical',
        implementationEffort: 'low',
        businessImpact: 'high',
      },
      {
        id: 'initial-2',
        x: 50,
        y: 45,
        feedback: "This primary CTA button could be 23% larger to follow Fitts' Law for better usability. The current 32px height is below the recommended 44px minimum touch target for mobile devices. This affects conversion rates significantly.",
        category: 'conversion',
        severity: 'suggested',
        implementationEffort: 'low',
        businessImpact: 'high',
      },
      {
        id: 'initial-3',
        x: 25,
        y: 65,
        feedback: "The sidebar layout breaks on screens smaller than 768px. Consider implementing a collapsible hamburger menu or bottom navigation for mobile users. 68% of traffic comes from mobile devices according to industry standards.",
        category: 'ux',
        severity: 'critical',
        implementationEffort: 'medium',
        businessImpact: 'high',
      }
    ];
  };

  const generateContextualFeedback = (coordinates: { x: number; y: number }): Annotation => {
    // Generate contextual feedback based on click location
    const feedbackExamples = [
      // Header/Navigation area (y < 25)
      ...(coordinates.y < 25 ? [
        {
          feedback: "Consider adding a search icon to the header navigation. 40% of users expect search functionality to be easily accessible in the top navigation area. This can improve user engagement by 15-20%.",
          category: 'ux' as const,
          severity: 'enhancement' as const,
          implementationEffort: 'low' as const,
          businessImpact: 'medium' as const,
        },
        {
          feedback: "The logo lacks proper alt text for screen readers. Adding descriptive alt text like 'Company Name - Homepage' improves SEO and accessibility scores significantly.",
          category: 'accessibility' as const,
          severity: 'suggested' as const,
          implementationEffort: 'low' as const,
          businessImpact: 'low' as const,
        },
        {
          feedback: "Navigation links should have a visible focus state for keyboard users. Add a 2px outline or underline animation when focused to meet WCAG 2.1 guidelines.",
          category: 'accessibility' as const,
          severity: 'critical' as const,
          implementationEffort: 'low' as const,
          businessImpact: 'medium' as const,
        }
      ] : []),
      
      // Main content area (25 < y < 75)
      ...(coordinates.y >= 25 && coordinates.y < 75 ? [
        {
          feedback: "The text hierarchy needs improvement. Your H2 headings (24px) are too close in size to body text (16px). Increase H2 to at least 32px to create better visual hierarchy and improve readability.",
          category: 'visual' as const,
          severity: 'suggested' as const,
          implementationEffort: 'low' as const,
          businessImpact: 'medium' as const,
        },
        {
          feedback: "This content block has a low conversion potential. Consider adding social proof elements like testimonials or trust badges. Studies show this can increase conversion rates by 10-15%.",
          category: 'conversion' as const,
          severity: 'enhancement' as const,
          implementationEffort: 'medium' as const,
          businessImpact: 'high' as const,
        },
        {
          feedback: "The form fields lack proper error states. Implement real-time validation with clear error messages positioned below each field to reduce form abandonment by up to 25%.",
          category: 'ux' as const,
          severity: 'suggested' as const,
          implementationEffort: 'medium' as const,
          businessImpact: 'high' as const,
        },
        {
          feedback: "This image is missing proper loading states. Add skeleton loaders or blur-up transitions to improve perceived performance and reduce bounce rates on slower connections.",
          category: 'ux' as const,
          severity: 'enhancement' as const,
          implementationEffort: 'medium' as const,
          businessImpact: 'medium' as const,
        },
        {
          feedback: "Brand consistency issue detected. The button style doesn't match your brand guidelines. The rounded corners should be 8px to match your design system's border-radius standards.",
          category: 'brand' as const,
          severity: 'suggested' as const,
          implementationEffort: 'low' as const,
          businessImpact: 'low' as const,
        }
      ] : []),
      
      // Footer area (y >= 75)
      ...(coordinates.y >= 75 ? [
        {
          feedback: "Footer links should be organized in logical groups. Consider categorizing them into 'Company', 'Resources', and 'Legal' sections to improve scannability and reduce cognitive load.",
          category: 'ux' as const,
          severity: 'enhancement' as const,
          implementationEffort: 'low' as const,
          businessImpact: 'low' as const,
        },
        {
          feedback: "Missing essential footer elements like privacy policy and terms of service links. These are required for GDPR compliance and build user trust, especially for e-commerce sites.",
          category: 'conversion' as const,
          severity: 'critical' as const,
          implementationEffort: 'low' as const,
          businessImpact: 'medium' as const,
        }
      ] : []),
      
      // General feedback that can appear anywhere
      {
        feedback: "Consider implementing lazy loading for images in this section. This can improve page load times by 20-30% and boost your Core Web Vitals scores, directly impacting SEO rankings.",
        category: 'ux' as const,
        severity: 'enhancement' as const,
        implementationEffort: 'medium' as const,
        businessImpact: 'medium' as const,
      },
      {
        feedback: "The spacing between elements here feels inconsistent. Use multiples of 8px (8, 16, 24, 32px) for margins and padding to create better visual rhythm and professional appearance.",
        category: 'visual' as const,
        severity: 'suggested' as const,
        implementationEffort: 'low' as const,
        businessImpact: 'low' as const,
      },
      {
        feedback: "This interactive element lacks hover states. Adding subtle hover effects (like 5% opacity change or 2px lift) improves affordance and makes the interface feel more responsive.",
        category: 'ux' as const,
        severity: 'enhancement' as const,
        implementationEffort: 'low' as const,
        businessImpact: 'low' as const,
      },
    ];

    // Filter contextually relevant feedback and pick one
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

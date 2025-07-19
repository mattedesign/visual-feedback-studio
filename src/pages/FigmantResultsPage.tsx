
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFigmantResults, getFigmantSession } from '@/services/figmantAnalysisService';
import { FigmantImageGrid } from '@/components/analysis/figmant/FigmantImageGrid';
import { FigmantImageDetail } from '@/components/analysis/figmant/FigmantImageDetail';
import { ResultsContent } from '@/components/analysis/results/ResultsContent';
import { ResultsChat } from '@/components/analysis/results/ResultsChat';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface FigmantImage {
  id: string;
  file_path: string;
  file_name: string;
  upload_order: number;
}

const FigmantResultsPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'grid' | 'detail' | 'results'>('grid');
  const [selectedImage, setSelectedImage] = useState<FigmantImage | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadAnalysisResults();
    }
  }, [sessionId]);

  const loadAnalysisResults = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const [results, session] = await Promise.all([
        getFigmantResults(sessionId),
        getFigmantSession(sessionId)
      ]);
      setAnalysisData(results);
      setSessionData(session);
      
      // If we have analysis data, show results view by default
      if (results && session?.images?.length > 0) {
        setCurrentView('results');
        setSelectedImage(session.images[0]); // Select first image
      }
    } catch (error) {
      console.error('Failed to load analysis results:', error);
      toast.error('Failed to load analysis results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 animate-spin mx-auto mb-4 text-[#22757C]" />
          <h2 className="text-lg font-semibold mb-2">Loading Analysis Results</h2>
          <p className="text-muted-foreground">Please wait while we load your design analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysisData || !sessionData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-semibold mb-2">Analysis Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested analysis could not be found.</p>
          <Button onClick={() => navigate('/analyze')}>
            Start New Analysis
          </Button>
        </div>
      </div>
    );
  }

  const handleImageSelect = (image: FigmantImage) => {
    setSelectedImage(image);
    setCurrentView('results');
  };

  const handleBackToGrid = () => {
    setCurrentView('grid');
    setSelectedImage(null);
  };

  // Three-panel layout for results view
  if (currentView === 'results' && selectedImage) {
    return (
      <div className="h-full flex bg-[#F1F1F1]">
        {/* Left Panel - Main Content */}
        <div className="flex-1 overflow-hidden">
          <ResultsContent 
            analysisData={analysisData}
            sessionData={sessionData}
          />
        </div>
        
        {/* Right Panel - Chat */}
        <div className="w-80 border-l border-[#E2E2E2] overflow-hidden">
          <ResultsChat 
            analysisData={analysisData}
            sessionId={sessionId!}
          />
        </div>
      </div>
    );
  }

  // Show detail view
  if (currentView === 'detail' && selectedImage) {
    return (
      <FigmantImageDetail 
        image={selectedImage}
        analysisData={analysisData}
        onBack={handleBackToGrid}
      />
    );
  }

  // Show grid view
  if (sessionData?.images?.length > 0) {
    return (
      <div className="h-full">
        <FigmantImageGrid 
          images={sessionData.images}
          onImageSelect={handleImageSelect}
          analysisData={analysisData}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
        <h2 className="text-lg font-semibold mb-2">No Images Found</h2>
        <p className="text-muted-foreground mb-4">No images were found for this analysis session.</p>
        <Button onClick={() => navigate('/analyze')}>
          Start New Analysis
        </Button>
      </div>
    </div>
  );
};

export default FigmantResultsPage;

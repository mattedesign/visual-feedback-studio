import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, Download, Share2, ChevronLeft, ChevronRight, 
  ThumbsUp, AlertTriangle, Flame, Copy, Check, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const GoblinResults: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [results, setResults] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New state for enhancements
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!sessionId) return;

      try {
        const { data, error } = await supabase
          .from('goblin_analysis_results')
          .select(`
            *,
            goblin_analysis_sessions (*)
          `)
          .eq('session_id', sessionId)
          .single();

        if (error) throw error;
        setResults(data);

        // Fetch related images
        const { data: imageData, error: imageError } = await supabase
          .from('goblin_analysis_images')
          .select('*')
          .eq('session_id', sessionId)
          .order('upload_order');

        if (imageError) throw imageError;
        setImages(imageData);

      } catch (error) {
        console.error('Failed to load results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [sessionId]);

  // Helper functions for enhancements
  const handleExport = () => {
    if (!results || !session || !personaData) return;
    
    const exportData = {
      session: session.title,
      date: new Date().toISOString(),
      persona: session.persona_type,
      analysis: personaData.analysis,
      recommendations: personaData.recommendations,
      gripeLevel: results.goblin_gripe_level,
      biggestGripe: personaData.biggestGripe,
      whatMakesGoblinHappy: personaData.whatMakesGoblinHappy,
      goblinWisdom: personaData.goblinWisdom,
      goblinPrediction: personaData.goblinPrediction,
      priorityMatrix: results.priority_matrix,
      synthesissSummary: results.synthesis_summary
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `goblin-analysis-${session.id}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    toast.success('Analysis exported! 📥');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied! Share your goblin wisdom! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const getGripeEmoji = (level: string) => {
    switch(level) {
      case 'low': return '😤';
      case 'medium': return '🤬';
      case 'rage-cranked': return '🌋';
      default: return '👾';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">👾</div>
          <p className="text-lg text-gray-600">Loading goblin feedback...</p>
          <div className="mt-4 w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Results not found</h2>
          <p className="text-gray-600">The goblin might have eaten them... 👾</p>
        </div>
      </div>
    );
  }

  const session = results.goblin_analysis_sessions;
  const isGoblin = session.persona_type === 'clarity';
  const personaData = results.persona_feedback[session.persona_type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="relative">
              <Sparkles className={`w-8 h-8 ${isGoblin ? 'text-green-600' : 'text-purple-600'} animate-pulse`} />
              {isGoblin && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
              )}
            </div>
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${
              isGoblin ? 'from-green-600 to-emerald-600' : 'from-purple-600 to-pink-600'
            } bg-clip-text text-transparent`}>
              {isGoblin ? 'Goblin Analysis Complete! 👾' : 'Analysis Results'}
            </h1>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-xl">{session.title}</p>
          
          {/* Enhanced Gripe Level Indicator */}
          {isGoblin && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl">{getGripeEmoji(results.goblin_gripe_level)}</span>
              <div className="text-lg font-medium">
                Goblin Gripe Level: 
                <span className={`ml-2 font-bold ${
                  results.goblin_gripe_level === 'rage-cranked' ? 'text-red-600 animate-pulse' :
                  results.goblin_gripe_level === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {results.goblin_gripe_level?.toUpperCase()}
                </span>
              </div>
            </div>
          )}
          
          {/* Status Badges and Action Buttons */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge className={`${isGoblin ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'} text-white px-4 py-1`}>
                {session.persona_type.charAt(0).toUpperCase() + session.persona_type.slice(1)} Persona
              </Badge>
              <Badge variant="outline" className="px-4 py-1">
                {images.length} {images.length === 1 ? 'Screen' : 'Screens'} Analyzed
              </Badge>
              <Badge variant="outline" className="px-4 py-1">
                {session.analysis_mode} Mode
              </Badge>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export Results
              </Button>
              <Button onClick={handleCopyLink} variant="outline" size="sm" className="gap-2">
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Share
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Image Carousel */}
        {images.length > 0 && (
          <Card className="overflow-hidden mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Analyzed Screens</CardTitle>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAnnotations(!showAnnotations)}
                  >
                    {showAnnotations ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                    Annotations
                  </Button>
                  <span className="text-sm text-gray-500">
                    {currentImageIndex + 1} of {images.length}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-900">
                  <img
                    src={images[currentImageIndex].file_path}
                    alt={`Screen ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Overlays */}
                  {showAnnotations && (
                    <>
                      <Badge className="absolute top-4 left-4 bg-black/80 text-white backdrop-blur">
                        {images[currentImageIndex].screen_type || 'Interface'}
                      </Badge>
                      
                      {images[currentImageIndex].vision_metadata?.confidence && (
                        <div className="absolute top-4 right-4 bg-blue-500/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur">
                          {Math.round(images[currentImageIndex].vision_metadata.confidence * 100)}% Confident
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 shadow-lg"
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 shadow-lg"
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex 
                          ? 'border-green-500 scale-105 shadow-lg' 
                          : 'border-gray-300 hover:border-gray-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.file_path}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute bottom-1 right-1 text-xs text-white font-medium">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabbed Analysis Content */}
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis" className="mt-6">
            <Card className={`${isGoblin ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isGoblin ? 'text-green-900' : 'text-purple-900'}`}>
                  <span className="text-2xl">{isGoblin ? '👾' : '🎯'}</span>
                  {isGoblin ? 'Clarity\'s Goblin Feedback' : `${session.persona_type.charAt(0).toUpperCase() + session.persona_type.slice(1)} Analysis`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`whitespace-pre-wrap text-base leading-relaxed ${isGoblin ? 'text-green-800' : 'text-purple-800'}`}>
                  {personaData?.analysis || 'No analysis content available'}
                </div>
                
                {/* Biggest Gripe for Goblins */}
                {isGoblin && personaData?.biggestGripe && (
                  <div className="mt-6 p-4 bg-red-100 border-2 border-red-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900">Biggest Gripe:</h4>
                        <p className="text-red-800 mt-1">{personaData.biggestGripe}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* What Makes Goblin Happy */}
                {isGoblin && personaData?.whatMakesGoblinHappy && (
                  <div className="mt-4 p-4 bg-green-100 border-2 border-green-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ThumbsUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900">What Actually Works:</h4>
                        <p className="text-green-800 mt-1">{personaData.whatMakesGoblinHappy}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className={`${isGoblin ? 'text-green-900' : 'text-purple-900'}`}>
                  {isGoblin ? '🔧 Goblin-Approved Fixes' : '📋 Strategic Recommendations'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {personaData?.recommendations && (
                  <div className="space-y-3">
                    {personaData.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-all">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          isGoblin ? 'bg-green-500' : 'bg-purple-500'
                        }`}>
                          {index + 1}
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights" className="mt-6 space-y-6">
            {/* Goblin Wisdom */}
            {isGoblin && personaData?.goblinWisdom && (
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="text-purple-900">🔮 Ancient Goblin Wisdom</CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-lg italic text-purple-800 border-l-4 border-purple-400 pl-4">
                    "{personaData.goblinWisdom}"
                  </blockquote>
                </CardContent>
              </Card>
            )}
            
            {/* Goblin Prediction */}
            {isGoblin && personaData?.goblinPrediction && (
              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-600" />
                    Goblin's Dark Prophecy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    {personaData.goblinPrediction}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Summary */}
            {results.synthesis_summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800">{results.synthesis_summary}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Priority Matrix - Enhanced */}
        {results.priority_matrix && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-700 flex items-center gap-2">
                  ✅ What Works
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {results.priority_matrix.whatWorks?.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-green-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-700 flex items-center gap-2">
                  ❌ What Hurts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {results.priority_matrix.whatHurts?.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">✗</span>
                      <span className="text-red-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  🚀 What's Next
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {results.priority_matrix.whatNext?.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">→</span>
                      <span className="text-blue-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoblinResults;
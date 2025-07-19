import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MessageCircle, X, Lightbulb, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FigmantImage {
  id: string;
  file_path: string;
  file_name: string;
  upload_order: number;
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  title: string;
  content: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

interface ImageDetailProps {
  image: FigmantImage;
  analysisData?: any;
  onBack: () => void;
}

export function FigmantImageDetail({ image, analysisData, onBack }: ImageDetailProps) {
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

  const getImageUrl = (filePath: string) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return supabase.storage.from('analysis-images').getPublicUrl(filePath).data.publicUrl;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Extract real annotations from analysis data
  const getRealAnnotations = (): Annotation[] => {
    if (!analysisData?.claude_analysis || image.upload_order !== 1) return [];
    
    const claudeAnalysis = analysisData.claude_analysis;
    const criticalIssues = claudeAnalysis.criticalIssues || [];
    const recommendations = claudeAnalysis.recommendations || [];
    const accessibilityIssues = claudeAnalysis.accessibilityAudit?.issues || [];
    
    const annotations: Annotation[] = [];
    let annotationId = 1;
    
    // Add critical issues as annotations
    criticalIssues.forEach((issue: any, index: number) => {
      // Distribute positions across the image
      const positions = [
        { x: 25, y: 35 }, { x: 70, y: 25 }, { x: 80, y: 60 }, { x: 40, y: 75 }
      ];
      const pos = positions[index % positions.length];
      
      annotations.push({
        id: annotationId.toString(),
        x: pos.x,
        y: pos.y,
        title: issue.issue || issue.title || 'Critical Issue',
        content: issue.solution || issue.impact || issue.description || 'Critical issue identified',
        severity: 'critical',
        category: issue.category || 'Critical'
      });
      annotationId++;
    });
    
    // Add top recommendations as annotations
    recommendations.slice(0, 2).forEach((rec: any, index: number) => {
      const positions = [
        { x: 60, y: 45 }, { x: 30, y: 65 }
      ];
      const pos = positions[index];
      
      const severity = rec.effort === 'Low' ? 'low' : rec.effort === 'High' ? 'high' : 'medium';
      
      annotations.push({
        id: annotationId.toString(),
        x: pos.x,
        y: pos.y,
        title: rec.title || 'Recommendation',
        content: rec.description || 'Improvement recommendation',
        severity: severity as 'critical' | 'high' | 'medium' | 'low',
        category: rec.category || 'Improvement'
      });
      annotationId++;
    });
    
    return annotations;
  };

  const realAnnotations = getRealAnnotations();

  // Generate AI-powered insights as comments
  const getAIComments = () => {
    if (!analysisData?.claude_analysis?.executiveSummary) return [];
    
    return [{
      id: '1',
      author: 'Claude AI',
      avatar: 'AI',
      content: analysisData.claude_analysis.executiveSummary.slice(0, 120) + '...',
      timestamp: 'Analysis'
    }];
  };

  const aiComments = getAIComments();

  const getImageTitle = (image: FigmantImage) => {
    // Use filename without extension as title, cleaned up
    const nameWithoutExt = image.file_name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    const cleanName = nameWithoutExt.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return cleanName || `Image ${image.upload_order}`;
  };

  const overallScore = analysisData?.claude_analysis?.overallScore || 72;
  const issues = analysisData?.claude_analysis?.criticalIssues || [];
  const recommendations = analysisData?.claude_analysis?.recommendations || [];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#E2E2E2]">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Grid
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-[#121212]">{getImageTitle(image)}</h1>
            <p className="text-sm text-[#7B7B7B]">
              {realAnnotations.length} Annotations • Overall Score: {overallScore}/100
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 relative">
        <div className="relative max-w-4xl max-h-full">
            <img 
              src={getImageUrl(image.file_path)}
              alt={getImageTitle(image)}
              className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
            />
            
            {/* Annotation Markers */}
            {realAnnotations.map((annotation) => (
              <button
                key={annotation.id}
                className="absolute w-8 h-8 bg-[#22757C] text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg hover:scale-110 transition-transform"
                style={{ 
                  left: `${annotation.x}%`, 
                  top: `${annotation.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => setSelectedAnnotation(annotation)}
              >
                {annotation.id}
              </button>
            ))}

            {/* AI Analysis Comments Overlay */}
            {aiComments.map((comment, index) => (
              <div
                key={comment.id}
                className="absolute bg-white rounded-lg shadow-lg p-3 max-w-xs"
                style={{
                  left: '65%',
                  top: '45%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-[#22757C] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                  <button 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => {/* Close comment */}}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 border-l border-[#E2E2E2] bg-white">
          <Tabs defaultValue="summary" className="h-full">
            <TabsList className="grid w-full grid-cols-2 m-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="ideas">Ideas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="px-4 pb-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Analysis Overview</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Score</span>
                    <span className="font-semibold">{overallScore}/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Critical Issues</span>
                    <span className="font-semibold text-red-600">
                      {analysisData?.claude_analysis?.criticalIssues?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Recommendations</span>
                    <span className="font-semibold text-blue-600">
                      {analysisData?.claude_analysis?.recommendations?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Accessibility Issues</span>
                    <span className="font-semibold text-orange-600">
                      {analysisData?.claude_analysis?.accessibilityAudit?.issues?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Annotation Details */}
              {selectedAnnotation && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getSeverityIcon(selectedAnnotation.severity)}
                    <h4 className="font-semibold">{selectedAnnotation.title}</h4>
                    <Badge className={`text-xs ${getSeverityColor(selectedAnnotation.severity)}`}>
                      {selectedAnnotation.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{selectedAnnotation.content}</p>
                  <Badge variant="outline" className="text-xs">
                    {selectedAnnotation.category}
                  </Badge>
                </Card>
              )}

              {/* All Annotations List */}
              <div>
                <h3 className="font-semibold mb-2">All Annotations ({realAnnotations.length})</h3>
                <div className="space-y-2">
                  {realAnnotations.map((annotation) => (
                    <div 
                      key={annotation.id}
                      className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedAnnotation(annotation)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#22757C] text-white rounded-full flex items-center justify-center text-xs">
                          {annotation.id}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{annotation.title}</div>
                          <div className="text-xs text-gray-500">{annotation.category}</div>
                        </div>
                        {getSeverityIcon(annotation.severity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ideas" className="px-4 pb-4">
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 text-[#22757C] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">AI Recommendations</h3>
                  <p className="text-sm text-gray-600">
                    Based on the analysis, here are some improvement suggestions for this design.
                  </p>
                </div>

                {analysisData?.claude_analysis?.recommendations?.length > 0 && (
                  <div className="space-y-3">
                    {analysisData.claude_analysis.recommendations.slice(0, 3).map((rec: any, index: number) => (
                      <Card key={index} className="p-3">
                        <h4 className="font-medium text-sm mb-1">{rec.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                          <Badge variant="secondary" className="text-xs">{rec.effort} effort</Badge>
                          {rec.timeline && (
                            <Badge variant="outline" className="text-xs">{rec.timeline}</Badge>
                          )}
                        </div>
                        {rec.expectedImpact && (
                          <p className="text-xs text-green-600 mt-1">💡 {rec.expectedImpact}</p>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
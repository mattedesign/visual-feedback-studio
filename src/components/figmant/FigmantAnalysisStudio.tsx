import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FigmantAnalysisStudioProps {
  onAnalysisComplete?: (analysisId: string) => void;
}

export function FigmantAnalysisStudio({ onAnalysisComplete }: FigmantAnalysisStudioProps) {
  const { subscription, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const handleFileUpload = async (files: FileList) => {
    if (!subscription?.canAnalyze) {
      toast.error('Analysis limit reached. Please upgrade your plan.');
      return;
    }

    if (files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log('📸 Starting image upload and analysis...');

      // Create session first
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('figmant-create-session', {
        body: {
          sessionId,
          title: `UX Analysis - ${new Date().toLocaleDateString()}`,
          industry: 'Technology',
          designType: 'UI/UX Design',
          businessGoals: ['Improve User Experience', 'Increase Conversions']
        }
      });

      if (sessionError || !sessionData?.success) {
        throw new Error(sessionData?.error || 'Failed to create session');
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;

          // Upload image
          const { data: uploadData, error: uploadError } = await supabase.functions.invoke('figmant-upload-image', {
            body: {
              sessionId,
              imageFile: base64,
              fileName: file.name,
              fileSize: file.size
            }
          });

          if (uploadError || !uploadData?.success) {
            throw new Error(uploadData?.error || 'Failed to upload image');
          }

          setUploadedImages([uploadData.image]);
          console.log('✅ Image uploaded successfully');

          // Start analysis
          console.log('🧠 Starting AI analysis...');
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke('figmant-analyze-design', {
            body: { sessionId }
          });

          if (analysisError || !analysisData?.success) {
            throw new Error(analysisData?.error || 'Analysis failed');
          }

          setAnalysisResults(analysisData.analysis);
          toast.success('Analysis completed successfully!');
          console.log('✅ Analysis completed:', analysisData.analysis);

          // Refresh subscription data
          await refreshSubscription();

          if (onAnalysisComplete) {
            onAnalysisComplete(sessionId);
          }
          
          // Redirect to results page
          navigate(`/analysis-results/${sessionId}`);

        } catch (error) {
          console.error('Analysis error:', error);
          toast.error(error instanceof Error ? error.message : 'Analysis failed');
        } finally {
          setIsAnalyzing(false);
        }
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
      setIsAnalyzing(false);
    }
  };

  const renderAnalysisResults = () => {
    if (!analysisResults) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-3xl font-bold text-primary">
                  {analysisResults.overallScore || 75}/100
                </div>
                <div className="text-sm text-muted-foreground">Overall UX Score</div>
              </div>
              <p className="text-foreground leading-relaxed">
                {analysisResults.executiveSummary || "Analysis completed successfully. See detailed findings below."}
              </p>
            </div>
          </CardContent>
        </Card>

        {analysisResults.criticalIssues?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Critical Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResults.criticalIssues.slice(0, 3).map((issue: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        issue.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                        issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {issue.severity?.toUpperCase()}
                      </span>
                      <span className="text-sm text-muted-foreground">{issue.category}</span>
                    </div>
                    <h4 className="font-semibold mb-2">{issue.issue}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{issue.impact}</p>
                    <div className="bg-teal-50 border border-teal-200 rounded p-3">
                      <p className="text-sm font-medium text-teal-900 mb-1">Recommended Solution:</p>
                      <p className="text-sm text-teal-700">{issue.solution}</p>
                    </div>
                    {issue.implementationTime && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        ⏱ Implementation time: {issue.implementationTime}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {analysisResults.recommendations?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Key Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResults.recommendations.slice(0, 3).map((rec: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.category === 'Quick Wins' ? 'bg-green-100 text-green-700' :
                        rec.category === 'Strategic' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {rec.category}
                      </span>
                      <span className="text-sm text-muted-foreground">{rec.effort} effort</span>
                    </div>
                    <h4 className="font-semibold mb-2">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    <div className="text-xs text-muted-foreground">
                      📈 Expected impact: {rec.expectedImpact} | ⏱ Timeline: {rec.timeline}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Figmant AI UX Analysis</h1>
        <p className="text-muted-foreground">
          Get expert-level UX analysis powered by Claude Sonnet 4 and Google Vision
        </p>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">
                  Plan: {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
                </span>
                <span className="text-sm text-muted-foreground ml-4">
                  {subscription.analysesUsed}/{subscription.analysesLimit} analyses used
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(subscription.analysesUsed / subscription.analysesLimit) * 100}%` }}
                  />
                </div>
                {!subscription.canAnalyze && (
                  <Button size="sm" variant="outline">
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Design for Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              {isAnalyzing ? 'Analyzing your design...' : 'Drop your design here or click to upload'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PNG, JPG, WebP up to 10MB
            </p>
            
            {isAnalyzing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing with AI...</span>
              </div>
            ) : (
              <Button disabled={!subscription?.canAnalyze}>
                {subscription?.canAnalyze ? 'Select File' : 'Upgrade to Analyze'}
              </Button>
            )}
            
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              disabled={isAnalyzing || !subscription?.canAnalyze}
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium truncate">{image.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(image.file_size / 1024).toFixed(1)}KB • 
                    {image.google_vision_processed ? ' AI Processed' : ' Processing...'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {renderAnalysisResults()}
    </div>
  );
}
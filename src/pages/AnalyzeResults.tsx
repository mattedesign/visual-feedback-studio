import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react'

export default function AnalyzeResults() {
  const params = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isMultiModel, setIsMultiModel] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadSession(params.id)
    }
  }, [params.id])

  const loadSession = async (sessionId: string) => {
    try {
      // Initial load
      const { data, error } = await supabase
        .from('analysis_sessions')
        .select('*, analysis_session_images(*)')
        .eq('id', sessionId)
        .single()

      if (error) {
        console.error('Error loading session:', error)
        setLoading(false)
        return
      }

      if (data) {
        setSession(data)
        
        // Determine if this is multi-model analysis
        setIsMultiModel(!!data.multimodel_results)
        
        console.log('Session loaded:', {
          id: data.id,
          hasMultimodel: !!data.multimodel_results,
          hasClaude: !!data.claude_results,
          imageCount: data.analysis_session_images?.length
        })
        
        // Poll for completion if still processing
        if (data.status === 'processing') {
          const interval = setInterval(async () => {
            const { data: updated } = await supabase
              .from('analysis_sessions')
              .select('*, analysis_session_images(*)')
              .eq('id', sessionId)
              .single()

            if (updated) {
              setSession(updated)
              setIsMultiModel(!!updated.multimodel_results)
              
              if (updated.status !== 'processing') {
                clearInterval(interval)
              }
            }
          }, 2000)

          // Clean up interval on unmount
          return () => clearInterval(interval)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get the appropriate results based on single vs multi-model
  const getAnalysisResults = () => {
    if (isMultiModel && session?.multimodel_results) {
      console.log('Using multi-model results')
      return session.multimodel_results
    }
    console.log('Using Claude results')
    return session?.claude_results
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Session not found</h1>
        <Button onClick={() => navigate('/analyze')}>
          Start New Analysis
        </Button>
      </div>
    )
  }

  // Still processing
  if (session.status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Analyzing your designs...</h2>
        <p className="text-muted-foreground">This usually takes 30-60 seconds</p>
      </div>
    )
  }

  const results = getAnalysisResults()

  // Error state - no results at all
  if (session.status === 'error' || (!results && !session.claude_results && !session.multimodel_results)) {
    return (
      <div className="container mx-auto p-6 text-center">
        <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Analysis Failed</h1>
        <p className="text-muted-foreground mb-6">Something went wrong during the analysis.</p>
        <Button onClick={() => navigate('/analyze')}>
          Try Again
        </Button>
      </div>
    )
  }

  // Log what we're working with
  console.log('Results structure:', {
    isMultiModel,
    hasImageAnalysis: !!results?.imageAnalysis,
    imageAnalysisCount: results?.imageAnalysis?.length,
    selectedImage,
    hasZoneFeedback: !!results?.imageAnalysis?.[selectedImage]?.zoneFeedback
  })

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/analyze')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
          <h1 className="text-3xl font-bold">Analysis Results</h1>
        </div>
        <div className="flex items-center gap-2">
          {isMultiModel && (
            <Badge variant="outline" className="text-blue-600">
              Multi-Model Analysis
            </Badge>
          )}
          <Badge variant="outline" className="text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="summary">Overall Summary</TabsTrigger>
          <TabsTrigger value="annotations">Image Feedback</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          {isMultiModel && results ? (
            <div className="space-y-4">
              {/* Confidence Badge */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Multi-Model Analysis</h2>
                {results.metadata?.confidence && (
                  <Badge variant="outline" className="text-green-600">
                    {Math.round(results.metadata.confidence * 100)}% Confidence
                  </Badge>
                )}
              </div>
              
              {/* Models Used */}
              {results.metadata?.modelsUsed && (
                <div className="text-sm text-gray-600">
                  Analysis by: {results.metadata.modelsUsed.join(', ')}
                </div>
              )}
              
              {/* Summary Card */}
              <Card className="p-6">
                <h3 className="font-semibold mb-3">Analysis Summary</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {results.summary?.overallAssessment || 'Analysis completed'}
                </p>
              </Card>
              
              {/* Key Findings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Strengths */}
                <Card className="p-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {results.summary?.keyStrengths?.map((strength: string, idx: number) => (
                      <li key={idx} className="text-green-700 dark:text-green-300 text-sm">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Critical Issues */}
                <Card className="p-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    Critical Issues
                  </h3>
                  <ul className="space-y-2">
                    {results.summary?.criticalIssues?.map((issue: string, idx: number) => (
                      <li key={idx} className="text-red-700 dark:text-red-300 text-sm">
                        • {issue}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Quick Wins */}
                <Card className="p-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Quick Wins
                  </h3>
                  <ul className="space-y-2">
                    {results.summary?.quickWins?.map((win: string, idx: number) => (
                      <li key={idx} className="text-blue-700 dark:text-blue-300 text-sm">
                        • {win}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Compound Insights (if available) */}
              {results.insights && results.insights.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-3">Detailed Insights</h3>
                  {results.insights.slice(0, 5).map((insight: any, idx: number) => (
                    <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg last:mb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{insight.description}</p>
                          {insight.evidence && (
                            <div className="mt-2 text-xs text-gray-600">
                              {insight.evidence.agreement_score && (
                                <span>Agreement: {Math.round(insight.evidence.agreement_score * 100)}% • </span>
                              )}
                              {insight.evidence.perspectives && (
                                <span>Sources: {insight.evidence.perspectives.length} models</span>
                              )}
                            </div>
                          )}
                        </div>
                        <Badge className={
                          insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                          insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {insight.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          ) : (
            <>
              {/* Single Model Results (Claude) */}
              {/* Overall Assessment */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Overall Assessment</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{results?.summary?.overallAssessment}</p>
              </Card>

              {/* Key Findings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Strengths */}
                <Card className="p-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {results?.summary?.keyStrengths?.map((strength: string, idx: number) => (
                      <li key={idx} className="text-green-700 dark:text-green-300 text-sm">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Critical Issues */}
                <Card className="p-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    Critical Issues
                  </h3>
                  <ul className="space-y-2">
                    {results?.summary?.criticalIssues?.map((issue: string, idx: number) => (
                      <li key={idx} className="text-red-700 dark:text-red-300 text-sm">
                        • {issue}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Quick Wins */}
                <Card className="p-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Quick Wins
                  </h3>
                  <ul className="space-y-2">
                    {results?.summary?.quickWins?.map((win: string, idx: number) => (
                      <li key={idx} className="text-blue-700 dark:text-blue-300 text-sm">
                        • {win}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Immediate Actions</h4>
                    <ul className="space-y-1">
                      {results?.recommendations?.immediate?.map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Short Term (1-2 weeks)</h4>
                    <ul className="space-y-1">
                      {results?.recommendations?.shortTerm?.map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Long Term (1-3 months)</h4>
                    <ul className="space-y-1">
                      {results?.recommendations?.longTerm?.map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Annotations Tab - UPDATED FOR ZONE FEEDBACK */}
        <TabsContent value="annotations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Display */}
            <Card className="p-4">
              <div className="relative">
                <img
                  src={session.analysis_session_images[selectedImage]?.storage_url}
                  alt={`Design ${selectedImage + 1}`}
                  className="w-full rounded-lg"
                />
                
                {/* Zone Grid Overlay */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  {['top-left', 'top-center', 'top-right',
                    'middle-left', 'middle-center', 'middle-right',
                    'bottom-left', 'bottom-center', 'bottom-right'].map((zone) => {
                    const feedbacks = results?.imageAnalysis?.[selectedImage]?.zoneFeedback?.[zone] || []
                    return (
                      <div
                        key={zone}
                        className={`border border-dashed transition-all ${
                          feedbacks.length > 0
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        }`}
                      >
                        {feedbacks.length > 0 && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                            {feedbacks.length}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Image selector */}
              {session.analysis_session_images.length > 1 && (
                <div className="flex gap-2 mt-4 justify-center flex-wrap">
                  {session.analysis_session_images.map((_: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        idx === selectedImage
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      Image {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Feedback Panel */}
            <Card className="p-6 max-h-[600px] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">Zone Feedback</h3>
              
              {/* Debug info - remove in production */}
              <div className="text-xs text-muted-foreground mb-2">
                Image {selectedImage + 1} of {session.analysis_session_images.length}
                {isMultiModel && ' (Multi-Model)'}
              </div>
              
              <div className="space-y-4">
                {(() => {
                  const currentImageAnalysis = results?.imageAnalysis?.[selectedImage]
                  const zoneFeedback = currentImageAnalysis?.zoneFeedback || {}
                  const hasAnyFeedback = Object.values(zoneFeedback).some((f: any) => f && f.length > 0)

                  if (!hasAnyFeedback) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-2">
                          No specific feedback for this image
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {!results?.imageAnalysis ? 'Analysis data not found' :
                           results.imageAnalysis.length <= selectedImage ? 'Image analysis missing' :
                           'No zone feedback available'}
                        </p>
                      </div>
                    )
                  }

                  return Object.entries(zoneFeedback).map(([zone, feedbacks]: [string, any]) => {
                    if (!feedbacks || feedbacks.length === 0) return null
                    
                    return (
                      <div key={zone} className="bg-muted rounded-lg p-4">
                        <h4 className="font-medium mb-2 capitalize">
                          {zone.replace('-', ' ')}
                        </h4>
                        {feedbacks.map((feedback: any, idx: number) => (
                          <div key={idx} className="mb-3 last:mb-0 bg-background rounded p-3">
                            <p className="text-sm text-foreground mb-2">{feedback.feedback}</p>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  feedback.severity === 'high'
                                    ? 'text-destructive border-destructive'
                                    : feedback.severity === 'medium'
                                    ? 'text-yellow-600 border-yellow-300 dark:text-yellow-400 dark:border-yellow-600'
                                    : 'text-green-600 border-green-300 dark:text-green-400 dark:border-green-600'
                                }`}
                              >
                                {feedback.severity} priority
                              </Badge>
                              {isMultiModel && feedback.source && (
                                <Badge variant="outline" className="text-xs">
                                  via {feedback.source}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })
                })()}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
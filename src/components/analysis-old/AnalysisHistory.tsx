import React, { useEffect, useState } from 'react';
import { Clock, Eye, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserAnalysisHistory, AnalysisResultsResponse } from '@/services/analysisResultsService';
import { toast } from 'sonner';

export const AnalysisHistory = () => {
  const [analyses, setAnalyses] = useState<AnalysisResultsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    try {
      setIsLoading(true);
      const history = await getUserAnalysisHistory();
      setAnalyses(history);
    } catch (error) {
      console.error('Failed to load analysis history:', error);
      toast.error('Failed to load analysis history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewAnalysis = (analysisId: string) => {
    window.location.href = `/analysis/${analysisId}?beta=true`;
  };

  const getAnalysisPreview = (analysis: AnalysisResultsResponse) => {
    const context = analysis.analysis_context || 'No context provided';
    return context.length > 100 ? context.substring(0, 100) + '...' : context;
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No analyses yet</p>
            <p className="text-sm">Start your first analysis to see it here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Analysis History ({analyses.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-300 font-medium">
                  {analysis.total_annotations} insights found
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-500 text-sm">
                  {analysis.images.length} image{analysis.images.length !== 1 ? 's' : ''}
                </span>
                {analysis.knowledge_sources_used > 0 && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span className="text-blue-400 text-sm">
                      {analysis.knowledge_sources_used} research sources
                    </span>
                  </>
                )}
              </div>
              
              <p className="text-slate-400 text-sm mb-2 truncate">
                {getAnalysisPreview(analysis)}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(analysis.created_at)}</span>
                <span>•</span>
                <span>{analysis.ai_model_used}</span>
                {analysis.well_done_data && (
                  <>
                    <span>•</span>
                    <span className="text-green-400">Well Done insights</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                onClick={() => viewAnalysis(analysis.analysis_id)}
                variant="outline"
                size="sm"
                className="border-slate-600 hover:bg-slate-600 text-slate-200"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>
          </div>
        ))}
        
        {analyses.length > 0 && (
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              All analyses are automatically saved to your account
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
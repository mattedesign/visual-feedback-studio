
import React, { useEffect, useState } from 'react';
import { Clock, Eye, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUnifiedAnalysisHistory, UnifiedAnalysisHistory, getAnalysisViewUrl } from '@/services/unifiedHistoryService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const AnalysisHistory = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<UnifiedAnalysisHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    try {
      setIsLoading(true);
      const history = await getUnifiedAnalysisHistory();
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

  const viewAnalysis = (analysis: UnifiedAnalysisHistory) => {
    const url = getAnalysisViewUrl(analysis);
    navigate(url);
  };

  const getAnalysisPreview = (analysis: UnifiedAnalysisHistory) => {
    const context = analysis.analysis_context || analysis.title || 'No context provided';
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
                  {analysis.insight_count || 0} insights found
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-500 text-sm">
                  {analysis.images.length} image{analysis.images.length !== 1 ? 's' : ''}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-purple-400 text-sm capitalize">
                  {analysis.type} analysis
                </span>
              </div>
              
              <p className="text-slate-400 text-sm mb-2 truncate">
                {getAnalysisPreview(analysis)}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(analysis.created_at)}</span>
                <span>•</span>
                <span>{analysis.ai_model_used}</span>
                <span>•</span>
                <span className={`capitalize ${
                  analysis.status === 'completed' ? 'text-green-400' : 
                  analysis.status === 'processing' ? 'text-yellow-400' : 
                  analysis.status === 'failed' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {analysis.status}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                onClick={() => viewAnalysis(analysis)}
                variant="outline"
                size="sm"
                className="border-slate-600 hover:bg-slate-600 text-slate-200"
                disabled={!analysis.hasResults}
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

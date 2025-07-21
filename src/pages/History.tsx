import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, BarChart3, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUnifiedAnalysisHistory, UnifiedAnalysisHistory, getAnalysisViewUrl } from '@/services/unifiedHistoryService';
import { toast } from 'sonner';

const History = () => {
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

  const handleViewAnalysis = (analysis: UnifiedAnalysisHistory) => {
    const url = getAnalysisViewUrl(analysis);
    navigate(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
        <p className="text-gray-600 mt-2">View all your recent UX analyses</p>
      </div>

      {analyses.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
          <p className="text-gray-600 mb-4">Start your first analysis to see your history here</p>
          <Button onClick={() => navigate('/analyze')}>
            Create New Analysis
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((analysis) => (
            <Card 
              key={analysis.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleViewAnalysis(analysis)}
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {analysis.title || analysis.analysis_context || 'UX Analysis'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(analysis.status)}`}
                      >
                        {analysis.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {analysis.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Preview Image */}
                {analysis.images && analysis.images.length > 0 && (
                  <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={analysis.images[0]}
                      alt="Analysis preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>{analysis.insight_count || 0} insights</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Image className="h-4 w-4" />
                    <span>{analysis.images?.length || 0} images</span>
                  </div>
                </div>

                {/* Context Preview */}
                {analysis.analysis_context && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {analysis.analysis_context}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(analysis.created_at)}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!analysis.hasResults}
                    className="group-hover:bg-blue-50 group-hover:border-blue-200"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
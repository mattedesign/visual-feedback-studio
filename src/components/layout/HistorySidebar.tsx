
import React, { useState, useEffect } from 'react';
import { X, Eye, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUserAnalysisHistory, AnalysisResultsResponse } from '@/services/analysisResultsService';
import { useNavigate } from 'react-router-dom';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisResultsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadRecentAnalyses();
    }
  }, [isOpen]);

  const loadRecentAnalyses = async () => {
    try {
      setIsLoading(true);
      const history = await getUserAnalysisHistory();
      // Show only the 10 most recent analyses
      setAnalyses(history.slice(0, 10));
    } catch (error) {
      console.error('Failed to load analysis history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getAnalysisTitle = (analysis: AnalysisResultsResponse) => {
    const context = analysis.analysis_context || 'UX Analysis';
    return context.length > 30 ? context.substring(0, 30) + '...' : context;
  };

  const handleViewAnalysis = (analysisId: string) => {
    navigate(`/analysis/${analysisId}?beta=true`);
    onClose();
  };

  const handleViewAllHistory = () => {
    navigate('/');
    onClose();
  };

  // Helper function to determine analysis status
  const getAnalysisStatus = (analysis: AnalysisResultsResponse) => {
    // Since AnalysisResultsResponse doesn't have analysis_status, 
    // we'll assume completed if it has annotations and images
    if (analysis.total_annotations > 0 && analysis.images?.length > 0) {
      return 'completed';
    }
    return 'processing';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 z-50 h-full w-96 bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Analyses
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-slate-700 rounded-lg">
                      <div className="w-12 h-12 bg-gray-300 dark:bg-slate-600 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-4">No analyses yet</p>
                <Button
                  onClick={() => {
                    // 🔧 FIX: Clear persistent state before new analysis
                    sessionStorage.removeItem('consultationResults');
                    sessionStorage.removeItem('userProblemStatement');
                    Object.keys(localStorage).forEach(key => {
                      if (key.startsWith('strategist_context_')) {
                        localStorage.removeItem(key);
                      }
                    });
                    console.log('🔄 NEW ANALYSIS: Cleared state from history sidebar');
                    navigate('/analysis');
                    onClose();
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Start First Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map((analysis) => {
                  const analysisStatus = getAnalysisStatus(analysis);
                  
                  return (
                    <div
                      key={analysis.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      onClick={() => handleViewAnalysis(analysis.analysis_id)}
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-12 bg-gray-200 dark:bg-slate-600 rounded-lg overflow-hidden flex-shrink-0">
                        {analysis.images && analysis.images.length > 0 ? (
                          <img
                            src={analysis.images[0]}
                            alt="Analysis thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {getAnalysisTitle(analysis)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(analysis.created_at)}</span>
                          </div>
                          <Badge
                            variant={analysisStatus === 'completed' ? 'default' : 'secondary'}
                            className="text-xs py-0 px-2"
                          >
                            {analysisStatus === 'completed' ? 'Complete' : 'Processing'}
                          </Badge>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {analysis.total_annotations} insights • {analysis.images?.length || 0} images
                        </div>
                      </div>
                      
                      {/* View button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAnalysis(analysis.analysis_id);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleViewAllHistory}
            >
              View All History
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

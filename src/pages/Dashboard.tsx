
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUserAnalysisHistory, AnalysisResultsResponse } from '@/services/analysisResultsService';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisResultsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing'>('all');

  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    try {
      setIsLoading(true);
      const history = await getUserAnalysisHistory();
      console.log('🔍 DASHBOARD DEBUG - Analysis history loaded:', {
        count: history.length,
        sampleData: history.slice(0, 3).map(item => ({
          id: item.id,
          analysis_id: item.analysis_id,
          images: item.images,
          imagesLength: item.images?.length,
          imagesType: typeof item.images,
          total_annotations: item.total_annotations
        }))
      });
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
      year: 'numeric'
    });
  };

  const getAnalysisPreview = (analysis: AnalysisResultsResponse) => {
    const context = analysis.analysis_context || 'UX Analysis';
    return context.length > 50 ? context.substring(0, 50) + '...' : context;
  };

  // Helper function to determine analysis status
  const getAnalysisStatus = (analysis: AnalysisResultsResponse) => {
    if (analysis.total_annotations > 0 && analysis.images?.length > 0) {
      return 'completed';
    }
    return 'processing';
  };

  // 🚀 FIXED: Simplified image count calculation with proper TypeScript handling
  const calculateImageCount = (analysis: AnalysisResultsResponse): number => {
    console.log(`🔍 IMAGE COUNT - Analysis ${analysis.analysis_id}:`, {
      images: analysis.images,
      imagesType: typeof analysis.images,
      isArray: Array.isArray(analysis.images),
      length: analysis.images?.length
    });

    // Since images is typed as string[] | null, handle accordingly
    if (!analysis.images || !Array.isArray(analysis.images)) {
      return 0;
    }

    return analysis.images.length;
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.analysis_context?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const analysisStatus = getAnalysisStatus(analysis);
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'completed' && analysisStatus === 'completed') ||
      (filterStatus === 'processing' && analysisStatus === 'processing');
    
    return matchesSearch && matchesFilter;
  });

  const handleNewAnalysis = () => {
    navigate('/analysis');
  };

  const handleViewAnalysis = (analysisId: string) => {
    navigate(`/analysis/${analysisId}?beta=true`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage and review your UX analysis history
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/hybrid-engine-test')}
              variant="outline"
              size="lg"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              🧪 Test Hybrid Engine
            </Button>
            
            <Button
              onClick={handleNewAnalysis}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Analysis
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search analyses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </Button>
            <Button
              variant={filterStatus === 'processing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('processing')}
            >
              Processing
            </Button>
          </div>
        </div>

        {/* Analysis Grid */}
        {filteredAnalyses.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {analyses.length === 0 ? 'No analyses yet' : 'No matching analyses'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {analyses.length === 0 
                ? 'Start your first UX analysis to see results here'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {analyses.length === 0 && (
              <Button
                onClick={handleNewAnalysis}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Analysis
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyses.map((analysis) => {
              const analysisStatus = getAnalysisStatus(analysis);
              const imageCount = calculateImageCount(analysis);
              
              console.log('🎯 DASHBOARD CARD RENDER:', {
                analysisId: analysis.analysis_id,
                imageCount,
                totalAnnotations: analysis.total_annotations,
                status: analysisStatus,
              });
              
              return (
                <Card
                  key={analysis.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-slate-700"
                  onClick={() => handleViewAnalysis(analysis.analysis_id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {getAnalysisPreview(analysis)}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(analysis.created_at)}</span>
                        </div>
                      </div>
                      <Badge
                        variant={analysisStatus === 'completed' ? 'default' : 'secondary'}
                        className={analysisStatus === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {analysisStatus === 'completed' ? 'Complete' : 'Processing'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Thumbnail - Only show if we have images */}
                    {imageCount > 0 && analysis.images && analysis.images[0] && (
                      <div className="w-full h-32 bg-gray-100 dark:bg-slate-800 rounded-lg mb-4 overflow-hidden">
                        <img
                          src={analysis.images[0]}
                          alt="Analysis preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('🔍 Image failed to load:', analysis.images?.[0]);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* 🚀 FIXED: Clean metrics display */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Insights Found
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {analysis.total_annotations}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Images Analyzed
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {imageCount}
                        </span>
                      </div>
                      
                      {analysis.knowledge_sources_used && analysis.knowledge_sources_used > 0 && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Research Sources
                          </span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {analysis.knowledge_sources_used}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAnalysis(analysis.analysis_id);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Analysis
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

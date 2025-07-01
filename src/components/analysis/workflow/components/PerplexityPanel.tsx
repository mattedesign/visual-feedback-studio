import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { perplexityService } from '@/services/perplexityService';
import { PerplexityResearchResponse, PerplexityCompetitiveAnalysis } from '@/types/perplexity';
import { useState } from 'react';
import { Globe, Search, TrendingUp, Users, ExternalLink, Loader2 } from 'lucide-react';

interface PerplexityPanelProps {
  designContext?: string;
  onResearchUpdate?: (data: any) => void;
  className?: string;
}

export const PerplexityPanel = ({
  designContext,
  onResearchUpdate,
  className = ''
}: PerplexityPanelProps) => {
  const [researchQuery, setResearchQuery] = useState('');
  const [researchData, setResearchData] = useState<PerplexityResearchResponse | null>(null);
  const [competitiveData, setCompetitiveData] = useState<PerplexityCompetitiveAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'research' | 'competitive'>('research');

  const isPerplexityEnabled = useFeatureFlag('perplexity-integration');

  // Only render if Perplexity integration is enabled
  if (!isPerplexityEnabled) {
    return null;
  }

  const handleResearch = async () => {
    if (!researchQuery.trim()) return;

    setIsLoading(true);
    try {
      console.log('🔍 Starting Perplexity research...', { query: researchQuery });

      const response = await perplexityService.researchTopic({
        query: researchQuery,
        context: designContext,
        domain: 'ux',
        recencyFilter: 'month',
        maxSources: 5
      });

      setResearchData(response);
      onResearchUpdate?.(response);

      console.log('✅ Perplexity research completed', {
        success: response.success,
        sourcesCount: response.sources?.length || 0
      });
    } catch (error) {
      console.error('❌ Perplexity research failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompetitiveAnalysis = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Starting competitive analysis...');

      const analysisQuery = designContext 
        ? `UX competitive analysis for ${designContext}` 
        : 'Current UX design trends and competitive patterns';

      const response = await perplexityService.getCompetitiveAnalysis(
        analysisQuery,
        'technology' // Default industry
      );

      setCompetitiveData(response);
      onResearchUpdate?.(response);

      console.log('✅ Competitive analysis completed', {
        competitorsCount: response.competitors?.length || 0,
        trendsCount: response.industryTrends?.length || 0
      });
    } catch (error) {
      console.error('❌ Competitive analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-purple-900 dark:text-purple-100">
              Real-Time UX Research
            </CardTitle>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Validate insights with current industry research
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === 'research' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('research')}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Research
          </Button>
          <Button
            variant={activeTab === 'competitive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('competitive')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Competitive
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeTab === 'research' && (
          <>
            {/* Research Input */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about UX trends, validate patterns, research best practices..."
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleResearch}
                  disabled={isLoading || !researchQuery.trim()}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Research
                </Button>
              </div>

              {designContext && (
                <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 p-2 rounded">
                  <strong>Context:</strong> {designContext}
                </div>
              )}
            </div>

            {/* Research Results */}
            {researchData && researchData.success && (
              <div className="space-y-4">
                <Separator />
                
                {/* Content */}
                {researchData.content && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Research Insights</h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {researchData.content}
                    </p>
                  </div>
                )}

                {/* Sources */}
                {researchData.sources && researchData.sources.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Current Sources ({researchData.sources.length})
                    </h5>
                    <div className="space-y-2">
                      {researchData.sources.slice(0, 3).map((source, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h6 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                                {source.title}
                              </h6>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {source.snippet}
                              </p>
                              <Badge variant="outline" className="text-xs mt-2">
                                {source.domain}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="ml-2 flex-shrink-0"
                            >
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Questions */}
                {researchData.relatedQuestions && researchData.relatedQuestions.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Related Research Topics</h5>
                    <div className="flex flex-wrap gap-2">
                      {researchData.relatedQuestions.slice(0, 3).map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setResearchQuery(question);
                            handleResearch();
                          }}
                          className="text-xs"
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'competitive' && (
          <>
            {/* Competitive Analysis Trigger */}
            <div className="space-y-3">
              <Button 
                onClick={handleCompetitiveAnalysis}
                disabled={isLoading}
                className="w-full flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                Analyze Current UX Trends
              </Button>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                Get real-time competitive insights and industry trends
              </p>
            </div>

            {/* Competitive Results */}
            {competitiveData && (
              <div className="space-y-4">
                <Separator />
                
                {/* Industry Trends */}
                {competitiveData.industryTrends && competitiveData.industryTrends.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Current Trends ({competitiveData.industryTrends.length})
                    </h5>
                    <div className="space-y-2">
                      {competitiveData.industryTrends.slice(0, 3).map((trend, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h6 className="font-medium text-gray-900 dark:text-white text-sm">
                                {trend.trend}
                              </h6>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {trend.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={`text-xs ${
                                  trend.impact === 'high' ? 'border-red-500 text-red-700' :
                                  trend.impact === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                  'border-green-500 text-green-700'
                                }`}>
                                  {trend.impact} impact
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {trend.timeframe}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {competitiveData.recommendations && competitiveData.recommendations.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Strategic Recommendations</h5>
                    <div className="space-y-2">
                      {competitiveData.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Beta Footer */}
        <Separator />
        <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
          <Globe className="w-3 h-3" />
          <span>Real-time UX intelligence • Powered by Perplexity.ai</span>
          <Badge variant="outline" className="text-xs">BETA</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
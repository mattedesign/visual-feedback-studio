
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Brain, Search, TrendingUp, Shield, Smartphone, Monitor, Tablet } from 'lucide-react';

interface EnhancedContextDisplayProps {
  enhancedContext?: {
    visionAnalysis?: {
      industry?: {
        industry: string;
        confidence: number;
      };
      layout?: {
        type: string;
        confidence: number;
      };
      deviceType?: {
        type: string;
        confidence: number;
      };
    };
    confidenceScore?: number;
    knowledgeSourcesUsed?: number;
    citations?: string[];
  };
  ragEnhanced?: boolean;
  knowledgeSourcesUsed?: number;
  researchCitations?: string[];
  visionEnhanced?: boolean;
  visionConfidenceScore?: number;
  visionElementsDetected?: number;
}

export const EnhancedContextDisplay = ({
  enhancedContext,
  ragEnhanced,
  knowledgeSourcesUsed,
  researchCitations,
  visionEnhanced,
  visionConfidenceScore,
  visionElementsDetected
}: EnhancedContextDisplayProps) => {
  const vision = enhancedContext?.visionAnalysis;
  const totalKnowledgeSources = (knowledgeSourcesUsed || 0) + (enhancedContext?.knowledgeSourcesUsed || 0);
  const totalCitations = [...(researchCitations || []), ...(enhancedContext?.citations || [])];
  const overallConfidence = visionConfidenceScore || enhancedContext?.confidenceScore;
  const isEnhanced = visionEnhanced || ragEnhanced || !!enhancedContext;

  // Don't render if no enhanced context is available
  if (!isEnhanced) {
    return null;
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'e-commerce':
      case 'ecommerce':
        return '🛒';
      case 'finance':
      case 'banking':
        return '💳';
      case 'healthcare':
        return '🏥';
      case 'education':
        return '📚';
      case 'travel':
        return '✈️';
      case 'real estate':
        return '🏠';
      default:
        return '🏢';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Analysis Context Section */}
      {(visionEnhanced || vision) && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-600" />
              Enhanced Analysis Context
              <Badge className="bg-blue-600 text-white text-xs font-bold">
                AI Vision Powered
              </Badge>
            </CardTitle>
            <p className="text-sm text-blue-700">
              Advanced context detection using Google Vision AI and industry pattern recognition
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Detected Industry */}
              {vision?.industry && (
                <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getIndustryIcon(vision.industry.industry)}</span>
                    <h4 className="font-semibold text-gray-900">Industry Detected</h4>
                  </div>
                  <p className="text-lg font-bold text-blue-700 capitalize">
                    {vision.industry.industry}
                  </p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-2 ${getConfidenceColor(vision.industry.confidence)}`}>
                    {Math.round(vision.industry.confidence * 100)}% confidence
                  </div>
                </div>
              )}

              {/* Layout Type */}
              {vision?.layout && (
                <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Layout Type</h4>
                  </div>
                  <p className="text-lg font-bold text-purple-700 capitalize">
                    {vision.layout.type}
                  </p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-2 ${getConfidenceColor(vision.layout.confidence)}`}>
                    {Math.round(vision.layout.confidence * 100)}% confidence
                  </div>
                </div>
              )}

              {/* Device Type */}
              {vision?.deviceType && (
                <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    {getDeviceIcon(vision.deviceType.type)}
                    <h4 className="font-semibold text-gray-900">Device Type</h4>
                  </div>
                  <p className="text-lg font-bold text-indigo-700 capitalize">
                    {vision.deviceType.type}
                  </p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-2 ${getConfidenceColor(vision.deviceType.confidence)}`}>
                    {Math.round(vision.deviceType.confidence * 100)}% confidence
                  </div>
                </div>
              )}
            </div>

            {/* Overall Confidence Score */}
            {overallConfidence && (
              <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Overall Analysis Confidence</h4>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-lg font-bold border ${getConfidenceColor(overallConfidence)}`}>
                    {Math.round(overallConfidence * 100)}%
                  </div>
                </div>
                {visionElementsDetected && (
                  <p className="text-sm text-gray-600 mt-2">
                    Analyzed {visionElementsDetected} UI elements with computer vision
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Research-Backed Insights Section */}
      {(ragEnhanced || totalKnowledgeSources > 0) && (
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-emerald-900 flex items-center gap-3">
              <Brain className="w-6 h-6 text-emerald-600" />
              Research-Backed Insights
              <Badge className="bg-emerald-600 text-white text-xs font-bold">
                Evidence-Based
              </Badge>
            </CardTitle>
            <p className="text-sm text-emerald-700">
              Analysis enhanced with UX research, industry best practices, and competitive intelligence
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Knowledge Sources Summary */}
            <div className="bg-white rounded-lg p-4 border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5 text-emerald-600" />
                <h4 className="font-semibold text-gray-900">Knowledge Sources Retrieved</h4>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Research entries used:</span>
                <Badge className="bg-emerald-100 text-emerald-800 text-lg font-bold px-3 py-1">
                  {totalKnowledgeSources}
                </Badge>
              </div>
              {totalCitations.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Research Sources:</h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {totalCitations.slice(0, 10).map((citation, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-600 font-medium min-w-0 w-6">
                          {index + 1}.
                        </span>
                        <span className="text-gray-700 truncate">
                          {citation}
                        </span>
                      </div>
                    ))}
                    {totalCitations.length > 10 && (
                      <p className="text-xs text-gray-500 italic pl-8">
                        +{totalCitations.length - 10} more research sources
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Analysis Benefits */}
            <div className="bg-white rounded-lg p-4 border border-emerald-100 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3">Enhancement Benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visionEnhanced && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Computer vision analysis
                  </div>
                )}
                {ragEnhanced && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Research-backed recommendations
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Industry-specific insights
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Competitive benchmarking
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

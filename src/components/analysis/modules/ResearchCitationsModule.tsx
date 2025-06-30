
import React, { useState } from 'react';
import { Brain, Search, BookOpen, ExternalLink, Award, CheckCircle } from 'lucide-react';
import { BusinessAnalysisData } from '@/types/businessImpact';

interface ResearchCitationsModuleProps {
  analysisData: BusinessAnalysisData;
}

export const ResearchCitationsModule: React.FC<ResearchCitationsModuleProps> = ({ analysisData }) => {
  const [selectedCategory, setSelectedCategory] = useState('overview');
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  // Extract research data from enhancedContext
  const knowledgeSourcesUsed = analysisData.enhancedContext?.knowledgeSourcesUsed || 0;
  const citations = analysisData.enhancedContext?.citations || [];
  const researchContext = analysisData.enhancedContext?.researchContext || '';
  
  // Collect all research backing from annotations
  const allResearchBacking = analysisData.annotations?.reduce((acc, annotation) => {
    if (annotation.researchCitations) {
      acc.push(...annotation.researchCitations);
    }
    return acc;
  }, [] as string[]) || [];
  
  // Remove duplicates and combine with citations
  const uniqueResearchSources = [...new Set([...citations, ...allResearchBacking])];
  
  // Calculate research confidence
  const annotationsWithResearch = analysisData.annotations?.filter(ann => 
    ann.researchCitations && ann.researchCitations.length > 0
  ) || [];
  const averageConfidence = annotationsWithResearch.length > 0 
    ? annotationsWithResearch.reduce((sum, ann) => sum + (ann.confidence || 0.8), 0) / annotationsWithResearch.length 
    : 0.8;

  // Categorize research sources
  const researchCategories = {
    'Primary Research Institutions': [
      'Nielsen Norman Group',
      'Baymard Institute',
      'UX Research Institute',
      'Google UX Research',
      'Microsoft Research',
      'Apple Human Interface'
    ],
    'Academic Sources': [
      'MIT Technology Review',
      'Stanford HCI Group',
      'Carnegie Mellon HCII',
      'ACM Digital Library',
      'IEEE Computer Society',
      'Harvard Business Review'
    ],
    'Industry Standards': [
      'W3C Accessibility Guidelines',
      'Apple Human Interface Guidelines',
      'Material Design Guidelines',
      'Microsoft Fluent Design',
      'IBM Design Language',
      'Shopify Polaris'
    ]
  };

  const categorizeSource = (source: string) => {
    for (const [category, sources] of Object.entries(researchCategories)) {
      if (sources.some(s => source.toLowerCase().includes(s.toLowerCase()))) {
        return category;
      }
    }
    return 'Industry Best Practices';
  };

  // Handle missing research data gracefully
  if (!analysisData || (!knowledgeSourcesUsed && uniqueResearchSources.length === 0)) {
    return (
      <div className="research-citations-module h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No Research Data Available
          </h2>
          <p className="text-gray-500 dark:text-gray-500">
            This analysis was completed without enhanced research context.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="research-citations-module h-screen bg-white dark:bg-slate-900 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Research-Backed Analysis
            </h1>
            <div className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 px-3 py-1 rounded-full text-sm font-medium">
              Evidence-Based
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Analysis enhanced with {knowledgeSourcesUsed} research sources, industry best practices, and competitive intelligence
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Research Authority Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Research Sources Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Search className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Research Sources</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">{knowledgeSourcesUsed}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Authoritative UX sources</p>
            </div>

            {/* Research Confidence Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Confidence Score</h3>
              </div>
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                {Math.round(averageConfidence * 100)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Research backing strength</p>
            </div>

            {/* Citations Available Card */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Citations Available</h3>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">{uniqueResearchSources.length}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Unique research citations</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-slate-700">
            {['overview', 'sources', 'methodology', 'citations'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  selectedCategory === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setSelectedCategory(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on selected tab */}
        {selectedCategory === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                How Analysis Works
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>AI model trained on 1000+ research papers and UX best practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Pattern matching against established UX principles and guidelines</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Confidence scoring based on research consensus and evidence strength</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Citations provided for stakeholder credibility and implementation confidence</span>
                </li>
              </ul>
            </div>

            {researchContext && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Research Context for This Analysis
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {researchContext.substring(0, 500)}
                  {researchContext.length > 500 && '...'}
                </p>
              </div>
            )}

            {/* Limitations and Transparency */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Limitations and Assumptions
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                <li>• Research is current as of analysis date and may not reflect latest industry changes</li>
                <li>• Recommendations are based on general UX principles and may need industry-specific validation</li>
                <li>• Consider consulting with human UX experts for critical business decisions</li>
                <li>• Knowledge base is updated regularly but may not include all recent research</li>
              </ul>
            </div>
          </div>
        )}

        {selectedCategory === 'sources' && (
          <div className="space-y-6">
            {Object.entries(researchCategories).map(([category, sources]) => {
              const usedSources = sources.filter(source => 
                uniqueResearchSources.some(used => used.toLowerCase().includes(source.toLowerCase()))
              );
              
              if (usedSources.length === 0) return null;
              
              return (
                <div key={category} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {category} ({usedSources.length} used)
                  </h3>
                  <div className="grid gap-3">
                    {usedSources.map((source, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-900 dark:text-white font-medium">{source}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto cursor-pointer hover:text-gray-600" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Show uncategorized sources if any */}
            {uniqueResearchSources.filter(source => 
              !Object.values(researchCategories).flat().some(knownSource => 
                source.toLowerCase().includes(knownSource.toLowerCase())
              )
            ).length > 0 && (
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Additional Research Sources
                </h3>
                <div className="grid gap-3">
                  {uniqueResearchSources
                    .filter(source => 
                      !Object.values(researchCategories).flat().some(knownSource => 
                        source.toLowerCase().includes(knownSource.toLowerCase())
                      )
                    )
                    .map((source, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-900 dark:text-white font-medium">{source}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto cursor-pointer hover:text-gray-600" />
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {selectedCategory === 'methodology' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quality Assurance Process
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Research Recency</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average publication date within last 3 years for current best practices</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Source Authority</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ratings based on industry recognition, peer review, and research impact</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Cross-Validation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Multiple source confirmation when available to ensure reliability</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Transparency</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Full citations provided for verification and further reading</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Research Integration Process
              </h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p>• <strong>Context Analysis:</strong> Analyze uploaded designs for industry, layout type, and user context</p>
                <p>• <strong>Knowledge Retrieval:</strong> Query research database for relevant UX principles and guidelines</p>
                <p>• <strong>Pattern Matching:</strong> Match visual elements against established UX best practices</p>
                <p>• <strong>Evidence Synthesis:</strong> Combine multiple research sources to support recommendations</p>
                <p>• <strong>Confidence Scoring:</strong> Calculate reliability based on research consensus and evidence strength</p>
              </div>
            </div>
          </div>
        )}

        {selectedCategory === 'citations' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Research Citations ({uniqueResearchSources.length})
              </h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm transition-colors">
                Download Citation Library
              </button>
            </div>
            
            <div className="space-y-2">
              {uniqueResearchSources.map((source, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {index + 1}. {source}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Category: {categorizeSource(source)}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 ml-4 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
            
            {uniqueResearchSources.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <h4 className="font-medium mb-2">No research citations available</h4>
                <p className="text-sm">This analysis was completed without enhanced research context.</p>
              </div>
            )}
          </div>
        )}

        {/* Stakeholder Sharing Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Stakeholder Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 text-sm font-medium transition-colors">
              Send Research Summary to Team
            </button>
            <button className="border border-gray-300 dark:border-gray-600 px-4 py-3 rounded hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors">
              Download Citation Library (BibTeX)
            </button>
            <button className="border border-gray-300 dark:border-gray-600 px-4 py-3 rounded hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors">
              Verify Sources Checklist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

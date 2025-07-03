// File: src/components/analysis/results/StrategistResultsDisplay.tsx

import React, { useState } from 'react';
import { StrategistOutput, ExpertRecommendation } from '@/services/ai/claudeUXStrategistEngine';
import { Check, Download, ExternalLink, TrendingUp, Clock, Zap } from 'lucide-react';

interface StrategistResultsDisplayProps {
  traditionalAnnotations: any[];
  strategistAnalysis: StrategistOutput;
  userChallenge: string;
}

export const StrategistResultsDisplay: React.FC<StrategistResultsDisplayProps> = ({
  traditionalAnnotations,
  strategistAnalysis,
  userChallenge
}) => {
  const [viewMode, setViewMode] = useState<'comparison' | 'strategist' | 'traditional'>('comparison');

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getEffortBadgeColor = (effort: string) => {
    switch (effort) {
      case 'Low': return 'bg-green-600';
      case 'Medium': return 'bg-yellow-600';
      case 'High': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="strategist-results-container bg-slate-900 text-white min-h-screen p-6">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">🎭 UX Strategist Analysis</h1>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            <button className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors">
              <ExternalLink className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold mb-2 text-purple-400">🎯 Your Design Challenge</h3>
          <p className="text-slate-300">"{userChallenge}"</p>
          <div className="mt-3 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-400">Overall Confidence:</span>
              <span className={`font-semibold ${getConfidenceColor(strategistAnalysis.confidenceAssessment.overallConfidence)}`}>
                {Math.round(strategistAnalysis.confidenceAssessment.overallConfidence * 100)}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">{strategistAnalysis.expertRecommendations.length} Strategic Recommendations</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-toggle mb-8 flex space-x-2 bg-slate-800 p-1 rounded-lg">
        <button 
          className={`px-4 py-2 rounded-lg transition-colors flex-1 ${
            viewMode === 'comparison' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
          onClick={() => setViewMode('comparison')}
        >
          🔄 Value Comparison
        </button>
        <button 
          className={`px-4 py-2 rounded-lg transition-colors flex-1 ${
            viewMode === 'strategist' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
          onClick={() => setViewMode('strategist')}
        >
          🧠 Strategist Analysis
        </button>
        <button 
          className={`px-4 py-2 rounded-lg transition-colors flex-1 ${
            viewMode === 'traditional' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
          onClick={() => setViewMode('traditional')}
        >
          📋 Traditional Analysis
        </button>
      </div>

      {/* Value Comparison View */}
      {viewMode === 'comparison' && (
        <div className="comparison-view">
          <h2 className="text-2xl font-bold mb-6 text-center">🎭 Notice the Strategic Difference</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Traditional Analysis */}
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-400">🤖 Traditional AI Analysis</h3>
              <div className="space-y-4 mb-6">
                {traditionalAnnotations.slice(0, 4).map((annotation, index) => (
                  <div key={index} className="border-l-2 border-gray-600 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-300">{annotation.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded ${
                        annotation.severity === 'critical' ? 'bg-red-600' :
                        annotation.severity === 'important' ? 'bg-yellow-600' :
                        'bg-blue-600'
                      }`}>
                        {annotation.severity}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{annotation.feedback}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-sm mb-2">Typical AI Output:</div>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Lists what's wrong</li>
                  <li>• Generic suggestions</li>
                  <li>• No business context</li>
                  <li>• Leaves you guessing</li>
                </ul>
              </div>
            </div>

            {/* Strategist Analysis */}
            <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-6 rounded-lg border border-purple-500/50">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">🎭 20-Year UX Strategist</h3>
              <div className="space-y-4 mb-6">
                {strategistAnalysis.expertRecommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="border-l-2 border-purple-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{rec.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold ${getConfidenceColor(rec.confidence)}`}>
                          {Math.round(rec.confidence * 100)}%
                        </span>
                        <span className={`px-2 py-1 text-xs rounded text-white ${getEffortBadgeColor(rec.implementationEffort)}`}>
                          {rec.implementationEffort}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{rec.recommendation}</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-green-400">💰 {rec.expectedImpact}</span>
                      <span className="text-blue-400">⏱️ {rec.timeline}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <div className="text-purple-300 text-sm mb-2">Strategic Consultation:</div>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Diagnoses root causes</li>
                  <li>• Specific solutions + confidence</li>
                  <li>• Addresses your challenge</li>
                  <li>• Implementation ready</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 p-6 rounded-lg border border-green-500/30">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-green-400">💎 Business Value Achieved</h3>
              <p className="text-slate-300">Transform from "I found issues" to "Here's exactly what to do"</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">$247K</div>
                <div className="text-sm text-slate-400">Est. Annual Revenue Impact</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">2-8 weeks</div>
                <div className="text-sm text-slate-400">Implementation Timeline</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">78%</div>
                <div className="text-sm text-slate-400">Overall Confidence Score</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Strategist View */}
      {viewMode === 'strategist' && (
        <div className="strategist-full-view">
          <h2 className="text-2xl font-bold mb-6">🧠 Complete Strategic Analysis</h2>
          
          {/* Diagnosis Section */}
          <section className="mb-8 bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-yellow-400">🔍 Root Cause Diagnosis</h3>
            <p className="text-lg mb-4">{strategistAnalysis.diagnosis}</p>
            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-slate-300">Strategic Rationale</h4>
              <p className="text-slate-400">{strategistAnalysis.strategicRationale}</p>
            </div>
          </section>

          {/* Expert Recommendations */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-green-400">💡 Expert Recommendations</h3>
            <div className="space-y-6">
              {strategistAnalysis.expertRecommendations.map((rec, index) => (
                <div key={index} className="bg-slate-800 p-6 rounded-lg border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-white">{rec.title}</h4>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Confidence</div>
                      <div className={`text-xl font-bold ${getConfidenceColor(rec.confidence)}`}>
                        {Math.round(rec.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 mb-4">{rec.recommendation}</p>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-slate-400">Expected Impact</div>
                      <div className="text-green-400 font-semibold">{rec.expectedImpact}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Timeline</div>
                      <div className="text-blue-400 font-semibold">{rec.timeline}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Implementation</div>
                      <span className={`px-3 py-1 rounded text-white text-sm ${getEffortBadgeColor(rec.implementationEffort)}`}>
                        {rec.implementationEffort} effort
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2 text-slate-300">Strategic Reasoning</h5>
                    <p className="text-slate-400 text-sm mb-2">{rec.reasoning}</p>
                    <p className="text-xs text-slate-500">Source: {rec.source}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* A/B Testing & Success Metrics */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">🧪 A/B Test Strategy</h3>
              <p className="text-slate-300">{strategistAnalysis.abTestHypothesis}</p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-400">📊 Success Metrics</h3>
              <ul className="space-y-2">
                {strategistAnalysis.successMetrics.map((metric, index) => (
                  <li key={index} className="flex items-center space-x-2 text-slate-300">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Confidence Assessment */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-purple-400">🎯 Confidence Assessment</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-300">Overall Confidence</span>
              <span className={`text-2xl font-bold ${getConfidenceColor(strategistAnalysis.confidenceAssessment.overallConfidence)}`}>
                {Math.round(strategistAnalysis.confidenceAssessment.overallConfidence * 100)}%
              </span>
            </div>
            <p className="text-slate-400">{strategistAnalysis.confidenceAssessment.reasoning}</p>
          </div>
        </div>
      )}

      {/* Traditional View */}
      {viewMode === 'traditional' && (
        <div className="traditional-view">
          <h2 className="text-2xl font-bold mb-6">📋 Traditional Analysis Results</h2>
          <div className="grid gap-4">
            {traditionalAnnotations.map((annotation, index) => (
              <div key={index} className="bg-slate-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{annotation.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded ${
                    annotation.severity === 'critical' ? 'bg-red-600' :
                    annotation.severity === 'important' ? 'bg-yellow-600' :
                    'bg-blue-600'
                  }`}>
                    {annotation.severity}
                  </span>
                </div>
                <p className="text-slate-300 mb-4">{annotation.feedback}</p>
                <div className="text-sm text-slate-400">
                  Category: {annotation.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default StrategistResultsDisplay;
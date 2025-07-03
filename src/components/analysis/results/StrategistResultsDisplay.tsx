// File: src/components/analysis/results/StrategistResultsDisplay.tsx

import React, { useState } from 'react';
import { StrategistOutput, ExpertRecommendation } from '@/services/ai/claudeUXStrategistEngine';

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

  return (
    <div className="strategist-results-container bg-slate-900 text-white min-h-screen p-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🎭 UX Strategist Analysis Results</h1>
        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">🎯 Your Design Challenge</h3>
          <p className="text-slate-300">"{userChallenge}"</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-toggle mb-8 flex space-x-4">
        <button 
          className={`px-6 py-3 rounded-lg transition-colors ${
            viewMode === 'comparison' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          onClick={() => setViewMode('comparison')}
        >
          🎭 Strategist vs Traditional
        </button>
        <button 
          className={`px-6 py-3 rounded-lg transition-colors ${
            viewMode === 'strategist' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          onClick={() => setViewMode('strategist')}
        >
          🧠 20-Year Strategist View
        </button>
        <button 
          className={`px-6 py-3 rounded-lg transition-colors ${
            viewMode === 'traditional' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          onClick={() => setViewMode('traditional')}
        >
          🤖 Traditional Analysis
        </button>
      </div>

      {/* Comparison View (Default) */}
      {viewMode === 'comparison' && (
        <div className="comparison-view">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">🎭 Experience the Difference</h2>
            <p className="text-slate-300 mb-6">
              See how the same design analysis feels when enhanced with 20 years of UX strategy experience.
            </p>
          </div>
          
          <div className="comparison-grid grid md:grid-cols-2 gap-8">
            
            {/* Traditional Column */}
            <div className="traditional-column">
              <div className="bg-slate-800 p-6 rounded-lg h-full">
                <h3 className="text-xl font-semibold mb-4 text-slate-300">🤖 Traditional AI Analysis</h3>
                <div className="space-y-4">
                  {traditionalAnnotations.slice(0, 5).map((annotation, index) => (
                    <div key={index} className="bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">{annotation.title || `Annotation ${index + 1}`}</h4>
                      <p className="text-sm text-slate-300">{annotation.feedback || annotation.description || 'Analysis feedback'}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          annotation.severity === 'critical' ? 'bg-red-600' :
                          annotation.severity === 'important' ? 'bg-yellow-600' :
                          'bg-blue-600'
                        }`}>
                          {annotation.severity || 'moderate'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategist Column */}
            <div className="strategist-column">
              <div className="bg-gradient-to-br from-blue-900 to-purple-900 p-6 rounded-lg h-full">
                <h3 className="text-xl font-semibold mb-4 text-white">🎭 UX Strategist Analysis</h3>
                
                {/* Diagnosis */}
                <div className="mb-6 bg-white/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-yellow-300">🔍 Root Cause Diagnosis</h4>
                  <p className="text-sm">{strategistAnalysis.diagnosis}</p>
                </div>

                {/* Expert Recommendations */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-300">💡 Expert Recommendations</h4>
                  {strategistAnalysis.expertRecommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="bg-white/10 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">{rec.title}</h5>
                      <p className="text-sm mb-3">{rec.recommendation}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-green-600 px-2 py-1 rounded">
                          {Math.round(rec.confidence * 100)}% confidence
                        </span>
                        <span className="bg-blue-600 px-2 py-1 rounded">
                          {rec.expectedImpact}
                        </span>
                        <span className="bg-purple-600 px-2 py-1 rounded">
                          {rec.implementationEffort} effort
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* A/B Test */}
                <div className="mt-6 bg-white/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-orange-300">🧪 A/B Test Strategy</h4>
                  <p className="text-sm">{strategistAnalysis.abTestHypothesis}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="value-proposition mt-8 bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">🎯 Notice the Strategic Difference</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-red-400">Traditional AI</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Lists what's wrong</li>
                  <li>• Generic suggestions</li>
                  <li>• No business context</li>
                  <li>• Leaves you guessing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-400">UX Strategist</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Diagnoses root causes</li>
                  <li>• Specific solutions with confidence</li>
                  <li>• Addresses your challenge</li>
                  <li>• Implementation ready</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-400">Business Impact</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Quantified improvements</li>
                  <li>• Testable hypotheses</li>
                  <li>• Timeline guidance</li>
                  <li>• Success metrics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Strategist View */}
      {viewMode === 'strategist' && (
        <div className="strategist-full-view">
          <h2 className="text-2xl font-bold mb-6">🧠 Complete 20-Year UX Strategist Analysis</h2>
          
          {/* Diagnosis Section */}
          <section className="mb-8 bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-yellow-400">🔍 Root Cause Diagnosis</h3>
            <p className="text-lg mb-4">{strategistAnalysis.diagnosis}</p>
            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Strategic Rationale</h4>
              <p className="text-slate-300">{strategistAnalysis.strategicRationale}</p>
            </div>
          </section>

          {/* Recommendations Section */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-green-400">💡 Expert Recommendations</h3>
            <div className="space-y-6">
              {strategistAnalysis.expertRecommendations.map((rec, index) => (
                <div key={index} className="bg-slate-800 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold">{rec.title}</h4>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Confidence</div>
                      <div className="text-lg font-bold text-green-400">
                        {Math.round(rec.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 mb-4">{rec.recommendation}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-blue-400">Expected Impact:</strong>
                      <p className="text-slate-300">{rec.expectedImpact}</p>
                    </div>
                    <div>
                      <strong className="text-purple-400">Implementation:</strong>
                      <p className="text-slate-300">{rec.implementationEffort} effort, {rec.timeline}</p>
                    </div>
                    <div className="md:col-span-2">
                      <strong className="text-orange-400">Reasoning:</strong>
                      <p className="text-slate-300">{rec.reasoning}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Testing Section */}
          <section className="mb-8 bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-orange-400">🧪 Validation Strategy</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">A/B Test Hypothesis</h4>
                <p className="text-slate-300">{strategistAnalysis.abTestHypothesis}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Success Metrics</h4>
                <ul className="text-slate-300 space-y-1">
                  {strategistAnalysis.successMetrics.map((metric, index) => (
                    <li key={index}>• {metric}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Confidence Assessment */}
          <section className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">📊 Confidence Assessment</h3>
            <div className="flex items-center mb-4">
              <div className="text-3xl font-bold text-blue-400 mr-4">
                {Math.round(strategistAnalysis.confidenceAssessment.overallConfidence * 100)}%
              </div>
              <div className="flex-1">
                <div className="w-full bg-slate-700 rounded-full h-4">
                  <div 
                    className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{width: `${strategistAnalysis.confidenceAssessment.overallConfidence * 100}%`}}
                  ></div>
                </div>
              </div>
            </div>
            <p className="text-slate-300">{strategistAnalysis.confidenceAssessment.reasoning}</p>
          </section>
        </div>
      )}

      {/* Traditional View */}
      {viewMode === 'traditional' && (
        <div className="traditional-view">
          <h2 className="text-2xl font-bold mb-6">🤖 Traditional AI Analysis</h2>
          <div className="grid gap-6">
            {traditionalAnnotations.map((annotation, index) => (
              <div key={index} className="bg-slate-800 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{annotation.title || `Annotation ${index + 1}`}</h3>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    annotation.severity === 'critical' ? 'bg-red-600' :
                    annotation.severity === 'important' ? 'bg-yellow-600' :
                    'bg-blue-600'
                  }`}>
                    {annotation.severity || 'moderate'}
                  </span>
                </div>
                <p className="text-slate-300 mb-4">{annotation.feedback || annotation.description || 'Analysis feedback'}</p>
                <div className="text-sm text-slate-400">
                  Category: {annotation.category || 'General'}
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
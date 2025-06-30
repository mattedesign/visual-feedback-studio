
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, Share2 } from 'lucide-react';

interface SimpleAnalysisResultsProps {
  annotations?: any[];
  onBack?: () => void;
}

export default function SimpleAnalysisResults({ 
  annotations = [], 
  onBack 
}: SimpleAnalysisResultsProps) {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">Analysis Complete</h1>
              <p className="text-slate-400">Your design analysis is ready</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {onBack && (
              <Button onClick={onBack} variant="default">
                Start New Analysis
              </Button>
            )}
          </div>
        </div>

        {/* Quick Summary */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{annotations.length}</div>
                <div className="text-sm text-slate-400">Insights Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">High</div>
                <div className="text-sm text-slate-400">Impact Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">2-4 weeks</div>
                <div className="text-sm text-slate-400">Est. Timeline</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Findings List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Key Findings</CardTitle>
          </CardHeader>
          <CardContent>
            {annotations.length > 0 ? (
              <div className="space-y-4">
                {annotations.map((annotation, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-slate-700 rounded-lg border border-slate-600"
                  >
                    <h3 className="font-medium text-white mb-2">
                      Finding #{index + 1}
                    </h3>
                    <p className="text-slate-300 text-sm">
                      {annotation.suggestion || annotation.text || 'Analysis insight available'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">
                  Analysis completed successfully. Detailed findings are being processed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coming Soon Notice */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-2">🚀 Enhanced Dashboard Coming Soon</h3>
          <p className="text-blue-300 text-sm">
            We&apos;re working on a comprehensive modular dashboard with business impact metrics, 
            competitive analysis, and detailed implementation guidance.
          </p>
        </div>
      </div>
    </div>
  );
}

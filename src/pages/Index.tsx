
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Eye, BarChart3 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Figmant UX Analysis
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Professional UX analysis powered by AI and backed by research from 274+ authoritative sources
          </p>
          <Button 
            onClick={() => window.location.href = '/analysis'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            Start Analysis <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
            <Eye className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">UX Insights</h3>
            <p className="text-gray-300">
              Visual annotations and usability findings with detailed recommendations
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
            <BarChart3 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Business Impact</h3>
            <p className="text-gray-300">
              ROI projections and implementation timeline for stakeholder buy-in
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
            <Zap className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Research Backing</h3>
            <p className="text-gray-300">
              Citations from Nielsen Norman Group, Baymard Institute, and 274+ sources
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

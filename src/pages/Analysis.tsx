
import { AnalysisWorkflow } from "@/components/analysis/AnalysisWorkflow";
import { AnalysisHistory } from "@/components/analysis/AnalysisHistory";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { History, Plus } from "lucide-react";

const Analysis = () => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">UX Analysis Studio</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              className="border-slate-600 hover:bg-slate-700 text-slate-200"
            >
              <History className="w-4 h-4 mr-2" />
              {showHistory ? 'Hide History' : 'Show History'}
            </Button>
            {showHistory && (
              <Button
                onClick={() => setShowHistory(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analysis Area */}
          <div className={showHistory ? "lg:col-span-2" : "lg:col-span-3"}>
            <AnalysisWorkflow />
          </div>

          {/* Analysis History Sidebar */}
          {showHistory && (
            <div className="lg:col-span-1">
              <AnalysisHistory />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;

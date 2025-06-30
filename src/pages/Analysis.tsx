
import { AnalysisWorkflow } from "@/components/analysis/AnalysisWorkflow";
import { useState } from "react";

const Analysis = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">UX Analysis Studio</h1>
        </div>

        {/* Full width analysis workflow */}
        <div className="w-full">
          <AnalysisWorkflow />
        </div>
      </div>
    </div>
  );
};

export default Analysis;

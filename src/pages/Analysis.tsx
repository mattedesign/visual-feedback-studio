import { AnalysisWorkflow } from "@/components/analysis/AnalysisWorkflow";
import { useState } from "react";
const Analysis = () => {
  return <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-0 py-0">
        {/* Full width analysis workflow */}
        <div className="w-full">
          <AnalysisWorkflow />
        </div>
      </div>
    </div>;
};
export default Analysis;

import { AnalysisWorkflow } from "@/components/analysis/AnalysisWorkflow";
import { useState } from "react";

const Analysis = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="w-full">
        <AnalysisWorkflow />
      </div>
    </div>
  );
};

export default Analysis;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Analysis from "./pages/Analysis";
import AnalysisResults from "./pages/AnalysisResults";
import Auth from "./pages/Auth";
import DALLEDemo from "./pages/DalleDemo";
import UpgradeSuccess from "./pages/UpgradeSuccess";
import MigrationPage from "./pages/MigrationPage";
import VectorTest from "./pages/VectorTest";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

// Lazy load the knowledge base population page to prevent initialization on app load
const KnowledgeBasePopulation = lazy(() => import("./pages/KnowledgeBasePopulation"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Default route - everything goes to /auth */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/analysis" element={<Analysis />} />
            {/* FIXED: Add route for analysis with ID parameter */}
            <Route path="/analysis/:id" element={<AnalysisResults />} />
            <Route path="/analysis-results" element={<AnalysisResults />} />
            <Route path="/dalle-demo" element={<DALLEDemo />} />
            <Route path="/upgrade-success" element={<UpgradeSuccess />} />
            <Route path="/migration-page" element={<MigrationPage />} />
            <Route path="/vector-test" element={<VectorTest />} />
            <Route 
              path="/knowledge-population" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <KnowledgeBasePopulation />
                </Suspense>
              } 
            />
            {/* Catch all other routes and redirect to /auth */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

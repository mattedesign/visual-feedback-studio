
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import AnalysisResults from "./pages/AnalysisResults";
import Auth from "./pages/Auth";
import DALLEDemo from "./pages/DalleDemo";
import UpgradeSuccess from "./pages/UpgradeSuccess";
import MigrationPage from "./pages/MigrationPage";
import VectorTest from "./pages/VectorTest";
import HybridEngineTest from "./pages/HybridEngineTest";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DatabaseSeeder } from "@/components/admin/DatabaseSeeder";

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
            {/* Dashboard as the main route */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/analysis/:id" element={<AnalysisResults />} />
            <Route path="/analysis-results" element={<AnalysisResults />} />
            <Route path="/dalle-demo" element={<DALLEDemo />} />
            <Route path="/upgrade-success" element={<UpgradeSuccess />} />
            <Route path="/migration-page" element={<MigrationPage />} />
            <Route path="/vector-test" element={<VectorTest />} />
            <Route path="/hybrid-engine-test" element={<HybridEngineTest />} />
            <Route path="/database-seeder" element={<DatabaseSeeder />} />
            <Route 
              path="/knowledge-population" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <KnowledgeBasePopulation />
                </Suspense>
              } 
            />
            {/* Catch all other routes and redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

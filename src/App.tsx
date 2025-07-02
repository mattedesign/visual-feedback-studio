
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
import { useAuth } from "@/hooks/useAuth";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { AuthGuard } from "@/components/auth/AuthGuard";

// Lazy load the knowledge base population page to prevent initialization on app load
const KnowledgeBasePopulation = lazy(() => import("./pages/KnowledgeBasePopulation"));

const queryClient = new QueryClient();

const App = () => {
  const { user, signOut } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <TopNavigation user={user} onSignOut={signOut} />
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } />
              <Route path="/analysis" element={
                <AuthGuard>
                  <Analysis />
                </AuthGuard>
              } />
              <Route path="/analysis/:id" element={
                <AuthGuard>
                  <AnalysisResults />
                </AuthGuard>
              } />
              <Route path="/analysis-results" element={
                <AuthGuard>
                  <AnalysisResults />
                </AuthGuard>
              } />
              <Route path="/dalle-demo" element={
                <AuthGuard>
                  <DALLEDemo />
                </AuthGuard>
              } />
              <Route path="/upgrade-success" element={
                <AuthGuard>
                  <UpgradeSuccess />
                </AuthGuard>
              } />
              <Route path="/migration-page" element={
                <AuthGuard>
                  <MigrationPage />
                </AuthGuard>
              } />
              <Route path="/vector-test" element={
                <AuthGuard>
                  <VectorTest />
                </AuthGuard>
              } />
              <Route path="/hybrid-engine-test" element={
                <AuthGuard>
                  <HybridEngineTest />
                </AuthGuard>
              } />
              <Route path="/database-seeder" element={
                <AuthGuard>
                  <DatabaseSeeder />
                </AuthGuard>
              } />
              <Route path="/knowledge-population" element={
                <AuthGuard>
                  <Suspense fallback={<LoadingSpinner />}>
                    <KnowledgeBasePopulation />
                  </Suspense>
                </AuthGuard>
              } />
              
              {/* Catch all other routes and redirect to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

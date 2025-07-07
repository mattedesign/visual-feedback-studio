
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import GoblinDashboard from "./pages/GoblinDashboard";
import Archive from "./pages/Archive";
import Analysis from "./pages/Analysis";
import AnalysisResults from "./pages/AnalysisResults";
import Analyze from "./pages/Analyze";
import AnalyzeResults from "./pages/AnalyzeResults";
import Auth from "./pages/Auth";
import UpgradeSuccess from "./pages/UpgradeSuccess";
import VectorTest from "./pages/VectorTest";
import HybridEngineTest from "./pages/HybridEngineTest";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import GoblinStudio from "./pages/goblin/GoblinStudio";
import GoblinResults from "./pages/goblin/GoblinResults";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DatabaseSeeder } from "@/components/admin/DatabaseSeeder";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";



const queryClient = new QueryClient();

const App = () => {
  const { user, signOut } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider defaultOpen={true}>
            <div className="min-h-screen flex w-full bg-background">
              <Routes>
                {/* Public routes - no sidebar */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected routes with sidebar layout */}
                <Route path="/*" element={
                  <AuthGuard>
                    <>
                      <AppSidebar />
                      <SidebarInset>
                        {/* Header with sidebar trigger */}
                        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                          <SidebarTrigger className="-ml-1" />
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">UX Analysis Studio</span>
                          </div>
                        </header>
                        
                        {/* Main content area */}
                        <div className="flex-1 overflow-auto">
                          <Routes>
                            <Route path="/" element={<GoblinDashboard />} />
                            <Route path="archive" element={<Archive />} />
                            <Route path="analysis" element={<Analysis />} />
                            <Route path="analysis/:id" element={<AnalysisResults />} />
                            <Route path="analysis-results" element={<AnalysisResults />} />
                            <Route path="analysis-results/:id" element={<AnalysisResults />} />
                            <Route path="analyze" element={<Analyze />} />
                            <Route path="analyze-results/:id" element={<AnalyzeResults />} />
                            <Route path="goblin" element={<GoblinStudio />} />
                            <Route path="goblin/results/:sessionId" element={<GoblinResults />} />
                            <Route path="history" element={<History />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="help" element={<Help />} />
                            <Route path="upgrade-success" element={<UpgradeSuccess />} />
                            <Route path="vector-test" element={<VectorTest />} />
                            <Route path="hybrid-engine-test" element={<HybridEngineTest />} />
                            <Route path="database-seeder" element={<DatabaseSeeder />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </div>
                      </SidebarInset>
                      
                    </>
                  </AuthGuard>
                } />
              </Routes>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

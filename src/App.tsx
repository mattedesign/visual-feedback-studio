
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useState } from "react";
import GoblinDashboard from "./pages/GoblinDashboard";
import EnhancedDashboardPage from "./pages/EnhancedDashboardPage";
import AnalysisStudioPage from "./pages/AnalysisStudioPage";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import Archive from "./pages/Archive";
import Analysis from "./pages/Analysis";
import AnalysisResults from "./pages/AnalysisResults";
import Analyze from "./pages/Analyze";
import AnalyzeResults from "./pages/AnalyzeResults";
import Auth from "./pages/Auth";
import UpgradeSuccess from "./pages/UpgradeSuccess";
import VectorTest from "./pages/VectorTest";
import HybridEngineTest from "./pages/HybridEngineTest";
import GoblinHistory from "./pages/GoblinHistory";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import { AdminPanel } from "./pages/AdminPanel";
import Subscription from "./pages/Subscription";
import GoblinStudio from "./pages/goblin/GoblinStudio";
import GoblinStudioPage from "./pages/goblin/GoblinStudioPage";
import GoblinResults from "./pages/goblin/GoblinResults";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DatabaseSeeder } from "@/components/admin/DatabaseSeeder";
import { PublicAchievement } from "@/pages/public/Achievement";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { EnhancedAppSidebar } from "@/components/layout/EnhancedAppSidebar";

const queryClient = new QueryClient();

const App = () => {
  const { user, signOut } = useAuth();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes - no sidebar */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/achievement/:shareToken" element={<PublicAchievement />} />
            
            {/* Protected routes with enhanced sidebar layout */}
            <Route path="/*" element={
              <AuthGuard>
                <SubscriptionProvider>
                  <SidebarProvider defaultOpen={true}>
                    <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
                      <EnhancedAppSidebar />
                      <SidebarInset className="bg-transparent">
                        {/* Main content area with enhanced styling */}
                        <div className="flex flex-col items-start flex-1 self-stretch rounded-[20px] border-4 md:border-8 overflow-auto mx-1 my-2 md:m-4 mt-20 md:mt-2 bg-white shadow-xl" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          flex: '1 0 0',
                          alignSelf: 'stretch',
                          borderRadius: '20px',
                          borderColor: '#5C3C90',
                          background: 'linear-gradient(135deg, #FFF 0%, #FAFAFA 100%)'
                         }}>
                            <Routes>
                              <Route path="/" element={<EnhancedDashboardPage />} />
                              <Route path="/dashboard" element={<EnhancedDashboardPage />} />
                              <Route path="/analysis-studio" element={<AnalysisStudioPage />} />
                              <Route path="archive" element={<Archive />} />
                              <Route path="analysis" element={<Analysis />} />
                              <Route path="analysis/:id" element={<AnalysisResults />} />
                              <Route path="analysis-results" element={<AnalysisResults />} />
                              <Route path="analysis-results/:id" element={<AnalysisResults />} />
                              <Route path="analyze" element={<Analyze />} />
                              <Route path="analyze-results/:id" element={<AnalyzeResults />} />
                              <Route path="goblin" element={<GoblinStudioPage />} />
                              <Route path="goblin/results/:sessionId" element={<GoblinResults />} />
                              <Route path="history" element={<GoblinHistory />} />
                              <Route path="settings" element={<Settings />} />
                              <Route path="subscription" element={<Subscription />} />
                              <Route path="help" element={<Help />} />
                              <Route path="admin" element={<AdminPanel />} />
                              <Route path="upgrade-success" element={<UpgradeSuccess />} />
                              <Route path="vector-test" element={<VectorTest />} />
                              <Route path="hybrid-engine-test" element={<HybridEngineTest />} />
                              <Route path="database-seeder" element={<DatabaseSeeder />} />
                              {/* Placeholder routes for new features */}
                              <Route path="reports" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Reports Coming Soon</h1><p className="text-muted-foreground">Advanced reporting features will be available soon.</p></div>} />
                              <Route path="insights" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Design Insights Coming Soon</h1><p className="text-muted-foreground">AI-powered design insights will be available soon.</p></div>} />
                              <Route path="trends" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Trends Coming Soon</h1><p className="text-muted-foreground">UX trend analysis will be available soon.</p></div>} />
                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </div>
                        </SidebarInset>
                      </div>
                    </SidebarProvider>
                  </SubscriptionProvider>
                </AuthGuard>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
